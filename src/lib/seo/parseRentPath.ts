import { getSeoCategoryBySlug, type SeoCategory } from "./rentCategories";
import { getSeoLocationBySlug, type SeoLocation } from "./seoLocations";

export type ParsedRentPath =
  | { kind: "category"; category: SeoCategory; location: null }
  | { kind: "category-city"; category: SeoCategory; location: SeoLocation }
  | { kind: "invalid"; category: null; location: null };

const RENT_PATH_RE = /^\/rent\/([^/]+)(?:\/([^/]+))?\/?$/i;

/** Parse `/rent/{category}` or `/rent/{category}/{city}` from a pathname. */
export function parseRentPath(pathname: string): ParsedRentPath | null {
  const path = pathname.trim();
  const match = path.match(RENT_PATH_RE);
  if (!match) return null;

  const categorySlug = decodeURIComponent(match[1] ?? "").trim();
  const citySlug = match[2] ? decodeURIComponent(match[2]).trim() : "";

  const category = getSeoCategoryBySlug(categorySlug);
  if (!category) {
    return { kind: "invalid", category: null, location: null };
  }

  if (!citySlug) {
    return { kind: "category", category, location: null };
  }

  const location = getSeoLocationBySlug(citySlug);
  if (!location) {
    return { kind: "invalid", category: null, location: null };
  }

  return { kind: "category-city", category, location };
}

export function isRentLandingPath(pathname: string): boolean {
  return RENT_PATH_RE.test(pathname.trim());
}
