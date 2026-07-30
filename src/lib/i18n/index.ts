import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "./types";
import type { AppMessages } from "./types";
import { en } from "./messages/en";
import { cs } from "./messages/cs";

const STORAGE_KEY = "evorios_locale";
const AUTO_KEY = "evorios_locale_auto";

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

/** Map BCP-47 tags like cs-CZ / pt-BR → supported app locale. */
export function resolveDeviceLocale(
  languages: readonly string[] = typeof navigator !== "undefined"
    ? navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    : [DEFAULT_LOCALE],
): AppLocale {
  for (const raw of languages) {
    const tag = (raw || "").trim().toLowerCase();
    if (!tag) continue;
    const primary = tag.split("-")[0] || "";
    if (isAppLocale(primary)) return primary;
  }
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
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
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
  if (typeof document !== "undefined") {
    document.documentElement.lang = getLocale();
  }
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
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}
