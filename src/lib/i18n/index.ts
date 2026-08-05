import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "./types";
import type { AppMessages } from "./types";
import { en } from "./messages/en";
import { cs } from "./messages/cs";
import { getSearchCountryCode } from "../locationCountry";

const STORAGE_KEY = "evorios_locale";
const AUTO_KEY = "evorios_locale_auto";
const SEARCH_COUNTRY_EVENT = "evorios:search-country-change";

const CATALOG: Record<AppLocale, AppMessages> = { en, cs };

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeLocale(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function primaryLanguage(tag: string): string {
  return (tag || "").trim().toLowerCase().split(/[-_]/)[0] || "";
}

/** Common BCP-47 defaults — Web Speech API often needs a region, not just `cs`. */
const SPEECH_LANG_DEFAULTS: Record<string, string> = {
  ar: "ar-SA",
  cs: "cs-CZ",
  da: "da-DK",
  de: "de-DE",
  el: "el-GR",
  en: "en-US",
  es: "es-ES",
  fi: "fi-FI",
  fr: "fr-FR",
  he: "he-IL",
  hi: "hi-IN",
  hu: "hu-HU",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  ms: "ms-MY",
  nb: "nb-NO",
  nl: "nl-NL",
  no: "nb-NO",
  pl: "pl-PL",
  pt: "pt-BR",
  ro: "ro-RO",
  ru: "ru-RU",
  sk: "sk-SK",
  sv: "sv-SE",
  th: "th-TH",
  tr: "tr-TR",
  uk: "uk-UA",
  vi: "vi-VN",
  zh: "zh-CN",
};

export function collectDeviceLanguageTags(): string[] {
  const tags: string[] = [];
  const push = (raw: string | undefined | null) => {
    const t = (raw || "").trim();
    if (t && !tags.includes(t)) tags.push(t);
  };

  if (typeof navigator !== "undefined") {
    if (navigator.languages?.length) {
      for (const lang of navigator.languages) push(lang);
    }
    push(navigator.language);
  }

  // iOS/Android often expose system locale here even when Safari’s
  // preferred-language list leads with English.
  try {
    push(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    /* ignore */
  }

  return tags;
}

/** Normalize a language tag for SpeechRecognition.lang (e.g. cs → cs-CZ). */
export function normalizeSpeechRecognitionLang(tag: string): string {
  const raw = (tag || "").trim().replace(/_/g, "-");
  if (!raw) return "en-US";
  const parts = raw.split("-").filter(Boolean);
  const primary = (parts[0] || "").toLowerCase();
  if (!primary) return "en-US";
  if (parts.length === 1) return SPEECH_LANG_DEFAULTS[primary] ?? primary;

  const rest = parts.slice(1).map((part) => {
    if (part.length === 2) return part.toUpperCase();
    if (part.length === 4) return part[0]!.toUpperCase() + part.slice(1).toLowerCase();
    return part;
  });
  return `${primary}-${rest.join("-")}`;
}

/**
 * Language for Web Speech API.
 * Prefers the app UI locale when non-English, then the first non-English
 * device language (so RU/ES/CS mic works even if Safari lists English first).
 */
export function resolveSpeechRecognitionLang(
  uiLocale: AppLocale = getLocale(),
  languages: readonly string[] = collectDeviceLanguageTags(),
): string {
  const ordered: string[] = [];
  if (uiLocale === "cs") ordered.push("cs-CZ");

  for (const tag of languages) {
    if (tag && !ordered.includes(tag)) ordered.push(tag);
  }

  for (const tag of ordered) {
    const normalized = normalizeSpeechRecognitionLang(tag);
    if (primaryLanguage(normalized) !== "en") return normalized;
  }

  if (ordered[0]) return normalizeSpeechRecognitionLang(ordered[0]);
  return "en-US";
}

function localeFromTimezone(): AppLocale | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Europe/Prague" || tz === "Europe/Bratislava") return "cs";
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Map BCP-47 tags like cs-CZ / pt-BR → supported app locale.
 * Prefers the native Czech pack in CZ/SK (timezone, region tag, or search country)
 * even when Safari lists English first — never route Czechia through Google Translate.
 */
export function resolveDeviceLocale(
  languages: readonly string[] = collectDeviceLanguageTags(),
): AppLocale {
  const matched: AppLocale[] = [];
  for (const raw of languages) {
    const primary = primaryLanguage(raw);
    if (isAppLocale(primary) && !matched.includes(primary)) matched.push(primary);
  }

  const prefersCzechRegion =
    localeFromTimezone() === "cs" ||
    languages.some((t) => /[-_](CZ|SK)\b/i.test(t || "")) ||
    (() => {
      try {
        const country = getSearchCountryCode();
        return country === "CZ" || country === "SK";
      } catch {
        return false;
      }
    })();

  // Native cs.ts wins for Czechia/Slovakia — do not fall through to English-first lists.
  if (prefersCzechRegion) return "cs";
  if (matched[0]) return matched[0];

  return DEFAULT_LOCALE;
}

export function isLocaleAuto(): boolean {
  try {
    const v = localStorage.getItem(AUTO_KEY);
    if (v === "0") return false;
    if (v === "1") return true;
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }
}

export function getLocale(): AppLocale {
  try {
    if (isLocaleAuto()) return resolveDeviceLocale();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isAppLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return resolveDeviceLocale();
}

/** Persist explicit locale (turns off auto). */
export function setLocale(locale: AppLocale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    localStorage.setItem(AUTO_KEY, "0");
  } catch {
    /* ignore */
  }
  applyDocumentLang(locale);
  notify();
}

/** Follow device language again. */
export function setLocaleAuto() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(AUTO_KEY, "1");
  } catch {
    /* ignore */
  }
  applyDocumentLang();
  notify();
}

export function getMessages(locale: AppLocale = getLocale()): AppMessages {
  return CATALOG[locale] ?? CATALOG.en;
}

export function getOnboardingCopy(locale?: AppLocale) {
  return getMessages(locale).onboarding;
}

export function getAppModeLabels(locale?: AppLocale) {
  return getMessages(locale).modes;
}

export function applyDocumentLang(locale: AppLocale = getLocale()) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  // Native packs (en UI without Google target, and always cs) — discourage
  // Chrome/Safari “Translate this page” so Czechia uses messages/cs.ts, not Google.
  if (locale === "cs") {
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.add("notranslate");
  } else {
    document.documentElement.removeAttribute("translate");
    document.documentElement.classList.remove("notranslate");
  }
}

/** Keep Auto locale in sync when the OS/browser language or marketplace country changes. */
export function startLocaleChangeListener(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onChange = () => {
    if (!isLocaleAuto()) return;
    applyDocumentLang();
    notify();
  };
  window.addEventListener("languagechange", onChange);
  window.addEventListener(SEARCH_COUNTRY_EVENT, onChange);
  return () => {
    window.removeEventListener("languagechange", onChange);
    window.removeEventListener(SEARCH_COUNTRY_EVENT, onChange);
  };
}

export function emitSearchCountryLocaleRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SEARCH_COUNTRY_EVENT));
}
