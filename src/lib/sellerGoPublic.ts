import { fetchRemoteProfile } from "./supabaseProfile";
import { isSupabaseConfigured } from "./supabaseClient";
import { loadConnectStatus, startConnectOnboarding } from "./repositories/connectRepository";
import { loadUserProfile } from "./userProfileStorage";
import { getAccessToken } from "./stripePayments";
import {
  getSignInRequiredMessage,
  getStripeRequiredMessage,
  isPaymentsReady,
} from "./config/production";

const GO_PUBLIC_PENDING_KEY = "allbyrent_go_public_listing";

/**
 * Go-public checklist steps.
 * Identity KYC is collected inside Stripe Connect Express — a separate Stripe Identity
 * product step blocked hosts when Identity wasn’t enabled in the Dashboard.
 */
export type SellerGoPublicStep = "sign_in" | "stripe" | "ready";

/** Persist that the host was mid “go public” so Stripe/auth returns reopen the checklist. */
export function markGoPublicPending(listingId: string): void {
  const id = listingId.trim();
  if (!id) return;
  try {
    sessionStorage.setItem(GO_PUBLIC_PENDING_KEY, id);
  } catch {
    // ignore
  }
}

export function peekGoPublicPending(): string | null {
  try {
    return sessionStorage.getItem(GO_PUBLIC_PENDING_KEY);
  } catch {
    return null;
  }
}

export function clearGoPublicPending(): void {
  try {
    sessionStorage.removeItem(GO_PUBLIC_PENDING_KEY);
  } catch {
    // ignore
  }
}

export type SellerGoPublicStatus = {
  signedIn: boolean;
  /** Stripe Identity badge and/or Connect KYC completed (payouts). */
  identityVerified: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
  /** Express onboarding finished even if payouts are still enabling. */
  onboardingComplete: boolean;
  bankLast4: string | null;
  ready: boolean;
  nextStep: SellerGoPublicStep;
};

export type SellerGoPublicActionResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/** Deep-link back into the listing wizard after Stripe Connect. */
export function listingWizardReturnPath(listingId: string): string {
  const id = listingId.trim();
  if (!id) return "/?screen=listItem";
  return `/?screen=listItem&listingId=${encodeURIComponent(id)}`;
}

export function resolveSellerGoPublicNextStep(
  status: Pick<SellerGoPublicStatus, "signedIn" | "payoutsEnabled" | "onboardingComplete">,
): SellerGoPublicStep {
  if (!status.signedIn) return "sign_in";
  // Allow go-public after Express form is done — don't wait only on payouts_enabled webhook.
  if (!status.payoutsEnabled && !status.onboardingComplete) return "stripe";
  return "ready";
}

export async function loadSellerGoPublicStatus(
  userId: string | null,
): Promise<SellerGoPublicStatus> {
  const signedIn = Boolean(userId);

  if (!signedIn || !isSupabaseConfigured()) {
    const localIdentity = Boolean(loadUserProfile().verification.identity);
    const next = resolveSellerGoPublicNextStep({
      signedIn,
      payoutsEnabled: false,
      onboardingComplete: false,
    });
    return {
      signedIn,
      identityVerified: localIdentity,
      connected: false,
      payoutsEnabled: false,
      onboardingComplete: false,
      bankLast4: null,
      ready: next === "ready",
      nextStep: next,
    };
  }

  const [remote, connect] = await Promise.all([
    fetchRemoteProfile(userId),
    loadConnectStatus(userId),
  ]);

  // Connect Express already runs government-ID KYC; treat Connect done as identity-complete too.
  const identityVerified =
    Boolean(remote?.identity_verified) ||
    Boolean(loadUserProfile().verification.identity) ||
    connect.payoutsEnabled ||
    connect.onboardingComplete;

  const next = resolveSellerGoPublicNextStep({
    signedIn: true,
    payoutsEnabled: connect.payoutsEnabled,
    onboardingComplete: connect.onboardingComplete,
  });

  return {
    signedIn: true,
    identityVerified,
    connected: connect.connected,
    payoutsEnabled: connect.payoutsEnabled,
    onboardingComplete: connect.onboardingComplete,
    bankLast4: connect.last4,
    ready: next === "ready",
    nextStep: next,
  };
}

function friendlyIdentityError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("identity") &&
    (lower.includes("not enabled") ||
      lower.includes("not been activated") ||
      lower.includes("activate") ||
      lower.includes("signed up"))
  ) {
    return "Stripe Identity isn’t enabled on this Stripe account. Use Connect bank in Go public instead (ID check is included), or enable Identity in Stripe Dashboard → Identity.";
  }
  if (lower.includes("invalid api key") || lower.includes("api key")) {
    return "Stripe API key problem. Check STRIPE_SECRET_KEY on Vercel (test vs live).";
  }
  return raw;
}

export async function startIdentityVerificationForListing(
  returnPath: string,
): Promise<SellerGoPublicActionResult> {
  if (!isPaymentsReady()) {
    return { ok: false, reason: getStripeRequiredMessage() };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
  }

  const absoluteReturn =
    returnPath.startsWith("http://") || returnPath.startsWith("https://")
      ? returnPath
      : `${window.location.origin}${returnPath.startsWith("/") ? "" : "/"}${returnPath}`;

  try {
    const res = await fetch("/api/stripe/identity_session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ returnUrl: absoluteReturn }),
    });

    let payload: {
      ok?: boolean;
      url?: string | null;
      client_secret?: string;
      reason?: string;
      error?: string;
    } = {};
    try {
      payload = (await res.json()) as typeof payload;
    } catch {
      return {
        ok: false,
        reason: `Identity request failed (HTTP ${res.status}). Try Connect bank instead — ID check is included there.`,
      };
    }

    if (!payload?.ok) {
      const raw =
        payload?.reason ||
        payload?.error ||
        (res.status === 401 ? "Sign in required." : `Stripe Identity unavailable (HTTP ${res.status}).`);
      return { ok: false, reason: friendlyIdentityError(raw) };
    }
    if (payload.url) {
      return { ok: true, url: payload.url };
    }
    if (payload.client_secret) {
      return {
        ok: false,
        reason:
          "Stripe Identity returned no hosted page URL. Enable hosted verification in Stripe Dashboard → Identity, or use Connect bank (ID included).",
      };
    }
    return {
      ok: false,
      reason: "Stripe Identity unavailable. Use Connect bank instead — ID check is included.",
    };
  } catch (error) {
    return {
      ok: false,
      reason: friendlyIdentityError(
        error instanceof Error ? error.message : "Verification failed.",
      ),
    };
  }
}

export async function startConnectForListing(
  returnPath: string,
): Promise<SellerGoPublicActionResult> {
  return startConnectOnboarding(returnPath);
}
