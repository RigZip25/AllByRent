import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

/** Rentals that still need a party present — listings alone must not block deletion. */
const OPEN_RENTAL_STATUSES = [
  "pending_approval",
  "pending_checkin",
  "upcoming",
  "active",
  "overdue",
  "no_show",
] as const;

/** Garage sale / auction money still in flight. */
const OPEN_GARAGE_ORDER_STATUSES = ["pending", "processing", "requires_action"] as const;

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({
      ok: false,
      reason: "Account deletion requires SUPABASE_SERVICE_ROLE_KEY on the server.",
    });
    return;
  }

  const { count: openRentalCount, error: rentalsError } = await admin
    .from("rentals")
    .select("id", { count: "exact", head: true })
    .or(`owner_id.eq.${user.id},renter_id.eq.${user.id}`)
    .in("status", [...OPEN_RENTAL_STATUSES]);

  if (rentalsError) {
    res.status(500).json({ ok: false, reason: rentalsError.message });
    return;
  }

  if ((openRentalCount ?? 0) > 0) {
    res.status(409).json({
      ok: false,
      reason: "active_deals",
      message:
        "You still have an open rental or booking. Finish or cancel it first, then delete your account.",
    });
    return;
  }

  const { count: openOrderCount, error: ordersError } = await admin
    .from("garage_orders")
    .select("id", { count: "exact", head: true })
    .or(`host_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .in("status", [...OPEN_GARAGE_ORDER_STATUSES]);

  if (ordersError) {
    if (!/does not exist|schema cache/i.test(ordersError.message)) {
      res.status(500).json({ ok: false, reason: ordersError.message });
      return;
    }
  } else if ((openOrderCount ?? 0) > 0) {
    res.status(409).json({
      ok: false,
      reason: "active_deals",
      message:
        "You still have an open garage sale order. Finish or cancel it first, then delete your account.",
    });
    return;
  }

  const { count: openAuctionCount, error: auctionError } = await admin
    .from("garage_auction_payments")
    .select("id", { count: "exact", head: true })
    .or(`host_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .in("status", [...OPEN_GARAGE_ORDER_STATUSES]);

  if (auctionError) {
    if (!/does not exist|schema cache/i.test(auctionError.message)) {
      res.status(500).json({ ok: false, reason: auctionError.message });
      return;
    }
  } else if ((openAuctionCount ?? 0) > 0) {
    res.status(409).json({
      ok: false,
      reason: "active_deals",
      message:
        "You still have an open auction payment. Finish or cancel it first, then delete your account.",
    });
    return;
  }

  // Take shelf listings offline so neighbors don't see a deleted host's inventory.
  const { error: delistError } = await admin
    .from("listings")
    .update({ listing_status: "draft" })
    .eq("owner_id", user.id)
    .in("listing_status", ["active", "pending_qr", "published"]);

  if (delistError) {
    res.status(500).json({ ok: false, reason: delistError.message });
    return;
  }

  await admin
    .from("garage_storefronts")
    .update({ store_live: false })
    .eq("host_id", user.id);

  await admin
    .from("profiles")
    .update({
      display_name: "Deleted user",
      phone: null,
      stripe_connect_account_id: null,
      stripe_payouts_enabled: false,
      stripe_bank_last4: null,
    })
    .eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    res.status(500).json({ ok: false, reason: error.message });
    return;
  }

  res.status(200).json({
    ok: true,
    message: "Account deleted",
  });
});
