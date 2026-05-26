import { useMemo } from "react";
import { useNow } from "../../hooks/useNow";
import { formatCountdownShort, getCountdownParts } from "../../lib/rentalTiming";
import { pushInAppNotification } from "../../lib/inAppNotifications";
import {
  formatRentalDateRange,
  updateBooking,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { CounterpartyName } from "../trust/CounterpartyName";
import { InsuredLabel } from "./InsuredLabel";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

export function BookingRequestCard({
  booking,
  onRefresh,
  onViewProfile,
}: {
  booking: RentalBooking;
  onRefresh: () => void;
  onViewProfile: (userId: string) => void;
}) {
  const now = useNow(30_000);
  const timerLabel = useMemo(() => {
    if (!booking.approvalDeadline) return "Auto-cancelled soon";
    const parts = getCountdownParts(booking.approvalDeadline, now);
    if (parts.totalMs <= 0) return "Auto-cancelled soon";
    return `Auto-cancelled in ${formatCountdownShort(parts)}`;
  }, [booking.approvalDeadline, now]);

  const approve = () => {
    updateBooking(booking.id, {
      status: "pending_checkin",
      pickupWindowStart: new Date().toISOString(),
      approvalDeadline: undefined,
    });
    pushInAppNotification({
      type: "booking_request",
      title: "Booking approved",
      body: `${booking.counterpartyName} was notified — pickup details sent.`,
    });
    onRefresh();
  };

  const decline = () => {
    updateBooking(booking.id, { status: "cancelled" });
    pushInAppNotification({
      type: "booking_request",
      title: "Request declined",
      body: `${booking.counterpartyName} received a full refund.`,
    });
    onRefresh();
  };

  return (
    <article className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <div className="mb-3 flex gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: SURFACE }}
        >
          {booking.itemEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold" style={{ color: GREEN }}>
            {booking.itemTitle}
          </p>
          <p className="text-[13px] text-gray-500">
            {formatRentalDateRange(booking.startDate, booking.endDate)} · ${booking.totalUsd}
          </p>
          <p className="mt-1 text-[13px]">
            <CounterpartyName
              name={booking.counterpartyName}
              identityVerified={booking.counterpartyIdentityVerified}
              phoneVerified={booking.counterpartyPhoneVerified}
              onClick={() => onViewProfile(booking.counterpartyId)}
            />
          </p>
          <InsuredLabel modes={booking.listingModes} compact />
        </div>
      </div>

      <p className="mb-3 text-[12px] font-semibold text-amber-700">{timerLabel}</p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={approve}
          className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={decline}
          className="flex-1 rounded-xl border py-2.5 text-[14px] font-semibold text-gray-600"
          style={{ borderColor: BORDER }}
        >
          Decline
        </button>
      </div>
    </article>
  );
}
