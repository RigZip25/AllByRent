/** Server-side brand + domain defaults (keep in sync with src/lib/brand.ts). */

export const APP_NAME = "Evorios";
export const MARKETING_URL = "https://evorios.com";
export const APP_HOST = "app.evorios.com";
export const DEFAULT_APP_ORIGIN = `https://${APP_HOST}`;
export const SUPPORT_EMAIL = "support@evorios.com";

export function resolveConfiguredAppOrigin(fallback = DEFAULT_APP_ORIGIN): string {
  const configured = process.env.APP_ORIGIN?.trim() || process.env.PASSKEY_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return fallback;
}
