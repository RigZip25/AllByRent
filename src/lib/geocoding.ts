import {
  appendCountryToQuery,
  COUNTRY_BBOX,
  getSearchCountryCode,
  type CountryCode,
} from "./locationCountry";
import { abbreviateUsState, formatUsAddressLines, searchUsAddresses } from "./usAddressGeocoding";
import { refineUsReverseGeocode } from "./usReverseGeocode";
import {
  appendUsStateToQuery,
  filterMatchesByUsState,
  getPreferredUsState,
  US_STATE_BBOX,
} from "./usStates";
import {
  isUsZipQuery,
  normalizePostcodeDigits,
  postalQueryVariants,
  queryLooksLikeStreet,
  type LocationSearchGranularity,
} from "./locationQuery";

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
  /** City from saved home — helps partial street search. */
  cityHint?: string | null;
  /** `area` = ZIP / city only (no street required). `any` = include street-level Census. */
  granularity?: LocationSearchGranularity;
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
  county?: string;
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

/** OSM place types whose `name` is a locality — not a street. */
const PHOTON_LOCALITY_VALUES = new Set([
  "city",
  "town",
  "village",
  "hamlet",
  "municipality",
  "suburb",
  "neighbourhood",
  "neighborhood",
  "locality",
  "quarter",
  "borough",
]);

/** Admin / place features — never treat `name` as a street line. */
const PHOTON_NOT_STREET_NAME = new Set([
  ...PHOTON_NOT_STREET,
  ...PHOTON_LOCALITY_VALUES,
  "state",
  "county",
  "country",
  "region",
  "province",
  "postcode",
]);

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
};

/** Prefer city/town fields; Photon often only sets `name` for place=* features. */
function localityFromPhoton(properties: PhotonProperties): string {
  const fromFields =
    properties.city ||
    properties.town ||
    properties.village ||
    properties.locality ||
    properties.district ||
    properties.suburb ||
    properties.neighbourhood ||
    "";
  if (fromFields) return fromFields;

  const osm = properties.osm_value ?? "";
  if (PHOTON_LOCALITY_VALUES.has(osm) && properties.name?.trim()) {
    return properties.name.trim();
  }
  return "";
}

