import type { ListingDraft } from "../screens/listing/types";
import { getActiveRentLocationLabel, getProfileCity } from "./listingStorage";
import { loadUserProfile } from "./userProfileStorage";
import { formatMoney, formatMoneyPerDay, perDaySuffix } from "./regionalDisplay";
import {
  isNewGarageHost,
  normalizeGarageIdentity,
  resolveGarageAccent,
  type GarageAccentId,
  type GarageShopKind,
} from "./garageIdentity";
import { noteGarageFirstSeen } from "./garageFirstSeen";

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
  try {
    const self = loadUserProfile();
    if (self.id && self.id === hostId) {
      const custom = self.garageIdentity?.shopName?.trim();
      if (custom) return custom;
      if (self.displayName?.trim()) {
        return garageNameFromDisplayName(self.displayName);
      }
    }
  } catch {
    /* ignore */
  }
  const fromMap = hostNames?.[hostId]?.trim();
  if (fromMap) return garageNameFromDisplayName(fromMap);
  return "Neighbor's Garage";
}

export function garageTrustLine(
  hostId: string | undefined,
  hostMeta?: Record<string, HostGarageMeta | { displayName: string; rating: number }>,
): {
  name: string;
  rating: number;
  distance: string;
  neighborhood: string;
} {
  const meta = hostId ? hostMeta?.[hostId] : undefined;
  const customName =
    meta && "shopName" in meta && typeof meta.shopName === "string"
      ? meta.shopName.trim()
      : "";
  const neighborhood =
    meta && "neighborhood" in meta && typeof meta.neighborhood === "string"
      ? meta.neighborhood.trim()
      : "";
  let selfNeighborhood = "";
  try {
    const self = loadUserProfile();
    if (hostId && self.id && self.id === hostId) {
      selfNeighborhood = self.garageIdentity?.neighborhood?.trim() ?? "";
    }
  } catch {
    /* ignore */
  }
  const name =
    customName ||
    garageDisplayName(hostId, meta ? { [hostId!]: meta.displayName } : undefined);
  const city = getProfileCity().trim().toLowerCase();
  const active = getActiveRentLocationLabel().trim().toLowerCase();
  const distance = city && active && city === active ? "Near you" : "Nearby";
  return {
    name,
    rating: meta?.rating ?? 0,
    distance,
    neighborhood: neighborhood || selfNeighborhood,
  };
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

export type BrowseInterestMatch = {
  category: string;
  subcategory?: string;
};

/** Match if any selected interest fits (category-wide or category + subcategory). */
export function listingMatchesBrowseInterests(
  draft: ListingDraft,
  interests: BrowseInterestMatch[],
): boolean {
  if (!interests.length) return true;
  const draftCat = draft.category.trim().toLowerCase();
  const draftSub = (draft.subcategory ?? "").trim().toLowerCase();
  return interests.some((interest) => {
    if (draftCat !== interest.category.trim().toLowerCase()) return false;
    const wantSub = interest.subcategory?.trim().toLowerCase() ?? "";
    if (!wantSub) return true;
    return draftSub === wantSub;
  });
}

function parsePriceAmount(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function formatListingPriceLine(draft: ListingDraft): string {
  if (draft.modes.sell && draft.pricing.salePrice.trim()) {
    const sale = parsePriceAmount(draft.pricing.salePrice);
    if (sale !== null && sale <= 0) return "Free";
    if (sale !== null) return formatMoney(sale);
    return draft.pricing.salePrice;
  }
  if (draft.modes.gift) return "Free";
  if (draft.modes.rent && draft.pricing.dailyRate.trim()) {
    const rate = parsePriceAmount(draft.pricing.dailyRate);
    return rate !== null
      ? formatMoneyPerDay(rate)
      : `${draft.pricing.dailyRate}${perDaySuffix()}`;
  }
  if (draft.pricing.dailyRate.trim()) {
    const rate = parsePriceAmount(draft.pricing.dailyRate);
    return rate !== null
      ? formatMoneyPerDay(rate)
      : `${draft.pricing.dailyRate}${perDaySuffix()}`;
  }
  if (draft.pricing.salePrice.trim()) {
    const sale = parsePriceAmount(draft.pricing.salePrice);
    if (sale !== null && sale <= 0) return "Free";
    if (sale !== null) return formatMoney(sale);
    return draft.pricing.salePrice;
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
  neighborhood?: string;
  itemCount: number;
  categories: string[];
  listings: ListingDraft[];
  isNew?: boolean;
  shopKind?: GarageShopKind;
  accentId?: GarageAccentId;
  accentColor?: string;
  accentSoft?: string;
};

export type HostGarageMeta = {
  displayName: string;
  rating: number;
  createdAt?: string | null;
  shopKind?: GarageShopKind;
  accentId?: GarageAccentId;
  shopName?: string;
  shopSlug?: string;
  neighborhood?: string;
};

export function groupListingsByGarage(
  listings: ListingDraft[],
  hostMeta?: Record<string, HostGarageMeta>,
): GarageSummary[] {
  const byHost = new Map<string, ListingDraft[]>();
  for (const listing of listings) {
    const hostId = listing.hostId ?? "";
    const bucket = byHost.get(hostId) ?? [];
    bucket.push(listing);
    byHost.set(hostId, bucket);
  }

  let selfId = "";
  let selfIdentity: ReturnType<typeof loadUserProfile>["garageIdentity"] | null = null;
  try {
    const self = loadUserProfile();
    selfId = self.id?.trim() ?? "";
    selfIdentity = self.garageIdentity;
  } catch {
    /* ignore */
  }

  return [...byHost.entries()].map(([hostId, items]) => {
    const trust = garageTrustLine(hostId || undefined, hostMeta);
    const categories = [...new Set(items.map((l) => l.category).filter(Boolean))].slice(0, 3);
    if (hostId) noteGarageFirstSeen(hostId);

    const meta = hostId ? hostMeta?.[hostId] : undefined;
    // "New" = host joined within NEW_GARAGE_DAYS (14) — never longer.
    const isNew = isNewGarageHost(meta?.createdAt);

    let shopKind: GarageShopKind | undefined;
    let accentId: GarageAccentId | undefined;
    let accentColor: string | undefined;
    let accentSoft: string | undefined;

    const fromMeta =
      meta?.accentId || meta?.shopKind || meta?.shopName || meta?.neighborhood
        ? normalizeGarageIdentity({
            shopKind: meta.shopKind,
            accentId: meta.accentId,
            shopName: meta.shopName,
            shopSlug: meta.shopSlug,
            neighborhood: meta.neighborhood,
          })
        : null;
    const fromSelf =
      selfIdentity && selfId && hostId && selfId === hostId ? selfIdentity : null;
    const identity = fromSelf ?? fromMeta;
    if (identity) {
      const accent = resolveGarageAccent(identity);
      shopKind = identity.shopKind;
      accentId = identity.accentId;
      accentColor = accent.color;
      accentSoft = accent.soft;
    }

    return {
      hostId,
      name: trust.name,
      rating: trust.rating,
      distance: trust.distance,
      neighborhood: trust.neighborhood || identity?.neighborhood || undefined,
      itemCount: items.length,
      categories,
      listings: items,
      isNew,
      shopKind,
      accentId,
      accentColor,
      accentSoft,
    };
  });
}
