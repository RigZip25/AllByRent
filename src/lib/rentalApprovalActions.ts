import { recordManualBookingResponse } from "./bookingRequestsStorage";
import { createNotificationRemote } from "./notificationsStorage";
import { updateBooking, type RentalBooking } from "./rentalsStorage";
import { cancelRentalPayment } from "./stripePayments";

function refundNote(booking: RentalBooking): string {
  if (booking.stripePayment || booking.paymentOnHold) {
    return "Any authorized payment will be released — refunds may take a few business days.";
  }
  return "No payment was charged for this request.";
}

export async function approveRentalBooking(
  booking: RentalBooking,
  hostUserId: string,
): Promise<void> {
  updateBooking(booking.id, {
    status: "pending_checkin",
    pickupWindowStart: new Date().toISOString(),
    approvalDeadline: undefined,
    paymentOnHold: false,
  });
  recordManualBookingResponse(booking.id, hostUserId, "approved");
  await createNotificationRemote({
    recipientId: booking.counterpartyId,
    actorId: hostUserId,
    type: "booking_request",
    title: "Booking approved",
    body: `${booking.itemTitle} is confirmed — open Rentals for pickup PIN and details.`,
    rentalId: booking.id,
    listingId: booking.listingId,
  });
}

export async function declineRentalBooking(
  booking: RentalBooking,
  hostUserId: string,
): Promise<void> {
  updateBooking(booking.id, { status: "cancelled", paymentOnHold: false });
  recordManualBookingResponse(booking.id, hostUserId, "declined");
  void cancelRentalPayment(booking.id);
  await createNotificationRemote({
    recipientId: booking.counterpartyId,
    actorId: hostUserId,
    type: "booking_request",
    title: "Request declined",
    body: `Your request for ${booking.itemTitle} was declined. ${refundNote(booking)}`,
    rentalId: booking.id,
    listingId: booking.listingId,
  });
}

export async function cancelRentalRequest(
  booking: RentalBooking,
  renterUserId: string,
): Promise<void> {
  updateBooking(booking.id, { status: "cancelled", paymentOnHold: false });
  void cancelRentalPayment(booking.id);
  await createNotificationRemote({
    recipientId: booking.counterpartyId,
    actorId: renterUserId,
    type: "booking_request",
    title: "Booking request cancelled",
    body: `The renter cancelled their request for ${booking.itemTitle}.`,
    rentalId: booking.id,
    listingId: booking.listingId,
  });
}

export function cancelRefundLabel(booking: RentalBooking): string {
  if (booking.stripePayment || booking.paymentOnHold) {
    return "Cancel request (release payment)";
  }
  return "Cancel request";
}
