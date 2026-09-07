import { z } from "zod";
import type { MediaRef } from "../../../lib/mediaStore";
import { trackEvent } from "../../../lib/analytics";
import {
  getCategorySpecFields,
  isSpecFieldRequired,
  type SpecFieldDef,
  type SpecModeContext,
} from "../categorySpecs";
import { taxonomyIdsForNames } from "../taxonomyCatalog";
import { postListingAi } from "./listingAiClient";
import { buildAiImagePayload } from "./photoPayload";

export type AiFilledField = {
  fieldKey: string;
  value: string | null;
  confidence: "high" | "medium" | "low";
  source: "image" | "user_input" | "inferred";
};

export type FieldFillOutcome =
  | { status: "filled"; fields: AiFilledField[]; detected: number; total: number }
  | { status: "skipped"; reason: "no_fields" | "unknown_category" | "no_photos" }
  | { status: "failed"; reason: "invalid_response" | "unavailable" | "timeout" | "network" };

const responseSchema = z.object({
  ok: z.literal(true),
  fields: z
    .array(
      z.object({
        fieldKey: z.string(),
        value: z.string().nullable(),
        confidence: z.enum(["high", "medium", "low"]),
        source: z.enum(["image", "user_input", "inferred"]),
      }),
    )
    .default([]),
});

/** Schema fields the model is allowed to touch, in the shape the API expects. */
export function allowedFieldsPayload(
  fields: SpecFieldDef[],
  modes: SpecModeContext | null,
  labels?: Record<string, string>,
): {
  key: string;
  type: SpecFieldDef["type"];
  required: boolean;
  label?: string;
  options?: string[];
}[] {
  return fields.slice(0, 40).map((field) => ({
    key: field.key,
    type: field.type,
    required: isSpecFieldRequired(field, modes),
    ...(labels?.[field.key] ? { label: labels[field.key] } : {}),
    ...(field.options?.length ? { options: [...field.options].slice(0, 80) } : {}),
  }));
}

export async function fillListingFieldsFromPhotos(params: {
  category: string;
  subcategory: string;
  listingType: "personal" | "professional";
  itemName: string;
  photos: MediaRef[];
  modes?: SpecModeContext | null;
  labels?: Record<string, string>;
}): Promise<FieldFillOutcome> {
  const ids = taxonomyIdsForNames(params.category, params.subcategory);
  if (!ids) return { status: "skipped", reason: "unknown_category" };
  if (params.photos.length === 0) return { status: "skipped", reason: "no_photos" };

  const modes = params.modes ?? null;
  const schemaFields = getCategorySpecFields(params.category, params.subcategory, modes);
  if (schemaFields.length === 0) return { status: "skipped", reason: "no_fields" };

  let images;
  try {
    images = await buildAiImagePayload(params.photos);
  } catch {
    return { status: "failed", reason: "unavailable" };
  }
  if (images.length === 0) return { status: "skipped", reason: "no_photos" };

  const allowed = allowedFieldsPayload(schemaFields, modes, params.labels);
  const call = await postListingAi<unknown>("fields", {
    ...ids,
    listingType: params.listingType,
    itemName: params.itemName,
    fields: allowed,
    images,
  });

  if (!call.ok) {
    return {
      status: "failed",
      reason:
        call.code === "timeout"
          ? "timeout"
          : call.code === "network"
            ? "network"
            : call.code === "invalid_response"
              ? "invalid_response"
              : "unavailable",
    };
  }

  const parsed = responseSchema.safeParse(call.data);
  if (!parsed.success) return { status: "failed", reason: "invalid_response" };

  const allowedKeys = new Set(allowed.map((field) => field.key));
  const fields = parsed.data.fields.filter((field) => allowedKeys.has(field.fieldKey));
  const detected = fields.filter((field) => field.value !== null).length;

  trackEvent("ai_fields_accepted", {
    categoryId: ids.categoryId,
    subcategoryId: ids.subcategoryId,
    listingType: params.listingType,
    detected,
    total: allowed.length,
  });

  return { status: "filled", fields, detected, total: allowed.length };
}

/** Only fills blanks — a value the host already typed always wins. */
export function applyFilledFieldsToSpecs(
  current: Record<string, string>,
  fields: AiFilledField[],
): { specs: Record<string, string>; appliedKeys: string[] } {
  const specs = { ...current };
  const appliedKeys: string[] = [];

  for (const field of fields) {
    if (field.value === null) continue;
    if (specs[field.fieldKey]?.trim()) continue;
    specs[field.fieldKey] = field.value;
    appliedKeys.push(field.fieldKey);
  }

  return { specs, appliedKeys };
}
