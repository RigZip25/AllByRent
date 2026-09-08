/**
 * Cannot-relist borrowed item v1 — only owner / household co-hosts may list;
 * renters get no list CTA.
 */

import {
  loadRentalBookings,
  type RentalBooking,
  type RentalStatus,
} from "./rentalsStorage";
import { getManageableHostIds } from "./hostAccess";

const ACTIVE_BORROW_STATUSES: RentalStatus[] = [
  "pending_checkin",
  "active",
  "overdue",
  "upcoming",
];

export function isActiveBorrowStatus(status: RentalStatus): boolean {
  return ACTIVE_BORROW_STATUSES.includes(status);
}

/** True when viewer is the renter of this listing (not the owner). */
export function isBorrowedByViewer(opts: {
  listingId?: string | null;
  viewerId?: string | null;
  bookings?: RentalBooking[];
}): boolean {
  const listingId = (opts.listingId ?? "").trim();
  const viewerId = (opts.viewerId ?? "").trim();
  if (!listingId || !viewerId) return false;
  const bookings = opts.bookings ?? loadRentalBookings();
  return bookings.some(
    (b) =>
      b.listingId === listingId &&
      b.role === "renter" &&
      isActiveBorrowStatus(b.status),
  );
}

/** Active borrowals for the viewer (items rented-to-you). */
export function listBorrowedListingIds(viewerId?: string | null): Set<string> {
  const id = (viewerId ?? "").trim();
  const out = new Set<string>();
  if (!id) return out;
  for (const b of loadRentalBookings()) {
    if (b.role !== "renter" || !isActiveBorrowStatus(b.status)) continue;
    if (b.listingId) out.add(b.listingId);
  }
  return out;
}

/** Rental statuses that still hold a claim on the item, from either side. */
const LIVE_RENTAL_STATUSES: RentalStatus[] = [
  "pending_approval",
  "pending_checkin",
  "upcoming",
  "active",
  "overdue",
  "disputed",
  "no_show",
];

/**
 * Rentals on a listing that are not over yet.
 *
 * Deleting a listing takes its rentals with it — the row cascades — so a host
 * about to delete needs to know whether anything is still riding on it. The
 * database refuses the delete outright (migration 059); this is what lets the
 * screen say so before the host tries.
 */
export function countLiveRentalsForListing(opts: {
  listingId?: string | null;
  bookings?: RentalBooking[];
}): number {
  const listingId = (opts.listingId ?? "").trim();
  if (!listingId) return 0;
  const bookings = opts.bookings ?? loadRentalBookings();
  return bookings.filter(
    (booking) =>
      booking.listingId === listingId && LIVE_RENTAL_STATUSES.includes(booking.status),
  ).length;
}

/**
 * Publish guard: listing hostId must be the signer or a garage they co-host;
 * cannot publish as owner of a listing id you are currently borrowing.
 */
export function assertOwnerOnlyPublish(opts: {
  userId: string;
  userEmail?: string | null;
  listingHostId?: string | null;
  listingId: string;
}): { ok: true } | { ok: false; reason: string } {
  const userId = opts.userId.trim();
  if (!userId) {
    return { ok: false, reason: "Sign in to publish your listing." };
  }
  const hostId = (opts.listingHostId ?? "").trim();
  if (hostId && hostId !== userId) {
    const manageable = getManageableHostIds(userId, opts.userEmail ?? null);
    if (!manageable.includes(hostId)) {
      return {
        ok: false,
        reason: "Only the item owner or household co-hosts can publish or update this listing.",
      };
    }
  }
  if (isBorrowedByViewer({ listingId: opts.listingId, viewerId: userId })) {
    return {
      ok: false,
      reason:
        "You're borrowing this item — only the owner can list it. Return it when you're done.",
    };
  }
  return { ok: true };
}
