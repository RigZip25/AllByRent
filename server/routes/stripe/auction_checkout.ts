import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { getOrCreateStripeCustomer } from "../../lib/stripe/customer";
import { destinationChargeFields, requireHostPayoutAccount } from "../../lib/stripe/connectPayout";

type Body = {
  listingId?: string;
  hostId?: string;
  winningBidUsd?: number;
  amountCents?: number;
  platformFeeCents?: number;
  runnerUpAttempt?: number;
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
  const hostId = typeof body.hostId === "string" ? body.hostId.trim() : "";
  const amountCents = typeof body.amountCents === "number" ? Math.round(body.amountCents) : 0;
  const winningBidUsd = typeof body.winningBidUsd === "number" ? body.winningBidUsd : 0;
  const platformFeeCents =
    typeof body.platformFeeCents === "number" ? Math.max(0, Math.round(body.platformFeeCents)) : 0;
  const runnerUpAttempt =
    typeof body.runnerUpAttempt === "number" ? Math.max(1, Math.round(body.runnerUpAttempt)) : 1;

  if (!listingId || !hostId || amountCents < 50 || winningBidUsd <= 0) {
    res.status(400).json({ error: "listingId, hostId, winningBidUsd, and amountCents (≥50) are required" });
    return;
  }

  const hostPayout = await requireHostPayoutAccount(admin, hostId);
  if (!hostPayout.ok) {
    res.status(400).json({ ok: false, error: hostPayout.error });
    return;
  }

  const orderId = randomUUID();
  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);
  const destination = destinationChargeFields(hostPayout.account.accountId, platformFeeCents);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      payment_type: "garage_auction",
      order_id: orderId,
      listing_id: listingId,
      host_id: hostId,
      buyer_id: user.id,
      winning_bid_usd: String(winningBidUsd),
      runner_up_attempt: String(runnerUpAttempt),
      platform_fee_cents: String(platformFeeCents),
    },
    ...destination,
  });

  await admin.from("garage_auction_payments").insert({
    id: orderId,
    listing_id: listingId,
    buyer_id: user.id,
    host_id: hostId,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_payment_status: paymentIntent.status,
    winning_bid_cents: Math.round(winningBidUsd * 100),
    platform_fee_cents: platformFeeCents,
    total_cents: amountCents,
    runner_up_attempt: runnerUpAttempt,
    status: "pending",
  });

  if (!paymentIntent.client_secret) {
    res.status(500).json({ error: "PaymentIntent missing client secret" });
    return;
  }

  res.status(200).json({
    ok: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId,
    status: paymentIntent.status,
  });
});
