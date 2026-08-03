import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
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

/** Status bar, splash, Android back button, deep links — safe no-ops on web. */
export async function initNativeShell(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0D5C3A" });
    }
  } catch {
    /* plugin unavailable in some simulators */
  }

  try {
    await SplashScreen.hide();
  } catch {
    /* already auto-hidden */
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
