import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { getOrCreateStripeCustomer } from "./_lib/customer";

type Line = { listingId?: string; title?: string; priceUsd?: number };

type Body = {
  hostId?: string;
  lines?: Line[];
  amountCents?: number;
  subtotalCents?: number;
  platformFeeCents?: number;
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
  const hostId = typeof body.hostId === "string" ? body.hostId.trim() : "";
  const amountCents = typeof body.amountCents === "number" ? Math.round(body.amountCents) : 0;
  const lines = Array.isArray(body.lines) ? body.lines : [];

  if (!hostId || amountCents < 50 || lines.length === 0) {
    res.status(400).json({ error: "hostId, amountCents (≥50), and lines are required" });
    return;
  }

  const orderId = randomUUID();
  const listingIds = lines
    .map((line) => (typeof line.listingId === "string" ? line.listingId.trim() : ""))
    .filter(Boolean)
    .join(",");

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    metadata: {
      payment_type: "garage_cart",
      order_id: orderId,
      host_id: hostId,
      buyer_id: user.id,
      listing_ids: listingIds.slice(0, 450),
      line_count: String(lines.length),
    },
  });

  // TODO: insert into garage_orders + garage_order_lines when migration is applied.

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
