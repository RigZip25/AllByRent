import type { ListingDraft } from "../../screens/listing/types";
import {
  getActiveRentLocationLabel,
  getProfileCity,
  isListingBrowsable,
  loadPublishedListings,
  searchActiveListingsRemote,
} from "../listingStorage";
import { isSupabaseConfigured } from "../supabaseClient";
import type { SeoCategory } from "./rentCategories";
import {
  cityQueryTermsForLocation,
  type SeoLocation,
} from "./seoLocations";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function listingMatchesCategory(listing: ListingDraft, category: SeoCategory): boolean {
  return normalize(listing.category) === normalize(category.name);
}

function deviceCityMatchesLocation(location: SeoLocation): boolean {
  const terms = cityQueryTermsForLocation(location).map(normalize);
  const profile = normalize(getProfileCity());
  const browse = normalize(getActiveRentLocationLabel());
  return terms.some(
    (t) =>
      (profile && (profile === t || profile.includes(t) || t.includes(profile))) ||
      (browse && (browse === t || browse.includes(t) || t.includes(browse))),
  );
}

/**
 * Load active listings for a SEO rent landing.
 * Never fabricates rows — empty means empty (UI shows founding-host CTA).
 * City pages only include inventory attributable to that location.
 */
export async function fetchRentLandingListings(params: {
  category: SeoCategory;
  location: SeoLocation | null;
}): Promise<ListingDraft[]> {
  const { category, location } = params;

  if (!location) {
    const remote = await searchActiveListingsRemote({
      query: "",
      city: "",
      category: category.name,
    });
    return remote.filter(
      (l) => isListingBrowsable(l) && listingMatchesCategory(l, category) && l.modes.rent,
    );
  }

  // Without Supabase, city filters are not authoritative on listing rows.
  // Only show local inventory when this device is browsing that city.
  if (!isSupabaseConfigured()) {
    if (!deviceCityMatchesLocation(location)) return [];
    return loadPublishedListings().filter(
      (l) => isListingBrowsable(l) && listingMatchesCategory(l, category) && l.modes.rent,
    );
  }

  const terms = cityQueryTermsForLocation(location);
  const seen = new Set<string>();
  const merged: ListingDraft[] = [];

  for (const term of terms) {
    const batch = await searchActiveListingsRemote({
      query: "",
      city: term,
      category: category.name,
    });
    for (const listing of batch) {
      if (!isListingBrowsable(listing)) continue;
      if (!listingMatchesCategory(listing, category)) continue;
      if (!listing.modes.rent) continue;
      if (seen.has(listing.id)) continue;
      seen.add(listing.id);
      merged.push(listing);
    }
  }

  return merged;
}
