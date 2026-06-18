import {
  appendCountryToQuery,
  COUNTRY_BBOX,
  getSearchCountryCode,
  type CountryCode,
} from "./locationCountry";
import { abbreviateUsState, formatUsAddressLines, searchUsAddresses } from "./usAddressGeocoding";
import {
  appendUsStateToQuery,
  detectUsStateFromZip,
  filterMatchesByUsState,
  getPreferredUsState,
  queryHasUsCityHint,
  US_STATE_BBOX,
} from "./usStates";

export type LocationSuggestion = {
  label: string;
  primaryLine: string;
  secondaryLine: string;
  city: string;
  country: string;
  region: string;
  countryCode: string;
  flag: string;
  lat: number;
  lng: number;
  precision: string;
};

export type SearchPlacesOptions = {
  near?: { lat: number; lng: number };
  countryCode?: CountryCode;
  /** US only — e.g. AR */
  usState?: string | null;
};

type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  district?: string;
  suburb?: string;
  neighbourhood?: string;
  locality?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  osm_value?: string;
  type?: string;
};

const PHOTON_NOT_STREET = new Set([
  "bridge",
  "peak",
  "attraction",
  "museum",
  "school",
  "university",
  "hospital",
  "tram_stop",
  "bus_stop",
]);

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
};

export function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}

function dedupeParts(parts: string[]): string[] {
  const out: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (out[out.length - 1]?.toLowerCase() === trimmed.toLowerCase()) continue;
    out.push(trimmed);
  }
  return out;
}

function formatPhotonAddress(properties: PhotonProperties): {
  label: string;
  primaryLine: string;
  secondaryLine: string;
  city: string;
  region: string;
  country: string;
} {
  const countryCode = (properties.countrycode ?? "").toUpperCase();
  const streetLine = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const locality =
    properties.locality ||
    properties.district ||
    properties.suburb ||
    properties.neighbourhood ||
    "";
  const city =
    properties.city || properties.town || properties.village || locality || "";
  const region = properties.state || "";
  const country = properties.country || "";
  const postcode = properties.postcode || "";

  if (countryCode === "US") {
    const useNameAsStreet =
      !streetLine &&
      properties.name &&
      !PHOTON_NOT_STREET.has(properties.osm_value ?? "");
    return {
      ...formatUsAddressLines({
        street: streetLine || (useNameAsStreet ? properties.name : ""),
        city,
        state: region,
        zip: postcode,
      }),
      country,
    };
  }

  const placeName =
    properties.name &&
    properties.osm_value !== "postcode" &&
    properties.name !== properties.postcode &&
    !PHOTON_NOT_STREET.has(properties.osm_value ?? "")
      ? properties.name
      : "";

  const primaryLine =
    dedupeParts([streetLine || placeName, locality])
      .filter(Boolean)
      .join(", ") || city || postcode || country;

  const secondaryLine = dedupeParts([
    city && city !== primaryLine ? city : "",
    region,
    postcode && !primaryLine.includes(postcode) ? postcode : "",
    country,
  ])
    .filter(Boolean)
    .join(", ");

  const label = dedupeParts([primaryLine, secondaryLine]).join(", ");

  return { label, primaryLine, secondaryLine, city: city || primaryLine, region, country };
}

function parsePhotonFeature(feature: PhotonFeature): LocationSuggestion | null {
  const [lng, lat] = feature.geometry.coordinates;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const props = feature.properties;
  const countryCode = (props.countrycode ?? "").toUpperCase();
  const hasStreet = Boolean(props.street || props.housenumber);
  if (
    countryCode === "US" &&
    PHOTON_NOT_STREET.has(props.osm_value ?? "") &&
    !hasStreet
  ) {
    return null;
  }

  const { label, primaryLine, secondaryLine, city, region, country } =
    formatPhotonAddress(props);
  if (!label) return null;

  if (countryCode === "US" && !city && !props.postcode) return null;

  const stateLabel = countryCode === "US" ? abbreviateUsState(region) : region;

  return {
    label,
    primaryLine,
    secondaryLine,
    city,
    country,
    region: stateLabel,
    countryCode,
    flag: countryCodeToFlag(countryCode),
    lat,
    lng,
    precision: feature.properties.osm_value ?? "place",
  };
}

type OpenMeteoResult = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
};

function parseOpenMeteoResult(item: OpenMeteoResult): LocationSuggestion | null {
  const { latitude, longitude, name, admin1, country, country_code } = item;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  const region = admin1 ?? "";
  const label = dedupeParts([name, region, country ?? ""]).join(", ");
  const countryCode = (country_code ?? "").toUpperCase();

  return {
    label,
    primaryLine: name,
    secondaryLine: dedupeParts([region, country ?? ""]).join(", "),
    city: name,
    country: country ?? "",
    region,
    countryCode,
    flag: countryCodeToFlag(countryCode),
    lat: latitude,
    lng: longitude,
    precision: "city",
  };
}

function photonLang(countryCode: CountryCode): string {
  if (countryCode === "RU" || countryCode === "BY" || countryCode === "KZ") return "ru";
  if (countryCode === "UA") return "uk";
  if (typeof navigator === "undefined") return "en";
  return (navigator.language || "en").split("-")[0] || "en";
}

async function searchPhoton(
  query: string,
  countryCode: CountryCode,
  near?: { lat: number; lng: number },
  usState?: string | null,
): Promise<LocationSuggestion[]> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "15");
  url.searchParams.set("lang", photonLang(countryCode));

  const bbox =
    countryCode === "US" && usState && US_STATE_BBOX[usState]
      ? US_STATE_BBOX[usState]
      : COUNTRY_BBOX[countryCode];
  url.searchParams.set("bbox", bbox.join(","));

  if (near) {
    url.searchParams.set("lat", String(near.lat));
    url.searchParams.set("lon", String(near.lng));
  }

  const response = await fetch(url.toString());
  if (!response.ok) return [];

  const data = (await response.json()) as { features?: PhotonFeature[] };
  let results = (data.features ?? [])
    .map(parsePhotonFeature)
    .filter((item): item is LocationSuggestion => item !== null);

  if (countryCode === "US") {
    results = results.filter((item) => item.countryCode === "US");
    results = filterMatchesByUsState(results, usState);
  }

  return results;
}

