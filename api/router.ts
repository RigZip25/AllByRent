import type { VercelRequest, VercelResponse } from "@vercel/node";

import agentActivity from "../server/routes/agent/activity";
import agentFinance from "../server/routes/agent/finance";
import agentGrowth from "../server/routes/agent/growth";
import agentListings from "../server/routes/agent/listings";
import agentMarketing from "../server/routes/agent/marketing";
import agentMarket from "../server/routes/agent/market";
import agentPricing from "../server/routes/agent/pricing";
import agentSafety from "../server/routes/agent/safety";
import anthropic from "../server/routes/anthropic";
import authOtp from "../server/routes/auth/otp";
import cronRentalNoShow from "../server/routes/cron/rental-no-show";
import cronRentalOverdue from "../server/routes/cron/rental-overdue";
import geocodeUs from "../server/routes/geocode/us";
import geocodeUsps from "../server/routes/geocode/usps";
import link from "../server/routes/link";
import orchestratorRun from "../server/routes/orchestrator/run";
import passkeyAuthOptions from "../server/routes/passkey/auth/options";
import passkeyAuthVerify from "../server/routes/passkey/auth/verify";
import passkeyRegisterOptions from "../server/routes/passkey/register/options";
import passkeyRegisterVerify from "../server/routes/passkey/register/verify";
import photoroom from "../server/routes/photoroom";
import pushSend from "../server/routes/push/send";
import safelyQuote from "../server/routes/safely/quote";
import stripeAuctionCheckout from "../server/routes/stripe/auction_checkout";
import stripeBoost from "../server/routes/stripe/boost";
import stripeConnectAccountLink from "../server/routes/stripe/connect_account_link";
import stripeDepositClaim from "../server/routes/stripe/deposit_claim";
import stripeDepositIntent from "../server/routes/stripe/deposit_intent";
import stripeDepositRelease from "../server/routes/stripe/deposit_release";
import stripeGarageCheckout from "../server/routes/stripe/garage_checkout";
import stripeIdentitySession from "../server/routes/stripe/identity_session";
import stripePaymentIntent from "../server/routes/stripe/payment_intent";
import stripeWebhook from "../server/routes/stripe/webhook";

type RouteHandler = (req: VercelRequest, res: VercelResponse) => unknown;

const ROUTES: Record<string, RouteHandler> = {
  link,
  anthropic,
  photoroom,
  "auth/otp": authOtp,
  "agent/activity": agentActivity,
  "agent/finance": agentFinance,
  "agent/growth": agentGrowth,
  "agent/listings": agentListings,
  "agent/marketing": agentMarketing,
  "agent/market": agentMarket,
  "agent/pricing": agentPricing,
  "agent/safety": agentSafety,
  "cron/rental-no-show": cronRentalNoShow,
  "cron/rental-overdue": cronRentalOverdue,
  "geocode/us": geocodeUs,
  "geocode/usps": geocodeUsps,
  "orchestrator/run": orchestratorRun,
  "passkey/auth/options": passkeyAuthOptions,
  "passkey/auth/verify": passkeyAuthVerify,
  "passkey/register/options": passkeyRegisterOptions,
  "passkey/register/verify": passkeyRegisterVerify,
  "push/send": pushSend,
  "safely/quote": safelyQuote,
  "stripe/auction_checkout": stripeAuctionCheckout,
  "stripe/boost": stripeBoost,
  "stripe/connect_account_link": stripeConnectAccountLink,
  "stripe/deposit_claim": stripeDepositClaim,
  "stripe/deposit_intent": stripeDepositIntent,
  "stripe/deposit_release": stripeDepositRelease,
  "stripe/garage_checkout": stripeGarageCheckout,
  "stripe/identity_session": stripeIdentitySession,
  "stripe/payment_intent": stripePaymentIntent,
  "stripe/webhook": stripeWebhook,
};

function resolveRouteKey(route: string | string[] | undefined): string {
  if (Array.isArray(route)) return route.map((part) => part.trim()).filter(Boolean).join("/");
  return route?.trim() ?? "";
}

export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  const key = resolveRouteKey(req.query.route);
  const routeHandler = ROUTES[key];
  if (!routeHandler) {
    res.status(404).json({ error: "Not found", route: key || null });
    return;
  }
  return routeHandler(req, res);
}
