import type { ListingDraft } from "../screens/listing/types";
import { getPublicProfile } from "./demoUserProfiles";
import { getActiveRentLocationLabel, getProfileCity } from "./listingStorage";
import { mockDistanceMi } from "./garageDisplay";

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

export function hostTrustFromId(hostId: string | undefined): {
  rating: number;
  reviews: number;
} {
  if (!hostId) return { rating: 0, reviews: 0 };
  const profile = getPublicProfile(hostId);
  if (profile) {
    return { rating: profile.rating, reviews: profile.reviewCount };
  }
  return { rating: 0, reviews: 0 };
}

export function listingDistanceLabel(hostId: string | undefined): string {
  const city = getProfileCity().trim().toLowerCase();
  const active = getActiveRentLocationLabel().trim().toLowerCase();
  if (city && active && city === active) return "Near you";
  if (hostId) return mockDistanceMi(hostId);
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