function regionFromPhoton(properties: PhotonProperties): string {
  if (properties.state?.trim()) return properties.state.trim();
  // State-level reverse/search features often have name=Arkansas and empty `state`.
  if (properties.osm_value === "state" && properties.name?.trim()) {
    return properties.name.trim();
  }
  return "";
}

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
  const city = localityFromPhoton(properties);
  const region = regionFromPhoton(properties);
  const country = properties.country || "";
  const postcode = properties.postcode || "";

  if (countryCode === "US") {
    const useNameAsStreet =
      !streetLine &&
      Boolean(properties.name) &&
      !PHOTON_NOT_STREET_NAME.has(properties.osm_value ?? "");
    return {
      ...formatUsAddressLines({
        street: streetLine || (useNameAsStreet ? properties.name : ""),
        city: city || undefined,
        state: region || undefined,
        zip: postcode || undefined,
      }),
      country,
    };
  }

  const placeName =
    properties.name &&
    properties.osm_value !== "postcode" &&
    properties.name !== properties.postcode &&
    !PHOTON_NOT_STREET_NAME.has(properties.osm_value ?? "")
      ? properties.name
      : "";

  const primaryLine =
    dedupeParts([streetLine || placeName, city])
      .filter(Boolean)
      .join(", ") ||
    city ||
    postcode ||
    region ||
    country;

  const secondaryLine = dedupeParts([
    city && city !== primaryLine ? city : "",
    region && region !== city && region !== primaryLine ? region : "",
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
  const zipName = props.name?.trim() ?? "";
  if (
    countryCode === "US" &&
    props.osm_value === "postcode" &&
    /^\d{5}$/.test(zipName)
  ) {
    const stateLabel = abbreviateUsState(props.state ?? "");
    const place = props.city || props.county || "";
    return {
      label: place
        ? `ZIP ${zipName} — ${place}, ${stateLabel}`
        : `ZIP ${zipName}, ${stateLabel}`,
      primaryLine: `ZIP ${zipName}`,
      secondaryLine: [place, stateLabel].filter(Boolean).join(", "),
      city: place || zipName,
      country: props.country ?? "United States",
      region: stateLabel,
      countryCode: "US",
      flag: countryCodeToFlag("US"),
      lat,
      lng,
      precision: "postcode",
    };
  }

  // European (and other) OSM postcode nodes — prefer city over the bare code.
  if (props.osm_value === "postcode" && zipName) {
    const place =
      props.city || props.town || props.village || props.county || props.district || "";
    const region = props.state || "";
    const country = props.country || "";
    const primaryLine = place ? `${zipName} — ${place}` : zipName;
    const secondaryLine = dedupeParts([region, country]).join(", ");
    return {
      label: dedupeParts([primaryLine, secondaryLine]).join(", "),
      primaryLine,
      secondaryLine,
      city: place || zipName,
      country,
      region,
      countryCode,
      flag: countryCodeToFlag(countryCode),
      lat,
      lng,
      precision: "postcode",
    };
  }

  // State / county / country — not useful as a search hit (and name ≠ city).
  if (
    countryCode === "US" &&
    (props.osm_value === "state" ||
      props.osm_value === "county" ||
      props.osm_value === "country" ||
      props.osm_value === "region")
  ) {
    return null;
  }

  const hasStreet = Boolean(props.street || props.housenumber);
  if (
    countryCode === "US" &&
    PHOTON_NOT_STREET.has(props.osm_value ?? "") &&
    !hasStreet
  ) {
    return null;
  }

  const realCity = localityFromPhoton(props);
  const { label, primaryLine, secondaryLine, city, region, country } =
    formatPhotonAddress(props);
  if (!label) return null;

  if (
    countryCode === "US" &&
    !realCity &&
    !props.postcode &&
    props.osm_value !== "postcode"
  ) {
    return null;
  }

  const stateLabel = countryCode === "US" ? abbreviateUsState(region) : region;

  return {
    label,
    primaryLine,
    secondaryLine,
    city: realCity || city,
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
  // Prefer device language; bias a few locales when Photon benefits from it.
  const byCountry: Record<string, string> = {
    UA: "uk",
    DE: "de",
    AT: "de",
    CH: "de",
    FR: "fr",
    BE: "fr",
    ES: "es",
    MX: "es",
    AR: "es",
    CL: "es",
    CO: "es",
    PE: "es",
    UY: "es",
    BR: "pt",
    PT: "pt",
    IT: "it",
    NL: "nl",
    PL: "pl",
    CZ: "default",
  };
  const forced = byCountry[countryCode];
  if (forced && forced !== "default") return forced;
  if (typeof navigator === "undefined") return "en";
  const primary = (navigator.language || "en").split("-")[0] || "en";
  // Photon supports a limited set; fall back to en for rare tags.
  const supported = new Set(["en", "de", "fr", "it", "es", "pt", "nl", "pl", "uk", "default"]);
  return supported.has(primary) ? primary : "en";
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
      : COUNTRY_BBOX[countryCode] ?? COUNTRY_BBOX.US;
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
  granularity: LocationSearchGranularity = "any",
): number {
  const precision = PRECISION_RANK[item.precision] ?? 12;
  let score = precision;

  if (granularity === "area") {
    if (item.precision === "postcode") score -= 14;
    else if (item.precision === "city" || item.precision === "town" || item.precision === "village") {
      score -= 10;
    } else if (item.precision === "house" || item.precision === "building") {
      score += 12;
    }
  }

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

  // Exact postcode digit match (26901 ↔ "269 01") beats fuzzy street names.
  const qDigits = normalizePostcodeDigits(query);
  if (qDigits.length >= 4 && /^\d/.test(qDigits)) {
    const labelDigits = normalizePostcodeDigits(`${item.primaryLine} ${item.secondaryLine} ${item.label}`);
    if (labelDigits.startsWith(qDigits) || labelDigits.includes(qDigits)) {
      score -= item.precision === "postcode" ? 30 : 12;
    }
  }

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
  granularity: LocationSearchGranularity = "any",
): LocationSuggestion[] {
  return [...items].sort(
    (a, b) =>
      rankSuggestion(a, query, countryCode, preferredUsState, granularity) -
      rankSuggestion(b, query, countryCode, preferredUsState, granularity),
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

export function minQueryLength(
  query: string,
  granularity: LocationSearchGranularity = "any",
): number {
  const trimmed = query.trim();
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) return 5;
  if (granularity === "area" && /^\d+$/.test(trimmed)) return 5;
  if (/^\d/.test(trimmed)) return 2;
  return 3;
}

async function searchUsZipCode(
  zip: string,
  usState?: string | null,
): Promise<LocationSuggestion[]> {
  const zip5 = zip.trim().slice(0, 5);
  const [photonResults, meteoResults] = await Promise.all([
    searchPhoton(zip5, "US", undefined, usState),
    searchOpenMeteo(zip5, "US"),
  ]);

  let results = dedupeSuggestions([...photonResults, ...meteoResults]).filter(
    (item) => item.precision === "postcode" || item.precision === "city",
  );

  if (usState) {
    results = filterMatchesByUsState(results, usState);
  }

  if (results.length === 0 && meteoResults.length > 0) {
    results = meteoResults;
  }

  return results;
}

function augmentUsQueryWithCityHint(query: string, cityHint?: string | null): string | null {
  const trimmed = query.trim();
  if (!cityHint?.trim() || trimmed.includes(",")) return null;
  const city = cityHint.split(",")[0]?.trim();
  if (!city || city.length < 2) return null;
  if (trimmed.toLowerCase().includes(city.toLowerCase())) return null;
  return `${trimmed}, ${city}`;
}

export async function searchPlaces(
  query: string,
  options?: SearchPlacesOptions,
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  const granularity = options?.granularity ?? "any";
  if (trimmed.length < minQueryLength(trimmed, granularity)) return [];

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
    if (countryCode === "US" && isUsZipQuery(trimmed)) {
      const zipResults = await searchUsZipCode(trimmed, usState);
      if (zipResults.length > 0) return zipResults.slice(0, 8);
    }

    const areaMode = granularity === "area";
    const streetSearch = queryLooksLikeStreet(trimmed);
    const usCensus =
      countryCode === "US" && (!areaMode || streetSearch)
        ? await searchUsAddresses(trimmed, usState)
        : [];

    const cityFragment =
      trimmed
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .pop() ?? trimmed;

    const countryQuery = appendCountryToQuery(trimmed, countryCode);
    const cityAugmented =
      countryCode === "US" ? augmentUsQueryWithCityHint(trimmed, options?.cityHint) : null;
    const cityAugmentedBiased =
      countryCode === "US" && cityAugmented && usState
        ? appendUsStateToQuery(appendCountryToQuery(cityAugmented, countryCode), usState)
        : cityAugmented
          ? appendCountryToQuery(cityAugmented, countryCode)
          : null;

    // CZ "26901" → also query "269 01" (OSM/Photon postcode form).
    const postalForms = postalQueryVariants(trimmed, countryCode);
    const photonQueries = [
      ...postalForms.map((form) =>
        countryCode === "US" && usState
          ? appendUsStateToQuery(appendCountryToQuery(form, countryCode), usState)
          : appendCountryToQuery(form, countryCode),
      ),
      ...postalForms.filter((form) => form !== trimmed),
      biasedQuery,
      cityAugmentedBiased,
      countryQuery !== biasedQuery ? countryQuery : null,
    ].filter((q, index, all): q is string => Boolean(q && q.trim()) && all.indexOf(q) === index);

    const [photonBatches, meteoResults] = await Promise.all([
      Promise.all(
        photonQueries.map((q) => searchPhoton(q, countryCode, options?.near, usState)),
      ),
      searchOpenMeteo(cityFragment, countryCode),
    ]);

    const merged = sortSuggestions(
      filterByCountry(
        dedupeSuggestions([...usCensus, ...photonBatches.flat(), ...meteoResults]),
        countryCode,
      ),
      trimmed,
      countryCode,
      usState,
      granularity,
    );

    if (merged.length > 0) return merged.slice(0, 12);

    return [];
  } catch {
    return [];
  }
}

function photonToUsParts(properties: PhotonProperties): {
  street: string;
  city: string;
  state: string;
  zip: string;
} {
  const streetLine = [properties.housenumber, properties.street].filter(Boolean).join(" ");
  const useNameAsStreet =
    !streetLine &&
    Boolean(properties.name) &&
    !PHOTON_NOT_STREET_NAME.has(properties.osm_value ?? "");
  const city = localityFromPhoton(properties);
  const state = regionFromPhoton(properties);

  return {
    street: streetLine || (useNameAsStreet ? properties.name! : ""),
    city,
    state,
    zip: properties.postcode || "",
  };
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

    const props = feature.properties;
    const photonCountry = (props.countrycode ?? cc).toUpperCase();

    if (photonCountry === "US") {
      const refined = await refineUsReverseGeocode(lat, lng, photonToUsParts(props));
      if (refined) return refined;
    }

    return formatPhotonAddress(props).label;
  } catch {
    return null;
  }
}

/** @deprecated Use LocationSuggestion */
export type PlaceSuggestion = LocationSuggestion;
