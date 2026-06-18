/** Stripe.js can leave full-viewport controller iframes behind after checkout. */
export function removeStripeControllerIframes(): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll<HTMLIFrameElement>('iframe[name^="__privateStripeController"]')
    .forEach((frame) => frame.remove());
}
