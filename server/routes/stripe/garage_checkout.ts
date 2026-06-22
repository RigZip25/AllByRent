import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { getOrCreateStripeCustomer } from "../../lib/stripe/customer";

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

  // Persist order for webhook reconciliation.
  const { error: orderError } = await admin.from("garage_orders").insert({
    id: orderId,
    buyer_id: user.id,
    host_id: hostId,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_payment_status: paymentIntent.status,
    subtotal_cents: typeof body.subtotalCents === "number" ? Math.round(body.subtotalCents) : amountCents,
    platform_fee_cents: typeof body.platformFeeCents === "number" ? Math.round(body.platformFeeCents) : 0,
    total_cents: amountCents,
    status: "pending",
  });

  if (orderError) {
    res.status(500).json({ error: "Failed to create garage order" });
    return;
  }

  for (const line of lines) {
    const listingId = typeof line.listingId === "string" ? line.listingId.trim() : "";
    if (!listingId) continue;
    const priceUsd = typeof line.priceUsd === "number" ? line.priceUsd : 0;
    await admin.from("garage_order_lines").insert({
      order_id: orderId,
      listing_id: listingId,
      title: typeof line.title === "string" ? line.title.slice(0, 200) : "",
      price_cents: Math.round(priceUsd * 100),
    });
  }

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
