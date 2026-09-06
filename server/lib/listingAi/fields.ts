import { completeLlmChat } from "../llm/complete";
import type { LlmContentPart } from "../llm/types";
import {
  FIELD_EXTRACTION_JSON_SCHEMA,
  extractJsonObject,
  fieldExtractionResponseSchema,
  type FieldExtractionResponse,
} from "./schemas";
import type { ClassifyImage } from "./classify";

export type AllowedFieldType = "text" | "number" | "select" | "brand" | "multiselect";

export type AllowedField = {
  key: string;
  type: AllowedFieldType;
  required: boolean;
  label?: string;
  options?: string[];
};

export type ExtractedField = {
  fieldKey: string;
  value: string | null;
  confidence: "high" | "medium" | "low";
  source: "image" | "user_input" | "inferred";
};

export type FieldExtractionContext = {
  itemName: string;
  categoryName: string;
  subcategoryLabel: string;
  listingType: "personal" | "professional";
};

export type FieldExtractionOutcome =
  | { ok: true; fields: ExtractedField[] }
  | { ok: false; code: "invalid_response" | "unavailable"; message: string };

export const MAX_FIELD_IMAGES = 2;

/**
 * Fields the model may only report when it can actually read them off the item.
 * An inferred brand or condition is a fabricated listing detail, not a guess.
 */
const READ_ONLY_FROM_IMAGE = /^(brand|make|manufacturer|model|modelName|serial|serialNumber|vin|plate)$/i;

/** Money and liability numbers are never visible in a photo. */
const NEVER_EXTRACTED = /(value|price|worth|deposit|insurance|payout|rate|fee)/i;

const SYSTEM_PROMPT = [
  "You extract structured listing attributes from marketplace item photos.",
  "You may only fill fields from the provided schema, and only with values you can actually see or read in the photos.",
  "Anything you cannot verify must be null. Never invent brands, models, serial numbers, condition, contents of a kit, or prices.",
  "Answer with a single JSON object and nothing else.",
].join(" ");

function renderFields(fields: AllowedField[]): string {
  return fields
    .map((field) => {
      const parts = [`${field.key} (${field.type}${field.required ? ", required" : ""})`];
      if (field.label) parts.push(`label: ${field.label}`);
      if (field.options?.length) parts.push(`allowed values: ${field.options.join(" | ")}`);
      return `- ${parts.join(" — ")}`;
    })
    .join("\n");
}

function buildUserPrompt(context: FieldExtractionContext, fields: AllowedField[]): string {
  return `Confirmed by the host — treat these as facts, do not re-classify:
- item: ${context.itemName}
- category: ${context.categoryName} → ${context.subcategoryLabel}
- listing type: ${context.listingType}

Fill only these fields:
${renderFields(fields)}

Rules:
- Use fieldKey values exactly as listed; never add a field that is not listed.
- value is a string, or null when the photos do not show it. Prefer null over a plausible guess.
- For select and multiselect fields the value must be one of the allowed values verbatim (comma-separate multiselect values).
- brand, model, and serial-style fields: only when the text is legible in a photo, otherwise null.
- confidence: high when the value is unambiguous, medium when likely, low when uncertain.
- source: "image" when read or clearly visible, "inferred" when derived from the item type, "user_input" only for the confirmed facts above.

Return JSON exactly in this shape:
{ "fields": [ { "fieldKey": "brand", "value": null, "confidence": "low", "source": "image" } ] }`;
}

/** "Kit Lens", "kit-lens" and "kit_lens" all mean the same option. */
function canonicalOption(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeOptionValue(raw: string, options: string[]): string | null {
  const key = canonicalOption(raw);
  if (!key) return null;
  const exact = options.find((option) => canonicalOption(option) === key);
  if (exact) return exact;
  const partial = options.find((option) => {
    const canonical = canonicalOption(option);
    return canonical.includes(key) || key.includes(canonical);
  });
  return partial ?? null;
}

/**
 * Enforces the field schema on the model's answer.
 *
 * Unknown keys, out-of-schema option values, non-numeric numbers, inferred
 * identity fields, and money fields are all reduced to null or dropped, so an
 * over-eager model cannot fabricate listing details.
 */
export function resolveExtractedFields(
  parsed: FieldExtractionResponse,
  allowed: AllowedField[],
): ExtractedField[] {
  const byKey = new Map(allowed.map((field) => [field.key, field]));
  const seen = new Set<string>();
  const out: ExtractedField[] = [];

  for (const entry of parsed.fields) {
    const field = byKey.get(entry.fieldKey);
    if (!field || seen.has(field.key)) continue;
    seen.add(field.key);

    if (NEVER_EXTRACTED.test(field.key)) continue;

    let value = entry.value;

    if (value !== null && READ_ONLY_FROM_IMAGE.test(field.key) && entry.source !== "image") {
      value = null;
    }

    if (value !== null && (field.type === "select" || field.type === "brand")) {
      value = field.options?.length ? normalizeOptionValue(value, field.options) : value;
    }

    if (value !== null && field.type === "multiselect") {
      const options = field.options ?? [];
      const picked = value
        .split(",")
        .map((part) => (options.length ? normalizeOptionValue(part, options) : part.trim()))
        .filter((part): part is string => Boolean(part));
      value = picked.length ? Array.from(new Set(picked)).join(", ") : null;
    }

    if (value !== null && field.type === "number") {
      const digits = value.replace(/[^\d.,-]/g, "").replace(",", ".");
      // Stripping prose can leave an empty string, which Number() reads as 0.
      const numeric = /\d/.test(digits) ? Number(digits) : Number.NaN;
      value = Number.isFinite(numeric) ? String(numeric) : null;
    }

    out.push({
      fieldKey: field.key,
      value,
      confidence: value === null ? "low" : entry.confidence,
      source: entry.source,
    });
  }

  return out;
}

export function parseFieldExtraction(
  raw: string,
  allowed: AllowedField[],
): { ok: true; fields: ExtractedField[] } | { ok: false; reason: string } {
  let json: unknown;
  try {
    json = extractJsonObject(raw);
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "unparsable response" };
  }

  const parsed = fieldExtractionResponseSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") || "response";
    return { ok: false, reason: `${path}: ${issue?.message ?? "does not match the schema"}` };
  }

  return { ok: true, fields: resolveExtractedFields(parsed.data, allowed) };
}

export async function extractListingFields(params: {
  images: ClassifyImage[];
  context: FieldExtractionContext;
  fields: AllowedField[];
}): Promise<FieldExtractionOutcome> {
  if (params.fields.length === 0) return { ok: true, fields: [] };

  const parts: LlmContentPart[] = [
    ...params.images.slice(0, MAX_FIELD_IMAGES).map((image) => ({
      type: "image" as const,
      mimeType: image.mimeType,
      data: image.data,
    })),
    { type: "text" as const, text: buildUserPrompt(params.context, params.fields) },
  ];

  let text: string;
  try {
    const result = await completeLlmChat({
      purpose: "vision",
      max_tokens: 900,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: parts }],
      jsonSchema: { name: "listing_fields", schema: FIELD_EXTRACTION_JSON_SCHEMA },
    });
    text = result.text;
  } catch (error) {
    return {
      ok: false,
      code: "unavailable",
      message: error instanceof Error ? error.message : "Field extraction failed",
    };
  }

  const parsed = parseFieldExtraction(text, params.fields);
  if (parsed.ok) return { ok: true, fields: parsed.fields };

  return { ok: false, code: "invalid_response", message: parsed.reason };
}
