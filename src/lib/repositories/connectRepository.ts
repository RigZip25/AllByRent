import { fetchRemoteProfile } from "../supabaseProfile";
import { isSupabaseConfigured, getSupabaseClient } from "../supabaseClient";
import {
  getSignInRequiredMessage,
  getStripeRequiredMessage,
  isPaymentsReady,
} from "../config/production";
import { createConnectAccountLink, getAccessToken, syncConnectAccountStatus } from "../stripePayments";
import { openConnectOnboardingSheet } from "../connectOnboardingBus";
import { isPhoneOtpClientEnabled } from "../phoneE164";
import { isLocalPhoneVerified, refreshPhoneVerifiedFromRemote } from "../phoneKyc";

export type ConnectStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  /** Express onboarding form completed (details_submitted, nothing currently due). */
  onboardingComplete: boolean;
  last4: string | null;
};

export type ConnectOnboardingResult =
  | { ok: true; mode: "embedded" }
  | { ok: true; mode: "redirect"; url: string }
  | { ok: false; reason: string; code?: string };

export type StartConnectOptions = {
  /**
   * When true (Profile), open embedded UI even if bank is already linked —
   * Stripe Account Management lets the host update bank / payout details.
   * Default false: Live / publish flows treat already-connected as a soft stop.
   */
  allowUpdate?: boolean;
};

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

async function runConnectPrechecks(
  opts?: StartConnectOptions,
): Promise<{ ok: true } | { ok: false; reason: string; code?: string }> {
  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
  }

  const supabase = getSupabaseClient();
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id ?? null : null;

  // Setup flows (Live / publish): already linked is success, don't reopen.
  // Profile allowUpdate: skip — open Account Management instead.
  if (!opts?.allowUpdate) {
    const existing = await loadConnectStatus(userId);
    if (existing.payoutsEnabled || existing.onboardingComplete) {
      return {
        ok: false,
        code: "already_connected",
        reason: existing.payoutsEnabled
          ? "Bank already connected — payouts are enabled. Tap refresh status or Go live."
          : "Stripe onboarding already finished. Tap refresh status or Go live.",
      };
    }
  }

  // Phone KYC only when SMS OTP is actually enabled (same gate as Go Public checklist).
  if (isPhoneOtpClientEnabled()) {
    let phoneOk = isLocalPhoneVerified();
    if (!phoneOk && userId) phoneOk = await refreshPhoneVerifiedFromRemote(userId);
    if (!phoneOk) {
      return {
        ok: false,
        reason:
          "Verify your phone by SMS before connecting payouts. Open Account settings → Phone.",
        code: "phone_unverified",
      };
    }
  }

  return { ok: true };
}

/**
 * Prefer in-app embedded Connect onboarding / management; fall back to Account Link redirect
 * if the sheet host is not mounted (tests / early boot).
 */
export async function startConnectOnboarding(
  returnPath = "/?screen=garage",
  opts?: StartConnectOptions,
): Promise<ConnectOnboardingResult> {
  const pre = await runConnectPrechecks(opts);
  if (!pre.ok) {
    return { ok: false, reason: pre.reason, ...(pre.code ? { code: pre.code } : {}) };
  }

  if (openConnectOnboardingSheet({ returnPath })) {
    return { ok: true, mode: "embedded" };
  }

  // Redirect fallback is onboarding-only; manage requires the embedded sheet.
  if (opts?.allowUpdate) {
    return {
      ok: false,
      reason: "Open the app to update payout details (in-app bank settings).",
    };
  }

  const result = await createConnectAccountLink(returnPath);
  if (!result.ok) {
    return { ok: false, reason: result.reason, ...(result.code ? { code: result.code } : {}) };
  }

  return { ok: true, mode: "redirect", url: result.url };
}
