import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { getOrCreateStripeCustomer } from "../../lib/stripe/customer";
import { fetchRentalForPayments } from "../../lib/stripe/rentalAccess";

type Body = { rentalId?: string };

const RENTAL_PAID_STATUSES = new Set(["succeeded", "processing"]);

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

  if (rental.renter_id !== user.id) {
    res.status(403).json({ error: "Only the renter can authorize the deposit hold" });
    return;
  }

  const amountCents = Math.max(0, rental.deposit_amount_cents);
  if (amountCents < 50) {
    res.status(400).json({ error: "No security deposit on this rental" });
    return;
  }

  if (!rental.stripe_payment_status || !RENTAL_PAID_STATUSES.has(rental.stripe_payment_status)) {
    if (rental.stripe_payment_intent_id) {
      const secret = process.env.STRIPE_SECRET_KEY!;
      const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
      try {
        const rentalPi = await stripe.paymentIntents.retrieve(rental.stripe_payment_intent_id);
        if (RENTAL_PAID_STATUSES.has(rentalPi.status)) {
          await admin
            .from("rentals")
            .update({ stripe_payment_status: rentalPi.status })
            .eq("id", rentalId);
        } else {
          res.status(400).json({ error: "Rental payment must complete before deposit hold" });
          return;
        }
      } catch {
        res.status(400).json({ error: "Rental payment must complete before deposit hold" });
        return;
      }
    } else {
      res.status(400).json({ error: "Rental payment must complete before deposit hold" });
      return;
    }
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);

  const metadata = {
    rental_id: rentalId,
    listing_id: rental.listing_id,
    owner_id: rental.owner_id,
    renter_id: user.id,
    payment_type: "deposit",
  };

  let paymentIntent: Stripe.PaymentIntent;

  if (rental.stripe_deposit_payment_intent_id) {
    try {
      const existing = await stripe.paymentIntents.retrieve(rental.stripe_deposit_payment_intent_id);
      if (
        existing.capture_method === "manual" &&
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
          capture_method: "manual",
          automatic_payment_methods: { enabled: true },
          metadata,
        });
      }
    } catch {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        customer: customerId,
        capture_method: "manual",
        automatic_payment_methods: { enabled: true },
        metadata,
      });
    }
  } else {
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      capture_method: "manual",
      automatic_payment_methods: { enabled: true },
      metadata,
    });
  }

  const { error: updateError } = await admin
    .from("rentals")
    .update({
      stripe_deposit_payment_intent_id: paymentIntent.id,
      deposit_status: paymentIntent.status,
    })
    .eq("id", rentalId);

  if (updateError) {
    res.status(500).json({ error: "Failed to link deposit hold to rental" });
    return;
  }

  if (!paymentIntent.client_secret) {
    res.status(500).json({ error: "Deposit PaymentIntent missing client secret" });
    return;
  }

  res.status(200).json({
    ok: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
    amountCents,
  });
});
