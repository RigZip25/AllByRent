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

    if (paymentType === "rental" || paymentType === "deposit") {
      if (
        event.type === "payment_intent.succeeded" ||
        event.type === "payment_intent.payment_failed" ||
        event.type === "payment_intent.canceled" ||
        event.type === "payment_intent.processing" ||
        event.type === "payment_intent.amount_capturable_updated"
      ) {
        await syncRentalPaymentFromIntent(admin, intent);

        if (paymentType === "deposit" && event.type === "payment_intent.succeeded") {
          const rentalId = intent.metadata?.rental_id;
          if (rentalId && intent.capture_method === "manual") {
            await admin
              .from("rentals")
              .update({ deposit_status: "held" })
              .eq("id", rentalId);
          }
        }
      }
    }
  }

  res.status(200).json({ received: true });
});

