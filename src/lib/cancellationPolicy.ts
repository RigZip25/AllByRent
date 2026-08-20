import { parseIsoDateLocal } from "./availabilityBusy";

/**
 * Platform cancellation — aligned to common car-share / short-term rental practice
 * (similar spirit to mainstream peer car rental & flexible STR policies; not a brand copy).
 *
 * Renter cancel (accepted booking, before pickup handoff):
 * - ≥24h before trip start → 100% rental refund
 * - <24h before trip start → 50% rental refund (host keeps 50%)
 * - Last-minute book (<25h before start): 1h grace after booking → 100% refund
 * - After pickup handoff starts → cancel blocked here (return / dispute)
 *
 * Host cancel before pickup → 100% rental refund to renter (soft reliability note in UI).
 * Deposit hold → always released on cancel before pickup.
 *
 * Keep UI copy in sync via formatCancellationPolicySummary / booking.cancellationPolicyBody.
 */
export const CANCEL_FULL_REFUND_HOURS = 24;
/** Below this cutoff (and outside last-minute book grace) → partial refund. */
export const CANCEL_PARTIAL_REFUND_HOURS = 0;
export const CANCEL_PARTIAL_REFUND_PERCENT = 50;
/** Bookings made within this window of start get a short free-cancel grace. */
export const CANCEL_LAST_MINUTE_BOOK_HOURS = 25;
export const CANCEL_LAST_MINUTE_GRACE_MS = 60 * 60 * 1000;

export type CancelRefundTier = "full" | "partial" | "none";

export type CancelRefundAssessment = {
  tier: CancelRefundTier;
  /** 0–100 of rental charge to refund (host cancel always 100 when a charge exists). */
  refundPercent: number;
  hoursUntilStart: number;
  /** True when cancel is still allowed for this booking status / handoff state. */
  allowed: boolean;
  /** Deposit is always released on pre-pickup cancel. */
  releaseDeposit: boolean;
  /** Used last-minute booking grace (1h after book). */
  usedBookingGrace?: boolean;
};

/** Trip start ms: prefer scheduled pickup, else local midnight of start date. */
export function rentalStartMs(startDate: string, pickupScheduledAt?: string | null): number | null {
  if (pickupScheduledAt) {
    const ms = new Date(pickupScheduledAt).getTime();
    if (!Number.isNaN(ms)) return ms;
  }
  const d = parseIsoDateLocal(startDate);
  if (!d) return null;
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function hoursUntilRentalStart(
  startDate: string,
  nowMs: number = Date.now(),
  pickupScheduledAt?: string | null,
): number {
  const start = rentalStartMs(startDate, pickupScheduledAt);
  if (start == null) return 0;
  return (start - nowMs) / (1000 * 60 * 60);
}

/**
 * Renter-initiated refund tier from timing (+ optional last-minute book grace).
 */
export function assessRenterCancelRefund(
  startDate: string,
  nowMs: number = Date.now(),
  options?: { pickupScheduledAt?: string | null; bookedAt?: string | null },
): Pick<
  CancelRefundAssessment,
  "tier" | "refundPercent" | "hoursUntilStart" | "usedBookingGrace"
> {
  const hoursUntilStart = hoursUntilRentalStart(
    startDate,
    nowMs,
    options?.pickupScheduledAt,
  );

  // Last-minute booking grace: booked within 25h of start → free cancel for 1h after book.
  if (options?.bookedAt) {
    const bookedMs = new Date(options.bookedAt).getTime();
    if (!Number.isNaN(bookedMs)) {
      const hoursAtBook = hoursUntilRentalStart(
        startDate,
        bookedMs,
        options.pickupScheduledAt,
      );
      if (
        hoursAtBook < CANCEL_LAST_MINUTE_BOOK_HOURS &&
        nowMs - bookedMs <= CANCEL_LAST_MINUTE_GRACE_MS
      ) {
        return {
          tier: "full",
          refundPercent: 100,
          hoursUntilStart,
          usedBookingGrace: true,
        };
      }
    }
  }

  if (hoursUntilStart >= CANCEL_FULL_REFUND_HOURS) {
    return { tier: "full", refundPercent: 100, hoursUntilStart };
  }
  // Inside 24h of start (before pickup): keep half of trip price — common partial-fee pattern.
  if (hoursUntilStart > CANCEL_PARTIAL_REFUND_HOURS) {
    return {
      tier: "partial",
      refundPercent: CANCEL_PARTIAL_REFUND_PERCENT,
      hoursUntilStart,
    };
  }
  return { tier: "none", refundPercent: 0, hoursUntilStart };
}

export type CancelableBookingShape = {
  status: string;
  startDate: string;
  pickupScheduledAt?: string;
  /** When the booking request was created (ISO). */
  createdAt?: string;
  bookedAt?: string;
  hostHandedOverAt?: string;
  renterReceivedAt?: string;
  pickupConfirmedAt?: string;
};

/** Post-accept cancel is allowed before either side confirms pickup handoff. */
export function canCancelAcceptedBooking(booking: CancelableBookingShape): boolean {
  if (booking.status !== "pending_checkin" && booking.status !== "upcoming") {
    return false;
  }
  if (booking.hostHandedOverAt || booking.renterReceivedAt || booking.pickupConfirmedAt) {
    return false;
  }
  return true;
}

export function assessCancelRefund(params: {
  booking: CancelableBookingShape;
  role: "host" | "renter";
  nowMs?: number;
}): CancelRefundAssessment {
  const nowMs = params.nowMs ?? Date.now();
  const allowed = canCancelAcceptedBooking(params.booking);
  const base = assessRenterCancelRefund(params.booking.startDate, nowMs, {
    pickupScheduledAt: params.booking.pickupScheduledAt,
    bookedAt: params.booking.bookedAt ?? params.booking.createdAt,
  });
  if (params.role === "host") {
    return {
      ...base,
      tier: "full",
      refundPercent: 100,
      allowed,
      releaseDeposit: true,
    };
  }
  return { ...base, allowed, releaseDeposit: true };
}

export function refundCentsFromTotal(totalUsd: number, refundPercent: number): number {
  if (refundPercent <= 0 || totalUsd <= 0) return 0;
  return Math.round(totalUsd * 100 * (refundPercent / 100));
}

/** Short EN summary for booking / agreement (i18n body preferred in UI). */
export function formatCancellationPolicySummary(): string {
  return (
    `Free cancel until ${CANCEL_FULL_REFUND_HOURS}h before trip start (100% rental refund). ` +
    `Inside ${CANCEL_FULL_REFUND_HOURS}h: ${CANCEL_PARTIAL_REFUND_PERCENT}% rental refund. ` +
    `Last-minute bookings (<${CANCEL_LAST_MINUTE_BOOK_HOURS}h before start): 1h free-cancel grace after booking. ` +
    `Host cancel before pickup: full rental refund to renter. Deposit releases on cancel before pickup.`
  );
}
