import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MediaRef } from "../../src/lib/mediaStore";

const postListingAi = vi.fn();
const buildAiImagePayload = vi.fn();

vi.mock("../../src/screens/listing/ai/listingAiClient", () => ({
  postListingAi: (...args: unknown[]) => postListingAi(...args),
}));

vi.mock("../../src/screens/listing/ai/photoPayload", () => ({
  buildAiImagePayload: (...args: unknown[]) => buildAiImagePayload(...args),
}));

const { classifyListingPhotos, outcomeFromCandidates } = await import(
  "../../src/screens/listing/ai/listingClassifier"
);
const { AI_CATEGORY_CONFIG } = await import("../../src/screens/listing/ai/aiConfig");

const PHOTO: MediaRef = {
  id: "photo-1",
  kind: "image",
  mimeType: "image/jpeg",
  createdAt: 0,
  sizeBytes: 1024,
};

function candidate(subcategoryId: string, score: number, categoryId = "photo-video") {
  return {
    categoryId,
    categoryName: "Photo & Video",
    subcategoryId,
    subcategoryLabel: subcategoryId,
    score,
  };
}

function serverResult(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    result: {
      detectedItemName: "Mirrorless camera",
      primary: candidate("camera-kits", 0.91),
      alternatives: [],
      reason: "Visible camera body",
      attributes: { brand: null, model: null, condition: null },
      ...overrides,
    },
  };
}

beforeEach(() => {
  postListingAi.mockReset();
  buildAiImagePayload.mockReset();
  buildAiImagePayload.mockResolvedValue([{ mimeType: "image/jpeg", data: "AAAA" }]);
});

describe("confidence rules", () => {
  it("shows a single match when the score is high", () => {
    const outcome = outcomeFromCandidates({
      itemName: "Mirrorless camera",
      primary: candidate("camera-kits", AI_CATEGORY_CONFIG.highScore + 0.05),
      alternatives: [candidate("action-cameras", 0.3)],
      attributes: { brand: null, model: null, condition: null },
    });
    expect(outcome.status).toBe("match");
    if (outcome.status !== "match") return;
    expect(outcome.primary.subcategoryId).toBe("camera-kits");
  });

  it("asks which of at most three options fits when the score is middling", () => {
    const outcome = outcomeFromCandidates({
      itemName: "Camera-ish thing",
      primary: candidate("camera-kits", AI_CATEGORY_CONFIG.multiScore + 0.05),
      alternatives: [
        candidate("action-cameras", 0.42),
        candidate("tripods-mounts", 0.38),
        candidate("lighting-kits", 0.2),
      ],
      attributes: { brand: null, model: null, condition: null },
    });
    expect(outcome.status).toBe("choices");
    if (outcome.status !== "choices") return;
    expect(outcome.candidates).toHaveLength(AI_CATEGORY_CONFIG.maxSuggestions);
    expect(outcome.candidates[0]!.subcategoryId).toBe("camera-kits");
  });

  it("goes straight to manual on a low score but keeps the candidates as hints", () => {
    const outcome = outcomeFromCandidates({
      itemName: "Unclear object",
      primary: candidate("camera-kits", AI_CATEGORY_CONFIG.multiScore - 0.1),
      alternatives: [],
      attributes: { brand: null, model: null, condition: null },
    });
    expect(outcome.status).toBe("manual");
    if (outcome.status !== "manual") return;
    expect(outcome.reason).toBe("low_confidence");
    expect(outcome.candidates).toHaveLength(1);
  });

  it("refuses a pair the client cannot resolve in its own taxonomy", () => {
    const outcome = outcomeFromCandidates({
      itemName: "Mystery",
      primary: candidate("display-systems", 0.99),
      alternatives: [],
      attributes: { brand: null, model: null, condition: null },
    });
    expect(outcome.status).toBe("manual");
    if (outcome.status !== "manual") return;
    expect(outcome.reason).toBe("invalid_response");
  });

  it("drops duplicate and unresolvable alternatives", () => {
    const outcome = outcomeFromCandidates({
      itemName: "Mirrorless camera",
      primary: candidate("camera-kits", 0.95),
      alternatives: [
        candidate("camera-kits", 0.5),
        candidate("not-real", 0.4),
        candidate("action-cameras", 0.45),
      ],
      attributes: { brand: null, model: null, condition: null },
    });
    expect(outcome.status).toBe("match");
    if (outcome.status !== "match") return;
    expect(outcome.alternatives.map((alt) => alt.subcategoryId)).toEqual(["action-cameras"]);
  });
});

describe("failure states", () => {
  it("maps a timeout to manual selection", async () => {
    postListingAi.mockResolvedValue({ ok: false, code: "timeout", message: "timed out" });
    const outcome = await classifyListingPhotos([PHOTO]);
    expect(outcome).toMatchObject({ status: "manual", reason: "timeout" });
  });

  it("maps a network failure to manual selection", async () => {
    postListingAi.mockResolvedValue({ ok: false, code: "network", message: "offline" });
    const outcome = await classifyListingPhotos([PHOTO]);
    expect(outcome).toMatchObject({ status: "manual", reason: "network" });
  });

  it("maps a rejected image to manual selection", async () => {
    postListingAi.mockResolvedValue({
      ok: false,
      code: "unsupported_image",
      message: "bad image",
    });
    const outcome = await classifyListingPhotos([PHOTO]);
    expect(outcome).toMatchObject({ status: "manual", reason: "unsupported_image" });
  });

  it("falls back to manual when the photo cannot be prepared", async () => {
    buildAiImagePayload.mockRejectedValue(new Error("decode failed"));
    const outcome = await classifyListingPhotos([PHOTO]);
    expect(outcome).toMatchObject({ status: "manual", reason: "unsupported_image" });
    expect(postListingAi).not.toHaveBeenCalled();
  });

  it("falls back to manual when the payload has an unexpected shape", async () => {
    postListingAi.mockResolvedValue({ ok: true, data: { ok: true, result: { nope: 1 } } });
    const outcome = await classifyListingPhotos([PHOTO]);
    expect(outcome).toMatchObject({ status: "manual", reason: "invalid_response" });
  });

  it("never calls the API without a photo", async () => {
    const outcome = await classifyListingPhotos([]);
    expect(outcome).toMatchObject({ status: "manual", reason: "no_photos" });
    expect(postListingAi).not.toHaveBeenCalled();
  });

  it("turns a valid server answer into a confirmable match", async () => {
    postListingAi.mockResolvedValue({ ok: true, data: serverResult() });
    const outcome = await classifyListingPhotos([PHOTO]);
    expect(outcome.status).toBe("match");
    if (outcome.status !== "match") return;
    expect(outcome.itemName).toBe("Mirrorless camera");
    expect(outcome.primary.subcategoryLabel).toBe("camera-kits");
  });
});
