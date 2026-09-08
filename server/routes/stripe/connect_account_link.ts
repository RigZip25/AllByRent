import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { resolveConfiguredAppOrigin } from "../../lib/brand";
import {
  ensureExpressConnectAccount,
  getConnectAlreadyComplete,
  mapConnectStripeError,
  stripeKeyModeMismatch,
} from "../../lib/stripe/ensureConnectAccount";

type Body = {
  returnPath?: string;
  /** ISO country hint from the client (search/home country). */
  country?: string;
};

/** Stripe Account Links require https return URLs — never capacitor:// or ionic://.
 *  Android's WebView origin is `https://localhost`; treating that as the redirect
 *  origin sent Stripe back to a host that does not resolve outside the device.
 */
function resolveConnectRedirectOrigin(req: VercelRequest): string {
  const configured = resolveConfiguredAppOrigin().replace(/\/$/, "");
  const header = typeof req.headers.origin === "string" ? req.headers.origin.replace(/\/$/, "") : "";
  if (!header) return configured;
  try {
    const u = new URL(header);
    // Only the real production app host may override the configured origin.
    if (u.protocol === "https:" && u.hostname === "app.evorios.com") {
      return header;
    }
  } catch {
    /* ignore */
  }
  return configured;
}

/** Fallback redirect onboarding — prefer connect_account_session + embedded UI. */
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

  const mismatch = stripeKeyModeMismatch();
  if (mismatch) {
    res.status(200).json({ ok: false, code: mismatch.code, reason: mismatch.reason });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const origin = resolveConnectRedirectOrigin(req);

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
    const existingId = profile?.stripe_connect_account_id ?? null;
    if (existingId) {
      const gate = await getConnectAlreadyComplete(stripe, existingId);
      if (gate.complete) {
        res.status(200).json({
          ok: false,
          code: "already_connected",
          reason: gate.reason,
          last4: gate.last4,
        });
        return;
      }
    }

    const ensured = await ensureExpressConnectAccount({
      stripe,
      admin,
      user: { id: user.id, email: user.email },
      profile,
      requestedCountry,
    });
    if (!ensured.ok) {
      res.status(200).json({ ok: false, reason: ensured.reason });
      return;
    }

    const accountLink = await stripe.accountLinks.create({
      account: ensured.accountId,
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
    const mapped = mapConnectStripeError(error);
    res.status(200).json({ ok: false, reason: mapped.reason, ...(mapped.code ? { code: mapped.code } : {}) });
  }
});
