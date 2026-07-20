import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isCronAuthorized } from "../../lib/cronAuth";
import { runAbandonedListingNudges } from "../../lib/abandonedListingNudge";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient } from "../../lib/passkey/supabaseAdmin";

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isCronAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ ok: false, reason: "Database not configured" });
    return;
  }

  const result = await runAbandonedListingNudges(admin);
  res.status(200).json({ ok: true, ...result });
});
