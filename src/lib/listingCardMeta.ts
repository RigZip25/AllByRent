import type { ListingDraft } from "../screens/listing/types";
import {
  getActiveRentLocationLabel,
  getBrowseCenter,
  getListingCoords,
  getProfileCity,
} from "./listingStorage";
import { milesBetween } from "./geoLocality";

const CATEGORY_EMOJI: Record<string, string> = {
  tools: "🔧",
  sports: "⚽",
  photo: "📷",
  gaming: "🎮",
  music: "🎵",
  home: "🏠",
  outdoor: "⛺",
  party: "🎉",
};

export function categoryEmoji(category: string): string {
  const key = category.trim().toLowerCase();
  return CATEGORY_EMOJI[key] ?? "📦";
}

export function hostTrustFromId(_hostId: string | undefined): {
  rating: number;
  reviews: number;
} {
  // Real ratings come from reviews/remote profile — never invent demo stars.
  return { rating: 0, reviews: 0 };
}

export function listingDistanceLabel(listingId: string | undefined): string {
  const center = getBrowseCenter();
  const coords = listingId ? getListingCoords(listingId) : null;
  if (center && coords) {
    const mi = milesBetween(center, coords);
    if (mi < 0.5) return "Near you";
    if (mi < 10) return `${mi.toFixed(1)} mi`;
    return `${Math.round(mi)} mi`;
  }
  const city = getProfileCity().trim().toLowerCase();
  const active = getActiveRentLocationLabel().trim().toLowerCase();
  if (city && active && city === active) return "Near you";
  return "Nearby";
}

export function listingCardMeta(listing: ListingDraft): {
  rating: number;
  reviews: number;
  distance: string;
} {
  const trust = hostTrustFromId(listing.hostId);
  return {
    rating: trust.rating,
    reviews: trust.reviews,
    distance: listingDistanceLabel(listing.id),
  };
}
