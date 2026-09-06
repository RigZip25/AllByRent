import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildConfirmedCopyFacts } from "../../src/screens/listing/ai/copyFacts";
import { createInitialListingDraft } from "../../src/screens/listing/types";

const completeLlmChat = vi.fn();

vi.mock("../../server/lib/llm/complete", () => ({
  completeLlmChat: (...args: unknown[]) => completeLlmChat(...args),
}));

const { generateListingCopy } = await import("../../server/lib/listingAi/copy");

const REQUEST = {
  itemName: "Mirrorless camera",
  categoryName: "Photo & Video",
  subcategoryLabel: "Camera Kits",
  listingType: "personal" as const,
  facts: [
    { label: "Brand", value: "Sony" },
    { label: "Kit includes", value: "kit_lens" },
  ],
};

beforeEach(() => {
  completeLlmChat.mockReset();
});

describe("copy generation", () => {
  it("sends the confirmed facts as text and no image parts", async () => {
    completeLlmChat.mockResolvedValueOnce({
      text: JSON.stringify({
        title: "Sony mirrorless camera with kit lens",
        description:
          "A Sony mirrorless camera kit with the kit lens included. Good for weekend photo walks and small shoots nearby.",
      }),
    });

    const outcome = await generateListingCopy(REQUEST);
    expect(outcome.ok).toBe(true);

    const request = completeLlmChat.mock.calls[0]![0] as {
      messages: { content: unknown }[];
      jsonSchema?: { name: string };
    };
    const content = request.messages[0]!.content;
    expect(typeof content).toBe("string");
    expect(JSON.stringify(request.messages)).not.toContain("image");
    expect(String(content)).toContain("Brand: Sony");
    expect(request.jsonSchema?.name).toBe("listing_copy");
  });

  it("rejects copy that does not match the schema", async () => {
    completeLlmChat.mockResolvedValueOnce({ text: JSON.stringify({ title: "Hi" }) });
    const outcome = await generateListingCopy(REQUEST);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("invalid_response");
  });

  it("reports the model being down instead of throwing", async () => {
    completeLlmChat.mockRejectedValueOnce(new Error("no providers configured"));
    const outcome = await generateListingCopy(REQUEST);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.code).toBe("unavailable");
  });
});

describe("confirmed facts from the draft", () => {
  it("includes reviewed details and leaves out identity and money values", () => {
    const draft = {
      ...createInitialListingDraft(),
      category: "Photo & Video",
      subcategory: "Camera Kits",
      condition: "good" as const,
      modes: { rent: true, sell: false, rentToOwn: false, gift: false },
      categorySpecs: {
        brand: "Sony",
        model: "A7 III",
        kitIncludes: "full_kit",
        replacementValue: "1800",
        serialNumber: "SN-12345",
      },
    };

    const facts = buildConfirmedCopyFacts(draft, { brand: "Brand", model: "Model" });
    const labels = facts.map((fact) => fact.label);
    const values = facts.map((fact) => fact.value);

    expect(facts).toEqual(
      expect.arrayContaining([
        { label: "Condition", value: "Good" },
        { label: "Offered for", value: "rent" },
        { label: "Brand", value: "Sony" },
        { label: "Model", value: "A7 III" },
      ]),
    );
    expect(labels).not.toContain("replacementValue");
    expect(values).not.toContain("SN-12345");
    expect(values).not.toContain("1800");
  });

  it("returns nothing to assert when the host filled nothing in", () => {
    expect(buildConfirmedCopyFacts(createInitialListingDraft())).toEqual([]);
  });
});
