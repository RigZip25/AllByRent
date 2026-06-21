import { fetchRemoteProfile } from "../supabaseProfile";
import { isSupabaseConfigured } from "../supabaseClient";
import { isStripePaymentsEnabled } from "../stripeConfig";
import { createConnectAccountLink, getAccessToken } from "../stripePayments";

export type ConnectStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  last4: string | null;
  mode: "demo" | "live";
};

export type ConnectOnboardingResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export async function loadConnectStatus(userId: string | null): Promise<ConnectStatus> {
  if (!userId || !isSupabaseConfigured()) {
    return { connected: false, payoutsEnabled: false, last4: null, mode: "demo" };
  }

  const remote = await fetchRemoteProfile(userId);
  if (!remote) {
    return { connected: false, payoutsEnabled: false, last4: null, mode: "demo" };
  }

  return {
    connected: Boolean(remote.stripe_connect_account_id),
    payoutsEnabled: Boolean(remote.stripe_payouts_enabled),
    last4: remote.stripe_bank_last4 ?? null,
    mode: isStripePaymentsEnabled() ? "live" : "demo",
  };
}

export async function startConnectOnboarding(returnPath = "/?screen=profile"): Promise<ConnectOnboardingResult> {
  if (!isStripePaymentsEnabled()) {
    return {
      ok: false,
      reason: "Add VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to enable Stripe Connect onboarding.",
    };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required to connect payouts" };
  }

  const result = await createConnectAccountLink(returnPath);
  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }

  return { ok: true, url: result.url };
}
