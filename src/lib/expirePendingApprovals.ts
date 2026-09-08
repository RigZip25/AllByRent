import { recordManualBookingExpired } from "./bookingRequestsStorage";
import { createNotificationRemote } from "./notificationsStorage";
import { loadRentalBookings, updateBooking, type RentalBooking } from "./rentalsStorage";
import { cancelRentalPayment } from "./stripePayments";

const MS_DAY = 24 * 60 * 60 * 1000;

function partiesForBooking(
  booking: RentalBooking,
  viewerUserId: string,
): { hostId: string; renterId: string } {
  if (booking.role === "renter") {
    return { hostId: booking.counterpartyId, renterId: viewerUserId };
  }
  return { hostId: viewerUserId, renterId: booking.counterpartyId };
}

/**
 * When an unanswered request auto-cancels.
 *
 * The cron measures 24 hours from `created_at`, so the app has to read the same
 * clock: a deadline stamped on the device drifts from the row the server sees.
 */
export function approvalDeadlineMs(booking: RentalBooking): number | null {
  const fromCreatedAt = booking.createdAt
    ? new Date(booking.createdAt).getTime() + MS_DAY
    : Number.NaN;
  if (Number.isFinite(fromCreatedAt)) return fromCreatedAt;
  const stored = booking.approvalDeadline ? new Date(booking.approvalDeadline).getTime() : Number.NaN;
  return Number.isFinite(stored) ? stored : null;
}

export function approvalDeadlineIso(booking: RentalBooking): string | null {
  const ms = approvalDeadlineMs(booking);
  return ms == null ? null : new Date(ms).toISOString();
}

function isApprovalExpired(booking: RentalBooking, now = Date.now()): boolean {
  if (booking.status !== "pending_approval") return false;
  const deadline = approvalDeadlineMs(booking);
  return deadline != null && deadline <= now;
}

export async function expirePendingApprovalBooking(
  booking: RentalBooking,
  hostId: string,
  renterId: string,
): Promise<void> {
  updateBooking(booking.id, { status: "cancelled", paymentOnHold: false });
  recordManualBookingExpired(booking.id, hostId);
  void cancelRentalPayment(booking.id);

  if (renterId) {
    await createNotificationRemote({
      recipientId: renterId,
      actorId: null,
      type: "booking_request",
      title: "Booking request expired",
      body: `No response within 24h — your request for ${booking.itemTitle} was cancelled.${
        booking.paymentOnHold || booking.stripePayment
          ? " Any authorized payment has been released."
          : ""
      }`,
      rentalId: booking.id,
      listingId: booking.listingId,
    });
  }

  if (hostId && hostId !== renterId) {
    await createNotificationRemote({
      recipientId: hostId,
      actorId: null,
      type: "booking_request",
      title: "Request expired",
      body: `A booking request for ${booking.itemTitle} auto-cancelled after 24h without a response.`,
      rentalId: booking.id,
      listingId: booking.listingId,
    });
  }
}

export async function expireStalePendingApprovals(viewerUserId?: string | null): Promise<number> {
  if (!viewerUserId) return 0;

  const bookings = loadRentalBookings();
  let expired = 0;

  for (const booking of bookings) {
    if (!isApprovalExpired(booking)) continue;
    const { hostId, renterId } = partiesForBooking(booking, viewerUserId);
    await expirePendingApprovalBooking(booking, hostId, renterId);
    expired += 1;
  }

  return expired;
}

export function approvalDeadlineFromCreatedAt(createdAt: string): string {
  return new Date(new Date(createdAt).getTime() + MS_DAY).toISOString();
}
