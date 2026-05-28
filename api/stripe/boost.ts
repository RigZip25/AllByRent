import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../_lib/cors";
import { withApiErrorHandling } from "../_lib/safeHandler";

/**
 * Placeholder Stripe integration for listing boosts.
 * If STRIPE_SECRET_KEY is configured, implement Checkout/PaymentIntent here.
 */
export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(200).json({ ok: false, reason: "Stripe not configured" });
    return;
  }

  // Intentionally not implemented yet (Task 15-18 covers full Stripe Elements flows).
  res.status(200).json({ ok: false, reason: "Stripe boost checkout not implemented" });
});

