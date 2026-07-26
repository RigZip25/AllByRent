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

export type SellerGoPublicStep = "sign_in" | "identity" | "stripe" | "ready";

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
  identityVerified: boolean;
  connected: boolean;
  payoutsEnabled: boolean;
  bankLast4: string | null;
  ready: boolean;
  nextStep: SellerGoPublicStep;
};

export type SellerGoPublicActionResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/** Deep-link back into the listing wizard after Stripe Identity / Connect. */
export function listingWizardReturnPath(listingId: string): string {
  const id = listingId.trim();
  if (!id) return "/?screen=listItem";
  return `/?screen=listItem&listingId=${encodeURIComponent(id)}`;
}

export function resolveSellerGoPublicNextStep(
  status: Pick<SellerGoPublicStatus, "signedIn" | "identityVerified" | "payoutsEnabled">,
): SellerGoPublicStep {
  if (!status.signedIn) return "sign_in";
  if (!status.identityVerified) return "identity";
  if (!status.payoutsEnabled) return "stripe";
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
      identityVerified: localIdentity,
      payoutsEnabled: false,
    });
    return {
      signedIn,
      identityVerified: localIdentity,
      connected: false,
      payoutsEnabled: false,
      bankLast4: null,
      ready: next === "ready",
      nextStep: next,
    };
  }

  const [remote, connect] = await Promise.all([
    fetchRemoteProfile(userId),
    loadConnectStatus(userId),
  ]);

  const identityVerified =
    Boolean(remote?.identity_verified) || Boolean(loadUserProfile().verification.identity);

  const next = resolveSellerGoPublicNextStep({
    signedIn: true,
    identityVerified,
    payoutsEnabled: connect.payoutsEnabled,
  });

  return {
    signedIn: true,
    identityVerified,
    connected: connect.connected,
    payoutsEnabled: connect.payoutsEnabled,
    bankLast4: connect.last4,
    ready: next === "ready",
    nextStep: next,
  };
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
    const payload = (await res.json()) as {
      ok?: boolean;
      url?: string | null;
      client_secret?: string;
      reason?: string;
      error?: string;
    };
    if (!payload?.ok) {
      return {
        ok: false,
        reason: payload?.reason || payload?.error || "Stripe Identity unavailable.",
      };
    }
    if (payload.url) {
      return { ok: true, url: payload.url };
    }
    if (payload.client_secret) {
      return {
        ok: false,
        reason:
          "Stripe Identity is configured but no hosted URL was returned. Check Stripe dashboard settings.",
      };
    }
    return { ok: false, reason: "Stripe Identity unavailable." };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Verification failed.",
    };
  }
}

export async function startConnectForListing(
  returnPath: string,
): Promise<SellerGoPublicActionResult> {
  return startConnectOnboarding(returnPath);
}
