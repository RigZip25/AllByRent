import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { enforceProxyGuard } from "../../lib/proxyGuard";
import { MAX_FIELD_IMAGES, extractListingFields } from "../../lib/listingAi/fields";
import { findTaxonomyPair } from "../../lib/listingAi/taxonomy";
import { readJsonBody, validateImages } from "../../lib/listingAi/request";

const requestSchema = z.object({
  categoryId: z.string().trim().min(1),
  subcategoryId: z.string().trim().min(1),
  listingType: z.enum(["personal", "professional"]),
  itemName: z.string().trim().max(80).default(""),
  fields: z
    .array(
      z.object({
        key: z.string().trim().min(1),
        type: z.enum(["text", "number", "select", "brand", "multiselect"]),
        required: z.boolean().default(false),
        label: z.string().trim().max(120).optional(),
        options: z.array(z.string().trim().min(1)).max(80).optional(),
      }),
    )
    .max(40),
});

/** Fills the confirmed category's field schema from the photos. */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ ok: false, code: "method_not_allowed" });
    return;
  }

  const guard = await enforceProxyGuard(req, res, {
    route: "listing-fields",
    maxAuthed: 30,
    maxAnon: 10,
    windowMs: 60_000,
    requireAuth: false,
  });
  if (!guard) return;

  let body: unknown;
  try {
    body = readJsonBody(req);
  } catch {
    res.status(400).json({ ok: false, code: "invalid_request", error: "Invalid JSON body" });
    return;
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ ok: false, code: "invalid_request", error: parsed.error.issues[0]?.message });
    return;
  }

  // The client picks the schema, but the category pair still has to be real.
  const pair = findTaxonomyPair(parsed.data.categoryId, parsed.data.subcategoryId);
  if (!pair) {
    res
      .status(400)
      .json({ ok: false, code: "unknown_category", error: "Unknown category or subcategory" });
    return;
  }

  const images = validateImages((body as { images?: unknown }).images, MAX_FIELD_IMAGES);
  if (!images.ok) {
    res
      .status(images.code === "unsupported_image" ? 415 : 400)
      .json({ ok: false, code: images.code, error: images.message });
    return;
  }

  const outcome = await extractListingFields({
    images: images.images,
    context: {
      itemName: parsed.data.itemName || pair.subcategory.label,
      categoryName: pair.category.name,
      subcategoryLabel: pair.subcategory.label,
      listingType: parsed.data.listingType,
    },
    fields: parsed.data.fields,
  });

  if (outcome.ok) {
    res.status(200).json({ ok: true, fields: outcome.fields });
    return;
  }

  res
    .status(outcome.code === "invalid_response" ? 422 : 503)
    .json({ ok: false, code: outcome.code, error: outcome.message });
}

export default withApiErrorHandling(handler);