async function searchOpenMeteo(
  query: string,
  countryCode: CountryCode,
): Promise<LocationSuggestion[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "10");
  url.searchParams.set("countryCode", countryCode);

  const response = await fetch(url.toString());
  if (!response.ok) return [];

  const data = (await response.json()) as { results?: OpenMeteoResult[] };
  return (data.results ?? [])
    .map(parseOpenMeteoResult)
    .filter((item): item is LocationSuggestion => item !== null);
}

const PRECISION_RANK: Record<string, number> = {
  house: 0,
  building: 1,
  residential: 2,
  street: 3,
  neighbourhood: 4,
  suburb: 5,
  district: 6,
  postcode: 7,
  city: 8,
  town: 9,
  village: 10,
};

function tokenMatchBoost(item: LocationSuggestion, query: string): number {
  const tokens = query
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
  if (tokens.length === 0) return 0;

  const hay = `${item.label} ${item.primaryLine} ${item.secondaryLine}`.toLowerCase();
  let matched = 0;
  for (const token of tokens) {
    if (hay.includes(token)) matched += 1;
  }
  return matched;
}

function rankSuggestion(
  item: LocationSuggestion,
  query: string,
  preferredCountry: CountryCode,
  preferredUsState?: string | null,
): number {
  const precision = PRECISION_RANK[item.precision] ?? 12;
  let score = precision;

  if (item.precision === "house" && preferredCountry === "US") score -= 4;

  const countryMatch = item.countryCode === preferredCountry;
  if (countryMatch) score -= 8;
  else score += 20;

  if (preferredCountry === "US" && preferredUsState) {
    if (item.region === preferredUsState) score -= 12;
    else score += 25;
  }

  score -= tokenMatchBoost(item, query) * 3;

  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) score -= 2;
  if (/\d/.test(query) && /\d/.test(item.primaryLine)) score -= 2;

  return score;
}

function filterByCountry(
  items: LocationSuggestion[],
  countryCode: CountryCode,
): LocationSuggestion[] {
  const inCountry = items.filter(
    (item) => item.countryCode === countryCode || item.countryCode === "",
  );
  if (inCountry.length >= 2) return inCountry;
  return items;
}

function sortSuggestions(
  items: LocationSuggestion[],
  query: string,
  countryCode: CountryCode,
  preferredUsState?: string | null,
): LocationSuggestion[] {
  return [...items].sort(
    (a, b) =>
      rankSuggestion(a, query, countryCode, preferredUsState) -
      rankSuggestion(b, query, countryCode, preferredUsState),
  );
}

function dedupeSuggestions(items: LocationSuggestion[]): LocationSuggestion[] {
  const seen = new Set<string>();
  const out: LocationSuggestion[] = [];
  for (const item of items) {
    const key = `${item.lat.toFixed(5)}:${item.lng.toFixed(5)}:${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function minQueryLength(query: string): number {
  const trimmed = query.trim();
  if (/^\d/.test(trimmed)) return 2;
  return 3;
}

export async function searchPlaces(
  query: string,
  options?: SearchPlacesOptions,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < minQueryLength(trimmed)) return [];

  const countryCode = options?.countryCode ?? getSearchCountryCode();
  const usState =
    countryCode === "US"
      ? (options?.usState ?? getPreferredUsState(trimmed, options?.near))
      : null;
  const biasedQuery =
    countryCode === "US" && usState
      ? appendUsStateToQuery(appendCountryToQuery(trimmed, countryCode), usState)
      : appendCountryToQuery(trimmed, countryCode);

  try {
    const usCensus =
      countryCode === "US" ? await searchUsAddresses(trimmed, usState) : [];

    const cityFragment =
      trimmed
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .pop() ?? trimmed;

    const [photonResults, meteoResults] = await Promise.all([
      searchPhoton(biasedQuery, countryCode, options?.near, usState),
      searchOpenMeteo(cityFragment, countryCode),
    ]);

    const merged = sortSuggestions(
      filterByCountry(
        dedupeSuggestions([...usCensus, ...photonResults, ...meteoResults]),
        countryCode,
      ),
      trimmed,
      countryCode,
      usState,
    );

    if (merged.length > 0) return merged.slice(0, 10);

    if (biasedQuery !== trimmed) {
      const retryPhoton = await searchPhoton(
        appendCountryToQuery(trimmed, countryCode),
        countryCode,
        options?.near,
        usState,
      );
      const retryMerged = sortSuggestions(
        filterByCountry(dedupeSuggestions([...usCensus, ...retryPhoton]), countryCode),
        trimmed,
        countryCode,
        usState,
      );
      if (retryMerged.length > 0) return retryMerged.slice(0, 10);
    }

    return [];
  } catch {
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  countryCode?: CountryCode,
): Promise<string | null> {
  const cc = countryCode ?? getSearchCountryCode();
  try {
    const url = new URL("https://photon.komoot.io/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("lang", photonLang(cc));

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = (await response.json()) as { features?: PhotonFeature[] };
    const feature = data.features?.[0];
    if (!feature) return null;

    return formatPhotonAddress(feature.properties).label;
  } catch {
    return null;
  }
}

/** @deprecated Use LocationSuggestion */
export type PlaceSuggestion = LocationSuggestion;
