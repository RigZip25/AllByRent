import { useSyncExternalStore } from "react";
import {
  getLocale,
  getMessages,
  getOnboardingCopy,
  getAppModeLabels,
  subscribeLocale,
  setLocale,
  setLocaleAuto,
  isLocaleAuto,
} from "./index";
import type { AppLocale } from "./types";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "./types";

export function useLocale(): AppLocale {
  return useSyncExternalStore(subscribeLocale, getLocale, getLocale);
}

export function useMessages() {
  const locale = useLocale();
  return getMessages(locale);
}

export function useOnboardingCopy() {
  const locale = useLocale();
  return getOnboardingCopy(locale);
}

export function useAppModeLabels() {
  const locale = useLocale();
  return getAppModeLabels(locale);
}

export function useLocaleControls() {
  const locale = useLocale();
  const auto = useSyncExternalStore(subscribeLocale, isLocaleAuto, isLocaleAuto);
  return {
    locale,
    auto,
    labels: LOCALE_LABELS,
    supported: SUPPORTED_LOCALES,
    setLocale,
    setLocaleAuto,
  };
}
