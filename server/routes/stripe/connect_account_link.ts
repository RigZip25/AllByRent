import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { resolveConfiguredAppOrigin } from "../../lib/brand";
import { resolveConnectCountry } from "../../lib/stripe/marketCurrency";

type Body = {
  returnPath?: string;
  /** ISO country hint from the client (search/home country). */
  country?: string;
};

/** Stripe Account Links require https return URLs — never capacitor:// or ionic://. */
function resolveConnectRedirectOrigin(req: VercelRequest): string {
  const configured = resolveConfiguredAppOrigin().replace(/\/$/, "");
  const header = typeof req.headers.origin === "string" ? req.headers.origin.replace(/\/$/, "") : "";
  if (!header) return configured;
  try {
    const u = new URL(header);
    if (u.protocol === "https:" && (u.hostname === "app.evorios.com" || u.hostname === "localhost")) {
      return header;
    }
  } catch {
    /* ignore */
  }
  return configured;
}

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isStripeServerConfigured()) {
    res.status(200).json({ ok: false, reason: "Stripe not configured" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const body = (req.body ?? {}) as Body;
  const returnPath =
    typeof body.returnPath === "string" && body.returnPath.startsWith("/")
      ? body.returnPath
      : "/?screen=profile";
  const requestedCountry = typeof body.country === "string" ? body.country : null;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_connect_account_id, display_name, location_country_code")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: "Failed to load profile" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const origin = resolveConnectRedirectOrigin(req);
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
    res.status(200).json({
      ok: false,
      code: "key_mismatch",
      reason: `Stripe key mode mismatch on server: secret=${secretMode}, publishable=${pubMode}. Fix Vercel env so both are live or both are test.`,
    });
    return;
  }

  let accountId = profile?.stripe_connect_account_id ?? null;

  // Already finished Connect — don't open Account Links again (avoids false "couldn't connect" errors).
  if (accountId) {
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
        res.status(200).json({
          ok: false,
          code: "already_connected",
          reason: payoutsEnabled
            ? "Bank already connected — payouts are enabled. Tap refresh status or Go live."
            : "Stripe onboarding already finished. Tap refresh status or Go live.",
          last4: external?.last4 ?? null,
        });
        return;
      }
    } catch {
      // Fall through to create a fresh account link if retrieve fails.
    }
  }

  const appendConnectQuery = (path: string, flag: "refresh" | "done"): string => {
    try {
      const url = new URL(path, `${origin}/`);
      url.searchParams.set("connect", flag);
      return url.toString();
    } catch {
      const join = path.includes("?") ? "&" : "?";
      return `${origin}${path}${join}connect=${flag}`;
    }
  };

  try {
    if (!accountId) {
      const countryResolved = resolveConnectCountry({
        profileCountry:
          typeof profile?.location_country_code === "string"
            ? profile.location_country_code
            : null,
        requestedCountry,
        fallback: "US",
      });
      if (!countryResolved.ok) {
        res.status(200).json({ ok: false, reason: countryResolved.reason });
        return;
      }

      // Legacy Express create — this is what worked when sellers could open Stripe onboarding.
      // (Controller-property create can fail on platforms that completed the older Connect wizard.)
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
        res.status(200).json({
          ok: false,
          reason: `Failed to save Connect account: ${updateError.message}`,
        });
        return;
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: appendConnectQuery(returnPath, "refresh"),
      return_url: appendConnectQuery(returnPath, "done"),
      type: "account_onboarding",
    });

    if (!accountLink.url) {
      res.status(200).json({ ok: false, reason: "Stripe returned no onboarding URL." });
      return;
    }

    res.status(200).json({ ok: true, url: accountLink.url });
  } catch (error) {
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
    res.status(200).json({ ok: false, reason, ...(code ? { code } : {}) });
  }
});
