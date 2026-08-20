/**
 * Extension + early return — product capability for every rental category.
 * Extension only when the new end date stays free on the listing calendar.
 */

import {
  addDaysIso,
  daysInclusive,
  fetchListingBusyIntervals,
  isRangeBusy,
  parseIsoDateLocal,
  todayIsoLocal,
  type BusyInterval,
} from "./availabilityBusy";
import type { RentalBooking } from "./rentalsStorage";

export type ExtendAvailabilityResult =
  | { ok: true; extraDays: number; newEndDate: string }
  | { ok: false; reason: "invalid" | "not_later" | "busy" | "no_listing" };

export type EarlyReturnResult =
  | { ok: true; newEndDate: string; daysShortened: number }
  | { ok: false; reason: "invalid" | "not_earlier" | "before_start" | "not_active" };

/** Days after current endDate that must be free (exclusive of current booking occupancy). */
export function extensionProbeInterval(
  currentEndDate: string,
  newEndDate: string,
): BusyInterval | null {
  if (!parseIsoDateLocal(currentEndDate) || !parseIsoDateLocal(newEndDate)) return null;
  if (newEndDate <= currentEndDate) return null;
  const probeStart = addDaysIso(currentEndDate, 1);
  if (probeStart > newEndDate) return null;
  return { start: probeStart, end: newEndDate };
}

/**
 * Check whether a booking can extend to `newEndDate`.
 * Busy intervals from the listing include this rental — strip the current end day
 * so we only test the *new* days beyond the existing booking.
 */
export async function canExtendRental(params: {
  booking: Pick<RentalBooking, "id" | "listingId" | "endDate" | "status">;
  newEndDate: string;
  fallbackBlocked?: BusyInterval[] | null;
}): Promise<ExtendAvailabilityResult> {
  const { booking, newEndDate } = params;
  if (!booking.listingId) return { ok: false, reason: "no_listing" };
  if (!parseIsoDateLocal(newEndDate)) return { ok: false, reason: "invalid" };
  if (newEndDate <= booking.endDate) return { ok: false, reason: "not_later" };

  const probe = extensionProbeInterval(booking.endDate, newEndDate);
  if (!probe) return { ok: false, reason: "invalid" };

  const busy = await fetchListingBusyIntervals(booking.listingId, params.fallbackBlocked);
  // Current booking occupies through endDate — ignore intervals that only cover the existing rental
  // by checking the probe range against busy, but subtract this booking's own occupancy if present.
  const withoutSelf = busy.intervals.filter(
    (interval) => !(interval.start === booking.endDate && interval.end === booking.endDate),
  );
  // Also drop any busy row that exactly matches a typical single booking span ending on current end —
  // safer: for each busy interval, if it ends on booking.endDate and starts on/before, clip end to endDate
  // so days after remain free to re-check.
  const clipped: BusyInterval[] = withoutSelf.map((interval) => {
    if (interval.end === booking.endDate || interval.end < booking.endDate) {
      // Ends on or before current booking end — does not block extension days.
      return interval;
    }
    if (interval.start <= booking.endDate && interval.end > booking.endDate) {
      // Overlaps current booking into future — treat as busy from day after current end.
      return { start: addDaysIso(booking.endDate, 1), end: interval.end };
    }
    return interval;
  }).filter((interval) => interval.end >= probe.start);

  if (isRangeBusy(probe.start, probe.end, clipped)) {
    return { ok: false, reason: "busy" };
  }

  return {
    ok: true,
    newEndDate,
    extraDays: daysInclusive(probe.start, probe.end),
  };
}

export function canEarlyReturnBooking(params: {
  booking: Pick<RentalBooking, "startDate" | "endDate" | "status">;
  newEndDate?: string;
}): EarlyReturnResult {
  const { booking } = params;
  if (
    booking.status !== "active" &&
    booking.status !== "overdue" &&
    booking.status !== "pending_checkin"
  ) {
    return { ok: false, reason: "not_active" };
  }

  const candidate = params.newEndDate?.trim() || todayIsoLocal();
  if (!parseIsoDateLocal(candidate)) return { ok: false, reason: "invalid" };
  if (candidate < booking.startDate) return { ok: false, reason: "before_start" };
  if (candidate >= booking.endDate) return { ok: false, reason: "not_earlier" };

  return {
    ok: true,
    newEndDate: candidate,
    daysShortened: daysInclusive(addDaysIso(candidate, 1), booking.endDate),
  };
}

/** Statuses where renter/host may request an extension. */
export function bookingAllowsExtension(status: RentalBooking["status"]): boolean {
  return (
    status === "pending_checkin" ||
    status === "upcoming" ||
    status === "active" ||
    status === "overdue"
  );
}

/** Statuses where early return is supported (always, product-wise). */
export function bookingAllowsEarlyReturn(status: RentalBooking["status"]): boolean {
  return status === "active" || status === "overdue" || status === "pending_checkin";
}
