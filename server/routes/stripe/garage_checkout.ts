import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { randomUUID } from "crypto";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { getOrCreateStripeCustomer } from "../../lib/stripe/customer";
import { destinationChargeFields, requireHostPayoutAccount } from "../../lib/stripe/connectPayout";
import {
  buyerChargeFromSubtotalCents,
  platformFeeFromSubtotalCents,
  validateGarageSellLines,
  type GarageListingRow,
  type GarageLotRow,
} from "../../lib/stripe/garageInventory";

type Line = { listingId?: string; title?: string; priceUsd?: number };

type Body = {
  hostId?: string;
  lines?: Line[];
  amountCents?: number;
  subtotalCents?: number;
  platformFeeCents?: number;
  guestEmail?: string;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

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
  const body = (req.body ?? {}) as Body;
  const guestEmailRaw = typeof body.guestEmail === "string" ? body.guestEmail.trim().toLowerCase() : "";
  const guestEmail = isValidEmail(guestEmailRaw) ? guestEmailRaw : "";

  if (!user && !guestEmail) {
    res.status(401).json({ error: "Sign in or continue as guest with email" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const hostId = typeof body.hostId === "string" ? body.hostId.trim() : "";
  const lines = Array.isArray(body.lines) ? body.lines : [];
  const listingIds = [
    ...new Set(
      lines
        .map((line) => (typeof line.listingId === "string" ? line.listingId.trim() : ""))
        .filter(Boolean),
    ),
  ];

  if (!hostId || listingIds.length === 0) {
    res.status(400).json({ error: "hostId and lines are required" });
    return;
  }

  const hostPayout = await requireHostPayoutAccount(admin, hostId);
  if (!hostPayout.ok) {
    res.status(400).json({ ok: false, error: hostPayout.error });
    return;
  }

  const { data: listingRows, error: listingError } = await admin
    .from("listings")
    .select("id, owner_id, title, modes, pricing, availability, listing_status")
    .in("id", listingIds);

  if (listingError) {
    res.status(500).json({ error: "Failed to load listings" });
    return;
  }

  const { data: lotRows } = await admin
    .from("garage_lot_states")
    .select("listing_id, state")
    .in("listing_id", listingIds);

  const validated = validateGarageSellLines({
    hostId,
    listingIds,
    listings: (listingRows ?? []) as GarageListingRow[],
    lots: (lotRows ?? []) as GarageLotRow[],
  });
  if (!validated.ok) {
    res.status(409).json({ ok: false, error: validated.error });
    return;
  }

  const subtotalCents = validated.subtotalCents;
  const platformFeeCents = platformFeeFromSubtotalCents(subtotalCents);
  // Buyer pays listed prices only; platform fee is deducted from the seller via Connect.
  const amountCents = buyerChargeFromSubtotalCents(subtotalCents);

  const orderId = randomUUID();
  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });

  let customerId: string;
  if (user) {
    customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);
  } else {
    const customer = await stripe.customers.create({
      email: guestEmail,
      metadata: { guest_checkout: "1", host_id: hostId },
    });
    customerId = customer.id;
  }

  const destination = destinationChargeFields(hostPayout.account.accountId, platformFeeCents);
  const buyerId = user?.id ?? null;
  const receiptEmail = user?.email?.trim() || guestEmail || undefined;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    customer: customerId,
    receipt_email: receiptEmail,
    automatic_payment_methods: { enabled: true },
    metadata: {
      payment_type: "garage_cart",
      order_id: orderId,
      host_id: hostId,
      buyer_id: buyerId ?? "",
      guest_email: guestEmail || "",
      listing_ids: listingIds.join(",").slice(0, 450),
      line_count: String(validated.lines.length),
      platform_fee_cents: String(platformFeeCents),
      fee_paid_by: "seller",
    },
    ...destination,
  });

  const { error: orderError } = await admin.from("garage_orders").insert({
    id: orderId,
    buyer_id: buyerId,
    guest_email: buyerId ? null : guestEmail,
    host_id: hostId,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_payment_status: paymentIntent.status,
    subtotal_cents: subtotalCents,
    platform_fee_cents: platformFeeCents,
    total_cents: amountCents,
    status: "pending",
  });

  if (orderError) {
    res.status(500).json({ error: "Failed to create garage order" });
    return;
  }

  for (const line of validated.lines) {
    await admin.from("garage_order_lines").insert({
      order_id: orderId,
      listing_id: line.listingId,
      title: line.title,
      price_cents: line.priceCents,
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
    amountCents,
    subtotalCents,
    platformFeeCents,
  });
});
