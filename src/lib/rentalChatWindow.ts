/**
 * Active-rental chat lifecycle: open during the trip; auto-close (read-only)
 * when completed — except Vehicles / commercial / fuel rentals, which keep an
 * extended post-rental window for tolls & fines (configurable days).
 */

import type { ListingDraft } from "../screens/listing/types";
import {
  isCommercialEquipmentCategory,
  listingIsCommercialTransport,
} from "./listingRentRules";
import { defaultFuelPolicySnapshot } from "./rentalFuelPolicy";
import type { RentalBooking, RentalInvoice } from "./rentalsStorage";

/** Default post-rental writable window for vehicles / fuel / commercial (days). */
export const POST_RENTAL_CHAT_DAYS_DEFAULT = 45;

/** Clamp host/ops overrides into the product range (30–60 days). */
export function clampPostRentalChatDays(raw: number | null | undefined): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return POST_RENTAL_CHAT_DAYS_DEFAULT;
  return Math.min(60, Math.max(30, Math.round(raw)));
}

export type RentalChatMode = "open" | "post_rental_tolls" | "closed";

export type RentalChatWindow = {
  mode: RentalChatMode;
  /** True when the composer is disabled (history still visible). */
  readOnly: boolean;
  /** ISO deadline while in post_rental_tolls; null otherwise. */
  openUntilIso: string | null;
  extendedDays: number;
};

function listingGetsExtendedPostRentalChat(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs"> | null | undefined,
): boolean {
  if (!listing) return false;
  const cat = listing.category?.trim() ?? "";
  if (cat === "Vehicles") return true;
  if (isCommercialEquipmentCategory(cat)) return true;
  if (listingIsCommercialTransport(listing)) return true;
  // Fuel-consuming powered gear (boats, etc.) — plate/toll-like late bills less common,
  // but fuel shortfalls + fines still need host↔renter correspondence after return.
  if (defaultFuelPolicySnapshot(listing) != null) return true;
  return false;
}

function rentalEndAnchorIso(booking: RentalBooking): string {
  return (
    booking.completedAt ||
    booking.returnConfirmedAt ||
    booking.hostAcceptedReturnAt ||
    booking.renterReturnedAt ||
    `${booking.endDate}T23:59:59.999Z`
  );
}

function hasOpenInvoice(invoices: RentalInvoice[] | null | undefined): boolean {
  if (!Array.isArray(invoices) || invoices.length === 0) return false;
  return invoices.some((inv) => inv.status === "open" || inv.status === "payment_pending");
}

/**
 * Resolve chat writability for a booking + listing.
 * Non-vehicles: closed (read-only) once completed/cancelled.
 * Vehicles / commercial / fuel: writable for `extendedDays` after return, or
 * while an invoice is still open / payment_pending.
 */
export function resolveRentalChatWindow(params: {
  booking: RentalBooking;
  listing?: Pick<
    ListingDraft,
    "category" | "subcategory" | "handoff" | "modes" | "categorySpecs"
  > | null;
  /** Override default 45 (clamped to 30–60). */
  extendedDays?: number;
}): RentalChatWindow {
  const { booking, listing } = params;
  const extendedDays = clampPostRentalChatDays(params.extendedDays);
  const status = booking.status;

  const tripOpen =
    status === "pending_approval" ||
    status === "pending_checkin" ||
    status === "upcoming" ||
    status === "active" ||
    status === "overdue" ||
    status === "disputed" ||
    (status === "no_show" && !booking.noShowMarkedAt);

  if (tripOpen) {
    return { mode: "open", readOnly: false, openUntilIso: null, extendedDays };
  }

  const tripNeverStarted = !booking.hostHandedOverAt && !booking.pickupConfirmedAt;

  if (status === "cancelled" && tripNeverStarted) {
    return { mode: "closed", readOnly: true, openUntilIso: null, extendedDays };
  }

  if (status === "no_show" && booking.noShowMarkedAt && tripNeverStarted) {
    return { mode: "closed", readOnly: true, openUntilIso: null, extendedDays };
  }

  if (status !== "completed") {
    return { mode: "closed", readOnly: true, openUntilIso: null, extendedDays };
  }

  if (!listingGetsExtendedPostRentalChat(listing)) {
    return { mode: "closed", readOnly: true, openUntilIso: null, extendedDays };
  }

  const endMs = new Date(rentalEndAnchorIso(booking)).getTime();
  const untilMs = (Number.isFinite(endMs) ? endMs : Date.now()) + extendedDays * 86_400_000;
  const openUntilIso = new Date(untilMs).toISOString();
  const withinWindow = Date.now() <= untilMs;
  const invoiceKeepsOpen = hasOpenInvoice(booking.invoices);

  if (withinWindow || invoiceKeepsOpen) {
    return {
      mode: "post_rental_tolls",
      readOnly: false,
      openUntilIso,
      extendedDays,
    };
  }

  return { mode: "closed", readOnly: true, openUntilIso, extendedDays };
}
