import { expireStalePendingApprovals } from "./expirePendingApprovals";
import { canAutoCancelNoShow } from "./noShowPolicy";
import { applySoftNoShowSuggestions } from "./rentalNoShowActions";
import { loadRentalBookings, updateBooking, type RentalBooking } from "./rentalsStorage";

/**
 * The deadlines a rental passes on its own.
 *
 * A request expires 24 hours after it is made, a pickup nobody turned up for
 * becomes a no-show after two, and a no-show the host never confirms cancels
 * itself after a day. The server runs all three from cron — but only for
 * projects with a database, and only for rows it has; the client held the same
 * rules in `noShowPolicy` and called none of them, so a device offline for a
 * week showed a booking still waiting for an answer that expired on Tuesday.
 *
 * This is that sweep, run where the app knows about rentals at all rather than
 * only when the rentals screen happens to be opened. It is deliberately
 * idempotent and notification-free on the no-show path: the cron owns telling
 * people, this only makes the screen agree with the deadline that has passed.
 */

/** Cheap enough to run on every resume, but not on every render. */
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

let lastSweepAt = 0;
let inFlight: Promise<RentalBooking[]> | null = null;

function autoCancelStaleNoShows(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.map((booking) => {
    if (!canAutoCancelNoShow(booking)) return booking;
    const now = new Date().toISOString();
    const patch: Partial<RentalBooking> = {
      status: "cancelled",
      cancelledAt: now,
      cancelReason: "no_show",
      cancelRefundPercent: 0,
      cancelRefundStatus: "none",
    };
    updateBooking(booking.id, patch);
    return { ...booking, ...patch };
  });
}

export async function runRentalLifecycleSweep(
  userId: string | null | undefined,
  options: { force?: boolean } = {},
): Promise<RentalBooking[]> {
  if (!userId) return loadRentalBookings();
  if (inFlight) return inFlight;

  const now = Date.now();
  if (!options.force && now - lastSweepAt < SWEEP_INTERVAL_MS) {
    return loadRentalBookings();
  }
  lastSweepAt = now;

  inFlight = (async () => {
    // Expiry first: a request that ran out never becomes a no-show.
    await expireStalePendingApprovals(userId).catch(() => 0);
    const suggested = applySoftNoShowSuggestions(loadRentalBookings());
    return autoCancelStaleNoShows(suggested);
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/** For tests and for a sign-out, which should not inherit the last sweep. */
export function resetRentalLifecycleSweep(): void {
  lastSweepAt = 0;
  inFlight = null;
}
