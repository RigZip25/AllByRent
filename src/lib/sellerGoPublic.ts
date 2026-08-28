import { fetchRemoteProfile } from "./supabaseProfile";
import { isSupabaseConfigured } from "./supabaseClient";
import { loadConnectStatus, startConnectOnboarding, type ConnectOnboardingResult } from "./repositories/connectRepository";
import { loadUserProfile, saveUserProfile } from "./userProfileStorage";
import { getAccessToken } from "./stripePayments";
import { getRuntimeAppOrigin } from "./appOrigin";
import {
  getSignInRequiredMessage,
  isPaymentsReady,
} from "./config/production";
import { isLocalPhoneVerified } from "./phoneKyc";
import { isPhoneOtpClientEnabled } from "./phoneE164";
import { isStripeIdentityClientEnabled } from "./stripeIdentityConfig";
import { isFreeGiveaway } from "./listingGift";

const GO_PUBLIC_PENDING_KEY = "allbyrent_go_public_listing";

/**
 * Go-public checklist steps.
 * Identity KYC is collected inside Stripe Connect Express — a separate Stripe Identity
 * product step blocked hosts when Identity wasn’t enabled in the Dashboard.
 */
export type SellerGoPublicStep = "sign_in" | "phone" | "stripe" | "ready";

/** Persist mid “go public” so Stripe/auth returns reopen the checklist (localStorage survives WebView restart). */
export function markGoPublicPending(listingId: string): void {
  const id = listingId.trim();
  if (!id) return;
  try {
    sessionStorage.setItem(GO_PUBLIC_PENDING_KEY, id);
    localStorage.setItem(GO_PUBLIC_PENDING_KEY, id);
  } catch {
    // ignore
  }
}

export function peekGoPublicPending(): string | null {
  try {
    return (
      sessionStorage.getItem(GO_PUBLIC_PENDING_KEY) ??
      localStorage.getItem(GO_PUBLIC_PENDING_KEY)
    );
  } catch {
    return null;
  }
}

export function clearGoPublicPending(): void {
  try {
    sessionStorage.removeItem(GO_PUBLIC_PENDING_KEY);
    localStorage.removeItem(GO_PUBLIC_PENDING_KEY);
  } catch {
    // ignore
  }
}

/** True when this draft should reopen Seller setup (pending flag or Stripe return URL). */
export function shouldResumeGoPublicChecklist(listingId: string | null | undefined): boolean {
  const id = listingId?.trim();
  if (!id) return false;
  const pending = peekGoPublicPending();
  if (pending && pending === id) return true;
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("listingId")?.trim() || "";
    const connect = params.get("connect")?.trim() || "";
    if (urlId === id && (connect === "done" || connect === "refresh")) return true;
  } catch {
    // ignore
  }
  return false;
}

export type SellerGoPublicStatus = {
  signedIn: boolean;
  /** SMS phone KYC completed. */
  phoneVerified: boolean;
  /** Stripe Identity badge and/or Connect KYC completed (payouts). */
  identityVerified: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
  /** Express onboarding finished even if payouts are still enabling. */
  onboardingComplete: boolean;
  bankLast4: string | null;
  /**
   * Can publish / go live.
   * Sign-in always required. Paid listings also require verified phone.
   * Stripe Connect remains optional until the host wants card payouts.
   */
  ready: boolean;
  /** Host finished Connect enough to receive payouts. */
  payoutsReady: boolean;
  /** Listing charges money (rent/sell) — phone KYC required to go live. */
  requiresPhone: boolean;
  nextStep: SellerGoPublicStep;
};

export type SellerGoPublicActionResult =
  | { ok: true; url: string }
  | { ok: false; reason: string; code?: string };

/** Deep-link back into the listing wizard after Stripe Connect. */
export function listingWizardReturnPath(listingId: string): string {
  const id = listingId.trim();
  if (!id) return "/?screen=listItem";
  return `/?screen=listItem&listingId=${encodeURIComponent(id)}`;
}

export function resolveSellerGoPublicNextStep(
  status: Pick<
    SellerGoPublicStatus,
    "signedIn" | "phoneVerified" | "requiresPhone" | "payoutsEnabled" | "onboardingComplete"
  >,
): SellerGoPublicStep {
  if (!status.signedIn) return "sign_in";
  if (status.requiresPhone && !status.phoneVerified) return "phone";
  // Highlight optional Connect until done — go-live does not require it.
  if (!status.payoutsEnabled && !status.onboardingComplete) return "stripe";
  return "ready";
}

