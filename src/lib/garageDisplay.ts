import type { ListingDraft } from "../screens/listing/types";
import { getPublicProfile } from "./demoUserProfiles";
import { getActiveRentLocationLabel, getProfileCity } from "./listingStorage";

export function garageDisplayName(hostId: string | undefined): string {
  if (!hostId) return "Host's Garage";
  const profile = getPublicProfile(hostId);
  if (profile) return `${profile.displayName}'s Garage`;
  return "Neighbor's Garage";
}

export function garageTrustLine(hostId: string | undefined): {
  name: string;
  rating: number;
  distance: string;
} {
  const profile = hostId ? getPublicProfile(hostId) : null;
  const name = garageDisplayName(hostId);
  const rating = profile?.rating ?? 0;
  const city = getProfileCity().trim().toLowerCase();
  const active = getActiveRentLocationLabel().trim().toLowerCase();
  const distance =
    city && active && city === active ? "Near you" : mockDistanceMi(hostId ?? "neighbor");
  return { name, rating, distance };
}

/** Deterministic mock distance until geolocation wiring (P1). */
export function mockDistanceMi(seed: string): string {
  const hash = seed.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const tenths = (hash % 17) + 3;
  return `${(tenths / 10).toFixed(1)} mi`;
}

export type ModeChip = "all" | "rent" | "buy" | "gift";

export function listingMatchesModeChip(draft: ListingDraft, chip: ModeChip): boolean {
  if (chip === "all") return true;
  if (chip === "rent") return draft.modes.rent && !draft.modes.gift;
  if (chip === "buy") return draft.modes.sell;
  if (chip === "gift") return draft.modes.gift;
  return true;
}

export function formatListingPriceLine(draft: ListingDraft): string {
  if (draft.modes.gift) return "Free";
  if (draft.modes.sell && draft.pricing.salePrice.trim()) {
    return `$${draft.pricing.salePrice}`;
  }
  if (draft.modes.rent && draft.pricing.dailyRate.trim()) {
    return `$${draft.pricing.dailyRate}/day`;
  }
  if (draft.pricing.dailyRate.trim()) return `$${draft.pricing.dailyRate}/day`;
  if (draft.pricing.salePrice.trim()) return `$${draft.pricing.salePrice}`;
  return "Ask";
}

export function activeModeLabels(draft: ListingDraft): string[] {
  const labels: string[] = [];
  if (draft.modes.rent && !draft.modes.gift) labels.push("Rent");
  if (draft.modes.sell) labels.push("Buy");
  if (draft.modes.gift) labels.push("Gift");
  return labels.length ? labels : ["Rent"];
}

export type GarageSummary = {
  hostId: string;
  name: string;
  rating: number;
  distance: string;
  itemCount: number;
  categories: string[];
  listings: ListingDraft[];
};

export function groupListingsByGarage(listings: ListingDraft[]): GarageSummary[] {
  const byHost = new Map<string, ListingDraft[]>();
  for (const listing of listings) {
    const hostId = listing.hostId ?? "";
    const bucket = byHost.get(hostId) ?? [];
    bucket.push(listing);
    byHost.set(hostId, bucket);
  }

  return [...byHost.entries()].map(([hostId, items]) => {
    const trust = garageTrustLine(hostId);
    const categories = [...new Set(items.map((l) => l.category).filter(Boolean))].slice(0, 3);
    return {
      hostId,
      name: trust.name,
      rating: trust.rating,
      distance: trust.distance,
      itemCount: items.length,
      categories,
      listings: items,
    };
  });
}
