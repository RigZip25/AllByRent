import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

type Body = {
  returnUrl?: string;
};

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    res.status(200).json({ ok: false, reason: "Stripe not configured" });
    return;
  }

  const stripe = new Stripe(secret, { apiVersion: "2025-01-27.acacia" as any });
  const body = (req.body ?? {}) as Body;
  const returnUrl =
    typeof body.returnUrl === "string" && body.returnUrl.trim()
      ? body.returnUrl.trim()
      : "http://localhost:5173/?screen=profile";

  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: {
      supabase_user_id: user.id,
      email: user.email ?? "",
    },
    return_url: returnUrl,
  });

  res.status(200).json({
    ok: true,
    client_secret: session.client_secret,
    url: session.url ?? null,
  });
});

