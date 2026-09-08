import type { RentalBooking } from "./rentalsStorage";
import { releaseDepositHold } from "./stripePayments";

/**
 * Settling the hold when a booking ends.
 *
 * Only the payment routes can move the money and only they can write
 * `deposit_status`, so a screen that ends a rental has two jobs: ask the route
 * to lift the hold, and record what came back. Writing "released" whatever
 * happened — which is what cancelling used to do — told the renter their money
 * was free while it was still sitting on their card.
 */

type DepositFields = Pick<RentalBooking, "id" | "depositStatus" | "depositAmountCents">;

/** A hold that is still on the card, as opposed to one already settled. */
export function hasLiveDepositHold(booking: DepositFields): boolean {
  if (!booking.depositAmountCents || booking.depositAmountCents < 50) return false;
  return booking.depositStatus === "held" || booking.depositStatus === "requires_capture";
}

/**
 * Lift the hold if there is one, and return the status to record.
 *
 * A failure keeps the old status: the sweep in the overdue cron lifts holds
 * nobody claimed, so the money is not stuck either way — but the screen should
 * not claim something that did not happen.
 */
export async function releaseDepositHoldIfLive(
  booking: DepositFields,
): Promise<RentalBooking["depositStatus"]> {
  if (!hasLiveDepositHold(booking)) return booking.depositStatus;
  const result = await releaseDepositHold(booking.id);
  return result.ok ? "released" : booking.depositStatus;
}
