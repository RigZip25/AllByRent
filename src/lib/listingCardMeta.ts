import type { ListingDraft } from "../screens/listing/types";
import { getActiveRentLocationLabel, getProfileCity } from "./listingStorage";

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

export function listingDistanceLabel(_hostId: string | undefined): string {
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
    distance: listingDistanceLabel(listing.hostId),
  };
}
