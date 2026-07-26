import { getSupabaseClient } from "./supabaseClient";
import { isStripePaymentsEnabled } from "./stripeConfig";

export type CreateRentalPaymentIntentResult =
  | {
      ok: true;
      clientSecret: string;
      paymentIntentId: string;
      status: string;
    }
  | { ok: false; reason: string };

export async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) return data.session.access_token;
  // Right after OTP, session can lag one tick — refresh once.
  try {
    const refreshed = await supabase.auth.refreshSession();
    return refreshed.data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function createRentalPaymentIntent(params: {
  rentalId: string;
  listingId: string;
  ownerId: string;
  amountCents: number;
}): Promise<CreateRentalPaymentIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/payment_intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const payload = (await res.json()) as CreateRentalPaymentIntentResult & { error?: string };
  if (!res.ok) {
    return { ok: false, reason: payload.error ?? `Payment setup failed (${res.status})` };
  }
  if (!payload.ok) {
    return { ok: false, reason: payload.reason ?? "Stripe not configured" };
  }
  if (!("clientSecret" in payload) || !payload.clientSecret) {
    return { ok: false, reason: "Missing client secret" };
  }

  return payload;
}

export type SyncRentalPaymentResult =
  | { ok: true; status: string; paid: boolean; authorized?: boolean; onHold?: boolean }
  | { ok: false; reason: string };

export async function syncRentalPaymentStatus(rentalId: string): Promise<SyncRentalPaymentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/payment_confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });

  const payload = (await res.json()) as SyncRentalPaymentResult & { error?: string };
  if (!res.ok) {
    return { ok: false, reason: payload.error ?? `Payment sync failed (${res.status})` };
  }
  if (!payload.ok) {
    return { ok: false, reason: payload.reason ?? "Payment sync failed" };
  }
  if (!("status" in payload)) {
    return { ok: false, reason: "Missing payment status" };
  }

  return {
    ok: true,
    status: payload.status,
    paid: Boolean(payload.paid),
    authorized: Boolean(payload.authorized),
    onHold: Boolean(payload.onHold),
  };
}

export async function captureRentalPayment(
  rentalId: string,
): Promise<{ ok: boolean; reason?: string; status?: string }> {
  if (!isStripePaymentsEnabled()) {
    return { ok: true, status: "no_payment" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/payment_capture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });

  const payload = (await res.json()) as {
    ok?: boolean;
    error?: string;
    reason?: string;
    status?: string;
  };
  if (!res.ok || payload.ok === false) {
    return { ok: false, reason: payload.error ?? payload.reason ?? "Payment capture failed" };
  }
  return { ok: true, status: payload.status };
}

export async function cancelRentalPayment(
  rentalId: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isStripePaymentsEnabled()) {
    return { ok: true };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/payment_cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });

  const payload = (await res.json()) as { ok?: boolean; error?: string; reason?: string };
  if (!res.ok || payload.ok === false) {
    return { ok: false, reason: payload.error ?? payload.reason ?? "Payment cancel failed" };
  }
  return { ok: true };
}

export type DepositIntentResult =
  | {
      ok: true;
      clientSecret: string;
      paymentIntentId: string;
      status: string;
      amountCents: number;
    }
  | { ok: false; reason: string };

export async function createDepositPaymentIntent(rentalId: string): Promise<DepositIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/deposit_intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });

  const payload = (await res.json()) as DepositIntentResult & { error?: string };
  if (!res.ok) {
    return { ok: false, reason: payload.error ?? `Deposit setup failed (${res.status})` };
  }
  if (!payload.ok) {
    return { ok: false, reason: payload.reason ?? "Stripe not configured" };
  }
  if (!("clientSecret" in payload) || !payload.clientSecret) {
    return { ok: false, reason: "Missing client secret" };
  }

  return payload;
}

export async function releaseDepositHold(rentalId: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Sign in required" };

  const res = await fetch("/api/stripe/deposit_release", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });

  const payload = (await res.json()) as { ok?: boolean; error?: string; reason?: string };
  if (!res.ok || !payload.ok) {
    return { ok: false, error: payload.error ?? payload.reason ?? "Release failed" };
  }
  return { ok: true };
}

export async function claimDepositHold(rentalId: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Sign in required" };

  const res = await fetch("/api/stripe/deposit_claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rentalId }),
  });

  const payload = (await res.json()) as { ok?: boolean; error?: string; reason?: string };
  if (!res.ok || !payload.ok) {
    return { ok: false, error: payload.error ?? payload.reason ?? "Claim failed" };
  }
  return { ok: true };
}

export type GarageCheckoutIntentResult =
  | {
      ok: true;
      clientSecret: string;
      paymentIntentId: string;
      orderId: string;
      status: string;
    }
  | { ok: false; reason: string };

export async function createGarageCartCheckoutIntent(params: {
  hostId: string;
  lines: Array<{ listingId: string; title: string; priceUsd: number }>;
  amountCents: number;
  subtotalCents: number;
  platformFeeCents: number;
}): Promise<GarageCheckoutIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/garage_checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const payload = (await res.json()) as GarageCheckoutIntentResult & { error?: string };
  if (!res.ok) {
    return { ok: false, reason: payload.error ?? payload.reason ?? `Checkout failed (${res.status})` };
  }
  if (!payload.ok) {
    return { ok: false, reason: payload.reason ?? "Stripe not configured" };
  }
  if (!("clientSecret" in payload) || !payload.clientSecret) {
    return { ok: false, reason: "Missing client secret" };
  }

  return payload;
}

