import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { getOrCreateStripeCustomer } from "./_lib/customer";

type Body = {
  listingId?: string;
  amountCents?: number;
  durationHours?: number;
};

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isStripeServerConfigured()) {
    res.status(200).json({ ok: false, reason: "Stripe not configured" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const body = (req.body ?? {}) as Body;
  const listingId = typeof body.listingId === "string" ? body.listingId.trim() : "";
  const amountCents = typeof body.amountCents === "number" ? Math.round(body.amountCents) : 0;
  const durationHours = typeof body.durationHours === "number" ? Math.round(body.durationHours) : 0;

  if (!listingId || amountCents < 50 || durationHours < 1) {
    res.status(400).json({ error: "listingId, amountCents (≥50), and durationHours (≥1) are required" });
    return;
  }

  const { data: listing, error: listingError } = await admin
    .from("listings")
    .select("id, owner_id")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  if (listing.owner_id !== user.id) {
    res.status(403).json({ error: "Only the listing owner can boost" });
    return;
  }

  const boostedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  const boostedTier = amountCents / 100;

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      payment_type: "listing_boost",
      listing_id: listingId,
      owner_id: user.id,
      boosted_until: boostedUntil,
      boosted_tier: String(boostedTier),
      duration_hours: String(durationHours),
    },
  });

  if (!paymentIntent.client_secret) {
    res.status(500).json({ error: "PaymentIntent missing client secret" });
    return;
  }

  res.status(200).json({
    ok: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    boostedUntil,
    boostedTier,
    status: paymentIntent.status,
  });
});
