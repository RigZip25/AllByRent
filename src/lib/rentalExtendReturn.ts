/**
 * Extending a rental, for every category.
 *
 * Only the question of *when* an extension may be asked for lives here. What
 * the extra days cost, and whether the calendar still has them, is decided by
 * `/api/rentals/extend` — the device used to answer both, which is how days
 * the host was still selling ended up given away for free.
 *
 * There is no counterpart for returning early: the rental was paid to its end
 * date, so bringing the item back sooner is the return handoff happening
 * sooner, not a shorter booking.
 */

import type { RentalBooking } from "./rentalsStorage";

/** Statuses where the renter may ask for extra days. */
export function bookingAllowsExtension(status: RentalBooking["status"]): boolean {
  return (
    status === "pending_checkin" ||
    status === "upcoming" ||
    status === "active" ||
    status === "overdue"
  );
}
