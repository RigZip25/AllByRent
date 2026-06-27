import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { syncRentalPaymentFromIntent } from "../../lib/stripe/syncRentalPaymentIntent";

type Body = { rentalId?: string };

const PAID_STATUSES = new Set(["succeeded", "processing"]);

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

  const rentalId = typeof (req.body as Body)?.rentalId === "string" ? req.body.rentalId.trim() : "";
  if (!rentalId) {
    res.status(400).json({ error: "rentalId is required" });
    return;
  }

  const { data: rental, error: rentalError } = await admin
    .from("rentals")
    .select("id, renter_id, stripe_payment_intent_id, stripe_payment_status")
    .eq("id", rentalId)
    .maybeSingle();

  if (rentalError || !rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  if (rental.renter_id !== user.id) {
    res.status(403).json({ error: "Only the renter can confirm this payment" });
    return;
  }

  if (!rental.stripe_payment_intent_id) {
    res.status(400).json({ error: "No payment started for this rental" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const intent = await stripe.paymentIntents.retrieve(rental.stripe_payment_intent_id);

  await syncRentalPaymentFromIntent(admin, intent);

  const paid = PAID_STATUSES.has(intent.status);

  res.status(200).json({
    ok: true,
    status: intent.status,
    paid,
  });
});
