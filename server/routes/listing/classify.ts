import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { enforceProxyGuard } from "../../lib/proxyGuard";
import { MAX_CLASSIFY_IMAGES, classifyListingImages } from "../../lib/listingAi/classify";
import { readJsonBody, validateImages } from "../../lib/listingAi/request";

/** Photo → Evorios category/subcategory, validated against the real taxonomy. */
async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ ok: false, code: "method_not_allowed" });
    return;
  }

  // Vision calls are expensive; anonymous drafts still need to work.
  const guard = await enforceProxyGuard(req, res, {
    route: "listing-classify",
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

  const images = validateImages(
    (body as { images?: unknown } | null)?.images,
    MAX_CLASSIFY_IMAGES,
  );
  if (!images.ok) {
    res
      .status(images.code === "unsupported_image" ? 415 : 400)
      .json({ ok: false, code: images.code, error: images.message });
    return;
  }

  const outcome = await classifyListingImages(images.images);
  if (outcome.ok) {
    res.status(200).json({ ok: true, result: outcome.result });
    return;
  }

  res
    .status(outcome.code === "invalid_response" ? 422 : 503)
    .json({ ok: false, code: outcome.code, error: outcome.message });
}

export default withApiErrorHandling(handler);
