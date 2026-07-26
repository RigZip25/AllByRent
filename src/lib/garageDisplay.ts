import type { ListingDraft } from "../screens/listing/types";
import { getActiveRentLocationLabel, getProfileCity } from "./listingStorage";

export function garageDisplayName(hostId: string | undefined): string {
  if (!hostId) return "Host's Garage";
  return "Neighbor's Garage";
}

export function garageTrustLine(hostId: string | undefined): {
  name: string;
  rating: number;
  distance: string;
} {
  const name = garageDisplayName(hostId);
  const city = getProfileCity().trim().toLowerCase();
  const active = getActiveRentLocationLabel().trim().toLowerCase();
  const distance = city && active && city === active ? "Near you" : "Nearby";
  return { name, rating: 0, distance };
}

/** @deprecated Prefer "Nearby" — kept for call sites until distance is wired. */
export function mockDistanceMi(_seed: string): string {
  return "Nearby";
}

export type ModeChip = "all" | "rent" | "buy";

export function listingMatchesModeChip(draft: ListingDraft, chip: ModeChip): boolean {
  if (chip === "all") return true;
  if (chip === "rent") return draft.modes.rent;
  if (chip === "buy") return draft.modes.sell;
  return true;
}

export function formatListingPriceLine(draft: ListingDraft): string {
  if (draft.modes.sell && draft.pricing.salePrice.trim()) {
    const sale = Number.parseFloat(draft.pricing.salePrice.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(sale) && sale <= 0) return "Free";
    return `$${draft.pricing.salePrice}`;
  }
  if (draft.modes.gift) return "Free";
  if (draft.modes.rent && draft.pricing.dailyRate.trim()) {
    return `$${draft.pricing.dailyRate}/day`;
  }
  if (draft.pricing.dailyRate.trim()) return `$${draft.pricing.dailyRate}/day`;
  if (draft.pricing.salePrice.trim()) {
    const sale = Number.parseFloat(draft.pricing.salePrice.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(sale) && sale <= 0) return "Free";
    return `$${draft.pricing.salePrice}`;
  }
  return "Ask";
}

export function activeModeLabels(draft: ListingDraft): string[] {
  const labels: string[] = [];
  if (draft.modes.rent) labels.push("Rent");
  if (draft.modes.sell) {
    const sale = Number.parseFloat((draft.pricing.salePrice || "").replace(/[^0-9.]/g, ""));
    labels.push(Number.isFinite(sale) && sale <= 0 ? "Free" : "Buy");
  } else if (draft.modes.gift) {
    labels.push("Free");
  }
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
