import { getMessages } from "./i18n";
import { getPublishedListingById } from "./listingStorage";
import { createNotificationRemote } from "./notificationsStorage";
import {
  buildHostNoShowPatch,
  buildSoftNoShowSuggestPatch,
  canSuggestSoftNoShow,
} from "./noShowPolicy";
import { formatMoney } from "./regionalDisplay";
import { updateBooking, type RentalBooking } from "./rentalsStorage";
import { claimDepositHold, releaseDepositHold } from "./stripePayments";

/**
 * Host confirms no-show: free calendar, keep trip price, optional deposit fee.
 */
export async function completeHostNoShow(params: {
  booking: RentalBooking;
  actorUserId: string;
  reason?: string;
}): Promise<{ ok: boolean }> {
  const listing = params.booking.listingId
    ? getPublishedListingById(params.booking.listingId)
    : null;
  const patch = buildHostNoShowPatch({
    booking: params.booking,
    listing,
    reason: params.reason,
  });

  updateBooking(params.booking.id, patch);

  if (
    patch.noShowFeeCents &&
    patch.noShowFeeCents > 0 &&
    params.booking.depositAmountCents &&
    params.booking.depositAmountCents >= 50
  ) {
    const result = await claimDepositHold(params.booking.id, {
      amountCents: patch.noShowFeeCents,
      reason: "no_show_fee",
    });
    updateBooking(params.booking.id, {
      noShowFeeStatus: result.ok ? "claimed" : "flagged",
    });
  } else if (
    patch.depositStatus === "released" ||
    (params.booking.depositStatus === "held" && !patch.noShowFeeCents)
  ) {
    void releaseDepositHold(params.booking.id);
  }

  const t = getMessages();
  const feeNote =
    patch.noShowFeeCents && patch.noShowFeeCents > 0
      ? t.rentalCard.markNoShowFeeNote(formatMoney(patch.noShowFeeCents / 100))
      : "";

  await createNotificationRemote({
    recipientId: params.booking.counterpartyId,
    actorId: params.actorUserId,
    type: "booking_request",
    title: t.rentalCard.noShowMarkedNotifTitle,
    body: t.rentalCard.noShowMarkedNotifBody(params.booking.itemTitle, feeNote),
    rentalId: params.booking.id,
    listingId: params.booking.listingId,
  });

  return { ok: true };
}

/** Apply soft no-show status once per eligible booking (local + remote patch). */
export function applySoftNoShowSuggestions(bookings: RentalBooking[]): RentalBooking[] {
  return bookings.map((booking) => {
    if (!canSuggestSoftNoShow(booking)) return booking;
    const patch = buildSoftNoShowSuggestPatch(new Date().toISOString());
    updateBooking(booking.id, patch);
    return { ...booking, ...patch };
  });
}
