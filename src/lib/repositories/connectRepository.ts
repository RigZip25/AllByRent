import { fetchRemoteProfile } from "../supabaseProfile";
import { isSupabaseConfigured } from "../supabaseClient";
import {
  getSignInRequiredMessage,
  getStripeRequiredMessage,
  isPaymentsReady,
} from "../config/production";
import { createConnectAccountLink, getAccessToken } from "../stripePayments";

export type ConnectStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  last4: string | null;
};

export type ConnectOnboardingResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export async function loadConnectStatus(userId: string | null): Promise<ConnectStatus> {
  if (!userId || !isSupabaseConfigured()) {
    return { connected: false, payoutsEnabled: false, last4: null };
  }

  const remote = await fetchRemoteProfile(userId);
  if (!remote) {
    return { connected: false, payoutsEnabled: false, last4: null };
  }

  return {
    connected: Boolean(remote.stripe_connect_account_id),
    payoutsEnabled: Boolean(remote.stripe_payouts_enabled),
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
