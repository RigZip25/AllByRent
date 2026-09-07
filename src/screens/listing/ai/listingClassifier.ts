import { z } from "zod";
import { trackEvent } from "../../../lib/analytics";
import type { MediaRef } from "../../../lib/mediaStore";
import { AI_CATEGORY_CONFIG, confidenceTier } from "./aiConfig";
import { postListingAi } from "./listingAiClient";
import { buildAiImagePayload, type AiImagePayload } from "./photoPayload";
import { isTaxonomyPairValid } from "../taxonomyCatalog";

export type CategoryCandidate = {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryLabel: string;
  score: number;
};

export type DetectedAttributes = {
  brand: string | null;
  model: string | null;
  condition: string | null;
};

/** Why the flow fell back to manual category selection. */
export type ManualFallbackReason =
  | "no_photos"
  | "low_confidence"
  | "invalid_response"
  | "timeout"
  | "network"
  | "unsupported_image"
  | "unavailable";

export type ClassificationOutcome =
  | {
      status: "match";
      itemName: string;
      primary: CategoryCandidate;
      alternatives: CategoryCandidate[];
      attributes: DetectedAttributes;
    }
  | {
      status: "choices";
      itemName: string;
      candidates: CategoryCandidate[];
      attributes: DetectedAttributes;
    }
  | {
      status: "manual";
      reason: ManualFallbackReason;
      /** Candidates are kept even when confidence is low, to seed "Suggested". */
      candidates: CategoryCandidate[];
      itemName: string;
      attributes: DetectedAttributes;
    };

const candidateSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  subcategoryId: z.string(),
  subcategoryLabel: z.string(),
  score: z.number(),
});

const responseSchema = z.object({
  ok: z.literal(true),
  result: z.object({
    detectedItemName: z.string(),
    primary: candidateSchema,
    alternatives: z.array(candidateSchema).default([]),
    reason: z.string().default(""),
    attributes: z
      .object({
        brand: z.string().nullable().default(null),
        model: z.string().nullable().default(null),
        condition: z.string().nullable().default(null),
      })
      .default({ brand: null, model: null, condition: null }),
  }),
});

const EMPTY_ATTRIBUTES: DetectedAttributes = { brand: null, model: null, condition: null };

function manual(
  reason: ManualFallbackReason,
  extras?: { candidates?: CategoryCandidate[]; itemName?: string; attributes?: DetectedAttributes },
): ClassificationOutcome {
  return {
    status: "manual",
    reason,
    candidates: extras?.candidates ?? [],
    itemName: extras?.itemName ?? "",
    attributes: extras?.attributes ?? EMPTY_ATTRIBUTES,
  };
}

/**
 * Turns a validated classification into a UI state.
 *
 * Exported separately from the network call so the confidence rules can be
 * tested without a model: high score shows one match, medium score asks which
 * of up to three fits best, and anything lower goes straight to manual.
 */
export function outcomeFromCandidates(input: {
  itemName: string;
  primary: CategoryCandidate;
  alternatives: CategoryCandidate[];
  attributes: DetectedAttributes;
}): ClassificationOutcome {
  // Defensive: the server validates ids, but a stale client must never render
  // a category it cannot resolve locally.
  if (!isTaxonomyPairValid(input.primary.categoryId, input.primary.subcategoryId)) {
    return manual("invalid_response");
  }

  const alternatives = input.alternatives
    .filter((candidate) => isTaxonomyPairValid(candidate.categoryId, candidate.subcategoryId))
    .filter(
      (candidate) =>
        candidate.categoryId !== input.primary.categoryId ||
        candidate.subcategoryId !== input.primary.subcategoryId,
    )
    .sort((a, b) => b.score - a.score);

  const tier = confidenceTier(input.primary.score);

  if (tier === "high") {
    return {
      status: "match",
      itemName: input.itemName,
      primary: input.primary,
      alternatives: alternatives.slice(0, AI_CATEGORY_CONFIG.maxSuggestions - 1),
      attributes: input.attributes,
    };
  }

  if (tier === "medium") {
    return {
      status: "choices",
      itemName: input.itemName,
      candidates: [input.primary, ...alternatives].slice(0, AI_CATEGORY_CONFIG.maxSuggestions),
      attributes: input.attributes,
    };
  }

  return manual("low_confidence", {
    candidates: [input.primary, ...alternatives].slice(0, AI_CATEGORY_CONFIG.maxSuggestions),
    itemName: input.itemName,
    attributes: input.attributes,
  });
}

async function classifyImages(images: AiImagePayload[]): Promise<ClassificationOutcome> {
  const call = await postListingAi<unknown>("classify", { images });

  if (!call.ok) {
    const reason: ManualFallbackReason =
      call.code === "timeout"
        ? "timeout"
        : call.code === "network"
          ? "network"
          : call.code === "unsupported_image"
            ? "unsupported_image"
            : call.code === "invalid_response"
              ? "invalid_response"
              : "unavailable";
    trackEvent("ai_category_failed", { reason, code: call.code });
    return manual(reason);
  }

  const parsed = responseSchema.safeParse(call.data);
  if (!parsed.success) {
    trackEvent("ai_category_failed", { reason: "invalid_response", code: "schema" });
    return manual("invalid_response");
  }

  const result = parsed.data.result;
  const outcome = outcomeFromCandidates({
    itemName: result.detectedItemName,
    primary: result.primary,
    alternatives: result.alternatives,
    attributes: result.attributes,
  });

  if (outcome.status === "manual") {
    trackEvent("ai_category_failed", { reason: outcome.reason });
    return outcome;
  }

  const suggestions =
    outcome.status === "match" ? [outcome.primary, ...outcome.alternatives] : outcome.candidates;

  trackEvent("ai_category_suggested", {
    mode: outcome.status,
    suggestions: suggestions.length,
    categoryId: suggestions[0]?.categoryId ?? null,
    subcategoryId: suggestions[0]?.subcategoryId ?? null,
    confidence: confidenceTier(suggestions[0]?.score ?? 0),
  });

  return outcome;
}

/** Classifies listing photos, never throwing — every failure is a UI state. */
export async function classifyListingPhotos(photos: MediaRef[]): Promise<ClassificationOutcome> {
  if (photos.length === 0) return manual("no_photos");

  trackEvent("ai_category_started", { photos: photos.length });

  let images: AiImagePayload[];
  try {
    images = await buildAiImagePayload(photos);
  } catch {
    trackEvent("ai_category_failed", { reason: "unsupported_image" });
    return manual("unsupported_image");
  }

  if (images.length === 0) {
    trackEvent("ai_category_failed", { reason: "unsupported_image" });
    return manual("unsupported_image");
  }

  return classifyImages(images);
}
