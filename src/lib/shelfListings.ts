import {
  getActiveRentLocationLabel,
  getProfileCity,
  loadPublishedListings,
  fetchActiveListingsForCityRemote,
} from "./listingStorage";
import type { ListingDraft } from "../screens/listing/types";

export type ShelfPrefill = {
  category: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  city?: string;
  /** Optional freeform keywords to include in Post Request copy. */
  query?: string;
};

/** True when browse context is complete enough to skip category selection. */
export function hasPostRequestContext(prefill: ShelfPrefill | null | undefined): boolean {
  return Boolean(prefill?.category?.trim() && prefill?.subcategory?.trim());
}

export type ShelfListingFilter = {
  category: string;
  subcategory?: string;
  city?: string;
};

const PUBLISHED_STATUSES = new Set<ListingDraft["listingStatus"]>([
  "active",
]);

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function listingMatchesCity(listing: ListingDraft, city?: string): boolean {
  const cityNorm = normalize(city ?? "");
  if (!cityNorm) return true;

  // Listings do not store city yet; treat published inventory as local to profile/browse city.
  const profileCity = normalize(getProfileCity());
  const browseCity = normalize(getActiveRentLocationLabel());
  if (profileCity && cityNorm === profileCity) return true;
  if (browseCity && cityNorm === browseCity) return true;
  if (!profileCity && !browseCity) return true;

  return false;
}

export function loadShelfListings(filter: ShelfListingFilter): ListingDraft[] {
  const categoryNorm = normalize(filter.category);
  const subcategoryNorm = filter.subcategory ? normalize(filter.subcategory) : null;

  return loadPublishedListings().filter((listing) => {
    if (!PUBLISHED_STATUSES.has(listing.listingStatus)) return false;
    if (normalize(listing.category) !== categoryNorm) return false;
    if (subcategoryNorm && normalize(listing.subcategory) !== subcategoryNorm) return false;
    if (!listingMatchesCity(listing, filter.city)) return false;
    return true;
  });
}

export function countShelfListings(filter: ShelfListingFilter): number {
  return loadShelfListings(filter).length;
}

export async function fetchShelfListings(filter: ShelfListingFilter): Promise<ListingDraft[]> {
  const categoryNorm = normalize(filter.category);
  const subcategoryNorm = filter.subcategory ? normalize(filter.subcategory) : null;
  const city = filter.city?.trim() || getActiveRentLocationLabel().trim() || getProfileCity().trim();

  const active = await fetchActiveListingsForCityRemote(city);
  return active.filter((listing) => {
    if (!PUBLISHED_STATUSES.has(listing.listingStatus)) return false;
    if (normalize(listing.category) !== categoryNorm) return false;
    if (subcategoryNorm && normalize(listing.subcategory) !== subcategoryNorm) return false;
    return true;
  });
}

/** City label for empty-shelf copy — earn uses host city, rent uses active browse location. */
export function getShelfCityLabel(appMode: "earn" | "rent"): string {
  const profile = getProfileCity().trim();
  const browse = getActiveRentLocationLabel().trim();
  if (appMode === "earn") {
    return profile || browse || "your area";
  }
  return browse || profile || "your area";
}
