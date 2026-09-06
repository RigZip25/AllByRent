import { completeLlmChat } from "../llm/complete";
import type { LlmContentPart, LlmMessage } from "../llm/types";
import {
  CLASSIFICATION_JSON_SCHEMA,
  classificationResponseSchema,
  extractJsonObject,
  type ClassificationResponse,
} from "./schemas";
import { findTaxonomyPair, renderTaxonomyAllowList } from "./taxonomy";

export type ClassifyImage = { mimeType: string; data: string };

export type ClassificationCandidate = {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryLabel: string;
  score: number;
};

export type ClassificationResult = {
  detectedItemName: string;
  primary: ClassificationCandidate;
  alternatives: ClassificationCandidate[];
  reason: string;
  attributes: {
    brand: string | null;
    model: string | null;
    condition: string | null;
  };
};

export type ClassifyFailureCode = "invalid_response" | "unavailable";

export type ClassifyOutcome =
  | { ok: true; result: ClassificationResult; provider?: string; model?: string }
  | { ok: false; code: ClassifyFailureCode; message: string };

export const MAX_CLASSIFY_IMAGES = 2;

const SYSTEM_PROMPT = [
  "You identify second-hand and rental marketplace items from photos.",
  "You must classify strictly inside the provided Evorios taxonomy: never invent a category or subcategory, and never return an id that is not in the allow-list.",
  "Report what is visible. Never guess a brand, model, or condition you cannot read or see — return null instead.",
  "Answer with a single JSON object and nothing else.",
].join(" ");

function buildUserPrompt(): string {
  return `Identify the main item in the photos and map it to the Evorios taxonomy.

ALLOWED TAXONOMY (use these ids verbatim):
${renderTaxonomyAllowList()}

Rules:
- categoryId and subcategoryId MUST come from the list above, and the subcategoryId MUST belong to the chosen categoryId.
- Pick the single best match as the primary result. Add up to 3 genuinely plausible alternatives, best first; return an empty list when the primary match is obvious.
- score is your own ranking confidence from 0 to 1. Use low values when the photo is unclear, cropped, or shows several unrelated items.
- detectedItemName is a short human name for the item (e.g. "Mirrorless camera"), not a marketing title.
- reason is one short clause describing the visual evidence.
- attributes.brand / attributes.model: only when readable in the photo, otherwise null. Never infer them from the item type.
- attributes.condition: one of new, like_new, good, fair — only when wear is clearly visible, otherwise null.

Return JSON exactly in this shape:
{
  "detectedItemName": "Mirrorless camera",
  "categoryId": "photo-video",
  "subcategoryId": "camera-kits",
  "alternatives": [{ "categoryId": "photo-video", "subcategoryId": "cinema-cameras", "score": 0.4 }],
  "score": 0.91,
  "reason": "Visible interchangeable-lens camera body",
  "attributes": { "brand": null, "model": null, "condition": null }
}`;
}

function toCandidate(
  categoryId: string,
  subcategoryId: string,
  score: number,
): ClassificationCandidate | null {
  const pair = findTaxonomyPair(categoryId, subcategoryId);
  if (!pair) return null;
  return {
    categoryId: pair.category.id,
    categoryName: pair.category.name,
    subcategoryId: pair.subcategory.id,
    subcategoryLabel: pair.subcategory.label,
    score,
  };
}

/**
 * Taxonomy check that runs after schema validation.
 *
 * Returns the reason on failure so the corrective retry can tell the model
 * exactly which id it made up.
 */
export function resolveClassification(
  parsed: ClassificationResponse,
): { ok: true; result: ClassificationResult } | { ok: false; reason: string } {
  const primary = toCandidate(parsed.categoryId, parsed.subcategoryId, parsed.score);
  if (!primary) {
    return {
      ok: false,
      reason: `categoryId "${parsed.categoryId}" with subcategoryId "${parsed.subcategoryId}" is not a valid pair in the allow-list`,
    };
  }

  const seen = new Set([`${primary.categoryId}/${primary.subcategoryId}`]);
  const alternatives: ClassificationCandidate[] = [];
  for (const alt of parsed.alternatives) {
    const candidate = toCandidate(alt.categoryId, alt.subcategoryId, alt.score);
    if (!candidate) continue; // Drop invented alternatives instead of failing the whole answer.
    const key = `${candidate.categoryId}/${candidate.subcategoryId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    alternatives.push(candidate);
  }

  alternatives.sort((a, b) => b.score - a.score);

  return {
    ok: true,
    result: {
      detectedItemName: parsed.detectedItemName,
      primary,
      alternatives: alternatives.slice(0, 3),
      reason: parsed.reason,
      attributes: parsed.attributes,
    },
  };
}

export function parseClassification(
  raw: string,
): { ok: true; result: ClassificationResult } | { ok: false; reason: string } {
  let json: unknown;
  try {
    json = extractJsonObject(raw);
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "unparsable response" };
  }

  const parsed = classificationResponseSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") || "response";
    return { ok: false, reason: `${path}: ${issue?.message ?? "does not match the schema"}` };
  }

  return resolveClassification(parsed.data);
}

async function requestClassification(
  images: ClassifyImage[],
  correction?: { previous: string; reason: string },
): Promise<{ text: string; provider?: string; model?: string }> {
  const parts: LlmContentPart[] = [
    ...images.map((image) => ({
      type: "image" as const,
      mimeType: image.mimeType,
      data: image.data,
    })),
    { type: "text" as const, text: buildUserPrompt() },
  ];

  const messages: LlmMessage[] = [{ role: "user", content: parts }];
  if (correction) {
    messages.push({ role: "assistant", content: correction.previous.slice(0, 2000) });
    messages.push({
      role: "user",
      content: `That response was rejected: ${correction.reason}. Return only a JSON object that follows the schema and uses ids from the allow-list.`,
    });
  }

  const result = await completeLlmChat({
    purpose: "vision",
    max_tokens: 700,
    temperature: 0.1,
    system: SYSTEM_PROMPT,
    messages,
    jsonSchema: { name: "listing_classification", schema: CLASSIFICATION_JSON_SCHEMA },
  });

  return { text: result.text, provider: result.provider, model: result.model };
}

/** One classification attempt plus a single corrective retry. */
export async function classifyListingImages(images: ClassifyImage[]): Promise<ClassifyOutcome> {
  if (images.length === 0) {
    return { ok: false, code: "invalid_response", message: "No images to classify" };
  }

  let first: { text: string; provider?: string; model?: string };
  try {
    first = await requestClassification(images.slice(0, MAX_CLASSIFY_IMAGES));
  } catch (error) {
    return {
      ok: false,
      code: "unavailable",
      message: error instanceof Error ? error.message : "Classification failed",
    };
  }

  const firstAttempt = parseClassification(first.text);
  if (firstAttempt.ok) {
    return { ok: true, result: firstAttempt.result, provider: first.provider, model: first.model };
  }

  let retry: { text: string; provider?: string; model?: string };
  try {
    retry = await requestClassification(images.slice(0, MAX_CLASSIFY_IMAGES), {
      previous: first.text,
      reason: firstAttempt.reason,
    });
  } catch (error) {
    return {
      ok: false,
      code: "unavailable",
      message: error instanceof Error ? error.message : "Classification retry failed",
    };
  }

  const retryAttempt = parseClassification(retry.text);
  if (retryAttempt.ok) {
    return { ok: true, result: retryAttempt.result, provider: retry.provider, model: retry.model };
  }

  return {
    ok: false,
    code: "invalid_response",
    message: `Model returned an invalid classification twice (${retryAttempt.reason})`,
  };
}
