import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/AuthProvider";
import { useNow } from "../../hooks/useNow";
import { cancelRefundLabel, cancelRentalRequest } from "../../lib/rentalApprovalActions";
import { formatCountdownShort, getCountdownParts } from "../../lib/rentalTiming";
import {
  formatRentalDateRange,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { CounterpartyName } from "../trust/CounterpartyName";
import { InsuredLabel } from "./InsuredLabel";

const GREEN = "#0D5C3A";
const BLUE = "#2563EB";
const BORDER = "#E8E6E0";

export function PendingApprovalCard({
  booking,
  onRefresh,
  onViewProfile,
}: {
  booking: RentalBooking;
  onRefresh: () => void;
  onViewProfile: (userId: string) => void;
}) {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const now = useNow(30_000);
  const ownerTimeLeft = useMemo(() => {
    if (!booking.approvalDeadline) return null;
    const parts = getCountdownParts(booking.approvalDeadline, now);
    if (parts.totalMs <= 0) return "Expired";
    return formatCountdownShort(parts);
  }, [booking.approvalDeadline, now]);

  const handleCancel = async () => {
    const renterUserId = auth.userId;
    if (!renterUserId || busy) return;
    setBusy(true);
    try {
      await cancelRentalRequest(booking, renterUserId);
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-[15px] font-bold" style={{ color: GREEN }}>
          {booking.itemTitle} {booking.itemEmoji}
        </p>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
          style={{ backgroundColor: BLUE }}
        >
          Awaiting approval
        </span>
      </div>
      <p className="text-[13px] text-gray-500">
        {formatRentalDateRange(booking.startDate, booking.endDate)}
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

      <div className="mt-3 space-y-1 text-[13px] text-gray-600">
        <p>Owner has 24h to respond{ownerTimeLeft ? ` · ${ownerTimeLeft} left` : ""}</p>
        {booking.paymentOnHold ? (
          <p className="font-semibold" style={{ color: GREEN }}>
            Payment on hold — not charged until approved
          </p>
        ) : (
          <p>No payment required until the owner approves.</p>
        )}
      </div>

      <button
        type="button"
        disabled={busy}
        className="mt-3 w-full rounded-xl border py-2.5 text-[14px] font-semibold text-gray-600 disabled:opacity-60"
        style={{ borderColor: BORDER }}
        onClick={() => void handleCancel()}
      >
        {busy ? "Cancelling…" : cancelRefundLabel(booking)}
      </button>
    </article>
  );
}
