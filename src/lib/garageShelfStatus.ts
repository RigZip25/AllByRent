import type { ListingDraft } from "../screens/listing/types";
import { getLotState } from "./garageAuctionState";
import { loadRentalBookings, type RentalBooking } from "./rentalsStorage";
import { getAcceptedOfferForListing } from "./garageOfferStorage";

export type GarageShelfStatusKind =
  | "available"
  | "reserved"
  | "rented"
  | "sold"
  | "paused"
  | "pending_payment";

export type GarageShelfStatus = {
  kind: GarageShelfStatusKind;
  /** Neighbor can still buy / bid / offer / request. */
  actionable: boolean;
};

const RENTED_STATUSES = new Set<RentalBooking["status"]>(["active", "overdue"]);
const RESERVED_STATUSES = new Set<RentalBooking["status"]>([
  "pending_approval",
  "pending_checkin",
  "upcoming",
]);

function bookingsForListing(listingId: string): RentalBooking[] {
  const id = listingId.trim();
  if (!id) return [];
  return loadRentalBookings().filter((b) => (b.listingId ?? "").trim() === id);
}

/**
 * Live shelf status for garage storefront + host dashboard.
 * Priority: sold → rented → reserved → pending payment → paused → available.
 */
export function deriveGarageShelfStatus(listing: ListingDraft): GarageShelfStatus {
  const lot = getLotState(listing.id);
  if (lot.status === "sold") {
    return { kind: "sold", actionable: false };
  }

  const bookings = bookingsForListing(listing.id);
  if (bookings.some((b) => RENTED_STATUSES.has(b.status))) {
    return { kind: "rented", actionable: false };
  }
  if (bookings.some((b) => RESERVED_STATUSES.has(b.status))) {
    return { kind: "reserved", actionable: false };
  }

  if (lot.status === "awaiting_checkout") {
    return { kind: "pending_payment", actionable: false };
  }

  if (getAcceptedOfferForListing(listing.id)) {
    return { kind: "pending_payment", actionable: false };
  }

  if (listing.paused) {
    return { kind: "paused", actionable: false };
  }

  return { kind: "available", actionable: true };
}
