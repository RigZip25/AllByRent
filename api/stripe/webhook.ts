import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient } from "../passkey/_lib/supabaseAdmin";

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

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    res.status(200).json({ ok: false, reason: "Stripe webhook not configured" });
    return;
  }

  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as any });
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

  if (event.type.startsWith("identity.verification_session.")) {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = (session.metadata as any)?.supabase_user_id as string | undefined;
    const status = session.status;
    if (userId) {
      const admin = getAdminClient();
      if (admin) {
        const identityVerified = status === "verified";
        await admin
          .from("profiles")
          .update({ identity_verified: identityVerified })
          .eq("id", userId);
      }
    }
  }

  res.status(200).json({ received: true });
});

