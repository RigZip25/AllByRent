/**
 * What a rental should cost at pay time, from the listing and the dates.
 *
 * The booking row's `rental_total_cents` used to be whatever the renter's
 * device typed in — migration 053 freezes it after insert, but insert itself
 * still accepted the client's number. A $200 weekend could be booked and paid
 * as $0.50. This quote is the floor: daily (or monthly) rate × days, plus the
 * platform fee. Delivery and extras the renter actually ordered may push the
 * charge above the floor; nothing may push it below.
 */

export const RENTAL_PLATFORM_FEE_RATE = 0.12;

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseUsdToCents(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw * 100);
  }
  if (typeof raw !== "string") return 0;
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

export function daysInclusive(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / DAY_MS) + 1);
}

export type ListingPricing = {
  dailyRate?: unknown;
  weeklyRate?: unknown;
  monthlyRate?: unknown;
};

/**
 * Floor charge for the rented days. Weekly/monthly rates, when present and
 * cheaper for the span, win — same preference the booking screen uses.
 */
export function quoteRentalFloorCents(params: {
  pricing: ListingPricing | null | undefined;
  startDate: string;
  endDate: string;
  feeRate?: number;
}): { ok: true; floorCents: number; days: number; subtotalCents: number; feeCents: number } | { ok: false; reason: string } {
  const days = daysInclusive(params.startDate, params.endDate);
  if (days <= 0) return { ok: false, reason: "invalid_dates" };

  const pricing = params.pricing ?? {};
  const daily = parseUsdToCents(pricing.dailyRate);
  const weekly = parseUsdToCents(pricing.weeklyRate);
  const monthly = parseUsdToCents(pricing.monthlyRate);

  let subtotalCents = 0;
  if (monthly > 0 && days >= 28) {
    const months = Math.max(1, Math.round(days / 30));
    subtotalCents = monthly * months;
  } else if (weekly > 0 && days >= 7) {
    const weeks = Math.max(1, Math.round(days / 7));
    subtotalCents = weekly * weeks;
  } else if (daily > 0) {
    subtotalCents = daily * days;
  } else if (weekly > 0) {
    subtotalCents = Math.round((weekly / 7) * days);
  } else if (monthly > 0) {
    subtotalCents = Math.round((monthly / 30) * days);
  } else {
    return { ok: false, reason: "no_rate" };
  }

  if (subtotalCents < 50) return { ok: false, reason: "too_low" };

  const feeRate = params.feeRate ?? RENTAL_PLATFORM_FEE_RATE;
  const feeCents = Math.round(subtotalCents * feeRate);
  return {
    ok: true,
    days,
    subtotalCents,
    feeCents,
    floorCents: subtotalCents + feeCents,
  };
}

/**
 * What to charge: never less than the listing floor, never less than 50¢.
 * A booked total above the floor is kept — delivery and extras live there.
 */
export function resolvePayableRentalCents(params: {
  bookedTotalCents: number;
  floorCents: number;
}): number {
  return Math.max(50, params.bookedTotalCents, params.floorCents);
}