/**
 * Paid rent or paid-sell listing — phone KYC before go-live when SMS OTP is configured.
 * Free giveaway (gift / sell@$0) stays ungated unless also renting.
 */
export function listingRequiresPhoneKyc(
  modes: {
    rent?: boolean;
    sell?: boolean;
    gift?: boolean;
    rentToOwn?: boolean;
  },
  pricing?: { salePrice?: string },
): boolean {
  if (!isPhoneOtpClientEnabled()) return false;
  if (modes.rent || modes.rentToOwn) return true;
  if (!modes.sell && !modes.gift) return false;
  if (
    isFreeGiveaway({
      modes: {
        rent: Boolean(modes.rent),
        sell: Boolean(modes.sell),
        rentToOwn: Boolean(modes.rentToOwn),
        gift: Boolean(modes.gift),
      },
      pricing: { salePrice: pricing?.salePrice ?? (modes.gift ? "0" : "") },
    })
  ) {
    return false;
  }
  return Boolean(modes.sell);
}

function isPayoutsReady(
  status: Pick<SellerGoPublicStatus, "payoutsEnabled" | "onboardingComplete">,
): boolean {
  return Boolean(status.payoutsEnabled || status.onboardingComplete);
}

export async function loadSellerGoPublicStatus(
  userId: string | null,
  options?: { requiresPhone?: boolean },
): Promise<SellerGoPublicStatus> {
  const signedIn = Boolean(userId);
  const requiresPhone = Boolean(options?.requiresPhone);

  if (!userId || !isSupabaseConfigured()) {
    const localIdentity = Boolean(loadUserProfile().verification.identity);
    const phoneVerified = isLocalPhoneVerified();
    const next = resolveSellerGoPublicNextStep({
      signedIn,
      phoneVerified,
      requiresPhone,
      payoutsEnabled: false,
      onboardingComplete: false,
    });
    const ready = signedIn && (!requiresPhone || phoneVerified);
    return {
      signedIn,
      phoneVerified,
      identityVerified: localIdentity,
      connected: false,
      payoutsEnabled: false,
      onboardingComplete: false,
      bankLast4: null,
      ready,
      payoutsReady: false,
      requiresPhone,
      nextStep: next,
    };
  }

  const [remote, connect] = await Promise.all([
    fetchRemoteProfile(userId),
    loadConnectStatus(userId),
  ]);

  const phoneVerified =
    Boolean(remote?.phone_verified || remote?.phone_verified_at) || isLocalPhoneVerified();
  if (phoneVerified && !isLocalPhoneVerified()) {
    const profile = loadUserProfile();
    saveUserProfile({
      ...profile,
      phone: remote?.phone?.trim() || profile.phone,
      verification: { ...profile.verification, phone: true },
    });
  }

  // Connect Express already runs government-ID KYC; treat Connect done as identity-complete too.
  const identityVerified =
    Boolean(remote?.identity_verified) ||
    Boolean(loadUserProfile().verification.identity) ||
    connect.payoutsEnabled ||
    connect.onboardingComplete;

  const next = resolveSellerGoPublicNextStep({
    signedIn: true,
    phoneVerified,
    requiresPhone,
    payoutsEnabled: connect.payoutsEnabled,
    onboardingComplete: connect.onboardingComplete,
  });
  const payoutsReady = isPayoutsReady(connect);
  const ready = !requiresPhone || phoneVerified;

  return {
    signedIn: true,
    phoneVerified,
    identityVerified,
    connected: connect.connected,
    payoutsEnabled: connect.payoutsEnabled,
    onboardingComplete: connect.onboardingComplete,
    bankLast4: connect.last4,
    ready,
    payoutsReady,
    requiresPhone,
    nextStep: next,
  };
}


/** Stable reason codes for Identity — UI maps these to soft localized copy. */
export const IDENTITY_UNAVAILABLE_REASON = "identity_unavailable";
export const IDENTITY_FAILED_REASON = "identity_failed";

function looksLikeStripeAdminDump(raw: string): boolean {
  const lower = raw.toLowerCase();
  return (
    lower.includes("dashboard.stripe.com") ||
    lower.includes("account admin") ||
    lower.includes("stripe dashboard") ||
    (lower.includes("identity") &&
      (lower.includes("not set up") ||
        lower.includes("not enabled") ||
        lower.includes("not been activated") ||
        lower.includes("activate") ||
        lower.includes("signed up") ||
        lower.includes("identity application")))
  );
}

