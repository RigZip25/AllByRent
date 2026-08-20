import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { fetchRentalForPayments } from "../../lib/stripe/rentalAccess";
import { syncRentalPaymentFromIntent } from "../../lib/stripe/syncRentalPaymentIntent";

type Body = {
  rentalId?: string;
  /** Optional explicit refund amount; otherwise percent of rental_total_cents / charge. */
  amountCents?: number;
  /** 0–100; used when amountCents omitted. */
  percent?: number;
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
  if (!rentalId) {
    res.status(400).json({ error: "rentalId is required" });
    return;
  }

  const rental = await fetchRentalForPayments(admin, rentalId);
  if (!rental) {
    res.status(404).json({ error: "Rental not found" });
    return;
  }

  const isOwner = rental.owner_id === user.id;
  const isRenter = rental.renter_id === user.id;
  if (!isOwner && !isRenter) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!rental.stripe_payment_intent_id) {
    res.status(200).json({ ok: true, status: "no_payment", refundStatus: "none" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  const intent = await stripe.paymentIntents.retrieve(rental.stripe_payment_intent_id);

  // Uncaptured auth — cancel rather than refund.
  if (
    intent.status === "requires_capture" ||
    intent.status === "requires_action" ||
    intent.status === "requires_confirmation" ||
    intent.status === "requires_payment_method" ||
    intent.status === "processing"
  ) {
    const canceled = await stripe.paymentIntents.cancel(intent.id);
    await syncRentalPaymentFromIntent(admin, canceled);
    res.status(200).json({
      ok: true,
      status: canceled.status,
      refundStatus: "released",
      mode: "cancel_authorization",
    });
    return;
  }

  if (intent.status === "canceled") {
    await syncRentalPaymentFromIntent(admin, intent);
    res.status(200).json({ ok: true, status: "canceled", refundStatus: "released", mode: "already_canceled" });
    return;
  }

  if (intent.status !== "succeeded") {
    res.status(400).json({ error: `Cannot refund payment in status ${intent.status}` });
    return;
  }

  const chargeable = intent.amount_received || intent.amount || 0;
  let amountCents =
    typeof body.amountCents === "number" && Number.isFinite(body.amountCents)
      ? Math.max(0, Math.floor(body.amountCents))
      : null;

  if (amountCents == null) {
    const percent =
      typeof body.percent === "number" && Number.isFinite(body.percent)
        ? Math.min(100, Math.max(0, body.percent))
        : 100;
    const base =
      typeof rental.rental_total_cents === "number" && rental.rental_total_cents > 0
        ? rental.rental_total_cents
        : chargeable;
    amountCents = Math.round(base * (percent / 100));
  }

  amountCents = Math.min(amountCents, chargeable);

  if (amountCents <= 0) {
    res.status(200).json({
      ok: true,
      status: intent.status,
      refundStatus: "none",
      mode: "zero_amount",
      amountCents: 0,
    });
    return;
  }

  const refund = await stripe.refunds.create({
    payment_intent: intent.id,
    amount: amountCents,
    reason: "requested_by_customer",
    metadata: {
      rental_id: rentalId,
      requested_by: user.id,
    },
  });

  await admin
    .from("rentals")
    .update({
      stripe_payment_status: refund.status === "succeeded" ? "refunded" : `refund_${refund.status}`,
    })
    .eq("id", rentalId);

  res.status(200).json({
    ok: true,
    status: refund.status,
    refundStatus: refund.status === "succeeded" || refund.status === "pending" ? "refund_submitted" : "contact_support",
    mode: "refund",
    amountCents,
    refundId: refund.id,
  });
});
