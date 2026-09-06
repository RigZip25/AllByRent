import { beforeEach, describe, expect, it, vi } from "vitest";

const completeLlmChat = vi.fn();

vi.mock("../../server/lib/llm/complete", () => ({
  completeLlmChat: (...args: unknown[]) => completeLlmChat(...args),
}));

const { classifyListingImages, parseClassification } = await import(
  "../../server/lib/listingAi/classify"
);
const { renderTaxonomyAllowList } = await import("../../server/lib/listingAi/taxonomy");

const IMAGES = [{ mimeType: "image/jpeg", data: "AAAA" }];

function modelAnswer(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    detectedItemName: "Mirrorless camera",
    categoryId: "photo-video",
    subcategoryId: "camera-kits",
    alternatives: [],
    score: 0.91,
    reason: "Visible interchangeable-lens camera body",
    attributes: { brand: null, model: null, condition: null },
    ...overrides,
  });
}

beforeEach(() => {
  completeLlmChat.mockReset();
});

describe("taxonomy allow-list", () => {
  it("only offers ids the app can resolve", () => {
    const rendered = renderTaxonomyAllowList();
    expect(rendered).toContain("photo-video = Photo & Video");
    expect(rendered).toContain("camera-kits (Camera Kits)");
    // Curated hints exist because the raw names mislead the model.
    expect(rendered).toContain("Televisions and large screens");
  });
});

describe("obvious item", () => {
  it("resolves the model ids into names the wizard can display", () => {
    const parsed = parseClassification(modelAnswer());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.result.primary).toMatchObject({
      categoryId: "photo-video",
      categoryName: "Photo & Video",
      subcategoryId: "camera-kits",
      subcategoryLabel: "Camera Kits",
      score: 0.91,
    });
    expect(parsed.result.detectedItemName).toBe("Mirrorless camera");
  });

  it("passes a JSON schema to the provider and reports the result once", async () => {
    completeLlmChat.mockResolvedValueOnce({ text: modelAnswer(), provider: "gemini" });
    const outcome = await classifyListingImages(IMAGES);
    expect(outcome.ok).toBe(true);
    expect(completeLlmChat).toHaveBeenCalledTimes(1);
    const request = completeLlmChat.mock.calls[0]![0] as { jsonSchema?: { name: string } };
    expect(request.jsonSchema?.name).toBe("listing_classification");
  });
});

describe("ambiguous item", () => {
  it("keeps plausible alternatives, best score first", () => {
    const parsed = parseClassification(
      modelAnswer({
        score: 0.52,
        alternatives: [
          { categoryId: "photo-video", subcategoryId: "action-cameras", score: 0.3 },
          { categoryId: "electronics-tech", subcategoryId: "display-systems", score: 0.44 },
        ],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.result.alternatives.map((alt) => alt.subcategoryId)).toEqual([
      "display-systems",
      "action-cameras",
    ]);
  });

  it("drops invented alternatives instead of rejecting the whole answer", () => {
    const parsed = parseClassification(
      modelAnswer({
        alternatives: [
          { categoryId: "made-up", subcategoryId: "also-made-up", score: 0.5 },
          { categoryId: "photo-video", subcategoryId: "action-cameras", score: 0.4 },
        ],
      }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.result.alternatives).toHaveLength(1);
    expect(parsed.result.alternatives[0]!.subcategoryId).toBe("action-cameras");
  });
});

describe("ids outside the taxonomy", () => {
  it("rejects a category id that does not exist", () => {
    const parsed = parseClassification(modelAnswer({ categoryId: "vintage-spaceships" }));
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.reason).toContain("vintage-spaceships");
    expect(parsed.reason).toContain("allow-list");
  });

  it("rejects a subcategory that belongs to a different category", () => {
    // "display-systems" is a real id, but it lives under electronics-tech.
    const parsed = parseClassification(
      modelAnswer({ categoryId: "photo-video", subcategoryId: "display-systems" }),
    );
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.reason).toContain("display-systems");
  });

  it("retries once with the rejection reason and accepts the corrected answer", async () => {
    completeLlmChat
      .mockResolvedValueOnce({ text: modelAnswer({ categoryId: "not-a-category" }) })
      .mockResolvedValueOnce({ text: modelAnswer() });

    const outcome = await classifyListingImages(IMAGES);
    expect(outcome.ok).toBe(true);
    expect(completeLlmChat).toHaveBeenCalledTimes(2);

    const retry = completeLlmChat.mock.calls[1]![0] as {
      messages: { role: string; content: unknown }[];
    };
    const correction = retry.messages.at(-1);
    expect(correction?.role).toBe("user");
    expect(String(correction?.content)).toContain("not-a-category");
  });
});

describe("invalid JSON", () => {
  it("reports unparsable prose as a schema failure", () => {
    const parsed = parseClassification("I think this is a camera, but I'm not sure.");
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.reason).toContain("no JSON object");
  });

  it("still reads a valid object out of a fenced answer", () => {
    const parsed = parseClassification(`Sure!\n\`\`\`json\n${modelAnswer()}\n\`\`\``);
    expect(parsed.ok).toBe(true);
  });

  it("gives up after the corrective retry also fails", async () => {
    completeLlmChat
      .mockResolvedValueOnce({ text: "no json here" })
      .mockResolvedValueOnce({ text: "still no json" });

    const outcome = await classifyListingImages(IMAGES);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("invalid_response");
    expect(completeLlmChat).toHaveBeenCalledTimes(2);
  });
});

describe("model unavailable", () => {
  it("returns a failure code instead of throwing", async () => {
    completeLlmChat.mockRejectedValueOnce(new Error("all providers failed"));
    const outcome = await classifyListingImages(IMAGES);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("unavailable");
  });

  it("never calls the model without an image", async () => {
    const outcome = await classifyListingImages([]);
    expect(outcome.ok).toBe(false);
    expect(completeLlmChat).not.toHaveBeenCalled();
  });
});

describe("fabricated attributes", () => {
  it("normalizes 'unknown' style answers to null", () => {
    const parsed = parseClassification(
      modelAnswer({ attributes: { brand: "unknown", model: "N/A", condition: "pristine" } }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.result.attributes).toEqual({ brand: null, model: null, condition: null });
  });

  it("keeps a condition the model actually observed", () => {
    const parsed = parseClassification(
      modelAnswer({ attributes: { brand: "Sony", model: null, condition: "like new" } }),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.result.attributes).toEqual({
      brand: "Sony",
      model: null,
      condition: "like_new",
    });
  });
});
