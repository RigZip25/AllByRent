import { CheckCircle2, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { formatRentalDateRange, loadRentalBookings } from "../../lib/rentalsStorage";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function BookingConfirmedScreen({
  bookingId,
  onHome,
  onRentals,
}: {
  bookingId?: string | null;
  onHome: () => void;
  onRentals: () => void;
}) {
  const booking = useMemo(() => {
    if (!bookingId) return null;
    return loadRentalBookings().find((b) => b.id === bookingId) ?? null;
  }, [bookingId]);

  const dateLabel =
    booking?.startDate && booking?.endDate
      ? formatRentalDateRange(booking.startDate, booking.endDate)
      : null;

  return (
    <div className="screen bg-background flex flex-col">
      <div className="screen-scroll flex-1 min-h-0 p-5 pb-24">
        <div
          className="mx-auto max-w-[420px] rounded-3xl border bg-white p-6 text-center"
          style={{ borderColor: BORDER }}
        >
          <CheckCircle2 className="mx-auto h-12 w-12" style={{ color: GREEN }} />
          <h1 className="mt-3 text-[20px] font-extrabold" style={{ color: GREEN }}>
            Booking request sent
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
            The owner gets notified and will confirm availability. You’ll see status updates in
            Rentals.
          </p>

          {booking ? (
            <div
              className="mt-4 rounded-2xl border bg-[#F0F4F2] p-4 text-left"
              style={{ borderColor: BORDER }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{booking.itemEmoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold" style={{ color: GREEN }}>
                    {booking.itemTitle}
                  </p>
                  <p className="text-[13px] text-gray-500">with {booking.counterpartyName}</p>
                </div>
              </div>
              {dateLabel ? (
                <p className="mt-2 text-[13px] text-gray-600">{dateLabel}</p>
              ) : null}
              {booking.totalUsd != null ? (
                <p className="mt-1 text-[13px] font-semibold text-gray-700">
                  Total ${booking.totalUsd.toFixed(2)}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] text-gray-400">Ref #{booking.id.slice(0, 8)}</p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={onRentals}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              View Rentals
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-[14px] font-semibold text-gray-700"
              style={{ borderColor: BORDER }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
