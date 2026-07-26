import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { isStripeServerConfigured } from "../../lib/keys";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { getOrCreateStripeCustomer } from "../../lib/stripe/customer";
import { resolveConfiguredAppOrigin } from "../../lib/brand";

type Body = {
  returnPath?: string;
};

function resolveOrigin(req: VercelRequest): string {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  if (origin) return origin.replace(/\/$/, "");
  return resolveConfiguredAppOrigin();
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
  const returnPath = typeof body.returnPath === "string" && body.returnPath.startsWith("/")
    ? body.returnPath
    : "/?screen=profile";

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("stripe_connect_account_id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: "Failed to load profile" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as Stripe.LatestApiVersion });
  const origin = resolveOrigin(req);

  let accountId = profile?.stripe_connect_account_id ?? null;

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
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
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
    const reason =
      lower.includes("signed up for connect") ||
      (lower.includes("connect") && lower.includes("not enabled"))
        ? "Stripe Connect isn’t enabled. Open Stripe Dashboard → Connect → Get started, finish the platform profile, then retry."
        : message;
    res.status(200).json({ ok: false, reason });
  }
});
