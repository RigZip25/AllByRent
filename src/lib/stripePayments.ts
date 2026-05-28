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
  return data.session?.access_token ?? null;
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
