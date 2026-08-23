import type { ListingDraft } from "../screens/listing/types";
import { getActiveCoHostHostIds } from "./coHostStorage";
import {
  countPublishedListingsForHost,
  fetchListingsByOwnerIdsRemote,
  isListingRecentlyRemoved,
  loadPublishedListings,
} from "./listingStorage";
import { resolveHostAccountEmail, resolveHostAccountId } from "./hostIdentity";

const LEGACY_HOST_ID = "";
const ACTIVE_GARAGE_HOST_KEY = "allbyrent_active_garage_host_id";
const PROFILE_KEY = "allbyrent_user_profile";

function readOwnShopName(): string {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as {
      garageIdentity?: { shopName?: unknown };
    };
    const name = parsed.garageIdentity?.shopName;
    return typeof name === "string" ? name.trim() : "";
  } catch {
    return "";
  }
}

/** Host id stamped on listings; legacy rows without hostId are unassigned until migrated. */
export function getListingHostId(listing: ListingDraft): string {
  return listing.hostId?.trim() || LEGACY_HOST_ID;
}

export function getManageableHostIds(
  authUserId: string | null,
  authUserEmail: string | null,
): string[] {
  const ownId = resolveHostAccountId(authUserId);
  const email = resolveHostAccountEmail(authUserEmail);
  const coHostFor = getActiveCoHostHostIds(ownId, email);
  return Array.from(new Set([ownId, ...coHostFor].filter(Boolean)));
}

/**
 * Shared household garage id for stocking / Live / storefront.
 * Primary (own shop name) → own id. Active co-host without their own shop → primary’s id.
 * Concurrent listings from Barbara / John / Peter / Joanna all stamp this same owner_id.
 */
export function resolveGarageHostId(
  authUserId: string | null,
  authUserEmail: string | null,
): string {
  const ownId = resolveHostAccountId(authUserId);
  if (!ownId) return "";
  const email = resolveHostAccountEmail(authUserEmail);
  const coHostFor = getActiveCoHostHostIds(ownId, email).filter(Boolean);
  const manageable = Array.from(new Set([ownId, ...coHostFor]));

  try {
    const preferred = localStorage.getItem(ACTIVE_GARAGE_HOST_KEY)?.trim() ?? "";
    if (preferred && manageable.includes(preferred)) return preferred;
  } catch {
    /* ignore */
  }

  const ownShop = readOwnShopName();
  // Household helpers join an existing garage — they stock that shelf, not a second one.
  if (!ownShop && coHostFor.length > 0) {
    return coHostFor[0]!;
  }
  return ownId;
}

export function setActiveGarageHostId(hostId: string): void {
  const id = hostId.trim();
  if (!id) return;
  try {
    localStorage.setItem(ACTIVE_GARAGE_HOST_KEY, id);
  } catch {
    /* ignore */
  }
}

export function canManageListing(
  listing: ListingDraft,
  authUserId: string | null,
  authUserEmail: string | null,
): boolean {
  const hostIds = getManageableHostIds(authUserId, authUserEmail);
  const listingHostId = getListingHostId(listing);
  if (listingHostId && hostIds.includes(listingHostId)) return true;
  // Legacy local rows without hostId: only the signed-in user can claim/manage.
  return !listingHostId && Boolean(authUserId);
}

export function loadManageableListings(
  authUserId: string | null,
  authUserEmail: string | null,
): ListingDraft[] {
  return loadPublishedListings().filter((listing) =>
    canManageListing(listing, authUserId, authUserEmail),
  );
}

function listingUpdatedAtMs(listing: ListingDraft): number {
  const raw = listing.updatedAt ? Date.parse(listing.updatedAt) : 0;
  return Number.isFinite(raw) ? raw : 0;
}

/** Prefer newer copy when the same id exists locally and remotely. */
export function mergeManageableListings(
  local: ListingDraft[],
  remote: ListingDraft[],
): ListingDraft[] {
  const byId = new Map<string, ListingDraft>();
  for (const listing of local) {
    if (listing.id) byId.set(listing.id, listing);
  }
  for (const listing of remote) {
    if (!listing.id) continue;
    if (isListingRecentlyRemoved(listing.id)) continue;
    const prev = byId.get(listing.id);
    if (!prev || listingUpdatedAtMs(listing) >= listingUpdatedAtMs(prev)) {
      byId.set(listing.id, listing);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => listingUpdatedAtMs(b) - listingUpdatedAtMs(a),
  );
}

export async function fetchManageableListings(
  authUserId: string | null,
  authUserEmail: string | null,
): Promise<ListingDraft[]> {
  const hostIds = getManageableHostIds(authUserId, authUserEmail);
  const local = loadManageableListings(authUserId, authUserEmail);
  if (hostIds.length === 0) {
    return local;
  }
  try {
    const remote = await fetchListingsByOwnerIdsRemote(hostIds);
    // Never replace local inventory with an empty/stale remote — that hid just-published listings.
    return mergeManageableListings(local, remote);
  } catch {
    return local;
  }
}

export function countOwnListings(authUserId: string | null): number {
  const ownId = resolveHostAccountId(authUserId);
  return countPublishedListingsForHost(ownId);
}
