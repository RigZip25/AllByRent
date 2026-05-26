import type { LocationSuggestion } from "./geocoding";
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
  return "https://geocoding.geo.census.gov/geocoder";
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

/** US Census Bureau — accurate city, state, ZIP for street addresses. */
export async function searchUsAddresses(
  query: string,
  preferredState?: string | null,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  let searchAddress = trimmed;
  if (preferredState && !trimmed.toUpperCase().includes(preferredState)) {
    searchAddress = `${trimmed}, ${preferredState}`;
  }

  try {
    const url = new URL(`${getUsGeocoderBaseUrl()}/locations/onelineaddress`);
    url.searchParams.set("address", searchAddress);
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = (await response.json()) as {
      result?: { addressMatches?: CensusMatch[] };
    };

    let matches = (data.result?.addressMatches ?? [])
      .map(parseCensusMatch)
      .filter((item): item is LocationSuggestion => item !== null);

    matches = filterMatchesByUsState(matches, preferredState);

    return matches.slice(0, 8);
  } catch {
    return [];
  }
}
