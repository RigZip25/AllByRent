import { getSearchCountryCode, getSavedSearchCountry, getCountryDef, type CountryCode } from "./locationCountry";

type CurrencyInfo = {
  code: string;
  locale: string;
};

const LOCALE_STORAGE_KEY = "evorios_locale";
const LOCALE_AUTO_KEY = "evorios_locale_auto";

/**
 * Country used for money display.
 * Saved marketplace country wins; otherwise explicit UI locale es→ES / cs→CZ;
 * then the same detection as search country (timezone / language / US).
 */
export function getCurrencyCountryCode(): CountryCode {
  const saved = getSavedSearchCountry();
  if (saved) return saved;

  try {
    const auto = localStorage.getItem(LOCALE_AUTO_KEY);
    const stored = (localStorage.getItem(LOCALE_STORAGE_KEY) || "").trim().toLowerCase();
    // Explicit language pick is a strong market signal for Evorios (Spain / Czechia).
    if (auto === "0") {
      if (stored === "es") return "ES";
      if (stored === "cs") return "CZ";
    }
  } catch {
    /* ignore */
  }

  return getSearchCountryCode();
}

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

/**
 * Road distance: miles mainly in the US & UK.
 * Everywhere else in our markets (EU, LatAm, CA, …) → kilometres.
 */
const IMPERIAL_DISTANCE = new Set(["US", "GB"]);

const MI_PER_KM = 1 / 1.60934;
const KM_PER_MI = 1.60934;

export function currencyForCountry(country: CountryCode = getCurrencyCountryCode()): CurrencyInfo {
  return COUNTRY_CURRENCY[country] ?? { code: "USD", locale: "en-US" };
}

export function usesImperialDistance(country: CountryCode = getSearchCountryCode()): boolean {
  return IMPERIAL_DISTANCE.has(country);
}

export function usesMetricDistance(country: CountryCode = getSearchCountryCode()): boolean {
  return !usesImperialDistance(country);
}

export function distanceUnitShort(country: CountryCode = getSearchCountryCode()): "mi" | "km" {
  return usesImperialDistance(country) ? "mi" : "km";
}

export function milesToKm(miles: number): number {
  const value = Number.isFinite(miles) ? miles : 0;
  return value * KM_PER_MI;
}

export function kmToMiles(km: number): number {
  const value = Number.isFinite(km) ? km : 0;
  return value * MI_PER_KM;
}

/** Display number for an input that stores miles internally. */
export function distanceInputFromMiles(
  miles: number,
  country: CountryCode = getSearchCountryCode(),
): number {
  const value = Number.isFinite(miles) ? miles : 0;
  if (usesImperialDistance(country)) return Math.round(value);
  return Math.max(1, Math.round(milesToKm(value)));
}

/** Convert a user-entered distance back to miles for storage. */
export function milesFromDistanceInput(
  input: number,
  country: CountryCode = getSearchCountryCode(),
): number {
  const value = Number.isFinite(input) ? input : 0;
  if (usesImperialDistance(country)) return Math.round(value);
  return Math.max(1, Math.round(kmToMiles(value)));
}

/** Max distance input bound (product max is stored in miles). */
export function maxDistanceInput(
  maxMiles: number,
  country: CountryCode = getSearchCountryCode(),
): number {
  return distanceInputFromMiles(maxMiles, country);
}

