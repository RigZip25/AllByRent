import type { ListingDraft } from "../screens/listing/types";
import { getActiveCoHostHostIds } from "./coHostStorage";
import { countPublishedListingsForHost, fetchListingsByOwnerIdsRemote, loadPublishedListings } from "./listingStorage";
import { resolveHostAccountEmail, resolveHostAccountId } from "./hostIdentity";

const LEGACY_HOST_ID = "demo-user";

/** Host id stamped on listings; legacy rows without hostId belong to demo-user. */
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
  return Array.from(new Set([ownId, ...coHostFor]));
}

export function canManageListing(
  listing: ListingDraft,
  authUserId: string | null,
  authUserEmail: string | null,
): boolean {
  const hostIds = getManageableHostIds(authUserId, authUserEmail);
  return hostIds.includes(getListingHostId(listing));
}

export function loadManageableListings(
  authUserId: string | null,
  authUserEmail: string | null,
): ListingDraft[] {
  const hostIds = getManageableHostIds(authUserId, authUserEmail);
  return loadPublishedListings().filter((listing) =>
    hostIds.includes(getListingHostId(listing)),
  );
}

export async function fetchManageableListings(
  authUserId: string | null,
  authUserEmail: string | null,
): Promise<ListingDraft[]> {
  const hostIds = getManageableHostIds(authUserId, authUserEmail);
  return fetchListingsByOwnerIdsRemote(hostIds);
}

export function countOwnListings(authUserId: string | null): number {
  const ownId = resolveHostAccountId(authUserId);
  return countPublishedListingsForHost(ownId);
}
