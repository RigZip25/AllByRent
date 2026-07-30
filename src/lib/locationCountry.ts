const STORAGE_KEY = "allbyrent_search_country";

/** ISO 3166-1 alpha-2 — Americas + Europe only (no Eurasia / CIS / Oceania / ME). */
export type CountryCode = string;

export type CountryOption = {
  code: CountryCode;
  label: string;
  flag: string;
};

export type CountryGroup = {
  label: string;
  codes: CountryCode[];
};

type CountryDef = CountryOption & {
  /** Photon viewbox: minLon, minLat, maxLon, maxLat */
  bbox: [number, number, number, number];
  querySuffix: string;
  /** Short search example for empty/error hints */
  example: string;
  /** Local names that already imply this country in a query */
  aliases?: string[];
};

/**
 * Markets we support for neighborhood marketplace search:
 * North / Central / South America + Europe (widely).
 * Excludes Eurasia/CIS (RU, BY, KZ, …), Middle East, Oceania — payments/trust focus.
 */
const COUNTRY_DEFS: CountryDef[] = [
  // —— North America ——
  { code: "US", label: "United States", flag: "🇺🇸", bbox: [-125, 24, -66, 49], querySuffix: "United States", example: "78701 or Austin, TX", aliases: ["usa", "united states", "u.s."] },
  { code: "CA", label: "Canada", flag: "🇨🇦", bbox: [-141, 41, -52, 84], querySuffix: "Canada", example: "M5V 2T6 or Toronto, ON", aliases: ["canada"] },
  { code: "MX", label: "Mexico", flag: "🇲🇽", bbox: [-118.5, 14.5, -86.5, 32.8], querySuffix: "Mexico", example: "06600 or Ciudad de México", aliases: ["mexico", "méxico"] },

  // —— Central America ——
  { code: "BZ", label: "Belize", flag: "🇧🇿", bbox: [-89.3, 15.8, -87.4, 18.5], querySuffix: "Belize", example: "Belize City" },
  { code: "CR", label: "Costa Rica", flag: "🇨🇷", bbox: [-86, 8, -82.5, 11.3], querySuffix: "Costa Rica", example: "San José" },
  { code: "SV", label: "El Salvador", flag: "🇸🇻", bbox: [-90.2, 13, -87.6, 14.5], querySuffix: "El Salvador", example: "San Salvador" },
  { code: "GT", label: "Guatemala", flag: "🇬🇹", bbox: [-92.3, 13.7, -88.2, 17.9], querySuffix: "Guatemala", example: "Guatemala City" },
  { code: "HN", label: "Honduras", flag: "🇭🇳", bbox: [-89.4, 12.9, -83, 16.6], querySuffix: "Honduras", example: "Tegucigalpa" },
  { code: "NI", label: "Nicaragua", flag: "🇳🇮", bbox: [-87.7, 10.7, -83.1, 15.1], querySuffix: "Nicaragua", example: "Managua" },
  { code: "PA", label: "Panama", flag: "🇵🇦", bbox: [-83.1, 7, -77.1, 9.7], querySuffix: "Panama", example: "Panama City" },

  // —— Caribbean ——
  { code: "AG", label: "Antigua and Barbuda", flag: "🇦🇬", bbox: [-62, 16.9, -61.6, 17.8], querySuffix: "Antigua and Barbuda", example: "St. John's" },
  { code: "BS", label: "Bahamas", flag: "🇧🇸", bbox: [-79.4, 20.9, -72.6, 27.3], querySuffix: "Bahamas", example: "Nassau" },
  { code: "BB", label: "Barbados", flag: "🇧🇧", bbox: [-59.7, 13, -59.4, 13.4], querySuffix: "Barbados", example: "Bridgetown" },
  { code: "CU", label: "Cuba", flag: "🇨🇺", bbox: [-85, 19.8, -74, 23.3], querySuffix: "Cuba", example: "La Habana" },
  { code: "DM", label: "Dominica", flag: "🇩🇲", bbox: [-61.5, 15.2, -61.2, 15.7], querySuffix: "Dominica", example: "Roseau" },
  { code: "DO", label: "Dominican Republic", flag: "🇩🇴", bbox: [-72.1, 17.4, -68.2, 19.9], querySuffix: "Dominican Republic", example: "Santo Domingo" },
  { code: "GD", label: "Grenada", flag: "🇬🇩", bbox: [-61.9, 11.9, -61.4, 12.3], querySuffix: "Grenada", example: "St. George's" },
  { code: "HT", label: "Haiti", flag: "🇭🇹", bbox: [-74.5, 18, -71.6, 20.1], querySuffix: "Haiti", example: "Port-au-Prince" },
  { code: "JM", label: "Jamaica", flag: "🇯🇲", bbox: [-78.4, 17.6, -76.1, 18.6], querySuffix: "Jamaica", example: "Kingston" },
  { code: "KN", label: "Saint Kitts and Nevis", flag: "🇰🇳", bbox: [-62.9, 17.1, -62.5, 17.5], querySuffix: "Saint Kitts and Nevis", example: "Basseterre" },
  { code: "LC", label: "Saint Lucia", flag: "🇱🇨", bbox: [-61.1, 13.7, -60.8, 14.2], querySuffix: "Saint Lucia", example: "Castries" },
  { code: "VC", label: "Saint Vincent and the Grenadines", flag: "🇻🇨", bbox: [-61.5, 12.5, -61, 13.5], querySuffix: "Saint Vincent and the Grenadines", example: "Kingstown" },
  { code: "TT", label: "Trinidad and Tobago", flag: "🇹🇹", bbox: [-61.9, 10, -60.5, 11.4], querySuffix: "Trinidad and Tobago", example: "Port of Spain" },

  // —— South America ——
  { code: "AR", label: "Argentina", flag: "🇦🇷", bbox: [-73.6, -55.1, -53.6, -21.8], querySuffix: "Argentina", example: "C1000 or Buenos Aires", aliases: ["argentina"] },
  { code: "BO", label: "Bolivia", flag: "🇧🇴", bbox: [-69.7, -22.9, -57.4, -9.7], querySuffix: "Bolivia", example: "La Paz" },
  { code: "BR", label: "Brazil", flag: "🇧🇷", bbox: [-74, -34, -34, 5.3], querySuffix: "Brazil", example: "01310-100 or São Paulo", aliases: ["brazil", "brasil"] },
  { code: "CL", label: "Chile", flag: "🇨🇱", bbox: [-75.7, -56, -66.4, -17.5], querySuffix: "Chile", example: "Santiago" },
  { code: "CO", label: "Colombia", flag: "🇨🇴", bbox: [-79.1, -4.3, -66.8, 12.6], querySuffix: "Colombia", example: "Bogotá" },
  { code: "EC", label: "Ecuador", flag: "🇪🇨", bbox: [-81.1, -5.1, -75.1, 1.5], querySuffix: "Ecuador", example: "Quito" },
  { code: "GY", label: "Guyana", flag: "🇬🇾", bbox: [-61.4, 1.1, -56.4, 8.6], querySuffix: "Guyana", example: "Georgetown" },
  { code: "PY", label: "Paraguay", flag: "🇵🇾", bbox: [-62.7, -27.7, -54.2, -19.2], querySuffix: "Paraguay", example: "Asunción" },
  { code: "PE", label: "Peru", flag: "🇵🇪", bbox: [-81.4, -18.4, -68.6, -0], querySuffix: "Peru", example: "Lima" },
  { code: "SR", label: "Suriname", flag: "🇸🇷", bbox: [-58.1, 1.8, -53.9, 6.1], querySuffix: "Suriname", example: "Paramaribo" },
  { code: "UY", label: "Uruguay", flag: "🇺🇾", bbox: [-58.5, -35, -53, -30], querySuffix: "Uruguay", example: "Montevideo" },
  { code: "VE", label: "Venezuela", flag: "🇻🇪", bbox: [-73.4, 0.6, -59.7, 12.5], querySuffix: "Venezuela", example: "Caracas" },

  // —— Europe (wide: EU / EEA / UK / CH / Balkans / UA) ——
  { code: "AL", label: "Albania", flag: "🇦🇱", bbox: [19, 39.6, 21.1, 42.7], querySuffix: "Albania", example: "Tirana" },
  { code: "AD", label: "Andorra", flag: "🇦🇩", bbox: [1.4, 42.4, 1.8, 42.7], querySuffix: "Andorra", example: "Andorra la Vella" },
  { code: "AT", label: "Austria", flag: "🇦🇹", bbox: [9.5, 46.3, 17.2, 49.1], querySuffix: "Austria", example: "1010 or Wien", aliases: ["österreich", "austria"] },
  { code: "BE", label: "Belgium", flag: "🇧🇪", bbox: [2.5, 49.4, 6.5, 51.6], querySuffix: "Belgium", example: "1000 or Bruxelles", aliases: ["belgië", "belgique"] },
  { code: "BA", label: "Bosnia and Herzegovina", flag: "🇧🇦", bbox: [15.7, 42.5, 19.7, 45.3], querySuffix: "Bosnia and Herzegovina", example: "Sarajevo" },
  { code: "BG", label: "Bulgaria", flag: "🇧🇬", bbox: [22.3, 41.2, 28.7, 44.3], querySuffix: "Bulgaria", example: "Sofia" },
  { code: "HR", label: "Croatia", flag: "🇭🇷", bbox: [13.4, 42.3, 19.5, 46.6], querySuffix: "Croatia", example: "Zagreb", aliases: ["hrvatska"] },
  { code: "CY", label: "Cyprus", flag: "🇨🇾", bbox: [32.2, 34.5, 34.7, 35.8], querySuffix: "Cyprus", example: "Nicosia" },
  { code: "CZ", label: "Czechia", flag: "🇨🇿", bbox: [12, 48.5, 19, 51.1], querySuffix: "Czechia", example: "110 00 or Praha", aliases: ["czechia", "czech republic", "česko", "cesko"] },
  { code: "DK", label: "Denmark", flag: "🇩🇰", bbox: [8, 54.5, 15.3, 58], querySuffix: "Denmark", example: "København", aliases: ["danmark"] },
  { code: "EE", label: "Estonia", flag: "🇪🇪", bbox: [21.7, 57.5, 28.3, 59.8], querySuffix: "Estonia", example: "Tallinn" },
  { code: "FI", label: "Finland", flag: "🇫🇮", bbox: [20.5, 59.7, 31.6, 70.1], querySuffix: "Finland", example: "Helsinki", aliases: ["suomi"] },
  { code: "FR", label: "France", flag: "🇫🇷", bbox: [-5.5, 41, 10, 51.5], querySuffix: "France", example: "75001 or Paris", aliases: ["france"] },
  { code: "DE", label: "Germany", flag: "🇩🇪", bbox: [5.5, 47, 15.5, 55.5], querySuffix: "Germany", example: "10115 or Berlin", aliases: ["deutschland", "germany"] },
  { code: "GR", label: "Greece", flag: "🇬🇷", bbox: [19.3, 34.8, 29.7, 41.8], querySuffix: "Greece", example: "Athens", aliases: ["ελλάδα"] },
  { code: "HU", label: "Hungary", flag: "🇭🇺", bbox: [16, 45.7, 23, 48.6], querySuffix: "Hungary", example: "Budapest", aliases: ["magyarország"] },
  { code: "IS", label: "Iceland", flag: "🇮🇸", bbox: [-24.6, 63.3, -13.4, 66.6], querySuffix: "Iceland", example: "Reykjavík" },
  { code: "IE", label: "Ireland", flag: "🇮🇪", bbox: [-10.7, 51.3, -5.9, 55.5], querySuffix: "Ireland", example: "Dublin", aliases: ["éire"] },
  { code: "IT", label: "Italy", flag: "🇮🇹", bbox: [6.6, 36.6, 18.6, 47.1], querySuffix: "Italy", example: "00100 or Roma", aliases: ["italia"] },
  { code: "XK", label: "Kosovo", flag: "🇽🇰", bbox: [20, 41.8, 21.8, 43.3], querySuffix: "Kosovo", example: "Pristina" },
  { code: "LV", label: "Latvia", flag: "🇱🇻", bbox: [20.9, 55.6, 28.3, 58.1], querySuffix: "Latvia", example: "Riga" },
  { code: "LI", label: "Liechtenstein", flag: "🇱🇮", bbox: [9.4, 47, 9.7, 47.3], querySuffix: "Liechtenstein", example: "Vaduz" },
  { code: "LT", label: "Lithuania", flag: "🇱🇹", bbox: [20.9, 53.8, 26.9, 56.5], querySuffix: "Lithuania", example: "Vilnius" },
  { code: "LU", label: "Luxembourg", flag: "🇱🇺", bbox: [5.7, 49.4, 6.6, 50.2], querySuffix: "Luxembourg", example: "Luxembourg" },
  { code: "MT", label: "Malta", flag: "🇲🇹", bbox: [14.1, 35.7, 14.6, 36], querySuffix: "Malta", example: "Valletta" },
  { code: "MD", label: "Moldova", flag: "🇲🇩", bbox: [26.6, 45.4, 30.2, 48.5], querySuffix: "Moldova", example: "Chișinău" },
  { code: "MC", label: "Monaco", flag: "🇲🇨", bbox: [7.4, 43.7, 7.5, 43.8], querySuffix: "Monaco", example: "Monaco" },
  { code: "ME", label: "Montenegro", flag: "🇲🇪", bbox: [18.4, 41.8, 20.4, 43.6], querySuffix: "Montenegro", example: "Podgorica" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱", bbox: [3.3, 50.7, 7.3, 53.6], querySuffix: "Netherlands", example: "1011 or Amsterdam", aliases: ["nederland", "holland"] },
  { code: "MK", label: "North Macedonia", flag: "🇲🇰", bbox: [20.4, 40.8, 23.1, 42.4], querySuffix: "North Macedonia", example: "Skopje" },
  { code: "NO", label: "Norway", flag: "🇳🇴", bbox: [4.5, 57.9, 31.4, 71.3], querySuffix: "Norway", example: "Oslo", aliases: ["norge"] },
  { code: "PL", label: "Poland", flag: "🇵🇱", bbox: [14, 49, 24.5, 55], querySuffix: "Poland", example: "00-001 or Warszawa", aliases: ["polska", "poland"] },
  { code: "PT", label: "Portugal", flag: "🇵🇹", bbox: [-9.6, 36.9, -6.1, 42.2], querySuffix: "Portugal", example: "1000-001 or Lisboa", aliases: ["portugal"] },
  { code: "RO", label: "Romania", flag: "🇷🇴", bbox: [20.2, 43.6, 30, 48.3], querySuffix: "Romania", example: "București" },
  { code: "SM", label: "San Marino", flag: "🇸🇲", bbox: [12.4, 43.8, 12.6, 44], querySuffix: "San Marino", example: "San Marino" },
  { code: "RS", label: "Serbia", flag: "🇷🇸", bbox: [18.8, 42.2, 23, 46.2], querySuffix: "Serbia", example: "Beograd" },
  { code: "SK", label: "Slovakia", flag: "🇸🇰", bbox: [16.8, 47.7, 22.6, 49.7], querySuffix: "Slovakia", example: "Bratislava", aliases: ["slovensko"] },
  { code: "SI", label: "Slovenia", flag: "🇸🇮", bbox: [13.3, 45.4, 16.6, 46.9], querySuffix: "Slovenia", example: "Ljubljana" },
  { code: "ES", label: "Spain", flag: "🇪🇸", bbox: [-9.4, 35.9, 4.4, 43.9], querySuffix: "Spain", example: "28001 or Madrid", aliases: ["españa", "espana", "spain"] },
  { code: "SE", label: "Sweden", flag: "🇸🇪", bbox: [10.9, 55.2, 24.2, 69.1], querySuffix: "Sweden", example: "Stockholm", aliases: ["sverige"] },
  { code: "CH", label: "Switzerland", flag: "🇨🇭", bbox: [5.9, 45.8, 10.6, 47.9], querySuffix: "Switzerland", example: "8001 or Zürich", aliases: ["schweiz", "suisse", "svizzera"] },
  { code: "UA", label: "Ukraine", flag: "🇺🇦", bbox: [22, 44, 40, 53], querySuffix: "Ukraine", example: "Kyiv", aliases: ["україна", "украина", "ukraine"] },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧", bbox: [-8.5, 49.5, 2, 61], querySuffix: "United Kingdom", example: "SW1A 1AA or London", aliases: ["uk", "united kingdom", "great britain", "england"] },
  { code: "VA", label: "Vatican City", flag: "🇻🇦", bbox: [12.44, 41.9, 12.46, 41.91], querySuffix: "Vatican City", example: "Vatican City" },
];

const BY_CODE = new Map(COUNTRY_DEFS.map((c) => [c.code, c]));

export const COUNTRY_OPTIONS: CountryOption[] = COUNTRY_DEFS.map(
  ({ code, label, flag }) => ({ code, label, flag }),
);

/** Apple-style grouped picker — Americas + Europe only. */
export const COUNTRY_GROUPS: CountryGroup[] = [
  {
    label: "North America",
    codes: ["US", "CA", "MX"],
  },
  {
    label: "Central America",
    codes: ["BZ", "CR", "SV", "GT", "HN", "NI", "PA"],
  },
  {
    label: "Caribbean",
    codes: ["AG", "BS", "BB", "CU", "DM", "DO", "GD", "HT", "JM", "KN", "LC", "VC", "TT"],
  },
  {
    label: "South America",
    codes: ["AR", "BO", "BR", "CL", "CO", "EC", "GY", "PY", "PE", "SR", "UY", "VE"],
  },
  {
    label: "Europe",
    codes: [
      "AL", "AD", "AT", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
      "GR", "HU", "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME",
      "NL", "MK", "NO", "PL", "PT", "RO", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA",
      "GB", "VA",
    ],
  },
];

const COUNTRY_QUERY_SUFFIX: Record<string, string> = Object.fromEntries(
  COUNTRY_DEFS.map((c) => [c.code, c.querySuffix]),
);

/** minLon, minLat, maxLon, maxLat — Photon viewbox */
export const COUNTRY_BBOX: Record<string, [number, number, number, number]> = Object.fromEntries(
  COUNTRY_DEFS.map((c) => [c.code, c.bbox]),
);

/** Major IANA zones → supported country (no Eurasia defaults). */
const TZ_TO_COUNTRY: Record<string, CountryCode> = {
  // North America
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "America/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/St_Johns": "CA",
  "America/Mexico_City": "MX",
  "America/Monterrey": "MX",
  "America/Tijuana": "MX",
  "America/Cancun": "MX",
  // Central America
  "America/Belize": "BZ",
  "America/Costa_Rica": "CR",
  "America/El_Salvador": "SV",
  "America/Guatemala": "GT",
  "America/Tegucigalpa": "HN",
  "America/Managua": "NI",
  "America/Panama": "PA",
  // Caribbean
  "America/Nassau": "BS",
  "America/Barbados": "BB",
  "America/Havana": "CU",
  "America/Santo_Domingo": "DO",
  "America/Port-au-Prince": "HT",
  "America/Jamaica": "JM",
  "America/Port_of_Spain": "TT",
  // South America
  "America/Argentina/Buenos_Aires": "AR",
  "America/La_Paz": "BO",
  "America/Sao_Paulo": "BR",
  "America/Fortaleza": "BR",
  "America/Manaus": "BR",
  "America/Santiago": "CL",
  "America/Bogota": "CO",
  "America/Guayaquil": "EC",
  "America/Guyana": "GY",
  "America/Asuncion": "PY",
  "America/Lima": "PE",
  "America/Paramaribo": "SR",
  "America/Montevideo": "UY",
  "America/Caracas": "VE",
  // Europe
  "Europe/Tirane": "AL",
  "Europe/Andorra": "AD",
  "Europe/Vienna": "AT",
  "Europe/Brussels": "BE",
  "Europe/Sarajevo": "BA",
  "Europe/Sofia": "BG",
  "Europe/Zagreb": "HR",
  "Asia/Nicosia": "CY",
  "Europe/Prague": "CZ",
  "Europe/Copenhagen": "DK",
  "Europe/Tallinn": "EE",
  "Europe/Helsinki": "FI",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Athens": "GR",
  "Europe/Budapest": "HU",
  "Atlantic/Reykjavik": "IS",
  "Europe/Dublin": "IE",
  "Europe/Rome": "IT",
  "Europe/Riga": "LV",
  "Europe/Vaduz": "LI",
  "Europe/Vilnius": "LT",
  "Europe/Luxembourg": "LU",
  "Europe/Malta": "MT",
  "Europe/Chisinau": "MD",
  "Europe/Monaco": "MC",
  "Europe/Podgorica": "ME",
  "Europe/Amsterdam": "NL",
  "Europe/Skopje": "MK",
  "Europe/Oslo": "NO",
  "Europe/Warsaw": "PL",
  "Europe/Lisbon": "PT",
  "Europe/Bucharest": "RO",
  "Europe/San_Marino": "SM",
  "Europe/Belgrade": "RS",
  "Europe/Bratislava": "SK",
  "Europe/Ljubljana": "SI",
  "Europe/Madrid": "ES",
  "Europe/Stockholm": "SE",
  "Europe/Zurich": "CH",
  "Europe/Kyiv": "UA",
  "Europe/Kiev": "UA",
  "Europe/London": "GB",
  "Europe/Gibraltar": "GB",
  "Atlantic/Canary": "ES",
};

/** Language / locale tags → country when region is missing or unsupported. */
const LANG_TO_COUNTRY: Record<string, CountryCode> = {
  cs: "CZ",
  sk: "SK",
  de: "DE",
  fr: "FR",
  pl: "PL",
  es: "ES",
  pt: "PT",
  it: "IT",
  nl: "NL",
  da: "DK",
  fi: "FI",
  sv: "SE",
  nb: "NO",
  nn: "NO",
  no: "NO",
  hu: "HU",
  ro: "RO",
  bg: "BG",
  hr: "HR",
  sl: "SI",
  el: "GR",
  uk: "UA",
  ga: "IE",
  mt: "MT",
  lt: "LT",
  lv: "LV",
  et: "EE",
  is: "IS",
  sq: "AL",
  sr: "RS",
  mk: "MK",
  bs: "BA",
  ca: "ES",
  eu: "ES",
  gl: "ES",
  lb: "LU",
};

export function isCountryCode(value: string): value is CountryCode {
  return BY_CODE.has(value);
}

export function getCountryDef(code: CountryCode): CountryDef | undefined {
  return BY_CODE.get(code);
}

export function getSavedSearchCountry(): CountryCode | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && isCountryCode(raw)) return raw;
    // Drop legacy Eurasia / out-of-scope codes (RU, BY, KZ, AU, IL, …)
    if (raw) localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return null;
}

