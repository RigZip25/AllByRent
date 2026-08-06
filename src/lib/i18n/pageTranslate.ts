/**
 * Instant page translation for languages without a native message pack.
 * Uses Google Website Translator (same engine as Chrome’s “Translate this page”).
 *
 * Native packs (en, cs, es) stay authoritative — no Google layer.
 * Auto + phone in pl/fr/sk/… → English UI source + live Google translate.
 */

import { isNativeApp } from "../nativeShell";
import { collectDeviceLanguageTags, getLocale, isLocaleAuto } from "./index";

const GOOG_SCRIPT_ID = "evorios-google-translate";
const HIDDEN_HOST_ID = "evorios_google_translate_element";

/** Languages we never send through Google (native UI packs). */
const NATIVE_UI = new Set(["en", "cs", "es"]);

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (
          opts: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
          },
          elementId: string,
        ) => void;
      };
    };
  }
}

function primaryLanguage(tag: string): string {
  return (tag || "").trim().toLowerCase().split(/[-_]/)[0] || "";
}

/** Human label for a language code, e.g. pl → Polish. */
export function languageDisplayName(code: string, ofLocale = "en"): string {
  const primary = primaryLanguage(code);
  if (!primary) return code;
  try {
    const name = new Intl.DisplayNames([ofLocale], { type: "language" }).of(primary);
    if (name) return name[0]!.toUpperCase() + name.slice(1);
  } catch {
    /* ignore */
  }
  return primary.toUpperCase();
}

/**
 * Target language for Google page translate, or null when native UI is enough.
 */
export function resolvePageTranslateTarget(
  languages: readonly string[] = collectDeviceLanguageTags(),
): string | null {
  // Store builds should not use Google Website Translator — it mangles chat
  // copy and leaves half the UI in English. Prefer English (or real i18n packs).
  if (isNativeApp()) return null;
  if (!isLocaleAuto()) return null;
  const ui = getLocale();
  // Native packs (en source for Google, and always cs.ts for Czechia) — never
  // Google-translate into Czech; resolveDeviceLocale already picks cs for CZ/SK.
  if (ui !== "en") return null;

  for (const tag of languages) {
    const primary = primaryLanguage(tag);
    if (!primary || NATIVE_UI.has(primary)) continue;
    // Skip nonsense / private-use tags
    if (primary.length < 2 || primary.length > 3) continue;
    return primary;
  }
  return null;
}

function cookieDomainCandidates(): string[] {
  if (typeof window === "undefined") return [""];
  const host = window.location.hostname;
  const out = [""];
  if (host && host.includes(".")) out.push(host, `.${host}`);
  // apex + www / app siblings
  const parts = host.split(".");
  if (parts.length >= 2) {
    const apex = parts.slice(-2).join(".");
    out.push(apex, `.${apex}`);
  }
  return [...new Set(out)];
}

function readGoogTrans(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function writeGoogTrans(value: string | null) {
  if (typeof document === "undefined") return;
  const expireClear = "Thu, 01 Jan 1970 00:00:00 GMT";
  for (const domain of cookieDomainCandidates()) {
    const domainPart = domain ? `;domain=${domain}` : "";
    if (value) {
      document.cookie = `googtrans=${value};path=/${domainPart}`;
    } else {
      document.cookie = `googtrans=;expires=${expireClear};path=/${domainPart}`;
    }
  }
}

/** Call before React paint so the first frame can already be translated. */
export function bootstrapPageTranslate(): string | null {
  if (typeof window === "undefined") return null;
  const target = resolvePageTranslateTarget();
  if (!target) {
    writeGoogTrans(null);
    return null;
  }
  writeGoogTrans(`/en/${target}`);
  document.documentElement.lang = target;
  return target;
}

function ensureHiddenHost(): HTMLElement {
  let el = document.getElementById(HIDDEN_HOST_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = HIDDEN_HOST_ID;
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;";
    document.body.appendChild(el);
  }
  return el;
}

function selectGoogleCombo(lang: string) {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  if (combo.value === lang) return true;
  combo.value = lang;
  combo.dispatchEvent(new Event("change"));
  return true;
}

let scriptLoading: Promise<void> | null = null;

function loadGoogleTranslateScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.translate?.TranslateElement) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      try {
        ensureHiddenHost();
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            HIDDEN_HOST_ID,
          );
        }
      } catch {
        /* ignore init errors */
      }
      resolve();
    };

    const existing = document.getElementById(GOOG_SCRIPT_ID);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = GOOG_SCRIPT_ID;
    script.async = true;
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.onerror = () => reject(new Error("Google Translate failed to load"));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

/**
 * Enable or disable live Google page translation for the current session.
 * Returns the active target language code, or null.
 */
export async function syncPageTranslate(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const target = resolvePageTranslateTarget();

  if (!target) {
    const prev = readGoogTrans();
    writeGoogTrans(null);
    // If a prior session mutated the DOM, a soft combo reset helps
    selectGoogleCombo("");
    if (prev && prev !== `/en/${getLocale()}` && !prev.endsWith("/en")) {
      // Native pack active — leave DOM; user can hard-refresh if mixed
    }
    return null;
  }

  writeGoogTrans(`/en/${target}`);
  document.documentElement.lang = target;

  try {
    await loadGoogleTranslateScript();
  } catch {
    return target; // cookie still set; browser may apply on next navigation
  }

  // Widget mounts async — retry combo select briefly
  for (let i = 0; i < 12; i++) {
    if (selectGoogleCombo(target)) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  return target;
}

export function getActivePageTranslateTarget(): string | null {
  return resolvePageTranslateTarget();
}
