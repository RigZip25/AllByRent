import type { MinimumRentalPeriod } from "../screens/listing/types";

export type PeriodRateFields = {
  showDaily: boolean;
  showWeekly: boolean;
  showMonthly: boolean;
  /** Which field must be filled to continue. */
  required: "daily" | "weekly" | "monthly";
};

/**
 * Checkout prices rentals as daily × days. Hosts always set a daily rate except
 * when the minimum stay is a full month (monthly-only categories / periods).
 * Weekly & monthly are optional discounts for longer bookings.
 */
export function getRateFieldsForMinimumPeriod(
  minimumPeriod: MinimumRentalPeriod,
): PeriodRateFields {
  if (minimumPeriod === "1 month") {
    return { showDaily: false, showWeekly: false, showMonthly: true, required: "monthly" };
  }
  if (minimumPeriod === "1 day") {
    return { showDaily: true, showWeekly: false, showMonthly: false, required: "daily" };
  }
  // 3 days, 1 week, 2 weeks — daily is the primary rate; weekly/monthly optional.
  return { showDaily: true, showWeekly: true, showMonthly: true, required: "daily" };
}