/** Narrow currency symbol/code for input prefixes (e.g. Kč, $, €). */
export function currencySymbol(country: CountryCode = getCurrencyCountryCode()): string {
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

/** Parse a user-entered or stored money string into a number. */
export function parseMoneyAmount(raw: string | number | null | undefined): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;
  const n = Number.parseFloat(trimmed.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Format a money amount for the active (or given) country. */
export function formatMoney(
  amount: number,
  country: CountryCode = getCurrencyCountryCode(),
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

/** Format a raw price string (e.g. listing.pricing.dailyRate) for display. */
export function formatMoneyRaw(
  raw: string | number | null | undefined,
  country: CountryCode = getCurrencyCountryCode(),
): string | null {
  const amount = parseMoneyAmount(raw);
  if (amount === null) return null;
  return formatMoney(amount, country);
}

/** Localized "/day" suffix for rental rates (es → /día, cs → /den). */
export function perDaySuffix(country: CountryCode = getCurrencyCountryCode()): string {
  const { locale } = currencyForCountry(country);
  if (locale.startsWith("cs")) return "/den";
  if (locale.startsWith("es")) return "/día";
  if (locale.startsWith("sk")) return "/deň";
  if (locale.startsWith("de")) return "/Tag";
  if (locale.startsWith("fr")) return "/jour";
  if (locale.startsWith("pl")) return "/dzień";
  if (locale.startsWith("it")) return "/giorno";
  if (locale.startsWith("pt")) return "/dia";
  return "/day";
}

export function formatMoneyPerDay(
  amount: number,
  country: CountryCode = getCurrencyCountryCode(),
): string {
  return `${formatMoney(amount, country)}${perDaySuffix(country)}`;
}

export function formatMoneyRawPerDay(
  raw: string | number | null | undefined,
  country: CountryCode = getCurrencyCountryCode(),
): string | null {
  const amount = parseMoneyAmount(raw);
  if (amount === null) return null;
  return formatMoneyPerDay(amount, country);
}

/** Localized "/mo" suffix for long-term rates. */
export function perMonthSuffix(country: CountryCode = getCurrencyCountryCode()): string {
  const { locale } = currencyForCountry(country);
  if (locale.startsWith("cs")) return "/měs.";
  if (locale.startsWith("es")) return "/mes";
  return "/mo";
}

export function formatMoneyPerMonth(
  amount: number,
  country: CountryCode = getCurrencyCountryCode(),
): string {
  return `${formatMoney(amount, country)}${perMonthSuffix(country)}`;
}

/**
 * Format a distance that is stored in miles in the product model.
 * Metric countries see an approximate km label (auto by search country).
 */
export function formatDistanceFromMiles(
  miles: number,
  country: CountryCode = getSearchCountryCode(),
  options?: { plus?: boolean },
): string {
  const value = Number.isFinite(miles) ? miles : 0;
  const showPlus = options?.plus ?? value >= 50;
  if (usesImperialDistance(country)) {
    const n = Math.round(value);
    return showPlus && value >= 50 ? `${n}+ mi` : `${n} mi`;
  }
  const km = Math.round(milesToKm(value));
  return showPlus && value >= 50 ? `${km}+ km` : `${km} km`;
}

const LB_TO_KG = 0.45359237;

export function lbsToKg(lbs: number): number {
  return lbs * LB_TO_KG;
}

/** Always show both systems so travelers don't convert mentally: "85 lb (39 kg)". */
export function formatWeightFromLbs(lbs: number): string {
  const value = Number.isFinite(lbs) ? Math.max(0, lbs) : 0;
  const lbRounded = Math.round(value);
  const kg = lbsToKg(value);
  const kgLabel = kg >= 10 ? String(Math.round(kg)) : (Math.round(kg * 10) / 10).toString();
  return `${lbRounded} lb (${kgLabel} kg)`;
}

export function freePriceLabel(country: CountryCode = getCurrencyCountryCode()): string {
  return formatMoney(0, country);
}

/** Retailer hints for AI replacement-value estimates by marketplace country. */
const MARKET_RETAILERS: Record<string, string> = {
  US: "Amazon, Home Depot, Best Buy, Walmart, Target",
  CA: "Amazon.ca, Canadian Tire, Best Buy Canada, Home Depot Canada",
  GB: "Amazon.co.uk, Screwfix, Currys, Argos, B&Q",
  IE: "Amazon.de (IE shipping), Currys, Woodie's",
  MX: "Amazon.com.mx, Mercado Libre, Home Depot México, Walmart México",
  BR: "Amazon.com.br, Magazine Luiza, Mercado Livre, Leroy Merlin Brasil",
  AR: "Mercado Libre, Frávega, Garbarino",
  CL: "Mercado Libre, Falabella, Paris.cl",
  CO: "Mercado Libre, Éxito, Homecenter",
  PE: "Mercado Libre, Falabella, Ripley",
  CZ: "Alza, CZC, Mall.cz, Hornbach, OBI, Datart",
  SK: "Alza, Mall.sk, Nay, Hornbach, Planeo",
  PL: "Allegro, Media Expert, Castorama, Leroy Merlin",
  DE: "Amazon.de, MediaMarkt, Otto, Bauhaus, Hornbach",
  AT: "Amazon.de, MediaMarkt, Bauhaus, Hornbach",
  CH: "Digitec, Galaxus, Manor, Hornbach",
  FR: "Amazon.fr, Fnac, Leroy Merlin, Boulanger, Decathlon",
  ES: "Amazon.es, El Corte Inglés, MediaMarkt, Leroy Merlin, PcComponentes",
  IT: "Amazon.it, MediaWorld, Leroy Merlin, Unieuro",
  PT: "Amazon.es (PT), Worten, Radio Popular, Leroy Merlin",
  NL: "Bol.com, Coolblue, Gamma, Praxis",
  BE: "Bol.com, Coolblue, MediaMarkt, Hubo",
  SE: "Elgiganten, NetOnNet, Bauhaus, Clas Ohlson",
  NO: "Elkjøp, Komplett, Jula",
  DK: "Elgiganten, Proshop, Bauhaus",
  FI: "Verkkokauppa, Gigantti, Bauhaus",
  HU: "Árukereső, Media Markt, Praktiker",
  RO: "eMAG, Altex, Dedeman",
  BG: "Technopolis, Ozone, Practiker",
  HR: "Links.hr, Sancta Domus, Bauhaus",
  SI: "Mimovrste, Big Bang, Merkur",
  GR: "Skroutz, Public, Praktiker",
  EE: "Hinnavaatlus, Euronics, Bauhaus",
  LV: "1a.lv, Dateks, Depo",
  LT: "Pigu.lt, Topocentras, Senukai",
  UA: "Rozetka, Allo, Epicentr",
};

export type ListingPricingMarket = {
  countryCode: CountryCode;
  countryLabel: string;
  currencyCode: string;
  retailers: string;
};

export function listingPricingMarket(
  country: CountryCode = getCurrencyCountryCode(),
): ListingPricingMarket {
  const { code } = currencyForCountry(country);
  const def = getCountryDef(country);
  return {
    countryCode: country,
    countryLabel: def?.label ?? country,
    currencyCode: code,
    retailers:
      MARKET_RETAILERS[country] ??
      `major local online retailers and big-box stores in ${def?.label ?? country}`,
  };
}

/** Round AI / suggested money amounts for the local currency. */
export function roundMoneyForSuggestion(
  amount: number,
  country: CountryCode = getCurrencyCountryCode(),
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const { code } = currencyForCountry(country);
  const highDenom = new Set([
    "CZK",
    "HUF",
    "JPY",
    "KRW",
    "CLP",
    "COP",
    "IDR",
    "VND",
    "ISK",
  ]);
  if (highDenom.has(code)) {
    if (amount >= 10_000) return Math.round(amount / 100) * 100;
    if (amount >= 1_000) return Math.round(amount / 50) * 50;
    return Math.round(amount / 10) * 10;
  }
  if (amount >= 500) return Math.round(amount / 10) * 10;
  if (amount >= 50) return Math.round(amount / 5) * 5;
  return Math.max(1, Math.round(amount));
}

/** User-prompt fragment so vision pricing matches the host’s marketplace. */
export function buildListingValuePricingInstructions(
  country: CountryCode = getCurrencyCountryCode(),
): string {
  const market = listingPricingMarket(country);
  return `MARKET CONTEXT (required):
- Country: ${market.countryLabel} (${market.countryCode})
- Currency for estimatedValue: ${market.currencyCode} ONLY (integer amount, no currency symbol in the JSON number)
- Use current NEW retail / MSRP prices typical for ${market.countryLabel}, not used/secondhand prices and not USD unless the currency is USD.
- Prefer prices from: ${market.retailers}
- If you only know a USD MSRP, convert to ${market.currencyCode} using a reasonable current market rate for ${market.countryLabel}, then round sensibly for that currency.
- estimatedValue is replacement value — what we'd use to size a deposit hold if the item is lost or damaged.`;
}
