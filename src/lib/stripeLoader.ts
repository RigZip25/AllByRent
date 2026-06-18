import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { getStripePublishableKey } from "./stripeConfig";

let stripePromise: Promise<Stripe | null> | null = null;

/** Single shared Stripe.js instance — avoids stacking controller iframes. */
export function getStripePromise(): Promise<Stripe | null> | null {
  const key = getStripePublishableKey();
  if (!key) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
