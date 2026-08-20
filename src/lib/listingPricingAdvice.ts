/**
 * Expert host pricing advice for Evorios.
 * Goods: deposit = replace-new (no platform insurance yet).
 * Vehicles / heavy / boats: insurance proof is primary; deposit ≈ host max deductible
 *   (e.g. deductible_2500 → $2500 hold), never full car value.
 * Real estate: deposit ≈ one month.
 */

export type RentalPriceSuggestion = {
  daily: number;
  weekly: number;
  monthly: number;
  deposit: number;
};

export type DepositAdviceKind = "full_replacement" | "insurance_backed" | "monthly_rent";

export type FinalizeRentalPriceOptions = {
  /**
   * Host band from categorySpecs / handoff: deductible_500 | deductible_1000 |
   * deductible_2500 | full_coverage_required.
   * When set for insurance-backed categories, the card hold matches that amount.
   */
  insuranceMaxDeductible?: string | null;
};

const INSURANCE_BACKED_CATEGORIES = new Set([
  "Vehicles",
  "Heavy Equipment",
  "Boats & Water",
  "Construction",
]);

export function depositAdviceKind(category: string): DepositAdviceKind {
  const c = category.trim();
  if (c === "Real Estate") return "monthly_rent";
  if (INSURANCE_BACKED_CATEGORIES.has(c)) return "insurance_backed";
  return "full_replacement";
}

/**
 * Map host insurance deductible band → USD for the Stripe card hold.
 * Returns null when the band is unknown / full coverage without a fixed dollar cap.
 */
export function parseInsuranceMaxDeductibleUsd(
  band: string | null | undefined,
): number | null {
  const key = (band ?? "").trim();
  switch (key) {
    case "deductible_500":
      return 500;
    case "deductible_1000":
      return 1000;
    case "deductible_2500":
      return 2500;
    default:
      return null;
  }
}

/** Heuristic deductible-sized hold when the host has not picked a max deductible yet. */
export function heuristicInsuranceBackedDepositUsd(replacementValue: number): number {
  const v = Number.isFinite(replacementValue) && replacementValue > 0 ? replacementValue : 0;
  if (v <= 0) return 1000;
  // Cap at $2500 — never suggest full vehicle value as the hold.
  return Math.min(2500, Math.max(500, Math.round(v * 0.05)));
}

/**
 * Resolve the insurance-backed card hold: prefer host max deductible, else heuristic.
 * Always deductible-sized — never replace-new for Vehicles / Heavy / Boats.
 */
export function resolveInsuranceBackedDepositUsd(
  replacementValue: number,
  insuranceMaxDeductible?: string | null,
): number {
  const fromHost = parseInsuranceMaxDeductibleUsd(insuranceMaxDeductible);
  if (fromHost != null) return fromHost;
  // full_coverage_required / unset → still a modest hold, not asset value
  if ((insuranceMaxDeductible ?? "").trim() === "full_coverage_required") {
    return Math.min(1000, heuristicInsuranceBackedDepositUsd(replacementValue));
  }
  return heuristicInsuranceBackedDepositUsd(replacementValue);
}

/** Cap / normalize raw category formulas so advice stays profitable and bookable. */
export function finalizeRentalPriceSuggestion(
  replacementValue: number,
  raw: RentalPriceSuggestion,
  category = "",
  options?: FinalizeRentalPriceOptions,
): RentalPriceSuggestion {
  const v = Number.isFinite(replacementValue) && replacementValue > 0 ? replacementValue : 0;
  let { daily, weekly, monthly, deposit } = raw;
  const kind = depositAdviceKind(category);

  if (daily > 0 && weekly > 0 && weekly > daily * 7) {
    weekly = Math.round(daily * 5.5);
  }
  if (daily > 0 && weekly > 0 && weekly < daily * 3) {
    weekly = Math.round(daily * 4.5);
  }

  // Long-stay monthly must stay under "just buy it" — usually ≤ ~55% of replace-new.
  if (kind !== "monthly_rent") {
    if (monthly > 0 && v > 0) {
      const buyCap = Math.round(v * 0.55);
      const fromDaily = daily > 0 ? Math.round(daily * 30 * 0.45) : monthly;
      monthly = Math.min(monthly, buyCap, Math.max(fromDaily, Math.round(v * 0.25)));
    } else if (monthly > 0 && daily > 0) {
      monthly = Math.min(monthly, Math.round(daily * 30 * 0.45));
    }

    if (monthly > 0 && weekly > 0 && monthly < weekly) {
      monthly = Math.round(weekly * 2.2);
      if (v > 0) monthly = Math.min(monthly, Math.round(v * 0.55));
    }
  }

  if (kind === "full_replacement") {
    // No platform theft insurance for neighborhood goods — hold replace-new.
    if (v > 0) deposit = Math.round(v);
    else if (deposit > 0) deposit = Math.max(deposit, 1);
  } else if (kind === "insurance_backed") {
    // Primary protection: renter insurance. Card hold = host max deductible (or heuristic).
    deposit = Math.round(
      resolveInsuranceBackedDepositUsd(v, options?.insuranceMaxDeductible),
    );
  } else {
    // Real estate: one month
    const month = monthly > 0 ? monthly : daily > 0 ? Math.round(daily * 30) : 0;
    deposit = month > 0 ? Math.round(month) : deposit > 0 ? Math.round(deposit) : 0;
  }

  daily = Math.max(daily, daily > 0 ? 1 : 0);
  weekly = Math.max(weekly, weekly > 0 ? 5 : 0);
  monthly = Math.max(monthly, monthly > 0 ? 15 : 0);

  return { daily, weekly, monthly, deposit };
}

/**
 * Long-term (30+ day) monthly from the host's daily rate.
 * Never suggest more than ~55% of replace-new — otherwise renters buy instead.
 */
export function suggestLongTermMonthlyFromDaily(
  dailyRate: number,
  replacementValue?: number,
): number | null {
  if (!Number.isFinite(dailyRate) || dailyRate <= 0) return null;
  let suggested = Math.round(dailyRate * 30 * 0.45);
  const v =
    replacementValue != null && Number.isFinite(replacementValue) && replacementValue > 0
      ? replacementValue
      : 0;
  if (v > 0) {
    suggested = Math.min(suggested, Math.round(v * 0.55));
  }
  if (!Number.isFinite(suggested) || suggested <= 0) return null;
  return suggested;
}

/** Used-sale ask: below replace-new so it moves, above junk pricing. */
export function suggestSaleFromReplacement(replacementValue: number): number {
  const v = Number.isFinite(replacementValue) && replacementValue > 0 ? replacementValue : 0;
  if (v <= 0) return 0;
  return Math.max(1, Math.round(v * 0.45));
}
