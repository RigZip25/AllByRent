import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../_lib/cors";
import { isStripeServerConfigured } from "../_lib/keys";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { getOrCreateStripeCustomer } from "./_lib/customer";

type Body = {
  returnPath?: string;
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
  const returnPath = typeof body.returnPath === "string" && body.returnPath.startsWith("/")
    ? body.returnPath
    : "/?screen=profile";

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_connect_account_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: "Failed to load profile" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const origin = resolveOrigin(req);

  let accountId = profile?.stripe_connect_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
      capabilities: {
        transfers: { requested: true },
      },
    });
    accountId = account.id;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ stripe_connect_account_id: accountId })
      .eq("id", user.id);

    if (updateError) {
      res.status(500).json({ error: "Failed to save Connect account" });
      return;
    }
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}${returnPath}&connect=refresh`,
    return_url: `${origin}${returnPath}&connect=done`,
    type: "account_onboarding",
  });

  res.status(200).json({ ok: true, url: accountLink.url });
});
