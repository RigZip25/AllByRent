import type { VercelRequest, VercelResponse } from "@vercel/node";

import auctionCheckout from "../../server/routes/stripe/auction_checkout";
import boost from "../../server/routes/stripe/boost";
import connectAccountLink from "../../server/routes/stripe/connect_account_link";
import depositClaim from "../../server/routes/stripe/deposit_claim";
import depositIntent from "../../server/routes/stripe/deposit_intent";
import depositRelease from "../../server/routes/stripe/deposit_release";
import garageCheckout from "../../server/routes/stripe/garage_checkout";
import identitySession from "../../server/routes/stripe/identity_session";
import paymentCancel from "../../server/routes/stripe/payment_cancel";
import paymentCapture from "../../server/routes/stripe/payment_capture";
import paymentConfirm from "../../server/routes/stripe/payment_confirm";
import paymentIntent from "../../server/routes/stripe/payment_intent";
import webhook from "../../server/routes/stripe/webhook";

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
  const slug = req.query.slug;
  const key = Array.isArray(slug) ? slug.join("/") : (slug ?? "");
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
