import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { resolveConnectCountry } from "./marketCurrency";

export type ConnectProfileRow = {
  stripe_connect_account_id?: string | null;
  display_name?: string | null;
  location_country_code?: string | null;
} | null;

export function stripeKeyModeMismatch(): { code: "key_mismatch"; reason: string } | null {
  const secret = (process.env.STRIPE_SECRET_KEY || "").trim();
  const secretMode = secret.startsWith("sk_live")
    ? "live"
    : secret.startsWith("sk_test")
      ? "test"
      : "unknown";
  const pub = (process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
  const pubMode = pub.startsWith("pk_live")
    ? "live"
    : pub.startsWith("pk_test")
      ? "test"
      : "unknown";
  if (secretMode !== "unknown" && pubMode !== "unknown" && secretMode !== pubMode) {
    return {
      code: "key_mismatch",
      reason: `Stripe key mode mismatch on server: secret=${secretMode}, publishable=${pubMode}. Fix Vercel env so both are live or both are test.`,
    };
  }
  return null;
}

/** True when Express onboarding is finished (or payouts already enabled). */
export async function getConnectAlreadyComplete(
  stripe: Stripe,
  accountId: string,
): Promise<
  | { complete: true; reason: string; last4: string | null }
  | { complete: false }
> {
  try {
    const existing = await stripe.accounts.retrieve(accountId);
    const payoutsEnabled = Boolean(existing.payouts_enabled);
    const detailsSubmitted = Boolean(existing.details_submitted);
    const currentlyDue = existing.requirements?.currently_due ?? [];
    const onboardingComplete = detailsSubmitted && currentlyDue.length === 0;
    if (payoutsEnabled || onboardingComplete) {
      const external = existing.external_accounts?.data?.find(
        (item) => item.object === "bank_account",
      ) as { last4?: string } | undefined;
      return {
        complete: true,
        reason: payoutsEnabled
          ? "Bank already connected — payouts are enabled. Tap refresh status or Go live."
          : "Stripe onboarding already finished. Tap refresh status or Go live.",
        last4: external?.last4 ?? null,
      };
    }
  } catch {
    // Fall through — treat as incomplete / recreate path.
  }
  return { complete: false };
}

/**
 * Create Express Connect account if missing; return existing account id otherwise.
 * Does not open Account Links / Sessions.
 */
export async function ensureExpressConnectAccount(params: {
  stripe: Stripe;
  admin: SupabaseClient;
  user: { id: string; email?: string | null };
  profile: ConnectProfileRow;
  requestedCountry: string | null;
}): Promise<{ ok: true; accountId: string } | { ok: false; reason: string }> {
  const { stripe, admin, user, profile, requestedCountry } = params;
  let accountId = profile?.stripe_connect_account_id ?? null;

  if (accountId) {
    return { ok: true, accountId };
  }

  const countryResolved = resolveConnectCountry({
    profileCountry:
      typeof profile?.location_country_code === "string" ? profile.location_country_code : null,
    requestedCountry,
    fallback: "US",
  });
  if (!countryResolved.ok) {
    return { ok: false, reason: countryResolved.reason };
  }

  // Legacy Express create — works on platforms that completed the older Connect wizard.
  const account = await stripe.accounts.create({
    type: "express",
    country: countryResolved.country,
    email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  accountId = account.id;

  const { error: updateError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: profile?.display_name ?? user.email ?? "Host",
      stripe_connect_account_id: accountId,
    },
    { onConflict: "id" },
  );

  if (updateError) {
    return {
      ok: false,
      reason: `Failed to save Connect account: ${updateError.message}`,
    };
  }

  return { ok: true, accountId };
}

export function mapConnectStripeError(error: unknown): { reason: string; code?: string } {
  const message = error instanceof Error ? error.message : "Stripe Connect failed";
  const lower = message.toLowerCase();
  let reason = message;
  let code: string | undefined;
  if (
    lower.includes("responsibilities") ||
    lower.includes("managing losses") ||
    lower.includes("platform-profile") ||
    lower.includes("platform profile")
  ) {
    code = "platform_profile";
    reason = message.includes("dashboard.stripe.com")
      ? message
      : `${message} https://dashboard.stripe.com/settings/connect/platform-profile`;
  } else if (
    lower.includes("signed up for connect") ||
    (lower.includes("connect") && lower.includes("not enabled"))
  ) {
    code = "platform_profile";
    reason =
      "Stripe Connect isn’t enabled. Open Stripe Dashboard → Connect → Get started, finish the platform profile, then retry. https://dashboard.stripe.com/settings/connect/platform-profile";
  } else if (
    lower.includes("direct charge") ||
    (lower.includes("express") && (lower.includes("not") || lower.includes("cannot"))) ||
    lower.includes("controller properties")
  ) {
    code = "platform_config";
    reason = `${message} Ask Stripe Support to set Connect to destination charges + Express for marketplace payouts.`;
  }
  return { reason, ...(code ? { code } : {}) };
}
