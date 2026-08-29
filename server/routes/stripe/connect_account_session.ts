import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import {
  ensureExpressConnectAccount,
  getConnectAlreadyComplete,
  mapConnectStripeError,
  stripeKeyModeMismatch,
} from "../../lib/stripe/ensureConnectAccount";

type Body = {
  /** ISO country hint from the client (search/home country). */
  country?: string;
};

/**
 * Creates a Connect Account Session for embedded UI.
 * Express: Stripe keeps loss liability; hosted SMS auth may still appear.
 */
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

  try {
    const existingId = profile?.stripe_connect_account_id ?? null;
    let mode: "onboarding" | "management" = "onboarding";
    if (existingId) {
      const gate = await getConnectAlreadyComplete(stripe, existingId);
      if (gate.complete) mode = "management";
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

    const session = await stripe.accountSessions.create({
      account: ensured.accountId,
      components:
        mode === "management"
          ? {
              account_management: {
                enabled: true,
                features: {
                  external_account_collection: true,
                },
              },
            }
          : {
              account_onboarding: {
                enabled: true,
                features: {
                  external_account_collection: true,
                },
              },
            },
    });

    if (!session.client_secret) {
      res.status(200).json({ ok: false, reason: "Stripe returned no account session secret." });
      return;
    }

    res.status(200).json({ ok: true, clientSecret: session.client_secret, mode });
  } catch (error) {
    const mapped = mapConnectStripeError(error);
    res.status(200).json({ ok: false, reason: mapped.reason, ...(mapped.code ? { code: mapped.code } : {}) });
  }
});
