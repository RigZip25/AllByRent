import { Capacitor } from "@capacitor/core";
import { APP_ORIGIN } from "./brand";

/**
 * Public HTTPS origin for redirects (Stripe, magic links, share URLs).
 * On Capacitor the WebView origin is not app.evorios.com — always use production there.
 */
export function getRuntimeAppOrigin(): string {
  if (typeof window === "undefined") return APP_ORIGIN;
  if (Capacitor.isNativePlatform()) return APP_ORIGIN;
  const origin = window.location.origin?.trim();
  return origin || APP_ORIGIN;
}

/** Custom URL scheme registered in iOS/Android manifests. */
export const NATIVE_URL_SCHEME = "evorios";
