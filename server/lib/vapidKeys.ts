/** Matches client `src/lib/vapidPublicKey.ts` — public half of the VAPID pair. */
export const FALLBACK_VAPID_PUBLIC_KEY =
  "BH45waZHpiO_FiJjHMJfseI3nyNVyZscTYoq1dNYfdRSSKudNQP47kt76TcEgboKBmzUQQO7xzQCx5e464dCCwk";

export function getVapidPublicKey(): string | undefined {
  const key = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  if (key?.trim()) return key.trim();
  return FALLBACK_VAPID_PUBLIC_KEY;
}

export function getVapidPrivateKey(): string | undefined {
  const key = process.env.VAPID_PRIVATE_KEY;
  return key?.trim() ? key.trim() : undefined;
}

export function isWebPushSendConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
