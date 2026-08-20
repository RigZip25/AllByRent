/**
 * Extra Stripe Identity badge (separate from Connect Express KYC).
 * Default OFF — Connect already collects government ID + bank for payouts.
 * Set VITE_STRIPE_IDENTITY_ENABLED=true when Identity is enabled in the Dashboard.
 */
export function isStripeIdentityClientEnabled(): boolean {
  const flag = String(import.meta.env.VITE_STRIPE_IDENTITY_ENABLED ?? "")
    .trim()
    .toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;
  if (flag === "1" || flag === "true" || flag === "on" || flag === "yes") return true;
  return false;
}
