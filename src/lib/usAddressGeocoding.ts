import type { LocationSuggestion } from "./geocoding";
import {
  formatParsedUsAddress,
  normalizeUsStreetLine,
  parseUsAddressQuery,
  usStreetVariants,
  type ParsedUsAddress,
} from "./usAddressParse";
import { filterMatchesByUsState } from "./usStates";

const US_STATE_ABBREV: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  "district of columbia": "DC",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

export function abbreviateUsState(state: string): string {
  const trimmed = state.trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return US_STATE_ABBREV[trimmed.toLowerCase()] ?? trimmed;
}

/** US display: street / City, ST ZIP */
export function formatUsAddressLines(parts: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): { label: string; primaryLine: string; secondaryLine: string; city: string; region: string } {
  const street = parts.street?.trim() ?? "";
  const city = parts.city?.trim() ?? "";
  const state = parts.state ? abbreviateUsState(parts.state) : "";
  const zip = parts.zip?.trim() ?? "";

  const secondaryLine = [city, [state, zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const primaryLine = street || city || secondaryLine;
  const label = street && secondaryLine ? `${street}, ${secondaryLine}` : secondaryLine || street;

  return {
    label,
    primaryLine: street || city,
    secondaryLine,
    city: city || primaryLine,
    region: state,
  };
}

function getUsGeocoderBaseUrl(): string {
  if (import.meta.env.DEV) return "/us-geocode";
  return "/api/geocode/us";
}

function getUspsValidatorBaseUrl(): string {
  if (import.meta.env.DEV) return "/api/geocode/usps";
  return "/api/geocode/usps";
}

type CensusMatch = {
  matchedAddress: string;
  coordinates: { x: number; y: number };
  addressComponents: {
    fromAddress?: string;
    toAddress?: string;
    preQualifier?: string;
    preDirection?: string;
    preType?: string;
    streetName?: string;
    suffixType?: string;
    suffixDirection?: string;
    suffixQualifier?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

function buildStreetFromCensus(c: CensusMatch["addressComponents"]): string {
  const number = c.fromAddress || c.toAddress || "";
  const parts = [
    number,
    c.preDirection,
    c.streetName,
    c.suffixType,
    c.suffixDirection,
  ].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function parseCensusMatch(match: CensusMatch): LocationSuggestion | null {
  const { addressComponents: c, coordinates, matchedAddress } = match;
  const lat = coordinates.y;
  const lng = coordinates.x;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const street = buildStreetFromCensus(c);
  const formatted = formatUsAddressLines({
    street: street || undefined,
    city: c.city,
    state: c.state,
    zip: c.zip,
  });

  const label = matchedAddress
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part, i, arr) => {
      if (i === arr.length - 2 && c.state && part === c.state) {
        return [c.state, c.zip].filter(Boolean).join(" ");
      }
      return part;
    })
    .join(", ");

  return {
    label: label || formatted.label,
    primaryLine: formatted.primaryLine,
    secondaryLine: formatted.secondaryLine,
    city: formatted.city,
    country: "United States",
    region: formatted.region,
    countryCode: "US",
    flag: "🇺🇸",
    lat,
    lng,
    precision: "house",
  };
}

async function fetchCensusJson(url: URL): Promise<LocationSuggestion[]> {
  const response = await fetch(url.toString());
  if (!response.ok) return [];

  const data = (await response.json()) as {
    result?: { addressMatches?: CensusMatch[] };
  };

  return (data.result?.addressMatches ?? [])
    .map(parseCensusMatch)
    .filter((item): item is LocationSuggestion => item !== null);
}

async function censusOneline(address: string): Promise<LocationSuggestion[]> {
  const url = new URL(`${getUsGeocoderBaseUrl()}/locations/onelineaddress`);
  url.searchParams.set("address", address);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");
  return fetchCensusJson(url);
}

async function censusStructured(parsed: ParsedUsAddress): Promise<LocationSuggestion[]> {
  if (!parsed.street && !parsed.city && !parsed.zip) return [];

  const url = new URL(`${getUsGeocoderBaseUrl()}/locations/address`);
  if (parsed.street) url.searchParams.set("street", normalizeUsStreetLine(parsed.street));
  if (parsed.city) url.searchParams.set("city", parsed.city);
  if (parsed.state) url.searchParams.set("state", abbreviateUsState(parsed.state));
  if (parsed.zip) url.searchParams.set("zip", parsed.zip);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");
  return fetchCensusJson(url);
}

type UspsValidated = {
  address2: string;
  city: string;
  state: string;
  zip5: string;
};

async function validateWithUsps(parsed: ParsedUsAddress): Promise<UspsValidated | null> {
  if (!parsed.street && !parsed.city && !parsed.zip) return null;

  try {
    const url = new URL(getUspsValidatorBaseUrl());
    if (parsed.street) url.searchParams.set("street", parsed.street);
    if (parsed.city) url.searchParams.set("city", parsed.city);
    if (parsed.state) url.searchParams.set("state", abbreviateUsState(parsed.state));
    if (parsed.zip) url.searchParams.set("zip", parsed.zip);

    const response = await fetch(url.toString());
    if (response.status === 503) return null;
    if (!response.ok) return null;

    const data = (await response.json()) as {
      available?: boolean;
      address?: UspsValidated;
    };
    return data.address ?? null;
  } catch {
    return null;
  }
}

function buildSearchPlans(
  query: string,
  preferredState?: string | null,
): { oneline: string[]; structured: ParsedUsAddress[] } {
  const parsed = parseUsAddressQuery(query, preferredState);
  const oneline = new Set<string>();
  const structured: ParsedUsAddress[] = [];

  const baseState = parsed?.state ?? preferredState ?? undefined;
  const pushOneline = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length >= 3) oneline.add(trimmed);
  };

  pushOneline(query);
  if (parsed) pushOneline(formatParsedUsAddress(parsed));
  if (baseState && !query.toUpperCase().includes(baseState.toUpperCase())) {
    pushOneline(`${query}, ${baseState}`);
    if (parsed) pushOneline(formatParsedUsAddress({ ...parsed, state: baseState }));
  }

  if (parsed) {
    structured.push(parsed);
    if (parsed.street) {
      for (const street of usStreetVariants(parsed.street)) {
        structured.push({ ...parsed, street });
      }
    }
  }

  return { oneline: [...oneline], structured };
}

function dedupeMatches(matches: LocationSuggestion[]): LocationSuggestion[] {
  const seen = new Set<string>();
  const out: LocationSuggestion[] = [];
  for (const item of matches) {
    const key = `${item.lat.toFixed(5)}:${item.lng.toFixed(5)}:${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * US address search — Census TIGER (official street ranges) with structured parsing,
 * suffix variants (Lane/Ln), and optional USPS standardization when configured on server.
 */
export async function searchUsAddresses(
  query: string,
  preferredState?: string | null,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const plans = buildSearchPlans(trimmed, preferredState);

  const onelineBatches = await Promise.all(plans.oneline.map((addr) => censusOneline(addr)));
  let matches = dedupeMatches(onelineBatches.flat());

  if (matches.length === 0) {
    const structuredBatches = await Promise.all(
      plans.structured.map((parsed) => censusStructured(parsed)),
    );
    matches = dedupeMatches(structuredBatches.flat());
  }

  if (matches.length === 0 && plans.structured[0]) {
    const usps = await validateWithUsps(plans.structured[0]);
    if (usps) {
      const standardized: ParsedUsAddress = {
        street: usps.address2,
        city: usps.city,
        state: usps.state,
        zip: usps.zip5,
      };
      const [line, structured] = await Promise.all([
        censusOneline(formatParsedUsAddress(standardized)),
        censusStructured(standardized),
      ]);
      matches = dedupeMatches([...line, ...structured]);
    }
  }

  matches = filterMatchesByUsState(matches, preferredState);
  return matches.slice(0, 8);
}
