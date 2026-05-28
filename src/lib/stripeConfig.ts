function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function isPlaceholderKey(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.includes("placeholder") || lower.includes("changeme") || lower === "pk_test_xxx";
}

/** Publishable key for Stripe.js (set VITE_STRIPE_PUBLISHABLE_KEY in Vercel). */
export function getStripePublishableKey(): string | undefined {
  const key = trimEnv(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined);
  if (!key || isPlaceholderKey(key)) return undefined;
  return key;
}

export function isStripePaymentsEnabled(): boolean {
  return Boolean(getStripePublishableKey());
}
