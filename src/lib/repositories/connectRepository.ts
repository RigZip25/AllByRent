import { fetchRemoteProfile } from "../supabaseProfile";
import { isSupabaseConfigured } from "../supabaseClient";
import {
  getSignInRequiredMessage,
  getStripeRequiredMessage,
  isPaymentsReady,
} from "../config/production";
import { createConnectAccountLink, getAccessToken, syncConnectAccountStatus } from "../stripePayments";

export type ConnectStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  /** Express onboarding form completed (details_submitted, nothing currently due). */
  onboardingComplete: boolean;
  last4: string | null;
};

export type ConnectOnboardingResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export async function loadConnectStatus(userId: string | null): Promise<ConnectStatus> {
  if (!userId || !isSupabaseConfigured()) {
    return { connected: false, payoutsEnabled: false, onboardingComplete: false, last4: null };
  }

  // Live sync from Stripe — webhook alone often lags and left sellers stuck after Connect.
  const synced = await syncConnectAccountStatus();
  if (synced.ok) {
    return {
      connected: synced.connected,
      payoutsEnabled: synced.payoutsEnabled,
      onboardingComplete: synced.onboardingComplete,
      last4: synced.last4,
    };
  }

  const remote = await fetchRemoteProfile(userId);
  if (!remote) {
    return { connected: false, payoutsEnabled: false, onboardingComplete: false, last4: null };
  }

  return {
    connected: Boolean(remote.stripe_connect_account_id),
    payoutsEnabled: Boolean(remote.stripe_payouts_enabled),
    onboardingComplete: Boolean(remote.stripe_payouts_enabled),
    last4: remote.stripe_bank_last4 ?? null,
  };
}

export async function startConnectOnboarding(returnPath = "/?screen=profile"): Promise<ConnectOnboardingResult> {
  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
  }

  const result = await createConnectAccountLink(returnPath);
  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }

  return { ok: true, url: result.url };
}
