import { getSearchCountryCode, type CountryCode } from "./locationCountry";

type CurrencyInfo = {
  code: string;
  locale: string;
};

/** Display currency for marketplace amounts by search/country context. */
const COUNTRY_CURRENCY: Record<string, CurrencyInfo> = {
  US: { code: "USD", locale: "en-US" },
  CA: { code: "CAD", locale: "en-CA" },
  MX: { code: "MXN", locale: "es-MX" },
  BR: { code: "BRL", locale: "pt-BR" },
  AR: { code: "ARS", locale: "es-AR" },
  CL: { code: "CLP", locale: "es-CL" },
  CO: { code: "COP", locale: "es-CO" },
  PE: { code: "PEN", locale: "es-PE" },
  GB: { code: "GBP", locale: "en-GB" },
  IE: { code: "EUR", locale: "en-IE" },
  CZ: { code: "CZK", locale: "cs-CZ" },
  SK: { code: "EUR", locale: "sk-SK" },
  PL: { code: "PLN", locale: "pl-PL" },
  DE: { code: "EUR", locale: "de-DE" },
  AT: { code: "EUR", locale: "de-AT" },
  CH: { code: "CHF", locale: "de-CH" },
  FR: { code: "EUR", locale: "fr-FR" },
  ES: { code: "EUR", locale: "es-ES" },
  IT: { code: "EUR", locale: "it-IT" },
  PT: { code: "EUR", locale: "pt-PT" },
  NL: { code: "EUR", locale: "nl-NL" },
  BE: { code: "EUR", locale: "nl-BE" },
  LU: { code: "EUR", locale: "fr-LU" },
  SE: { code: "SEK", locale: "sv-SE" },
  NO: { code: "NOK", locale: "nb-NO" },
  DK: { code: "DKK", locale: "da-DK" },
  FI: { code: "EUR", locale: "fi-FI" },
  HU: { code: "HUF", locale: "hu-HU" },
  RO: { code: "RON", locale: "ro-RO" },
  BG: { code: "BGN", locale: "bg-BG" },
  HR: { code: "EUR", locale: "hr-HR" },
  SI: { code: "EUR", locale: "sl-SI" },
  GR: { code: "EUR", locale: "el-GR" },
  EE: { code: "EUR", locale: "et-EE" },
  LV: { code: "EUR", locale: "lv-LV" },
  LT: { code: "EUR", locale: "lt-LT" },
  UA: { code: "UAH", locale: "uk-UA" },
};

/** Miles are still the common road unit mainly in the US & UK. */
const IMPERIAL_DISTANCE = new Set(["US", "GB"]);

export function currencyForCountry(country: CountryCode = getSearchCountryCode()): CurrencyInfo {
  return COUNTRY_CURRENCY[country] ?? { code: "USD", locale: "en-US" };
}

export function usesImperialDistance(country: CountryCode = getSearchCountryCode()): boolean {
  return IMPERIAL_DISTANCE.has(country);
}

/** Narrow currency symbol/code for input prefixes (e.g. Kč, $, €). */
export function currencySymbol(country: CountryCode = getSearchCountryCode()): string {
  const { code, locale } = currencyForCountry(country);
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

/** Format a money amount for the active (or given) country. */
export function formatMoney(
  amount: number,
  country: CountryCode = getSearchCountryCode(),
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const { code, locale } = currencyForCountry(country);
  const digits = Number.isInteger(value) ? 0 : 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(digits)}`;
  }
}

/**
 * Format a cluster radius that is stored in miles in the product model.
 * Metric countries see an approximate km label.
 */
export function formatDistanceFromMiles(
  miles: number,
  country: CountryCode = getSearchCountryCode(),
): string {
  const value = Number.isFinite(miles) ? miles : 0;
  if (usesImperialDistance(country)) {
    return value >= 50 ? `${Math.round(value)}+ mi` : `${Math.round(value)} mi`;
  }
  const km = Math.round(value * 1.60934);
  return value >= 50 ? `${km}+ km` : `${km} km`;
}

export function freePriceLabel(country: CountryCode = getSearchCountryCode()): string {
  return formatMoney(0, country);
}
