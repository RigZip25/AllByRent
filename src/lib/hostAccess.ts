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
 * Active garage for stocking / Live / shelf chrome.
 * Default is always YOUR garage. Prefer a co-hosted garage only after an
 * explicit switch (or a temporary prefer after accepting an invite).
 * Barbara helping her daughter: keep own home garage, switch when helping.
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

  return ownId;
}

export function getActiveGarageHostId(
  authUserId: string | null,
  authUserEmail: string | null,
): string {
  return resolveGarageHostId(authUserId, authUserEmail);
}

/** True when the signed-in user owns the active (or given) garage — not only helping. */
export function isGaragePrimaryOwner(
  authUserId: string | null,
  garageHostId?: string | null,
): boolean {
  const ownId = resolveHostAccountId(authUserId);
  if (!ownId) return false;
  const target = (garageHostId ?? "").trim() || ownId;
  return target === ownId;
}

export function setActiveGarageHostId(hostId: string): void {
  const id = hostId.trim();
  if (!id) return;
  try {
    localStorage.setItem(ACTIVE_GARAGE_HOST_KEY, id);
    window.dispatchEvent(new CustomEvent("allbyrent:active-garage", { detail: { hostId: id } }));
  } catch {
    /* ignore */
  }
}

export function clearActiveGarageHostPreference(): void {
  try {
    localStorage.removeItem(ACTIVE_GARAGE_HOST_KEY);
    window.dispatchEvent(new CustomEvent("allbyrent:active-garage", { detail: { hostId: "" } }));
  } catch {
    /* ignore */
  }
}

export function onActiveGarageChanged(listener: (hostId: string) => void): () => void {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ hostId?: string }>).detail;
    listener((detail?.hostId ?? "").trim());
  };
  window.addEventListener("allbyrent:active-garage", handler);
  return () => window.removeEventListener("allbyrent:active-garage", handler);
}

/** Shelf rows for the garage currently selected in the switcher. */
export function loadActiveGarageListings(
  authUserId: string | null,
  authUserEmail: string | null,
): ListingDraft[] {
  const garageId = resolveGarageHostId(authUserId, authUserEmail);
  return loadManageableListings(authUserId, authUserEmail).filter(
    (listing) => getListingHostId(listing) === garageId || (!getListingHostId(listing) && garageId === resolveHostAccountId(authUserId)),
  );
}

export async function fetchActiveGarageListings(
  authUserId: string | null,
  authUserEmail: string | null,
): Promise<ListingDraft[]> {
  const garageId = resolveGarageHostId(authUserId, authUserEmail);
  const all = await fetchManageableListings(authUserId, authUserEmail);
  return all.filter(
    (listing) =>
      getListingHostId(listing) === garageId ||
      (!getListingHostId(listing) && garageId === resolveHostAccountId(authUserId)),
  );
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
