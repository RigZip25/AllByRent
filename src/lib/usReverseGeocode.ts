import {
  abbreviateUsState,
  formatUsAddressLines,
  searchUsAddresses,
} from "./usAddressGeocoding";

type UsReverseParts = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

function getUsGeocoderBaseUrl(): string {
  if (import.meta.env.DEV) return "/us-geocode";
  return "/api/geocode/us";
}

function censusGeographiesUrl(lat: number, lng: number): URL {
  if (import.meta.env.DEV) {
    const url = new URL(`${getUsGeocoderBaseUrl()}/geographies/coordinates`);
    url.searchParams.set("x", String(lng));
    url.searchParams.set("y", String(lat));
    url.searchParams.set("benchmark", "Public_AR_Current");
    url.searchParams.set("vintage", "Current_Current");
    url.searchParams.set("format", "json");
    return url;
  }

  const url = new URL(getUsGeocoderBaseUrl(), window.location.origin);
  url.searchParams.set("mode", "geographies");
  url.searchParams.set("x", String(lng));
  url.searchParams.set("y", String(lat));
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");
  return url;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function titleCasePlace(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePlaceName(name: string): string {
  return name
    .replace(/\s+CDP$/i, "")
    .replace(/\s+city$/i, "")
    .replace(/\s+town$/i, "")
    .trim();
}

/** Census CDP / incorporated place at GPS — more reliable than OSM in rural AR. */
export async function fetchCensusPlaceAtCoordinates(
  lat: number,
  lng: number,
): Promise<{ city: string; state: string } | null> {
  try {
    const url = censusGeographiesUrl(lat, lng);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = (await response.json()) as {
      result?: {
        geographies?: Record<string, Array<{ NAME?: string; STUSAB?: string; STATE?: string }>>;
      };
    };

    const geographies = data.result?.geographies;
    if (!geographies) return null;

    const cdp = geographies["Census Designated Places"]?.[0];
    const incorporated = geographies["Incorporated Places"]?.[0];
    const countySub = geographies["County Subdivisions"]?.[0];
    const stateRow = geographies.States?.[0];

    const place =
      cdp?.NAME ?? incorporated?.NAME ?? (countySub?.BASENAME ? `${countySub.BASENAME} township` : null);
    const state = stateRow?.STUSAB ?? cdp?.STUSAB ?? incorporated?.STUSAB;
    if (!place || !state) return null;

    return { city: titleCasePlace(normalizePlaceName(place)), state };
  } catch {
    return null;
  }
}

/** Pick the USPS ZIP whose centroid is closest to the user (e.g. HSV 71909 vs 71910). */
export async function lookupClosestZipForPlace(
  state: string,
  placeName: string,
  lat: number,
  lng: number,
): Promise<string | null> {
  const stateAbbr = abbreviateUsState(state).toLowerCase();
  const slug = encodeURIComponent(placeName.trim().toLowerCase());

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${stateAbbr}/${slug}`);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      places?: Array<{ "post code": string; latitude: string; longitude: string }>;
    };

    let best: { zip: string; dist: number } | null = null;
    for (const place of data.places ?? []) {
      const zip = place["post code"]?.trim();
      const plat = Number.parseFloat(place.latitude);
      const plon = Number.parseFloat(place.longitude);
      if (!zip || Number.isNaN(plat) || Number.isNaN(plon)) continue;

      const dist = haversineKm(lat, lng, plat, plon);
      if (!best || dist < best.dist) best = { zip, dist };
    }

    return best?.zip ?? null;
  } catch {
    return null;
  }
}

async function resolveZip(
  parts: UsReverseParts,
  lat: number,
  lng: number,
): Promise<string | undefined> {
  const state = parts.state ? abbreviateUsState(parts.state) : "";
  const city = parts.city?.trim() ?? "";
  if (!state || !city) return parts.zip?.trim() || undefined;

  const closest = await lookupClosestZipForPlace(state, city, lat, lng);
  return closest ?? (parts.zip?.trim() || undefined);
}

/**
 * Refine Photon reverse-geocode for US: keep street/city, fix ZIP via Census + place lookup.
 */
export async function refineUsReverseGeocode(
  lat: number,
  lng: number,
  parts: UsReverseParts,
): Promise<string | null> {
  const street = parts.street?.trim() ?? "";
  let city = parts.city?.trim() ?? "";
  let state = parts.state?.trim() ?? "";

  const censusPlace = await fetchCensusPlaceAtCoordinates(lat, lng);
  if (censusPlace) {
    // Prefer official Census place — OSM often tags county or the wrong city for rural blocks.
    city = censusPlace.city || city;
    state = censusPlace.state || state;
  }

  state = state ? abbreviateUsState(state) : "";
  if (!state) return null;

  if (street) {
    const query = [street, city, state].filter(Boolean).join(", ");
    const censusMatches = await searchUsAddresses(query, state);
    if (censusMatches.length > 0) {
      return censusMatches[0].label;
    }
  }

  const zip = await resolveZip({ ...parts, city, state }, lat, lng);
  const formatted = formatUsAddressLines({
    street: street || undefined,
    city: city || undefined,
    state,
    zip,
  });

  if (formatted.label.trim()) return formatted.label;
  return null;
}
