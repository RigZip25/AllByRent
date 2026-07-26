import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

function bankLast4FromAccount(account: Stripe.Account): string | null {
  const ext = account.external_accounts?.data?.[0] as
    | { last4?: string | null }
    | undefined;
  const last4 = ext?.last4?.trim();
  return last4 || null;
}

/** Pull live Connect account status into profiles (webhook can lag or miss). */
export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST" && req.method !== "GET") {
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

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_connect_account_id, stripe_payouts_enabled, stripe_bank_last4")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: "Failed to load profile" });
    return;
  }

  const accountId = profile?.stripe_connect_account_id?.trim() || "";
  if (!accountId) {
    res.status(200).json({
      ok: true,
      connected: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      chargesEnabled: false,
      onboardingComplete: false,
      last4: null,
    });
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion,
  });

  const account = await stripe.accounts.retrieve(accountId);
  const payoutsEnabled = Boolean(account.payouts_enabled);
  const chargesEnabled = Boolean(account.charges_enabled);
  const detailsSubmitted = Boolean(account.details_submitted);
  // Express hosted form submitted — enough to publish listings.
  // (currently_due can still list pending reviews; don't block the host on that.)
  const onboardingComplete = detailsSubmitted || payoutsEnabled || chargesEnabled;
  const last4 = bankLast4FromAccount(account);

  // Persist payouts when Stripe says so; also mark enabled once charges work.
  const nextPayouts =
    payoutsEnabled || chargesEnabled || Boolean(profile?.stripe_payouts_enabled);
  await admin
    .from("profiles")
    .update({
      stripe_payouts_enabled: nextPayouts,
      ...(last4 ? { stripe_bank_last4: last4 } : {}),
      // Ensure metadata link for future webhooks
      stripe_connect_account_id: accountId,
    })
    .eq("id", user.id);

  // Best-effort: stamp user id on the Connect account for webhook matching.
  if (!account.metadata?.supabase_user_id) {
    try {
      await stripe.accounts.update(accountId, {
        metadata: { ...(account.metadata ?? {}), supabase_user_id: user.id },
      });
    } catch {
      /* ignore */
    }
  }

  res.status(200).json({
    ok: true,
    connected: true,
    payoutsEnabled: nextPayouts,
    detailsSubmitted,
    chargesEnabled,
    onboardingComplete,
    last4: last4 ?? profile?.stripe_bank_last4 ?? null,
  });
});