export async function createAuctionCheckoutIntent(params: {
  listingId: string;
  hostId: string;
  winningBidUsd: number;
  amountCents: number;
  platformFeeCents: number;
  runnerUpAttempt: number;
}): Promise<GarageCheckoutIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/auction_checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const payload = (await res.json()) as GarageCheckoutIntentResult & { error?: string };
  if (!res.ok) {
    return { ok: false, reason: payload.error ?? payload.reason ?? `Checkout failed (${res.status})` };
  }
  if (!payload.ok) {
    return { ok: false, reason: payload.reason ?? "Stripe not configured" };
  }
  if (!("clientSecret" in payload) || !payload.clientSecret) {
    return { ok: false, reason: "Missing client secret" };
  }

  return payload;
}

export type ConnectAccountLinkResult = { ok: true; url: string } | { ok: false; reason: string };

function friendlyConnectError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("responsibilities") ||
    lower.includes("managing losses") ||
    lower.includes("platform-profile") ||
    (lower.includes("platform profile") && lower.includes("connect"))
  ) {
    // Keep Stripe’s wording so the UI can detect + deep-link the Dashboard.
    return raw.includes("dashboard.stripe.com")
      ? raw
      : `${raw} Open https://dashboard.stripe.com/settings/connect/platform-profile`;
  }
  if (
    lower.includes("signed up for connect") ||
    (lower.includes("connect") && lower.includes("not enabled"))
  ) {
    return "Stripe Connect isn’t enabled for this platform. In Stripe Dashboard → Connect, complete platform profile / get started, then try again.";
  }
  if (lower.includes("responsible") || lower.includes("platform profile")) {
    return "Finish Stripe Connect platform setup in the Dashboard (responsibilities / platform profile), then try again. https://dashboard.stripe.com/settings/connect/platform-profile";
  }
  if (lower.includes("invalid api key") || lower.includes("api key")) {
    return "Stripe API key problem. Check STRIPE_SECRET_KEY on Vercel (test vs live must match the publishable key).";
  }
  return raw;
}

export async function createConnectAccountLink(returnPath: string): Promise<ConnectAccountLinkResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured. Set VITE_STRIPE_PUBLISHABLE_KEY on Vercel." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required — enter your email code again, then retry Connect." };
  }

  let res: Response;
  try {
    res = await fetch("/api/stripe/connect_account_link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ returnPath }),
    });
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Network error calling Stripe Connect.",
    };
  }

  let payload: ConnectAccountLinkResult & { error?: string } = { ok: false, reason: "" };
  try {
    payload = (await res.json()) as ConnectAccountLinkResult & { error?: string };
  } catch {
    return { ok: false, reason: `Connect failed (HTTP ${res.status}, invalid response).` };
  }

  if (!res.ok) {
    return {
      ok: false,
      reason: friendlyConnectError(
        payload.error ?? payload.reason ?? `Connect failed (${res.status})`,
      ),
    };
  }
  if (!payload.ok) {
    return {
      ok: false,
      reason: friendlyConnectError(payload.reason ?? "Stripe Connect not configured"),
    };
  }
  if (!("url" in payload) || !payload.url) {
    return { ok: false, reason: "Missing onboarding URL from Stripe." };
  }

  return payload;
}

export type ConnectSyncResult =
  | {
      ok: true;
      connected: boolean;
      payoutsEnabled: boolean;
      detailsSubmitted: boolean;
      chargesEnabled: boolean;
      onboardingComplete: boolean;
      last4: string | null;
    }
  | { ok: false; reason: string };

/** Refresh Connect flags from Stripe into Supabase (fixes stuck “Finish Stripe” after onboarding). */
export async function syncConnectAccountStatus(): Promise<ConnectSyncResult> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  let res: Response;
  try {
    res = await fetch("/api/stripe/connect_sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Connect sync network error",
    };
  }

  let payload: ConnectSyncResult & { error?: string; reason?: string };
  try {
    payload = (await res.json()) as ConnectSyncResult & { error?: string; reason?: string };
  } catch {
    return { ok: false, reason: `Connect sync failed (HTTP ${res.status})` };
  }

  if (!res.ok || !payload.ok) {
    return {
      ok: false,
      reason: payload.error ?? payload.reason ?? `Connect sync failed (${res.status})`,
    };
  }

  return payload;
}

export type ListingBoostIntentResult =
  | {
      ok: true;
      clientSecret: string;
      paymentIntentId: string;
      boostedUntil: string;
      boostedTier: number;
      status: string;
    }
  | { ok: false; reason: string };

export async function createListingBoostIntent(params: {
  listingId: string;
  amountCents: number;
  durationHours: number;
}): Promise<ListingBoostIntentResult> {
  if (!isStripePaymentsEnabled()) {
    return { ok: false, reason: "Stripe not configured" };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, reason: "Sign in required" };
  }

  const res = await fetch("/api/stripe/boost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const payload = (await res.json()) as ListingBoostIntentResult & { error?: string };
  if (!res.ok) {
    return { ok: false, reason: payload.error ?? payload.reason ?? `Boost failed (${res.status})` };
  }
  if (!payload.ok) {
    return { ok: false, reason: payload.reason ?? "Stripe not configured" };
  }
  if (!("clientSecret" in payload) || !payload.clientSecret) {
    return { ok: false, reason: "Missing client secret" };
  }

  return payload;
}
