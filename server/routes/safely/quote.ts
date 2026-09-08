import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleOptions, applyCors } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";

/**
 * Platform rental insurance is not wired to a live partner yet.
 * Do not return branded quotes or fee estimates until a real policy API is connected.
 * Route path stays `/api/safely/*` for when the partner lands.
 */
export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json({
    provider: "unavailable",
    feeCents: 0,
    currency: "USD",
    policyId: null,
    isEstimate: false,
    available: false,
  });
});
