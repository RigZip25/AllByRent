export const SUPPORTED_LOCALES = ["en", "cs"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  cs: "Čeština",
};

export const DEFAULT_LOCALE: AppLocale = "en";

export type OnboardingMessages = {
  roleChoice: {
    title: string;
    subtitle: string;
    stockGarage: { title: string; subtitle: string; cta: string };
    browseBlock: { title: string; subtitle: string; cta: string };
    footer: string;
  };
  location: {
    title: string;
    subtitle: string;
    onBlock: { title: string; subtitle: string; cta: string };
    trip: { title: string; subtitle: string; cta: string };
  };
  tripDestination: {
    title: string;
    subtitle: string;
    ctaWithCity: (city: string) => string;
    ctaDefault: string;
  };
  allSet: {
    title: string;
    subtitle: string;
    exploreCta: string;
    stockGarageCta: string;
  };
  browseHub: {
    title: string;
    subtitle: string;
    findGear: { title: string; subtitle: string; cta: string };
    yardSales: { title: string; subtitle: string; cta: string };
    footer: string;
  };
};

export type AppMessages = {
  tagline: string;
  taglineShort: string;
  modes: { earn: string; rent: string };
  nav: {
    home: string;
    stock: string;
    garage: string;
    more: string;
  };
  profile: {
    language: string;
    languageAuto: string;
    languageValue: (label: string) => string;
  };
  onboarding: OnboardingMessages;
};
