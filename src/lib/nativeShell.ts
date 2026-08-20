import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { CapacitorPasskey } from "@capgo/capacitor-passkey";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { APP_HOST, APP_ORIGIN } from "./brand";

/** True when running inside the Capacitor iOS/Android shell. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

function resolveApiRequest(
  input: RequestInfo | URL,
  origin: string,
): RequestInfo | URL {
  if (typeof input === "string") {
    if (input.startsWith("/api/") || input === "/api") {
      return `${origin}${input}`;
    }
    // Absolute same-origin /api (legacy callers using window.location.origin)
    try {
      const abs = new URL(input, window.location.href);
      if (
        abs.origin === window.location.origin &&
        abs.pathname.startsWith("/api")
      ) {
        return `${origin}${abs.pathname}${abs.search}${abs.hash}`;
      }
    } catch {
      /* ignore */
    }
    return input;
  }

  if (input instanceof URL) {
    if (
      input.origin === window.location.origin &&
      input.pathname.startsWith("/api")
    ) {
      return new URL(`${input.pathname}${input.search}${input.hash}`, origin);
    }
    return input;
  }

  const url = new URL(input.url, window.location.href);
  if (
    url.origin === window.location.origin &&
    url.pathname.startsWith("/api")
  ) {
    return new Request(
      `${origin}${url.pathname}${url.search}${url.hash}`,
      input,
    );
  }
  return input;
}

/**
 * Bundled Capacitor apps have no Vercel /api routes on device.
 * Rewrite same-origin `/api/*` to production so Stripe, auth, geocode, etc. work.
 */
export function installNativeApiBridge(): void {
  if (!isNativeApp()) return;
  if ((window as Window & { __evoriosNativeApi?: boolean }).__evoriosNativeApi) {
    return;
  }
  (window as Window & { __evoriosNativeApi?: boolean }).__evoriosNativeApi =
    true;

  const origin = APP_ORIGIN.replace(/\/$/, "");
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) =>
    originalFetch(resolveApiRequest(input, origin), init);
}

/** Map custom-scheme / universal-link URLs onto the in-app router. */
function applyExternalAppUrl(rawUrl: string): void {
  try {
    const normalized = rawUrl
      .replace(/^evorios:\/\//i, `https://${APP_HOST}/`)
      .replace(/^evorios:/i, `https://${APP_HOST}/`);
    const incoming = new URL(normalized);
    const next = `${incoming.pathname}${incoming.search}${incoming.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next === current || next === "/" || next === "") return;
    window.location.assign(`${window.location.origin}${next}`);
  } catch {
    /* ignore malformed deep links */
  }
}

/** Hide the native launch splash (call when React splash mounts or when intentionally skipping). */
export async function hideNativeSplash(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    /* already hidden */
  }
}

/**
 * Bridge WebAuthn (Face ID) to native APIs so @simplewebauthn/browser works
 * inside the Capacitor shell (RP origin = https://app.evorios.com).
 */
async function installNativePasskeyShim(): Promise<void> {
  try {
    await CapacitorPasskey.autoShimWebAuthn({
      origin: APP_ORIGIN,
      // WebView often exposes a non-functional navigator.credentials — force native.
      force: true,
    });
  } catch (err) {
    console.warn("[native] passkey shim failed", err);
  }
}

/** Status bar, Android back button, deep links — safe no-ops on web.
 *  Native splash stays until hideNativeSplash() (launchAutoHide: false). */
export async function initNativeShell(): Promise<void> {
  if (!isNativeApp()) return;

  await installNativePasskeyShim();

  try {
    // Edge-to-edge: one safe-area pad from CSS (same as PWA). Do not let the
    // status bar reserve layout space on Android — that stacks with env(safe-area-inset-top).
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    /* plugin unavailable in some simulators */
  }

  await CapApp.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
      return;
    }
    void CapApp.exitApp();
  });

  await CapApp.addListener("appUrlOpen", ({ url }) => {
    applyExternalAppUrl(url);
  });

  try {
    const launch = await CapApp.getLaunchUrl();
    if (launch?.url) applyExternalAppUrl(launch.url);
  } catch {
    /* no launch URL */
  }
}
