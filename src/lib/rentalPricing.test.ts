import { describe, expect, it } from "vitest";

import {
  PLATFORM_SERVICE_FEE_RATE,
  computeRentalPriceBreakdown,
} from "./rentalPricing";

describe("computeRentalPriceBreakdown", () => {
  it("keeps the advertised 12% service fee", () => {
    expect(PLATFORM_SERVICE_FEE_RATE).toBe(0.12);
  });

  it("charges the daily rate for every rented day", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: 50,
      rentalDays: 3,
      deliveryRequested: false,
      deliveryRoundTripUsd: 0,
    });

    expect(breakdown.rentalSubtotalUsd).toBe(150);
    expect(breakdown.serviceFeeUsd).toBe(18);
    expect(breakdown.totalUsd).toBe(168);
  });

  it("bills at least one day for same-day pickups", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: 40,
      rentalDays: 0,
      deliveryRequested: false,
      deliveryRoundTripUsd: 0,
    });

    expect(breakdown.rentalDays).toBe(1);
    expect(breakdown.rentalSubtotalUsd).toBe(40);
  });

  it("taxes delivery and insurance before the service fee", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: 100,
      rentalDays: 1,
      deliveryRequested: true,
      deliveryRoundTripUsd: 20,
      insuranceFeeUsd: 10,
    });

    expect(breakdown.deliveryFeeUsd).toBe(20);
    expect(breakdown.serviceFeeUsd).toBe(15.6);
    expect(breakdown.totalUsd).toBe(145.6);
  });

  it("ignores delivery fees the renter did not ask for", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: 100,
      rentalDays: 1,
      deliveryRequested: false,
      deliveryRoundTripUsd: 35,
      heavySurchargeUsd: 25,
    });

    expect(breakdown.deliveryFeeUsd).toBe(0);
    expect(breakdown.deliveryRequested).toBe(false);
    expect(breakdown.totalUsd).toBe(112);
  });

  it("prices a long-term month by the monthly rate, not the daily one", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: 50,
      monthlyRateUsd: 900,
      pricingBasis: "monthly",
      rentalDays: 30,
      deliveryRequested: false,
      deliveryRoundTripUsd: 0,
    });

    expect(breakdown.rentalSubtotalUsd).toBe(900);
    expect(breakdown.totalUsd).toBe(1008);
  });

  it("never turns a negative rate into a credit", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: -50,
      rentalDays: 2,
      deliveryRequested: false,
      deliveryRoundTripUsd: 0,
    });

    expect(breakdown.rentalSubtotalUsd).toBe(0);
    expect(breakdown.totalUsd).toBe(0);
  });

  it("rounds the charged total to whole cents", () => {
    const breakdown = computeRentalPriceBreakdown({
      dailyRateUsd: 33.33,
      rentalDays: 3,
      deliveryRequested: false,
      deliveryRoundTripUsd: 0,
    });

    const cents = Math.round(breakdown.totalUsd * 100);
    expect(cents).toBe(11199);
    expect(breakdown.totalUsd * 100).toBeCloseTo(cents, 6);
  });
});
