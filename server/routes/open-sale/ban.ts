import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/**
 * Host-gated Open Sale ban write (table is service-role / RPC only for clients).
 * Caller must host an open-sale event where the bidder appears in lot results.
 */
export default withApiErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user?.id) {
    res.status(401).json({ ok: false, error: "Sign in required" });
    return;
  }

  const bidderId = typeof req.body?.bidderId === "string" ? req.body.bidderId.trim() : "";
  const days = Math.max(1, Math.min(90, Number(req.body?.days ?? 30) || 30));
  const reason =
    typeof req.body?.reason === "string" && req.body.reason.trim()
      ? req.body.reason.trim().slice(0, 80)
      : "missed_payment";

  if (!isUuid(bidderId)) {
    res.status(400).json({ ok: false, error: "bidderId must be a signed-in user id" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ ok: false, error: "Database not configured" });
    return;
  }

  const { data: hostedEvents, error: eventsError } = await admin
    .from("open_sale_events")
    .select("id")
    .eq("host_id", user.id)
    .limit(40);
  if (eventsError) {
    res.status(500).json({ ok: false, error: eventsError.message });
    return;
  }
  const eventIds = (hostedEvents ?? []).map((row) => row.id as string).filter(Boolean);
  if (eventIds.length === 0) {
    res.status(403).json({ ok: false, error: "Only Open Sale hosts can ban unpaid winners" });
    return;
  }

  const { data: lotHits, error: lotError } = await admin
    .from("open_sale_lot_results")
    .select("listing_id")
    .in("event_id", eventIds)
    .eq("winner_bidder_id", bidderId)
    .limit(1);
  if (lotError) {
    res.status(500).json({ ok: false, error: lotError.message });
    return;
  }
  if (!lotHits?.length) {
    res.status(403).json({ ok: false, error: "Bidder is not an unpaid winner on your Open Sale" });
    return;
  }

  const { error: banError } = await admin.rpc("ban_open_sale_bidder", {
    p_bidder_id: bidderId,
    p_days: days,
    p_reason: reason,
  });
  if (banError) {
    res.status(500).json({ ok: false, error: banError.message });
    return;
  }

  const bannedUntil = new Date(Date.now() + days * 86_400_000).toISOString();
  res.status(200).json({ ok: true, bidderId, bannedUntil, reason });
});
