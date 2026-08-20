import type { ListingDraft } from "../screens/listing/types";
import type { RentalBooking } from "./rentalsStorage";

/**
 * No-show — aligned to common peer car-share practice (e.g. multi-hour pickup window
 * then host/platform cancel; guest typically forfeits most/all of trip price).
 *
 * Timeline from scheduled pickup (`pickupScheduledAt` / `pickup_at`):
 * - +30m: remind renter (automation)
 * - +2h (`NO_SHOW_MARK_AFTER_MS`): soft status `no_show` (auto-suggest) —
 *   calendar stays busy until host confirms; chat stays open to coordinate
 * - +24h: if host never marks, platform auto-cancels and frees the calendar
 * - Host marks no-show → `cancelled` + `noShowMarkedAt`:
 *   - Calendar freed
 *   - Trip price kept (0% rental refund) — market default for no-show
 *   - Optional host fee may also be claimed from deposit
 *   - Remaining deposit released when no fee / after claim
 *   - Chat closes (trip never started — no vehicle toll window)
 */

/** Host may mark no-show after this grace from scheduled pickup (US car-share–like). */
export const NO_SHOW_MARK_AFTER_MS = 2 * 60 * 60 * 1000;
/** Renter nudge before soft no-show suggest. */
export const NO_SHOW_RENTER_NUDGE_MS = 30 * 60 * 1000;

/**
 * Optional host-configured no-show fee (USD) from listing handoff — additive to
 * keeping the trip price. Empty / disabled → keep trip price only + free calendar.
 */
export function listingNoShowFeeUsd(
  listing: Pick<ListingDraft, "handoff"> | null | undefined,
): number | null {
  if (!listing) return null;
  if (listing.handoff.noShowFeeEnabled === false) return null;
  const raw = (listing.handoff.noShowFeeUsd ?? "").trim().replace(/^\$/, "");
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

export function listingNoShowFeeCents(
  listing: Pick<ListingDraft, "handoff"> | null | undefined,
): number {
  const usd = listingNoShowFeeUsd(listing);
  if (usd == null) return 0;
  return Math.max(0, Math.round(usd * 100));
}

export function canSuggestSoftNoShow(
  booking: Pick<
    RentalBooking,
    | "status"
    | "pickupScheduledAt"
    | "noShowMarkedAt"
    | "hostHandedOverAt"
    | "renterReceivedAt"
    | "pickupConfirmedAt"
  >,
  nowMs = Date.now(),
): boolean {
  if (booking.status !== "pending_checkin" && booking.status !== "upcoming") return false;
  if (booking.noShowMarkedAt) return false;
  if (booking.hostHandedOverAt || booking.renterReceivedAt || booking.pickupConfirmedAt) {
    return false;
  }
  if (!booking.pickupScheduledAt) return false;
  const pickup = new Date(booking.pickupScheduledAt).getTime();
  if (Number.isNaN(pickup)) return false;
  return nowMs - pickup >= NO_SHOW_MARK_AFTER_MS;
}

/** Soft auto-suggest: mark booking as `no_show` without freeing calendar yet. */
export function buildSoftNoShowSuggestPatch(nowIso?: string): Partial<RentalBooking> {
  return {
    status: "no_show",
    noShowNote: nowIso
      ? `Soft no-show suggested at ${nowIso}. Host should mark to free the calendar; if not, auto-cancel frees it 24h after pickup. Trip price is typically kept.`
      : "Soft no-show suggested. Host should mark to free the calendar; if not, auto-cancel frees it 24h after pickup. Trip price is typically kept.",
  };
}

/** Platform auto-cancel after soft suggest when host never acts (24h from pickup). */
export const NO_SHOW_AUTO_CANCEL_AFTER_MS = 24 * 60 * 60 * 1000;

export function canAutoCancelNoShow(
  booking: Pick<
    RentalBooking,
    | "status"
    | "pickupScheduledAt"
    | "noShowMarkedAt"
    | "hostHandedOverAt"
    | "renterReceivedAt"
    | "pickupConfirmedAt"
  >,
  nowMs = Date.now(),
): boolean {
  if (booking.status !== "no_show") return false;
  if (booking.noShowMarkedAt) return false;
  if (booking.hostHandedOverAt || booking.renterReceivedAt || booking.pickupConfirmedAt) {
    return false;
  }
  if (!booking.pickupScheduledAt) return false;
  const pickup = new Date(booking.pickupScheduledAt).getTime();
  if (Number.isNaN(pickup)) return false;
  return nowMs - pickup >= NO_SHOW_AUTO_CANCEL_AFTER_MS;
}

export type NoShowResolution = {
  status: "cancelled";
  noShowMarkedAt: string;
  cancelledAt: string;
  cancelledBy: "host";
  cancelReason: string;
  /** Paid rental is kept — market no-show default. */
  cancelRefundPercent: 0;
  cancelRefundStatus: "none";
  noShowFeeCents?: number;
  noShowFeeStatus?: "none" | "flagged" | "claimed" | "disputed";
  noShowNote?: string;
  depositStatus?: RentalBooking["depositStatus"];
};

/**
 * Host marks no-show after the start window: free calendar, keep trip price,
 * optional extra deposit fee if host configured one.
 */
export function buildHostNoShowPatch(input: {
  booking: RentalBooking;
  listing?: Pick<ListingDraft, "handoff"> | null;
  nowIso?: string;
  reason?: string;
}): NoShowResolution {
  const now = input.nowIso ?? new Date().toISOString();
  const feeCents = listingNoShowFeeCents(input.listing);
  const patch: NoShowResolution = {
    status: "cancelled",
    noShowMarkedAt: now,
    cancelledAt: now,
    cancelledBy: "host",
    cancelReason: (input.reason ?? "no_show").trim() || "no_show",
    cancelRefundPercent: 0,
    cancelRefundStatus: "none",
  };
  if (feeCents > 0) {
    patch.noShowFeeCents = feeCents;
    patch.noShowFeeStatus = "flagged";
    patch.noShowNote =
      "Host marked no-show. Trip price kept (0% rental refund). Optional fee flagged against deposit — renter may dispute.";
  } else {
    patch.noShowFeeStatus = "none";
    patch.noShowNote =
      "Host marked no-show. Trip price kept (0% rental refund). Calendar freed. Deposit released when held.";
    if (input.booking.depositStatus === "held") {
      patch.depositStatus = "released";
    }
  }
  return patch;
}

/** Trip never started → chat should close (no vehicle toll extension). */
export function noShowClosesChatImmediately(
  booking: Pick<
    RentalBooking,
    "noShowMarkedAt" | "status" | "hostHandedOverAt" | "pickupConfirmedAt"
  >,
): boolean {
  if (booking.hostHandedOverAt || booking.pickupConfirmedAt) return false;
  return Boolean(booking.noShowMarkedAt) || booking.status === "cancelled";
}
