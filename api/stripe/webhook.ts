import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getStripeSecretKey, getStripeWebhookSecret, isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient } from "../passkey/_lib/supabaseAdmin";

async function syncRentalPaymentFromIntent(
  admin: NonNullable<ReturnType<typeof getAdminClient>>,
  intent: Stripe.PaymentIntent,
): Promise<void> {
  const rentalId = intent.metadata?.rental_id;
  if (!rentalId) return;

  const paymentType = intent.metadata?.payment_type;

  if (paymentType === "deposit") {
    const patch: Record<string, unknown> = {
      stripe_deposit_payment_intent_id: intent.id,
      deposit_status: intent.status,
    };

    if (intent.status === "requires_capture") {
      patch.deposit_status = "held";
      const { data: rental } = await admin
        .from("rentals")
        .select("returned_at, end_date, deposit_claim_deadline_at")
        .eq("id", rentalId)
        .maybeSingle();

      if (rental && !rental.deposit_claim_deadline_at) {
        const base = rental.returned_at
          ? new Date(rental.returned_at)
          : new Date(`${rental.end_date}T23:59:59.999Z`);
        const deadline = new Date(base.getTime() + 48 * 60 * 60 * 1000);
        patch.deposit_claim_deadline_at = deadline.toISOString();
      }
    }

    if (intent.status === "canceled") {
      patch.deposit_status = "released";
    }

    if (intent.status === "succeeded" && intent.capture_method === "manual") {
      patch.deposit_status = "claimed";
    }

    await admin.from("rentals").update(patch).eq("id", rentalId);
    return;
  }

  const patch: Record<string, string> = {
    stripe_payment_intent_id: intent.id,
    stripe_payment_status: intent.status,
  };

  await admin.from("rentals").update(patch).eq("id", rentalId);
}

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const secret = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  if (!isStripeServerConfigured() || !webhookSecret) {
    res.status(200).json({ ok: false, reason: "Stripe webhook not configured" });
    return;
  }

  const stripe = new Stripe(secret!, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const sig = req.headers["stripe-signature"];
  if (typeof sig !== "string") {
    res.status(400).send("Missing signature");
    return;
  }

  const raw = await readRawBody(req);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (e) {
    res.status(400).send(`Webhook error: ${e instanceof Error ? e.message : "invalid"}`);
    return;
  }

  const admin = getAdminClient();

  if (event.type.startsWith("identity.verification_session.")) {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = (session.metadata as { supabase_user_id?: string })?.supabase_user_id;
    const status = session.status;
    if (userId && admin) {
      const identityVerified = status === "verified";
      await admin
        .from("profiles")
        .update({ identity_verified: identityVerified })
        .eq("id", userId);
    }
  }

  if (admin && event.type.startsWith("payment_intent.")) {
    const intent = event.data.object as Stripe.PaymentIntent;
    const paymentType = intent.metadata?.payment_type;

    if (paymentType === "garage_cart") {
      const orderId = intent.metadata?.order_id;
      const hostId = intent.metadata?.host_id;
      if (orderId) {
        await admin
          .from("garage_orders")
          .update({
            stripe_payment_status: intent.status,
            status: intent.status === "succeeded" ? "paid" : intent.status,
          })
          .eq("id", orderId);

        if (event.type === "payment_intent.succeeded" && hostId) {
          const { data: lines } = await admin
            .from("garage_order_lines")
            .select("listing_id, price_cents")
            .eq("order_id", orderId);
          for (const line of lines ?? []) {
            await admin.from("garage_lot_states").upsert({
              listing_id: line.listing_id,
              host_id: hostId,
              state: {
                status: "sold",
                method: "buy_now",
                priceUsd: (line.price_cents as number) / 100,
                soldAt: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    if (paymentType === "garage_auction") {
      const orderId = intent.metadata?.order_id;
      const listingId = intent.metadata?.listing_id;
      const hostId = intent.metadata?.host_id;
      const winningBidUsd = Number.parseFloat(intent.metadata?.winning_bid_usd ?? "0");
      if (orderId) {
        await admin
          .from("garage_auction_payments")
          .update({
            stripe_payment_status: intent.status,
            status: intent.status === "succeeded" ? "paid" : intent.status,
          })
          .eq("id", orderId);
      }
      if (event.type === "payment_intent.succeeded" && listingId && hostId) {
        await admin.from("garage_lot_states").upsert({
          listing_id: listingId,
          host_id: hostId,
          state: {
            status: "sold",
            method: "auction",
            priceUsd: winningBidUsd,
            soldAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (paymentType === "listing_boost" && event.type === "payment_intent.succeeded") {
      const listingId = intent.metadata?.listing_id;
      const ownerId = intent.metadata?.owner_id;
      const boostedUntil = intent.metadata?.boosted_until;
      const boostedTier = intent.metadata?.boosted_tier;
      if (listingId && ownerId && boostedUntil) {
        await admin
          .from("listings")
          .update({
            boosted_until: boostedUntil,
            boosted_tier: boostedTier ? Number.parseFloat(boostedTier) : null,
          })
          .eq("id", listingId)
          .eq("owner_id", ownerId);
      }
    }

    if (paymentType === "rental" || paymentType === "deposit") {
      if (
        event.type === "payment_intent.succeeded" ||
        event.type === "payment_intent.payment_failed" ||
        event.type === "payment_intent.canceled" ||
        event.type === "payment_intent.processing" ||
        event.type === "payment_intent.amount_capturable_updated"
      ) {
        await syncRentalPaymentFromIntent(admin, intent);
      }
    }
  }

  if (admin && event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const planId = session.metadata?.subscription_plan_id;
    const userId = session.metadata?.supabase_user_id;
    if (planId && userId) {
      await admin.from("profiles").update({ subscription_plan_id: planId }).eq("id", userId);
    }
  }

  if (admin && event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const userId = account.metadata?.supabase_user_id;
    if (userId) {
      await admin
        .from("profiles")
        .update({ stripe_payouts_enabled: Boolean(account.payouts_enabled) })
        .eq("id", userId);
    }
  }

  res.status(200).json({ received: true });
});

