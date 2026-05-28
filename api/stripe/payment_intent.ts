import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { getOrCreateStripeCustomer } from "./_lib/customer";

type Body = {
  rentalId?: string;
  listingId?: string;
  ownerId?: string;
  amountCents?: number;
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
  const rentalId = typeof body.rentalId === "string" ? body.rentalId.trim() : "";
  const listingId = typeof body.listingId === "string" ? body.listingId.trim() : "";
  const ownerId = typeof body.ownerId === "string" ? body.ownerId.trim() : "";
  const amountCents = typeof body.amountCents === "number" ? Math.round(body.amountCents) : 0;

  if (!rentalId || !listingId || !ownerId || amountCents < 50) {
    res.status(400).json({ error: "rentalId, listingId, ownerId, and amountCents (≥50) are required" });
    return;
  }

  const { data: rental, error: rentalError } = await admin
    .from("rentals")
    .select("id, renter_id, owner_id, listing_id, stripe_payment_intent_id")
    .eq("id", rentalId)
    .maybeSingle();

  if (rentalError || !rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  if (rental.renter_id !== user.id) {
    res.status(403).json({ error: "Only the renter can pay for this booking" });
    return;
  }

  if (rental.listing_id !== listingId || rental.owner_id !== ownerId) {
    res.status(400).json({ error: "Listing or owner mismatch" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);

  const metadata = {
    rental_id: rentalId,
    listing_id: listingId,
    owner_id: ownerId,
    renter_id: user.id,
    payment_type: "rental",
  };

  let paymentIntent: Stripe.PaymentIntent;

  if (rental.stripe_payment_intent_id) {
    try {
      const existing = await stripe.paymentIntents.retrieve(rental.stripe_payment_intent_id);
      if (
        existing.status !== "canceled" &&
        existing.status !== "succeeded" &&
        existing.amount === amountCents
      ) {
        paymentIntent = existing;
      } else {
        paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: "usd",
          customer: customerId,
          automatic_payment_methods: { enabled: true },
          metadata,
        });
      }
    } catch {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata,
      });
    }
  } else {
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata,
    });
  }

  const { error: updateError } = await admin
    .from("rentals")
    .update({
      stripe_payment_intent_id: paymentIntent.id,
      stripe_payment_status: paymentIntent.status,
    })
    .eq("id", rentalId);

  if (updateError) {
    res.status(500).json({ error: "Failed to link payment to rental" });
    return;
  }

  if (!paymentIntent.client_secret) {
    res.status(500).json({ error: "PaymentIntent missing client secret" });
    return;
  }

  res.status(200).json({
    ok: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  });
});
