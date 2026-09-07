import { z } from "zod";

/**
 * Wire contracts for the listing AI endpoints.
 *
 * Every model response is parsed here before anything else looks at it, and the
 * same shapes are handed to the provider as a JSON schema, so a well-behaved
 * model and a misbehaving one end up on the same code path.
 */

const UNKNOWN_TEXT = new Set(["", "n/a", "na", "none", "null", "undefined", "unknown", "unspecified"]);

/** Models express "cannot tell" in many ways; all of them mean null here. */
const nullableText = z
  .union([z.string(), z.null()])
  .transform((value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return UNKNOWN_TEXT.has(trimmed.toLowerCase()) ? null : trimmed;
  })
  .pipe(z.string().max(120).nullable());

export const LISTING_CONDITIONS = ["new", "like_new", "good", "fair"] as const;

const nullableCondition = z
  .union([z.string(), z.null()])
  .transform((value) => {
    if (typeof value !== "string") return null;
    const key = value.trim().toLowerCase().replace(/\s+/g, "_");
    return (LISTING_CONDITIONS as readonly string[]).includes(key) ? key : null;
  })
  .pipe(z.enum(LISTING_CONDITIONS).nullable());

const candidateSchema = z.object({
  categoryId: z.string().trim().min(1),
  subcategoryId: z.string().trim().min(1),
  score: z.number().min(0).max(1),
});

export const classificationResponseSchema = z.object({
  detectedItemName: z.string().trim().min(1).max(80),
  categoryId: z.string().trim().min(1),
  subcategoryId: z.string().trim().min(1),
  alternatives: z.array(candidateSchema).max(5).default([]),
  score: z.number().min(0).max(1),
  reason: z.string().trim().max(240).default(""),
  attributes: z
    .object({
      brand: nullableText,
      model: nullableText,
      condition: nullableCondition,
    })
    .default({ brand: null, model: null, condition: null }),
});

export type ClassificationResponse = z.infer<typeof classificationResponseSchema>;

export const FIELD_CONFIDENCES = ["high", "medium", "low"] as const;
export const FIELD_SOURCES = ["image", "user_input", "inferred"] as const;

export const fieldExtractionResponseSchema = z.object({
  fields: z
    .array(
      z.object({
        fieldKey: z.string().trim().min(1),
        value: nullableText,
        confidence: z.enum(FIELD_CONFIDENCES),
        source: z.enum(FIELD_SOURCES),
      }),
    )
    .max(60),
});

export type FieldExtractionResponse = z.infer<typeof fieldExtractionResponseSchema>;

export const listingCopyResponseSchema = z.object({
  title: z.string().trim().min(3).max(90),
  description: z.string().trim().min(20).max(1200),
});

export type ListingCopyResponse = z.infer<typeof listingCopyResponseSchema>;

/** Provider-side JSON schemas — OpenAI strict mode needs every key required. */
export const CLASSIFICATION_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "detectedItemName",
    "categoryId",
    "subcategoryId",
    "alternatives",
    "score",
    "reason",
    "attributes",
  ],
  properties: {
    detectedItemName: { type: "string" },
    categoryId: { type: "string" },
    subcategoryId: { type: "string" },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["categoryId", "subcategoryId", "score"],
        properties: {
          categoryId: { type: "string" },
          subcategoryId: { type: "string" },
          score: { type: "number" },
        },
      },
    },
    score: { type: "number" },
    reason: { type: "string" },
    attributes: {
      type: "object",
      additionalProperties: false,
      required: ["brand", "model", "condition"],
      properties: {
        brand: { type: ["string", "null"] },
        model: { type: ["string", "null"] },
        condition: { type: ["string", "null"], enum: [...LISTING_CONDITIONS, null] },
      },
    },
  },
};

export const FIELD_EXTRACTION_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["fields"],
  properties: {
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["fieldKey", "value", "confidence", "source"],
        properties: {
          fieldKey: { type: "string" },
          value: { type: ["string", "null"] },
          confidence: { type: "string", enum: [...FIELD_CONFIDENCES] },
          source: { type: "string", enum: [...FIELD_SOURCES] },
        },
      },
    },
  },
};

export const LISTING_COPY_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
  },
};

/** Pulls the JSON object out of a response that may carry prose or fences. */
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const text = candidate.startsWith("{") ? candidate : candidate.match(/\{[\s\S]*\}/)?.[0];
  if (!text) throw new Error("Response contained no JSON object");
  return JSON.parse(text) as unknown;
}
