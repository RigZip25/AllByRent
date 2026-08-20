import { SUPPORT_EMAIL } from "./brand";
import {
  assessCancelRefund,
  canCancelAcceptedBooking,
  refundCentsFromTotal,
  type CancelRefundAssessment,
} from "./cancellationPolicy";
import { getMessages } from "./i18n";
import { createNotificationRemote } from "./notificationsStorage";
import { updateBooking, type RentalBooking } from "./rentalsStorage";
import { refundRentalPayment, releaseDepositHold } from "./stripePayments";

export type CancelRefundUiStatus =
  | "none"
  | "released"
  | "refund_submitted"
  | "processing"
  | "contact_support";

export type CancelAcceptedResult = {
  ok: boolean;
  reason?: string;
  assessment: CancelRefundAssessment;
  refundStatus: CancelRefundUiStatus;
};

export { canCancelAcceptedBooking, assessCancelRefund };

function notifyBodyForRefund(status: CancelRefundUiStatus, percent: number): string {
  const t = getMessages().rentalDetail;
  if (status === "released") return t.cancelRefundReleased;
  if (status === "refund_submitted" || status === "processing") {
    return percent >= 100
      ? t.cancelRefundFullProcessing
      : t.cancelRefundPartialProcessing(percent);
  }
  if (status === "none") return t.cancelRefundNone;
  return t.cancelRefundContactSupport;
}

async function settlePaymentOnCancel(params: {
  booking: RentalBooking;
  refundPercent: number;
}): Promise<CancelRefundUiStatus> {
  const { booking, refundPercent } = params;
  const hasPayment = Boolean(booking.stripePayment || booking.paymentOnHold);
  if (!hasPayment) return "none";

  const amountCents = refundCentsFromTotal(booking.totalUsd, refundPercent);
  const refunded = await refundRentalPayment({
    rentalId: booking.id,
    amountCents: amountCents > 0 ? amountCents : undefined,
    percent: refundPercent,
  });

  if (!refunded.ok) return "contact_support";
  if (refunded.refundStatus === "released") return "released";
  if (refunded.refundStatus === "none") return "none";
  if (refunded.refundStatus === "contact_support") return "contact_support";
  if (refunded.refundStatus === "refund_submitted") return "refund_submitted";
  return "processing";
}

/**
 * Cancel a confirmed (post-accept) booking before pickup handoff.
 * Sets status cancelled (frees calendar via busy-interval trigger), clears payment holds when possible.
 */
export async function cancelAcceptedBooking(params: {
  booking: RentalBooking;
  actorUserId: string;
  role: "host" | "renter";
  cancelReason?: string;
}): Promise<CancelAcceptedResult> {
  const t = getMessages();
  const assessment = assessCancelRefund({
    booking: params.booking,
    role: params.role,
  });

  if (!assessment.allowed) {
    return {
      ok: false,
      reason: t.rentalDetail.cancelNotAllowed,
      assessment,
      refundStatus: "none",
    };
  }

  const refundStatus = await settlePaymentOnCancel({
    booking: params.booking,
    refundPercent: assessment.refundPercent,
  });

  // Best-effort deposit release (uncaptured hold).
  if (params.booking.depositStatus === "held" || params.booking.depositAmountCents) {
    void releaseDepositHold(params.booking.id);
  }

  const cancelledAt = new Date().toISOString();
  const trimmedReason = params.cancelReason?.trim() || undefined;
  updateBooking(params.booking.id, {
    status: "cancelled",
    paymentOnHold: false,
    cancelledAt,
    cancelledBy: params.role,
    cancelReason: trimmedReason,
    hostCancelReliabilityNote:
      params.role === "host" ? t.rentalDetail.hostReliabilityNote : undefined,
    cancelRefundPercent: assessment.refundPercent,
    cancelRefundStatus: refundStatus,
    depositStatus: params.booking.depositStatus === "held" ? "released" : params.booking.depositStatus,
  });

  const recipientId = params.booking.counterpartyId;
  const title =
    params.role === "host"
      ? t.rentalDetail.cancelNotifHostTitle
      : t.rentalDetail.cancelNotifRenterTitle;
  const refundNote = notifyBodyForRefund(refundStatus, assessment.refundPercent);
  const reasonNote = trimmedReason ? ` ${t.rentalDetail.cancelReasonInNotif(trimmedReason)}` : "";
  const body = t.rentalDetail.cancelNotifBody(
    params.booking.itemTitle,
    `${refundNote}${reasonNote}`,
  );

  await createNotificationRemote({
    recipientId,
    actorId: params.actorUserId,
    type: "booking_request",
    title,
    body,
    rentalId: params.booking.id,
    listingId: params.booking.listingId,
  });

  return { ok: true, assessment, refundStatus };
}

export function cancelSupportMailto(rentalId: string, itemTitle?: string): string {
  const subject = encodeURIComponent(`Cancellation / refund — rental ${rentalId}`);
  const body = encodeURIComponent(
    [
      "Hello Evorios support,",
      "",
      "I need help with a cancellation refund.",
      `Rental ID: ${rentalId}`,
      itemTitle ? `Item: ${itemTitle}` : null,
      "",
      "Please describe what you expected:",
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}
