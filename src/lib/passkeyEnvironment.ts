import { APP_HOST, APP_ORIGIN } from "./brand";

/** True when opened from iOS home screen (standalone display mode). */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)");
  if (mq.matches) return true;
  return Boolean(
    (navigator as Navigator & { standalone?: boolean }).standalone,
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Hostnames where production passkeys are configured (see PASSKEY_RP_ID). */
export function isPasskeyProductionHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === APP_HOST || host === "localhost" || host === "127.0.0.1";
}

export type PasskeyEnvironment = "ios-pwa" | "ios-safari" | "pwa" | "browser";

export function detectPasskeyEnvironment(): PasskeyEnvironment {
  if (isIosDevice() && isStandalonePwa()) return "ios-pwa";
  if (isIosDevice()) return "ios-safari";
  if (isStandalonePwa()) return "pwa";
  return "browser";
}

/** Short hint shown under Face ID buttons (Safari vs installed app). */
export function getPasskeyEnvironmentHint(): string | null {
  const env = detectPasskeyEnvironment();
  if (env === "ios-pwa") {
    return "Using the app from your Home Screen. Face ID must have been enabled on this same app icon.";
  }
  if (env === "ios-safari") {
    return "Using Safari. To use the installed app later, enable Face ID again from that icon.";
  }
  if (env === "pwa") {
    return "Using the installed app. Face ID is tied to this app icon, not a browser tab.";
  }
  if (!isPasskeyProductionHost()) {
    return `Passkeys work best at ${APP_ORIGIN} — preview URLs may not match Face ID.`;
  }
  return null;
}
