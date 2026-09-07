import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { enforceProxyGuard } from "../../lib/proxyGuard";
import { generateListingCopy } from "../../lib/listingAi/copy";
import { findTaxonomyPair } from "../../lib/listingAi/taxonomy";
import { readJsonBody } from "../../lib/listingAi/request";

const requestSchema = z.object({
  categoryId: z.string().trim().min(1),
  subcategoryId: z.string().trim().min(1),
  listingType: z.enum(["personal", "professional"]),
  itemName: z.string().trim().min(1).max(80),
  locale: z.string().trim().max(12).optional(),
  facts: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(80),
        value: z.string().trim().min(1).max(160),
      }),
    )
    .max(40)
    .default([]),
});

/** Title + description from confirmed data only — no photos are accepted here. */
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
    route: "listing-copy",
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

  const pair = findTaxonomyPair(parsed.data.categoryId, parsed.data.subcategoryId);
  if (!pair) {
    res
      .status(400)
      .json({ ok: false, code: "unknown_category", error: "Unknown category or subcategory" });
    return;
  }

  const outcome = await generateListingCopy({
    itemName: parsed.data.itemName,
    categoryName: pair.category.name,
    subcategoryLabel: pair.subcategory.label,
    listingType: parsed.data.listingType,
    facts: parsed.data.facts,
    locale: parsed.data.locale,
  });

  if (outcome.ok) {
    res.status(200).json({ ok: true, title: outcome.title, description: outcome.description });
    return;
  }

  res
    .status(outcome.code === "invalid_response" ? 422 : 503)
    .json({ ok: false, code: outcome.code, error: outcome.message });
}

export default withApiErrorHandling(handler);
