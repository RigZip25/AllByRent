const STORAGE_KEY = "allbyrent_search_country";

/** ISO 3166-1 alpha-2 */
export type CountryCode =
  | "US"
  | "RU"
  | "UA"
  | "DE"
  | "GB"
  | "FR"
  | "PL"
  | "KZ"
  | "BY"
  | "IL"
  | "CA"
  | "AU";

export type CountryOption = {
  code: CountryCode;
  label: string;
  flag: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "RU", label: "Russia", flag: "🇷🇺" },
  { code: "UA", label: "Ukraine", flag: "🇺🇦" },
  { code: "KZ", label: "Kazakhstan", flag: "🇰🇿" },
  { code: "BY", label: "Belarus", flag: "🇧🇾" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "PL", label: "Poland", flag: "🇵🇱" },
  { code: "IL", label: "Israel", flag: "🇮🇱" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
];

const COUNTRY_QUERY_SUFFIX: Record<CountryCode, string> = {
  US: "United States",
  RU: "Russia",
  UA: "Ukraine",
  KZ: "Kazakhstan",
  BY: "Belarus",
  DE: "Germany",
  GB: "United Kingdom",
  FR: "France",
  PL: "Poland",
  IL: "Israel",
  CA: "Canada",
  AU: "Australia",
};

/** minLon, minLat, maxLon, maxLat — Photon viewbox */
export const COUNTRY_BBOX: Record<CountryCode, [number, number, number, number]> = {
  US: [-125, 24, -66, 49],
  RU: [19, 41, 180, 82],
  UA: [22, 44, 40, 53],
  KZ: [46, 40, 87, 56],
  BY: [23, 51, 33, 57],
  DE: [5.5, 47, 15.5, 55.5],
  GB: [-8.5, 49.5, 2, 61],
  FR: [-5.5, 41, 10, 51.5],
  PL: [14, 49, 24.5, 55],
  IL: [34, 29, 36, 34],
  CA: [-141, 41, -52, 84],
  AU: [112, -44, 154, -10],
};

const TZ_TO_COUNTRY: Record<string, CountryCode> = {
  "Europe/Moscow": "RU",
  "Europe/Simferopol": "RU",
  "Europe/Kyiv": "UA",
  "Europe/Kiev": "UA",
  "Europe/Minsk": "BY",
  "Asia/Almaty": "KZ",
  "Asia/Qyzylorda": "KZ",
  "Europe/Berlin": "DE",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Warsaw": "PL",
  "Asia/Jerusalem": "IL",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "Australia/Sydney": "AU",
};

function isCountryCode(value: string): value is CountryCode {
  return COUNTRY_OPTIONS.some((c) => c.code === value);
}

export function getSavedSearchCountry(): CountryCode | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isCountryCode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveSearchCountry(code: CountryCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

function detectCountryFromTimeZone(): CountryCode | null {
  if (typeof Intl === "undefined") return null;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz && TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];
  if (tz?.startsWith("Europe/Moscow") || tz?.includes("Russia")) return "RU";
  if (tz?.startsWith("America/")) return "US";
  return null;
}

function detectCountryFromLanguage(): CountryCode | null {
  if (typeof navigator === "undefined") return null;
  const lang = navigator.language ?? "";
  const match = lang.match(/-([A-Za-z]{2})$/i);
  if (!match) return null;
  const code = match[1].toUpperCase();
  return isCountryCode(code) ? code : null;
}

/** Country used to bias address search (saved > timezone > language > US). */
export function getSearchCountryCode(): CountryCode {
  return (
    getSavedSearchCountry() ??
    detectCountryFromTimeZone() ??
    detectCountryFromLanguage() ??
    "US"
  );
}

export function countryQuerySuffix(code: CountryCode): string {
  return COUNTRY_QUERY_SUFFIX[code];
}

export function queryLikelyIncludesCountry(query: string, code: CountryCode): boolean {
  const q = query.toLowerCase();
  const suffix = countryQuerySuffix(code).toLowerCase();
  const localNames: Partial<Record<CountryCode, string[]>> = {
    RU: ["россия", "russia", "рф"],
    UA: ["україна", "украина", "ukraine"],
    US: ["usa", "united states", "u.s."],
    DE: ["deutschland", "germany"],
  };
  if (q.includes(suffix)) return true;
  return (localNames[code] ?? []).some((name) => q.includes(name));
}

export function appendCountryToQuery(query: string, code: CountryCode): string {
  const trimmed = query.trim();
  if (!trimmed || queryLikelyIncludesCountry(trimmed, code)) return trimmed;
  return `${trimmed}, ${countryQuerySuffix(code)}`;
}
