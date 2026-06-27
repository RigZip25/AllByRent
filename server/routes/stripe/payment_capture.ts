import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { fetchRentalForPayments } from "../../lib/stripe/rentalAccess";
import { syncRentalPaymentFromIntent } from "../../lib/stripe/syncRentalPaymentIntent";

type Body = { rentalId?: string };

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

  const rental = await fetchRentalForPayments(admin, rentalId);
  if (!rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  if (rental.owner_id !== user.id) {
    res.status(403).json({ error: "Only the host can capture payment for this booking" });
    return;
  }

  if (!rental.stripe_payment_intent_id) {
    res.status(200).json({ ok: true, status: "no_payment" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  const intent = await stripe.paymentIntents.retrieve(rental.stripe_payment_intent_id);

  if (intent.status === "succeeded") {
    await syncRentalPaymentFromIntent(admin, intent);
    res.status(200).json({ ok: true, status: "succeeded", captured: true });
    return;
  }

  if (intent.status !== "requires_capture") {
    res.status(400).json({
      error: `Payment cannot be captured (status: ${intent.status}). Renter may need to complete checkout first.`,
    });
    return;
  }

  const captured = await stripe.paymentIntents.capture(intent.id);
  await syncRentalPaymentFromIntent(admin, captured);

  res.status(200).json({ ok: true, status: captured.status, captured: true });
});
