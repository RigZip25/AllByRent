import { recordManualBookingResponse } from "./bookingRequestsStorage";
import { getMessages } from "./i18n";
import { getHomeLocation } from "./listingStorage";
import { createNotificationRemote } from "./notificationsStorage";
import { updateBooking, type RentalBooking } from "./rentalsStorage";
import { cancelRentalPayment, captureRentalPayment } from "./stripePayments";
import type { RentalAgreementRecord } from "./rentalAgreement";

function refundNote(booking: RentalBooking): string {
  const t = getMessages().booking;
  if (booking.stripePayment || booking.paymentOnHold) {
    return t.refundNotePayment;
  }
  return t.refundNoteNone;
}

export async function approveRentalBooking(
  booking: RentalBooking,
  hostUserId: string,
  options?: { rentalAgreement?: RentalAgreementRecord | null },
): Promise<void> {
  const t = getMessages().booking;
  if (booking.stripePayment || booking.paymentOnHold) {
    const captured = await captureRentalPayment(booking.id);
    if (!captured.ok) {
      throw new Error(captured.reason ?? t.captureFailed);
    }
  }

  const home = getHomeLocation();
  const handoffPatch: Partial<RentalBooking> = {
    status: "pending_checkin",
    pickupWindowStart: new Date().toISOString(),
    approvalDeadline: undefined,
    paymentOnHold: false,
  };
  if (options?.rentalAgreement) {
    handoffPatch.rentalAgreement = options.rentalAgreement;
  }
  // Stamp host home as handoff point so renter PIN unlock can be geo-gated (Turo-safe).
  if (
    home &&
    Number.isFinite(home.lat) &&
    Number.isFinite(home.lng) &&
    !(home.lat === 0 && home.lng === 0)
  ) {
    handoffPatch.handoffLat = home.lat;
    handoffPatch.handoffLng = home.lng;
    if (!booking.pickupAddress?.trim() && home.displayName?.trim()) {
      handoffPatch.pickupAddress = home.displayName.trim();
    }
  }
  updateBooking(booking.id, handoffPatch);
  recordManualBookingResponse(booking.id, hostUserId, "approved");
  await createNotificationRemote({
    recipientId: booking.counterpartyId,
    actorId: hostUserId,
    type: "booking_request",
    title: t.approvedTitle,
    body: t.approvedBody(booking.itemTitle),
    rentalId: booking.id,
    listingId: booking.listingId,
  });
}

export async function declineRentalBooking(
  booking: RentalBooking,
  hostUserId: string,
): Promise<void> {
  const t = getMessages().booking;
  updateBooking(booking.id, { status: "cancelled", paymentOnHold: false });
  recordManualBookingResponse(booking.id, hostUserId, "declined");
  void cancelRentalPayment(booking.id);
  await createNotificationRemote({
    recipientId: booking.counterpartyId,
    actorId: hostUserId,
    type: "booking_request",
    title: t.declinedTitle,
    body: t.declinedBody(booking.itemTitle, refundNote(booking)),
    rentalId: booking.id,
    listingId: booking.listingId,
  });
}

export async function cancelRentalRequest(
  booking: RentalBooking,
  renterUserId: string,
): Promise<void> {
  const t = getMessages().booking;
  updateBooking(booking.id, { status: "cancelled", paymentOnHold: false });
  void cancelRentalPayment(booking.id);
  await createNotificationRemote({
    recipientId: booking.counterpartyId,
    actorId: renterUserId,
    type: "booking_request",
    title: t.cancelledTitle,
    body: t.cancelledBody(booking.itemTitle),
    rentalId: booking.id,
    listingId: booking.listingId,
  });
}

export function cancelRefundLabel(booking: RentalBooking): string {
  const t = getMessages().rentalCard;
  if (booking.stripePayment || booking.paymentOnHold) {
    return t.cancelRequestRelease;
  }
  return t.cancelRequest;
}
