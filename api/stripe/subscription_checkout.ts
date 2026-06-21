import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { getOrCreateStripeCustomer } from "./_lib/customer";

type Body = {
  planId?: string;
};

const PLAN_PRICE_ENV: Record<string, string> = {
  starter: "STRIPE_PRICE_STARTER",
  pro: "STRIPE_PRICE_PRO",
};

function resolveOrigin(req: VercelRequest): string {
  const configured = process.env.PASSKEY_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin) return origin.replace(/\/$/, "");
  return "https://app.allbyrent.com";
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
  const planId = typeof body.planId === "string" ? body.planId.trim() : "";
  const priceEnvKey = PLAN_PRICE_ENV[planId];

  if (!priceEnvKey) {
    res.status(400).json({ error: "Unsupported planId — set STRIPE_PRICE_STARTER / STRIPE_PRICE_PRO" });
    return;
  }

  const priceId = process.env[priceEnvKey]?.trim();
  if (!priceId) {
    res.status(200).json({
      ok: false,
      reason: `${priceEnvKey} is not set — create a Stripe Price and add it to Vercel env.`,
    });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const customerId = await getOrCreateStripeCustomer(stripe, admin, user.id, user.email);
  const origin = resolveOrigin(req);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/?screen=subscriptionPlans&checkout=success&plan=${planId}`,
    cancel_url: `${origin}/?screen=subscriptionPlans&checkout=cancel`,
    metadata: {
      supabase_user_id: user.id,
      subscription_plan_id: planId,
    },
  });

  if (!session.url) {
    res.status(500).json({ error: "Checkout session missing URL" });
    return;
  }

  res.status(200).json({
    ok: true,
    checkoutUrl: session.url,
    sessionId: session.id,
  });
});
