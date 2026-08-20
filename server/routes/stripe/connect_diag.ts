import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { getStripeSecretKey, getStripePublishableKey, isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";

/**
 * Ops-only Stripe Connect smoke test.
 * Auth: Authorization: Bearer $CRON_SECRET
 * Returns key mode + whether Express account + Account Link can be created (no secrets).
 */
export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const cron = (process.env.CRON_SECRET || "").trim();
  const auth = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!cron || !token || token !== cron) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const secret = getStripeSecretKey() || "";
  const publishable = getStripePublishableKey() || "";
  const configured = isStripeServerConfigured();

  const secretMode = secret.startsWith("sk_live")
    ? "live"
    : secret.startsWith("sk_test")
      ? "test"
      : secret
        ? "unknown"
        : "missing";
  const pubMode = publishable.startsWith("pk_live")
    ? "live"
    : publishable.startsWith("pk_test")
      ? "test"
      : publishable
        ? "unknown"
        : "missing";

  if (!configured) {
    res.status(200).json({
      ok: false,
      configured: false,
      secretMode,
      pubMode,
      modeMatch: secretMode === pubMode,
      reason: "STRIPE_SECRET_KEY missing or placeholder",
    });
    return;
  }

  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  let accountId: string | null = null;

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { evorios_diag: "1" },
    });
    accountId = account.id;

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "https://app.evorios.com/?connect=refresh",
      return_url: "https://app.evorios.com/?connect=done",
      type: "account_onboarding",
    });

    res.status(200).json({
      ok: true,
      configured: true,
      secretMode,
      pubMode,
      modeMatch: secretMode === pubMode,
      accountCreate: "ok",
      accountLink: Boolean(link.url) ? "ok" : "missing_url",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe Connect failed";
    const lower = message.toLowerCase();
    const platformLikely =
      lower.includes("responsibilities") ||
      lower.includes("platform-profile") ||
      lower.includes("platform profile") ||
      lower.includes("signed up for connect") ||
      (lower.includes("connect") && lower.includes("not enabled"));

    res.status(200).json({
      ok: false,
      configured: true,
      secretMode,
      pubMode,
      modeMatch: secretMode === pubMode,
      accountCreate: accountId ? "ok" : "failed",
      accountLink: accountId ? "failed" : "skipped",
      platformLikely,
      reason: message.slice(0, 400),
      dashboardHint: platformLikely
        ? "https://dashboard.stripe.com/settings/connect/platform-profile"
        : null,
    });
  } finally {
    if (accountId) {
      try {
        await stripe.accounts.del(accountId);
      } catch {
        /* ignore */
      }
    }
  }
});
