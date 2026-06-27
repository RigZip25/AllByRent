import { MASCOT_NAME } from "../../lib/brand";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useNow } from "../../hooks/useNow";
import {
  canMarkNoShow,
  formatCountdownShort,
  formatDisputeDeadline,
  formatOverdueShort,
  formatPickupWindow,
  getCountdownParts,
  getOverdueParts,
  isReviewWindowOpen,
} from "../../lib/rentalTiming";
import {
  formatRentalDateRange,
  isNoShowHistory,
  RENTAL_STATUS_LABEL,
  updateBooking,
  type RentalBooking,
} from "../../lib/rentalsStorage";
import { CounterpartyName } from "../trust/CounterpartyName";
import { InsuredLabel } from "./InsuredLabel";
import { DepositHoldActions } from "../payments/DepositHoldActions";
import { RunningLateSheet } from "./RunningLateSheet";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const CTA = "#F59E0B";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

function StatusBadge({ booking }: { booking: RentalBooking }) {
  const status = booking.status;
  const historyNoShow = isNoShowHistory(booking);

  let bg = "#F3F4F6";
  let color = "#666";
  let label = RENTAL_STATUS_LABEL[status];

  if (historyNoShow) {
    bg = "#FFEDD5";
    color = "#C2410C";
    label = "No-show";
  } else if (status === "overdue") {
    bg = "#FEE2E2";
    color = "#B91C1C";
    label = "Overdue";
  } else if (status === "no_show") {
    bg = "#FFEDD5";
    color = "#C2410C";
    label = "No-show";
  } else if (status === "disputed") {
    bg = "#FEF3C7";
    color = "#B45309";
    label = "In dispute";
  } else if (status === "pending_approval") {
    bg = "#DBEAFE";
    color = "#2563EB";
  } else if (status === "pending_checkin") {
    bg = `${CTA}33`;
    color = "#B45309";
  } else if (status === "active") {
    bg = `${GREEN_LIGHT}22`;
    color = GREEN;
  }

  return (
    <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: bg, color }}>
      {label}
    </span>
  );
}

function TimerBanner({
  booking,
  now,
}: {
  booking: RentalBooking;
  now: number;
}) {
  let text = "";
  let red = false;

  if (booking.status === "pending_checkin" && booking.pickupWindowStart && booking.pickupWindowEnd) {
    text = formatPickupWindow(booking.pickupWindowStart, booking.pickupWindowEnd);
  } else if (booking.status === "active" && booking.returnDueAt) {
    const parts = getCountdownParts(booking.returnDueAt, now);
    text = `Returns in: ${formatCountdownShort(parts)}`;
  } else if (booking.status === "overdue" && booking.overdueSince) {
    const parts = getOverdueParts(booking.overdueSince, now);
    text = `Overdue: ${formatOverdueShort(parts)}`;
    red = true;
  } else if (booking.status === "disputed" && booking.disputeEvidenceDeadline) {
    text = formatDisputeDeadline(booking.disputeEvidenceDeadline, now);
  }

  if (!text) return null;

  return (
    <div
      className="mb-2 rounded-xl px-3 py-2 text-[12px] font-bold"
      style={{
        backgroundColor: red ? "#FEE2E2" : `${GREEN_LIGHT}15`,
        color: red ? "#B91C1C" : GREEN,
      }}
    >
      {text}
    </div>
  );
}

function ActionButton({
  label,
  variant = "secondary",
  onClick,
}: {
  label: string;
  variant?: "primary" | "cta" | "secondary" | "danger";
  onClick: (e: React.MouseEvent) => void;
}) {
  const styles: Record<string, { bg: string; color: string; border?: string }> = {
    primary: { bg: GREEN, color: "white" },
    cta: { bg: CTA, color: "white" },
    secondary: { bg: "white", color: GREEN, border: BORDER },
    danger: { bg: "#FEE2E2", color: "#B91C1C" },
  };
  const s = styles[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-3 py-2 text-[13px] font-bold"
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: s.border ? `1px solid ${s.border}` : undefined,
      }}
    >
      {label}
    </button>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold" style={{ color: CTA }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3 w-3"
          fill={i < rating ? CTA : "transparent"}
          stroke={CTA}
        />
      ))}
    </span>
  );
}

