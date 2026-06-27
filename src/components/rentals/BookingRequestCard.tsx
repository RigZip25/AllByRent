import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import { useNow } from "../../hooks/useNow";
import { approveRentalBooking, declineRentalBooking } from "../../lib/rentalApprovalActions";
import { formatCountdownShort, getCountdownParts } from "../../lib/rentalTiming";
import {
  formatRentalDateRange,
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
  const auth = useAuth();
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const now = useNow(30_000);
  const timerLabel = useMemo(() => {
    if (!booking.approvalDeadline) return "Auto-cancelled soon";
    const parts = getCountdownParts(booking.approvalDeadline, now);
    if (parts.totalMs <= 0) return "Auto-cancelled soon";
    return `Auto-cancelled in ${formatCountdownShort(parts)}`;
  }, [booking.approvalDeadline, now]);

  const run = async (action: "approve" | "decline") => {
    const hostUserId = auth.userId;
    if (!hostUserId || busy) return;
    setBusy(action);
    try {
      if (action === "approve") {
        await approveRentalBooking(booking, hostUserId);
      } else {
        await declineRentalBooking(booking, hostUserId);
      }
      onRefresh();
    } finally {
      setBusy(null);
    }
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
            {booking.deliveryRequested && booking.deliveryFee
              ? ` (incl. $${booking.deliveryFee} delivery)`
              : ""}
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
      {booking.paymentOnHold ? (
        <p className="mb-3 text-[12px] text-gray-500">
          Renter payment is authorized — it is not captured until you approve.
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void run("approve")}
          className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          {busy === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void run("decline")}
          className="flex-1 rounded-xl border py-2.5 text-[14px] font-semibold text-gray-600 disabled:opacity-60"
          style={{ borderColor: BORDER }}
        >
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </article>
  );
}
