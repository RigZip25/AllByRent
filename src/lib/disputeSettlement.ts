import { getMessages } from "./i18n";
import { createNotificationRemote } from "./notificationsStorage";
import { releaseDepositHoldIfLive, hasLiveDepositHold } from "./depositSettlement";
import { updateBooking, type RentalBooking } from "./rentalsStorage";
import type { DisputeResolutionOutcome } from "./disputesStorage";

/**
 * Doing what the two sides agreed the dispute meant.
 *
 * Resolving one used to close the rental and stop there, with the deposit still
 * held: the renter's money sat on their card whichever way the argument went,
 * until the authorization lapsed weeks later. The outcome now decides the hold.
 *
 * The host winning does not capture anything by itself — no one agreed on an
 * amount, only on who is owed — so it opens the claim window instead, and the
 * cron lifts whatever is left when the window closes.
 */

/** Hours the host has to claim after winning a dispute; matches the cron. */
const CLAIM_WINDOW_HOURS = 48;

export type DisputeSettlement = {
  patch: Partial<RentalBooking>;
  /** True when the renter's hold was lifted here and then. */
  depositReleased: boolean;
};

export async function settleResolvedDispute(params: {
  booking: RentalBooking;
  outcome: DisputeResolutionOutcome;
  actorUserId: string;
}): Promise<DisputeSettlement> {
  const { booking, outcome } = params;
  const t = getMessages();
  const now = new Date().toISOString();

  const patch: Partial<RentalBooking> = {
    status: "completed",
    completedAt: now,
    paymentOnHold: false,
    disputeEscalated: false,
  };

  const hostKeepsClaim = outcome === "favor_host" || outcome === "split";

  if (hostKeepsClaim) {
    if (hasLiveDepositHold(booking)) {
      await createNotificationRemote({
        recipientId: booking.role === "host" ? booking.counterpartyId : params.actorUserId,
        actorId: params.actorUserId,
        type: "booking_request",
        title: t.rentalDetail.disputeClaimWindowTitle,
        body: t.rentalDetail.disputeClaimWindowBody(CLAIM_WINDOW_HOURS),
        rentalId: booking.id,
        listingId: booking.listingId,
      });
    }
    updateBooking(booking.id, patch);
    return { patch, depositReleased: false };
  }

  // The renter keeps the deposit: the hold comes off now, not when a cron
  // happens to notice.
  const depositStatus = await releaseDepositHoldIfLive(booking);
  const released = depositStatus === "released" && booking.depositStatus !== "released";
  if (depositStatus !== booking.depositStatus) patch.depositStatus = depositStatus;

  updateBooking(booking.id, patch);

  if (released) {
    await createNotificationRemote({
      recipientId: booking.counterpartyId,
      actorId: params.actorUserId,
      type: "booking_request",
      title: t.rentalDetail.disputeDepositReleasedTitle,
      body: t.rentalDetail.disputeDepositReleasedBody,
      rentalId: booking.id,
      listingId: booking.listingId,
    });
  }

  return { patch, depositReleased: released };
}