export function RentalCard({
  booking,
  tab,
  onOpen,
  onRefresh,
  onViewProfile,
  onReRent,
}: {
  booking: RentalBooking;
  tab: "active" | "upcoming" | "history";
  onOpen?: () => void;
  onRefresh: () => void;
  onViewProfile?: (userId: string) => void;
  onReRent?: (booking: RentalBooking) => void;
}) {
  const [runningLateOpen, setRunningLateOpen] = useState(false);
  const now = useNow(booking.status === "active" || booking.status === "overdue" ? 1000 : 30_000);

  const roleLabel = booking.role === "renter" ? "Renting" : "Hosting";
  const showTimer = tab === "active";
  const markNoShowAvailable =
    booking.status === "no_show" &&
    booking.role === "host" &&
    !booking.noShowMarkedAt &&
    booking.pickupScheduledAt &&
    canMarkNoShow(booking.pickupScheduledAt, now);

  const reviewOpen =
    tab === "history" &&
    booking.status === "completed" &&
    !booking.review &&
    isReviewWindowOpen(booking.completedAt, now);

  const handleAction = (patch: Partial<RentalBooking>) => (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBooking(booking.id, patch);
    onRefresh();
  };

  const disputeSubtext = useMemo(() => {
    if (booking.status !== "disputed") return null;
    if (booking.disputeEscalated) return "Escalated — support reviewing";
    return null;
  }, [booking]);

  return (
    <article
      className="w-full rounded-2xl border bg-white p-4 text-left"
      style={{ borderColor: BORDER }}
    >
      {showTimer ? <TimerBanner booking={booking} now={now} /> : null}

      <button type="button" onClick={onOpen} className="flex w-full gap-3 text-left">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: SURFACE }}
        >
          {booking.itemEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="text-[15px] font-bold leading-tight" style={{ color: GREEN }}>
              {booking.itemTitle}
            </p>
            <StatusBadge booking={booking} />
          </div>
          <p className="text-[13px] text-gray-500">
            {formatRentalDateRange(booking.startDate, booking.endDate)}
          </p>
          <p className="mt-0.5 text-[12px] text-gray-500">
            {roleLabel} ·{" "}
            <CounterpartyName
              name={booking.counterpartyName}
              identityVerified={booking.counterpartyIdentityVerified}
              phoneVerified={booking.counterpartyPhoneVerified}
              onClick={
                onViewProfile ? () => onViewProfile(booking.counterpartyId) : undefined
              }
            />
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold" style={{ color: GREEN_LIGHT }}>
              ${booking.totalUsd} total
              {booking.deliveryRequested && booking.deliveryFee ? (
                <span className="font-normal text-gray-500">
                  {" "}
                  · incl. ${booking.deliveryFee} delivery
                </span>
              ) : null}
            </p>
            {booking.insuranceIncluded ? (
              <InsuredLabel modes={booking.listingModes} compact />
            ) : null}
            {booking.stripePayment ? (
              <span className="text-[10px] font-semibold text-gray-400">Stripe</span>
            ) : null}
          </div>
          {disputeSubtext ? (
            <p className="mt-1 text-[12px] font-semibold text-amber-700">{disputeSubtext}</p>
          ) : null}
        </div>
      </button>

      {tab === "active" && booking.status === "overdue" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {booking.role === "renter" ? (
            <>
              <ActionButton
                label="Return now"
                variant="cta"
                onClick={handleAction({ status: "completed", completedAt: new Date().toISOString() })}
              />
              <ActionButton label="Extend booking" variant="secondary" onClick={(e) => { e.stopPropagation(); onOpen?.(); }} />
            </>
          ) : (
            <ActionButton label="Request return" variant="danger" onClick={(e) => { e.stopPropagation(); onOpen?.(); }} />
          )}
        </div>
      ) : null}

      {tab === "active" && booking.status === "no_show" && !booking.noShowMarkedAt ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {booking.role === "renter" ? (
            <ActionButton
              label="I'm running late"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setRunningLateOpen(true);
              }}
            />
          ) : markNoShowAvailable ? (
            <ActionButton
              label="Mark as no-show"
              variant="danger"
              onClick={handleAction({
                noShowMarkedAt: new Date().toISOString(),
              })}
            />
          ) : (
            <p className="text-[12px] text-gray-500">
              Mark as no-show available 60 min after pickup time
            </p>
          )}
        </div>
      ) : null}

      {tab === "active" && booking.status === "disputed" ? (
        <div className="mt-3">
          <ActionButton label="Submit evidence" variant="cta" onClick={(e) => { e.stopPropagation(); onOpen?.(); }} />
        </div>
      ) : null}

      {tab === "active" &&
      (booking.status === "active" ||
        booking.status === "overdue" ||
        booking.status === "completed") ? (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <DepositHoldActions
            rentalId={booking.id}
            role={booking.role}
            depositStatus={booking.depositStatus}
            depositAmountCents={booking.depositAmountCents}
          />
        </div>
      ) : null}

      {tab === "history" && booking.status === "completed" ? (
        <div className="mt-3 border-t pt-3" style={{ borderColor: BORDER }}>
          {reviewOpen ? (
            <>
              <ActionButton
                label="Leave a review"
                variant="cta"
                onClick={handleAction({
                  review: { rating: 5, leftAt: new Date().toISOString() },
                })}
              />
              <p className="mt-2 flex items-center gap-2 text-[12px] text-gray-500">
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: `${GREEN_LIGHT}22`, color: GREEN }}
                >
                  {MASCOT_NAME}
                </span>
                Your review helps build trust
              </p>
            </>
          ) : booking.review ? (
            <div className="flex flex-wrap items-center gap-3">
              <StarRating rating={booking.review.rating} />
              <ActionButton label="See review" variant="secondary" onClick={(e) => { e.stopPropagation(); onOpen?.(); }} />
              {booking.role === "renter" ? (
                <ActionButton
                  label="Rent again"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReRent?.(booking);
                  }}
                />
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {booking.role === "renter" ? (
                <ActionButton
                  label="Rent again"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReRent?.(booking);
                  }}
                />
              ) : null}
              <ActionButton label="See review" variant="secondary" onClick={(e) => { e.stopPropagation(); onOpen?.(); }} />
            </div>
          )}
        </div>
      ) : null}

      {tab === "history" && isNoShowHistory(booking) ? (
        <p className="mt-2 text-[12px] font-semibold text-orange-700">Marked as no-show</p>
      ) : null}

      <RunningLateSheet
        open={runningLateOpen}
        bookingId={booking.id}
        ownerName={booking.counterpartyName}
        onClose={() => setRunningLateOpen(false)}
        onSent={onRefresh}
      />
    </article>
  );
}