/** Map any Identity failure to a stable code (never raw Stripe admin text/URLs). */
export function normalizeIdentityFailureReason(raw: string | null | undefined): string {
  if (!raw) return IDENTITY_UNAVAILABLE_REASON;
  if (raw === IDENTITY_UNAVAILABLE_REASON || raw === IDENTITY_FAILED_REASON) return raw;
  if (raw === getSignInRequiredMessage()) return raw;
  if (looksLikeStripeAdminDump(raw)) return IDENTITY_UNAVAILABLE_REASON;
  if (raw.toLowerCase().includes("api key")) return IDENTITY_UNAVAILABLE_REASON;
  // Prefer soft unavailable over forwarding unknown English Stripe dumps.
  if (/https?:\/\//i.test(raw) || /stripe/i.test(raw)) return IDENTITY_UNAVAILABLE_REASON;
  return IDENTITY_FAILED_REASON;
}

export function isIdentityUnavailableReason(reason: string | null | undefined): boolean {
  return normalizeIdentityFailureReason(reason) === IDENTITY_UNAVAILABLE_REASON;
}

async function postIdentitySession(
  token: string,
  body: { returnUrl?: string; probe?: boolean },
): Promise<{
  ok?: boolean;
  available?: boolean;
  url?: string | null;
  client_secret?: string;
  reason?: string;
  error?: string;
  status: number;
}> {
  const res = await fetch("/api/stripe/identity_session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  let payload: {
    ok?: boolean;
    available?: boolean;
    url?: string | null;
    client_secret?: string;
    reason?: string;
    error?: string;
  } = {};
  try {
    payload = (await res.json()) as typeof payload;
  } catch {
    return { status: res.status, ok: false, reason: IDENTITY_UNAVAILABLE_REASON, available: false };
  }
  return { ...payload, status: res.status };
}

/** Probe whether Stripe Identity is enabled — used to hide/disable the start CTA. */
export async function probeIdentityAvailability(): Promise<
  | { ok: true; available: true }
  | { ok: false; available: false; reason: string }
> {
  if (!isStripeIdentityClientEnabled()) {
    return { ok: false, available: false, reason: IDENTITY_UNAVAILABLE_REASON };
  }
  if (!isPaymentsReady()) {
    return { ok: false, available: false, reason: IDENTITY_UNAVAILABLE_REASON };
  }
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, available: false, reason: getSignInRequiredMessage() };
  }
  try {
    const payload = await postIdentitySession(token, {
      probe: true,
      returnUrl: `${getRuntimeAppOrigin()}/?screen=profile`,
    });
    if (payload.ok && payload.available !== false) {
      return { ok: true, available: true };
    }
    return {
      ok: false,
      available: false,
      reason: normalizeIdentityFailureReason(
        payload.reason || payload.error || IDENTITY_UNAVAILABLE_REASON,
      ),
    };
  } catch {
    return { ok: false, available: false, reason: IDENTITY_UNAVAILABLE_REASON };
  }
}

export async function startIdentityVerificationForListing(
  returnPath: string,
): Promise<SellerGoPublicActionResult> {
  if (!isStripeIdentityClientEnabled()) {
    return { ok: false, reason: IDENTITY_UNAVAILABLE_REASON };
  }
  if (!isPaymentsReady()) {
    return { ok: false, reason: IDENTITY_UNAVAILABLE_REASON };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: getSignInRequiredMessage() };
  }

  const absoluteReturn =
    returnPath.startsWith("http://") || returnPath.startsWith("https://")
      ? returnPath
      : `${getRuntimeAppOrigin()}${returnPath.startsWith("/") ? "" : "/"}${returnPath}`;

  try {
    const payload = await postIdentitySession(token, { returnUrl: absoluteReturn });

    if (!payload?.ok) {
      if (payload.status === 401) {
        return { ok: false, reason: getSignInRequiredMessage() };
      }
      return {
        ok: false,
        reason: normalizeIdentityFailureReason(
          payload?.reason || payload?.error || IDENTITY_UNAVAILABLE_REASON,
        ),
      };
    }
    if (payload.url) {
      return { ok: true, url: payload.url };
    }
    // Hosted URL missing — treat as unavailable (no admin/Dashboard copy).
    return { ok: false, reason: IDENTITY_UNAVAILABLE_REASON };
  } catch (error) {
    return {
      ok: false,
      reason: normalizeIdentityFailureReason(
        error instanceof Error ? error.message : IDENTITY_FAILED_REASON,
      ),
    };
  }
}

export async function startConnectForListing(
  returnPath: string,
): Promise<ConnectOnboardingResult> {
  return startConnectOnboarding(returnPath);
}
