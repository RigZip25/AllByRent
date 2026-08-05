/**
 * Marketplace country → Stripe Connect account country + charge currency.
 * Keep in sync with client `regionalDisplay` currency codes where possible.
 */

/** Countries Stripe Connect Express commonly supports (ISO 3166-1 alpha-2). */
export const STRIPE_CONNECT_COUNTRIES = new Set([
  "US",
  "CA",
  "MX",
  "BR",
  "GB",
  "IE",
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GI",
  "GR",
  "HU",
  "IT",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "AU",
  "NZ",
  "JP",
  "SG",
  "HK",
  "MY",
  "TH",
  "AE",
]);

/** ISO country → Stripe PaymentIntent currency (lowercase). */
const COUNTRY_TO_STRIPE_CURRENCY: Record<string, string> = {
  US: "usd",
  CA: "cad",
  MX: "mxn",
  BR: "brl",
  GB: "gbp",
  IE: "eur",
  AT: "eur",
  BE: "eur",
  BG: "bgn",
  HR: "eur",
  CY: "eur",
  CZ: "czk",
  DK: "dkk",
  EE: "eur",
  FI: "eur",
  FR: "eur",
  DE: "eur",
  GR: "eur",
  HU: "huf",
  IT: "eur",
  LV: "eur",
  LI: "chf",
  LT: "eur",
  LU: "eur",
  MT: "eur",
  NL: "eur",
  NO: "nok",
  PL: "pln",
  PT: "eur",
  RO: "ron",
  SK: "eur",
  SI: "eur",
  ES: "eur",
  SE: "sek",
  CH: "chf",
  AU: "aud",
  NZ: "nzd",
  JP: "jpy",
  SG: "sgd",
  HK: "hkd",
  MY: "myr",
  TH: "thb",
  AE: "aed",
  AR: "ars",
  CL: "clp",
  CO: "cop",
  PE: "pen",
  UA: "uah",
};

export function normalizeCountryCode(raw: string | null | undefined): string | null {
  const code = (raw || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

/**
 * Pick Connect account country: profile → client hint → US.
 * Returns null when the country is known but not Connect-capable.
 */
export function resolveConnectCountry(options: {
  profileCountry?: string | null;
  requestedCountry?: string | null;
  fallback?: string;
}): { ok: true; country: string } | { ok: false; reason: string } {
  const candidates = [
    normalizeCountryCode(options.profileCountry),
    normalizeCountryCode(options.requestedCountry),
    normalizeCountryCode(options.fallback) ?? "US",
  ].filter((c): c is string => Boolean(c));

  for (const country of candidates) {
    if (STRIPE_CONNECT_COUNTRIES.has(country)) {
      return { ok: true, country };
    }
  }

  const tried = candidates[0] ?? "??";
  return {
    ok: false,
    reason: `Card payouts aren’t available in ${tried} yet. You can still publish listings; payouts need a Stripe-supported country.`,
  };
}

export function stripeCurrencyForCountry(country: string | null | undefined): string {
  const code = normalizeCountryCode(country);
  if (!code) return "usd";
  return COUNTRY_TO_STRIPE_CURRENCY[code] ?? "usd";
}
