import type { ListingDraft } from "../screens/listing/types";
import { getActiveRentLocationLabel, getProfileCity } from "./listingStorage";
import { loadUserProfile } from "./userProfileStorage";

export function garageNameFromDisplayName(displayName: string | undefined | null): string {
  const name = displayName?.trim();
  if (!name) return "Neighbor's Garage";
  if (/['']s$/i.test(name)) return `${name} Garage`;
  return `${name}'s Garage`;
}

export function garageDisplayName(
  hostId: string | undefined,
  hostNames?: Record<string, string>,
): string {
  if (!hostId) return "Host's Garage";
  const fromMap = hostNames?.[hostId]?.trim();
  if (fromMap) return garageNameFromDisplayName(fromMap);
  try {
    const self = loadUserProfile();
    if (self.id && self.id === hostId && self.displayName?.trim()) {
      return garageNameFromDisplayName(self.displayName);
    }
  } catch {
    /* ignore */
  }
  return "Neighbor's Garage";
}

export function garageTrustLine(
  hostId: string | undefined,
  hostMeta?: Record<string, { displayName: string; rating: number }>,
): {
  name: string;
  rating: number;
  distance: string;
} {
  const meta = hostId ? hostMeta?.[hostId] : undefined;
  const name = garageDisplayName(hostId, meta ? { [hostId!]: meta.displayName } : undefined);
  const city = getProfileCity().trim().toLowerCase();
  const active = getActiveRentLocationLabel().trim().toLowerCase();
  const distance = city && active && city === active ? "Near you" : "Nearby";
  return { name, rating: meta?.rating ?? 0, distance };
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

export function listingPrimaryPrice(draft: ListingDraft): number | null {
  if (draft.modes.sell && draft.pricing.salePrice.trim()) {
    const sale = Number.parseFloat(draft.pricing.salePrice.replace(/[^0-9.]/g, ""));
    return Number.isFinite(sale) ? sale : null;
  }
  if (draft.modes.gift) return 0;
  if (draft.pricing.dailyRate.trim()) {
    const day = Number.parseFloat(draft.pricing.dailyRate.replace(/[^0-9.]/g, ""));
    return Number.isFinite(day) ? day : null;
  }
  if (draft.pricing.salePrice.trim()) {
    const sale = Number.parseFloat(draft.pricing.salePrice.replace(/[^0-9.]/g, ""));
    return Number.isFinite(sale) ? sale : null;
  }
  return null;
}

export function listingMatchesPriceRange(
  draft: ListingDraft,
  min: number | null,
  max: number | null,
): boolean {
  if (min == null && max == null) return true;
  const price = listingPrimaryPrice(draft);
  if (price == null) return false;
  if (min != null && price < min) return false;
  if (max != null && price > max) return false;
  return true;
}

export function listingMatchesCategory(draft: ListingDraft, category: string | null): boolean {
  if (!category?.trim()) return true;
  return draft.category.trim().toLowerCase() === category.trim().toLowerCase();
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

export function groupListingsByGarage(
  listings: ListingDraft[],
  hostMeta?: Record<string, { displayName: string; rating: number }>,
): GarageSummary[] {
  const byHost = new Map<string, ListingDraft[]>();
  for (const listing of listings) {
    const hostId = listing.hostId ?? "";
    const bucket = byHost.get(hostId) ?? [];
    bucket.push(listing);
    byHost.set(hostId, bucket);
  }

  return [...byHost.entries()].map(([hostId, items]) => {
    const trust = garageTrustLine(hostId || undefined, hostMeta);
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