export function saveSearchCountry(code: CountryCode): void {
  if (!isCountryCode(code)) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

function detectCountryFromTimeZone(): CountryCode | null {
  if (typeof Intl === "undefined") return null;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!tz) return null;
  if (TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];

  // Prefix heuristics — never map all America/* → US
  if (tz.startsWith("America/Argentina/")) return "AR";
  if (tz.startsWith("America/Sao_Paulo") || tz.startsWith("America/Fortaleza") || tz.startsWith("America/Manaus") || tz.startsWith("America/Belem") || tz.startsWith("America/Recife") || tz.startsWith("America/Bahia") || tz.startsWith("America/Cuiaba") || tz.startsWith("America/Campo_Grande") || tz.startsWith("America/Porto_Velho") || tz.startsWith("America/Boa_Vista") || tz.startsWith("America/Maceio") || tz.startsWith("America/Araguaina") || tz.startsWith("America/Santarem") || tz.startsWith("America/Noronha")) {
    return "BR";
  }
  if (tz.startsWith("Europe/")) return null;
  return null;
}

function detectCountryFromLanguage(): CountryCode | null {
  if (typeof navigator === "undefined") return null;
  const tags =
    navigator.languages?.length ? navigator.languages : [navigator.language].filter(Boolean);

  for (const raw of tags) {
    const tag = (raw || "").trim();
    if (!tag) continue;
    const region = tag.match(/-([A-Za-z]{2})$/)?.[1]?.toUpperCase();
    if (region && isCountryCode(region)) return region;
    // pt-BR / es-MX style
    const regionLong = tag.match(/-([A-Za-z]{2})-/)?.[1]?.toUpperCase();
    if (regionLong && isCountryCode(regionLong)) return regionLong;
    const primary = tag.split("-")[0]?.toLowerCase() ?? "";
    if (primary === "pt" && /br/i.test(tag)) return "BR";
    if (primary === "es" && /mx|ar|co|cl|pe|uy|ve|ec|bo|py|gt|cr|pa|hn|ni|sv|do|cu|pr/i.test(tag)) {
      const m = tag.toUpperCase().match(/-(MX|AR|CO|CL|PE|UY|VE|EC|BO|PY|GT|CR|PA|HN|NI|SV|DO|CU)/);
      if (m && isCountryCode(m[1])) return m[1];
    }
    if (LANG_TO_COUNTRY[primary] && isCountryCode(LANG_TO_COUNTRY[primary])) {
      return LANG_TO_COUNTRY[primary];
    }
  }
  return null;
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
  return COUNTRY_QUERY_SUFFIX[code] ?? code;
}

export function getCountrySearchExample(code: CountryCode): string {
  return BY_CODE.get(code)?.example ?? "city or postal code";
}

/** Empty-state hint for the active country (no US-only Fayetteville defaults). */
export function getCountryEmptyHint(code: CountryCode, variant: "area" | "address" = "area"): string {
  const example = getCountrySearchExample(code);
  if (variant === "address") {
    return `Street optional — try ${example}`;
  }
  return `Postal code or city — e.g. ${example}`;
}

export function queryLikelyIncludesCountry(query: string, code: CountryCode): boolean {
  const q = query.toLowerCase();
  const def = BY_CODE.get(code);
  if (!def) return false;
  if (q.includes(def.querySuffix.toLowerCase())) return true;
  return (def.aliases ?? []).some((name) => q.includes(name.toLowerCase()));
}

export function appendCountryToQuery(query: string, code: CountryCode): string {
  const trimmed = query.trim();
  if (!trimmed || queryLikelyIncludesCountry(trimmed, code)) return trimmed;
  return `${trimmed}, ${countryQuerySuffix(code)}`;
}
