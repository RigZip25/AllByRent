import { describe, expect, it } from "vitest";
import { isExtendableStatus, quoteExtension } from "./rentalExtension";

const rental = {
  start_date: "2026-03-01",
  end_date: "2026-03-05",
  rental_total_cents: 22400,
};

describe("quoteExtension", () => {
  it("prices the extra days at the host's daily rate plus the platform fee", () => {
    const result = quoteExtension({
      rental,
      pricing: { dailyRate: "40" },
      newEndDate: "2026-03-08",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.quote.extraDays).toBe(3);
    expect(result.quote.subtotalCents).toBe(12000);
    expect(result.quote.serviceFeeCents).toBe(1440);
    expect(result.quote.totalCents).toBe(13440);
    expect(result.quote.rateFromBooking).toBe(false);
  });

  it("refuses a date that is not after the current end", () => {
    for (const newEndDate of ["2026-03-05", "2026-03-01"]) {
      const result = quoteExtension({ rental, pricing: { dailyRate: "40" }, newEndDate });
      expect(result).toEqual({ ok: false, reason: "not_later" });
    }
  });

  it("refuses a date it cannot read", () => {
    const result = quoteExtension({ rental, pricing: {}, newEndDate: "next tuesday" });
    expect(result).toEqual({ ok: false, reason: "invalid_date" });
  });

  it("sends anything past three months back to booking again", () => {
    const result = quoteExtension({
      rental,
      pricing: { dailyRate: "40" },
      newEndDate: "2026-09-05",
    });
    expect(result).toEqual({ ok: false, reason: "too_far" });
  });

  it("falls back to what this rental worked out to per day, fee included", () => {
    const result = quoteExtension({ rental, pricing: {}, newEndDate: "2026-03-07" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // $224 over five booked days.
    expect(result.quote.dailyRateCents).toBe(4480);
    expect(result.quote.totalCents).toBe(8960);
    expect(result.quote.serviceFeeCents).toBe(0);
    expect(result.quote.rateFromBooking).toBe(true);
  });

  it("has no price at all for a listing with no rate and an unpaid rental", () => {
    const result = quoteExtension({
      rental: { ...rental, rental_total_cents: 0 },
      pricing: {},
      newEndDate: "2026-03-07",
    });
    expect(result).toEqual({ ok: false, reason: "no_rate" });
  });
});

describe("isExtendableStatus", () => {
  it("allows the statuses where the item is out or about to be", () => {
    for (const status of ["pending_checkin", "upcoming", "active", "overdue"]) {
      expect(isExtendableStatus(status)).toBe(true);
    }
  });

  it("refuses rentals that are over or never started", () => {
    for (const status of ["pending_approval", "completed", "cancelled", "no_show", "disputed", null]) {
      expect(isExtendableStatus(status)).toBe(false);
    }
  });
});
