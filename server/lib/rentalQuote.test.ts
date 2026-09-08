import { describe, expect, it } from "vitest";
import {
  daysInclusive,
  quoteRentalFloorCents,
  resolvePayableRentalCents,
} from "./rentalQuote";

describe("quoteRentalFloorCents", () => {
  it("prices three days at the daily rate plus the platform fee", () => {
    const result = quoteRentalFloorCents({
      pricing: { dailyRate: "40" },
      startDate: "2026-03-01",
      endDate: "2026-03-03",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.days).toBe(3);
    expect(result.subtotalCents).toBe(12000);
    expect(result.feeCents).toBe(1440);
    expect(result.floorCents).toBe(13440);
  });

  it("refuses a listing with no rate at all", () => {
    expect(
      quoteRentalFloorCents({
        pricing: {},
        startDate: "2026-03-01",
        endDate: "2026-03-03",
      }),
    ).toEqual({ ok: false, reason: "no_rate" });
  });
});

describe("resolvePayableRentalCents", () => {
  it("raises an underpaid booking up to the listing floor", () => {
    expect(resolvePayableRentalCents({ bookedTotalCents: 50, floorCents: 13440 })).toBe(13440);
  });

  it("keeps a booked total that already covers delivery on top of the floor", () => {
    expect(resolvePayableRentalCents({ bookedTotalCents: 16000, floorCents: 13440 })).toBe(16000);
  });
});

describe("daysInclusive", () => {
  it("counts the start and end day", () => {
    expect(daysInclusive("2026-03-01", "2026-03-01")).toBe(1);
    expect(daysInclusive("2026-03-01", "2026-03-05")).toBe(5);
  });
});
