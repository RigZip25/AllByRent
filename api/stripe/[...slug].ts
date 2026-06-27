import type { VercelRequest, VercelResponse } from "@vercel/node";

import auctionCheckout from "@allbyrent/server/routes/stripe/auction_checkout";
import { resolveApiRouteKey } from "@allbyrent/server/lib/safeHandler";
import boost from "@allbyrent/server/routes/stripe/boost";
import connectAccountLink from "@allbyrent/server/routes/stripe/connect_account_link";
import depositClaim from "@allbyrent/server/routes/stripe/deposit_claim";
import depositIntent from "@allbyrent/server/routes/stripe/deposit_intent";
import depositRelease from "@allbyrent/server/routes/stripe/deposit_release";
import garageCheckout from "@allbyrent/server/routes/stripe/garage_checkout";
import identitySession from "@allbyrent/server/routes/stripe/identity_session";
import paymentCancel from "@allbyrent/server/routes/stripe/payment_cancel";
import paymentCapture from "@allbyrent/server/routes/stripe/payment_capture";
import paymentConfirm from "@allbyrent/server/routes/stripe/payment_confirm";
import paymentIntent from "@allbyrent/server/routes/stripe/payment_intent";
import webhook from "@allbyrent/server/routes/stripe/webhook";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, Handler> = {
  auction_checkout: auctionCheckout,
  boost,
  connect_account_link: connectAccountLink,
  deposit_claim: depositClaim,
  deposit_intent: depositIntent,
  deposit_release: depositRelease,
  garage_checkout: garageCheckout,
  identity_session: identitySession,
  payment_cancel: paymentCancel,
  payment_capture: paymentCapture,
  payment_confirm: paymentConfirm,
  payment_intent: paymentIntent,
  webhook,
};

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveApiRouteKey(req, "stripe");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
