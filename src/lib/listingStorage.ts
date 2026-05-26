import type { ListingDraft } from "../screens/listing/types";

const LISTINGS_STORAGE_KEY = "allbyrent_published_listings";
const PROFILE_CITY_KEY = "allbyrent_profile_city";
const PROFILE_LOCATION_KEY = "allbyrent_profile_location";
const TRIP_DESTINATION_KEY = "allbyrent_trip_destination";
const RENT_CONTEXT_KEY = "allbyrent_rent_context";

export type RentLocationContext = "home" | "trip";

export type ProfileLocation = {
  displayName: string;
  lat: number;
  lng: number;
};

export function getRentContext(): RentLocationContext | null {
  try {
    const raw = localStorage.getItem(RENT_CONTEXT_KEY);
    if (raw === "home" || raw === "trip") return raw;
    return null;
  } catch {
    return null;
  }
}

export function setRentContext(context: RentLocationContext): void {
  try {
    localStorage.setItem(RENT_CONTEXT_KEY, context);
  } catch {
    /* ignore */
  }
}

export function getProfileCity(): string {
  const home = getHomeLocation();
  if (home) return home.displayName;
  try {
    return localStorage.getItem(PROFILE_CITY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function hasProfileCity(): boolean {
  return getProfileCity().trim().length > 0;
}

/** @deprecated Prefer setHomeLocation or setTripDestination */
export function setProfileCity(city: string): void {
  try {
    localStorage.setItem(PROFILE_CITY_KEY, city);
  } catch {
    /* ignore */
  }
}

export function getHomeLocation(): ProfileLocation | null {
  try {
    const raw = localStorage.getItem(PROFILE_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileLocation;
    if (
      typeof parsed.displayName === "string" &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setHomeLocation(location: ProfileLocation): void {
  setRentContext("home");
  setProfileCity(location.displayName);
  try {
    localStorage.setItem(PROFILE_LOCATION_KEY, JSON.stringify(location));
  } catch {
    /* ignore */
  }
}

export function getTripDestination(): string {
  try {
    return localStorage.getItem(TRIP_DESTINATION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setTripDestination(displayName: string): void {
  setRentContext("trip");
  try {
    localStorage.setItem(TRIP_DESTINATION_KEY, displayName);
  } catch {
    /* ignore */
  }
}

/** Label shown on Home Feed — follows last at-home vs trip choice. */
export function getActiveRentLocationLabel(): string {
  const context = getRentContext();
  if (context === "trip") {
    return getTripDestination().trim();
  }
  if (context === "home") {
    return getHomeLocation()?.displayName.trim() ?? getProfileCity().trim();
  }

  const trip = getTripDestination().trim();
  const home = getHomeLocation()?.displayName.trim() ?? "";
  return home || trip || getProfileCity().trim();
}

/** @deprecated Use setHomeLocation */
export function getProfileLocation(): ProfileLocation | null {
  return getHomeLocation();
}

/** @deprecated Use setHomeLocation */
export function setProfileLocation(location: ProfileLocation): void {
  setHomeLocation(location);
}

export function savePublishedListing(draft: ListingDraft): void {
  try {
    const existing = loadPublishedListings();
    const next = existing.filter((item) => item.id !== draft.id);
    next.unshift(draft);
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function loadPublishedListings(): ListingDraft[] {
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ListingDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function updateStoredListing(draft: ListingDraft): void {
  savePublishedListing(draft);
}

/** Published listings with QR enabled — for batch sticker sheets. */
export function loadStickerEligibleListings(): ListingDraft[] {
  return loadPublishedListings().filter(
    (listing) =>
      listing.generateQR &&
      (listing.listingStatus === "published" ||
        listing.listingStatus === "pending_sticker" ||
        listing.listingStatus === "active"),
  );
}
