import type { LocationSuggestion } from "./geocoding";
import type { ProfileLocation } from "./listingStorage";

/** Public feed/city label — never a street address (Stage 19 / G2). */
export function localityLabelFromParts(parts: {
  city?: string | null;
  region?: string | null;
  label?: string | null;
}): string {
  const city = (parts.city ?? "").trim();
  const region = (parts.region ?? "").trim();
  if (city && region && !city.toLowerCase().includes(region.toLowerCase())) {
    return `${city}, ${region}`;
  }
  if (city) return city;
  const label = (parts.label ?? "").trim();
  if (!label) return "";
  // Drop leading street number tokens: "123 Main St, Austin, TX" → "Austin, TX"
  const segments = label.split(",").map((s) => s.trim()).filter(Boolean);
  if (segments.length >= 2 && /^\d/.test(segments[0]!)) {
    return segments.slice(1).join(", ");
  }
  return label;
}

export function localityLabelFromSuggestion(suggestion: LocationSuggestion): string {
  return localityLabelFromParts({
    city: suggestion.city,
    region: suggestion.region,
    label: suggestion.label,
  });
}

export function cityKeyFromLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");
}

export function milesBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.7613;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function profileLocationFromSuggestion(
  suggestion: LocationSuggestion,
): ProfileLocation {
  return {
    displayName: localityLabelFromSuggestion(suggestion),
    lat: suggestion.lat,
    lng: suggestion.lng,
  };
}

/** Max length for geocode proxy query params (Stage 19 / G7). */
export const GEOCODE_QUERY_MAX_CHARS = 200;
