/**
 * Fuel (+ DEF) rules for powered rentals at handoff start/finish.
 * Default: full-to-full; shortfall → missing-fuel cost estimate + $20 fee.
 * Listing fuel level is NOT required — levels are captured at rental start/return only.
 */

import type { ListingDraft } from "../screens/listing/types";

export const DEFAULT_FUEL_MISSING_FEE_USD = 20;
export const DEFAULT_FUEL_MISSING_FEE_CENTS = DEFAULT_FUEL_MISSING_FEE_USD * 100;
/** Assumed tank size when host has not set capacity — estimate only. */
export const DEFAULT_TANK_GALLONS_ESTIMATE = 15;
export const FULL_FUEL_EIGHTHS = 8;

export type FuelLevelEighths = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const FUEL_LEVEL_EIGHTHS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type FuelPolicyKind = "full_to_full" | "prepaid_full_tank";

export type FuelConsumingType =
  | "gasoline"
  | "diesel"
  | "hybrid"
  | "propane"
  | "other";

export type FuelPolicySnapshot = {
  policy: FuelPolicyKind;
  /** Flat fee (cents) when returned below policy (missing fuel and/or DEF). */
  missingFeeCents: number;
  fuelType: FuelConsumingType | string;
  tracksDef: boolean;
  /** Optional tank capacity for top-up estimates. */
  tankGallons?: number;
};

export type FuelHandoffReading = {
  fuelLevelEighths: FuelLevelEighths;
  defLevelEighths?: FuelLevelEighths;
  /** Optional gauge photo (MediaRef id stamped elsewhere). */
  gaugePhotoId?: string;
  prepaidFullTank?: boolean;
  /** Optional $/gal entered at return for estimate. */
  pumpPricePerGallonUsd?: number;
};

export type FuelReturnAssessment = {
  policy: FuelPolicyKind;
  fuelShort: boolean;
  defShort: boolean;
  fuelMissingEighths: number;
  defMissingEighths: number;
  /** Gallons estimate for missing fuel (null if no tank size / pump price path). */
  fuelMissingGallons: number | null;
  fuelCostEstimateCents: number | null;
  missingFeeCents: number;
  /** fuelCostEstimateCents + missingFeeCents when short; else 0. */
  totalClaimEstimateCents: number;
  claimStatus: "none" | "flagged";
  summaryEn: string;
};

const FUEL_CATEGORIES = new Set([
  "Vehicles",
  "Heavy Equipment",
  "Boats & Water",
  "Construction",
]);

const FUEL_CONSUMING = new Set([
  "gasoline",
  "diesel",
  "hybrid",
  "propane",
  "other",
]);

function normalizeFuelTypeRaw(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  return v || null;
}

export function isFuelConsumingType(fuelType: string | null | undefined): boolean {
  if (!fuelType) return false;
  const v = fuelType.trim().toLowerCase();
  if (v === "electric" || v === "electric_only" || v === "not_motorized") return false;
  return FUEL_CONSUMING.has(v);
}

export function fuelTypeTracksDef(fuelType: string | null | undefined): boolean {
  return (fuelType ?? "").trim().toLowerCase() === "diesel";
}

export function clampFuelLevelEighths(raw: unknown): FuelLevelEighths | null {
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number.parseInt(raw.trim(), 10)
        : NaN;
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 8) return null;
  return rounded as FuelLevelEighths;
}

export function formatFuelLevelLabel(eighths: FuelLevelEighths): string {
  return `${eighths}/8`;
}

function parsePositiveNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === "string") {
    const n = Number.parseFloat(raw.trim().replace(/^\$/, "").replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Resolve whether this listing needs fuel (and DEF) capture at handoff.
 * Uses categorySpecs.fuelType when present; boats use motorIncluded; electric skips.
 */
export function listingRequiresFuelTracking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs"> | null | undefined,
): boolean {
  if (!listing?.modes?.rent) return false;
  const cat = listing.category.trim();
  if (!FUEL_CATEGORIES.has(cat)) return false;

  const specs = listing.categorySpecs ?? {};
  const fuelType = normalizeFuelTypeRaw(specs.fuelType);
  if (fuelType) return isFuelConsumingType(fuelType);

  if (cat === "Boats & Water") {
    const motor = normalizeFuelTypeRaw(specs.motorIncluded);
    if (motor === "no" || motor === "electric_only") return false;
    if (motor === "yes") return true;
    return false;
  }

  if (cat === "Vehicles" || cat === "Heavy Equipment") {
    // Specs should always include fuelType for these; if missing, assume liquid fuel.
    return true;
  }

  // Construction: only when a fuel type was somehow set.
  return false;
}

export function listingFuelType(
  listing: Pick<ListingDraft, "category" | "categorySpecs"> | null | undefined,
): string | null {
  if (!listing) return null;
  const fromSpecs = normalizeFuelTypeRaw(listing.categorySpecs?.fuelType);
  if (fromSpecs) return fromSpecs;
  if (listing.category.trim() === "Boats & Water") {
    const motor = normalizeFuelTypeRaw(listing.categorySpecs?.motorIncluded);
    if (motor === "yes") return "gasoline";
  }
  if (listing.category.trim() === "Vehicles" || listing.category.trim() === "Heavy Equipment") {
    return "gasoline";
  }
  return null;
}

export function listingTracksDef(
  listing: Pick<ListingDraft, "category" | "categorySpecs"> | null | undefined,
): boolean {
  return fuelTypeTracksDef(listingFuelType(listing));
}

export function defaultFuelPolicySnapshot(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs" | "handoff" | "modes"> | null | undefined,
): FuelPolicySnapshot | null {
  if (!listingRequiresFuelTracking(listing)) return null;
  const fuelType = listingFuelType(listing) ?? "gasoline";
  const handoff = listing?.handoff as
    | {
        fuelPolicy?: string;
        fuelMissingFeeUsd?: string | number;
        fuelTankGallons?: string | number;
      }
    | undefined;

  const policyRaw = (handoff?.fuelPolicy ?? "").trim().toLowerCase();
  const policy: FuelPolicyKind =
    policyRaw === "prepaid_full_tank" ? "prepaid_full_tank" : "full_to_full";

  const feeUsd =
    parsePositiveNumber(handoff?.fuelMissingFeeUsd) ?? DEFAULT_FUEL_MISSING_FEE_USD;
  const tankGallons = parsePositiveNumber(handoff?.fuelTankGallons) ?? undefined;

  return {
    policy,
    missingFeeCents: Math.round(feeUsd * 100),
    fuelType,
    tracksDef: fuelTypeTracksDef(fuelType),
    tankGallons,
  };
}

export function normalizeFuelPolicySnapshot(raw: unknown): FuelPolicySnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const policy: FuelPolicyKind =
    obj.policy === "prepaid_full_tank" ? "prepaid_full_tank" : "full_to_full";
  const fuelType =
    typeof obj.fuelType === "string" && obj.fuelType.trim()
      ? obj.fuelType.trim().toLowerCase()
      : "gasoline";
  if (!isFuelConsumingType(fuelType) && fuelType !== "gasoline") {
    // Still allow snapshot if stored; electric should not create one.
    if (fuelType === "electric") return null;
  }
  const missingFeeCents =
    typeof obj.missingFeeCents === "number" && Number.isFinite(obj.missingFeeCents)
      ? Math.max(0, Math.round(obj.missingFeeCents))
      : DEFAULT_FUEL_MISSING_FEE_CENTS;
  const tankGallons = parsePositiveNumber(obj.tankGallons) ?? undefined;
  return {
    policy,
    missingFeeCents,
    fuelType,
    tracksDef: Boolean(obj.tracksDef) || fuelTypeTracksDef(fuelType),
    tankGallons,
  };
}

export function assessFuelReturn(input: {
  policy: FuelPolicySnapshot | null | undefined;
  startFuelLevelEighths?: number | null;
  returnFuelLevelEighths?: number | null;
  startDefLevelEighths?: number | null;
  returnDefLevelEighths?: number | null;
  prepaidFullTank?: boolean;
  pumpPricePerGallonUsd?: number | null;
}): FuelReturnAssessment {
  const policy = input.policy ?? {
    policy: "full_to_full" as const,
    missingFeeCents: DEFAULT_FUEL_MISSING_FEE_CENTS,
    fuelType: "gasoline",
    tracksDef: false,
  };

  const returnFuel = clampFuelLevelEighths(input.returnFuelLevelEighths);
  const startDef = clampFuelLevelEighths(input.startDefLevelEighths);
  const returnDef = clampFuelLevelEighths(input.returnDefLevelEighths);

  const effectivePolicy: FuelPolicyKind =
    input.prepaidFullTank || policy.policy === "prepaid_full_tank"
      ? "prepaid_full_tank"
      : "full_to_full";

  let fuelMissingEighths = 0;
  let fuelShort = false;
  if (effectivePolicy === "full_to_full" && returnFuel != null) {
    fuelMissingEighths = Math.max(0, FULL_FUEL_EIGHTHS - returnFuel);
    fuelShort = fuelMissingEighths > 0;
  }

  let defMissingEighths = 0;
  let defShort = false;
  if (policy.tracksDef && returnDef != null) {
    // Same spirit: don’t return empty/low DEF without settling — expect ≥ start, and not 1/8 if started higher.
    const expected = startDef ?? FULL_FUEL_EIGHTHS;
    defMissingEighths = Math.max(0, expected - returnDef);
    defShort = defMissingEighths > 0 || returnDef <= 1;
    if (returnDef <= 1 && expected > 1) {
      defMissingEighths = Math.max(defMissingEighths, expected - returnDef);
      defShort = true;
    }
  }

  const tank =
    policy.tankGallons && policy.tankGallons > 0
      ? policy.tankGallons
      : DEFAULT_TANK_GALLONS_ESTIMATE;
  const pump = input.pumpPricePerGallonUsd;
  const fuelMissingGallons =
    fuelShort && fuelMissingEighths > 0
      ? (fuelMissingEighths / FULL_FUEL_EIGHTHS) * tank
      : null;
  const fuelCostEstimateCents =
    fuelMissingGallons != null &&
    typeof pump === "number" &&
    Number.isFinite(pump) &&
    pump > 0
      ? Math.round(fuelMissingGallons * pump * 100)
      : null;

  const short = fuelShort || defShort;
  const missingFeeCents = short ? Math.max(0, policy.missingFeeCents) : 0;
  const totalClaimEstimateCents =
    short
      ? missingFeeCents + (fuelCostEstimateCents ?? 0)
      : 0;

  const parts: string[] = [];
  if (fuelShort) {
    parts.push(
      `Fuel returned at ${returnFuel}/8 (full-to-full expects 8/8; ${fuelMissingEighths}/8 short)`,
    );
  }
  if (defShort) {
    parts.push(
      `DEF returned at ${returnDef}/8${startDef != null ? ` (started ${startDef}/8)` : ""}`,
    );
  }
  if (short && missingFeeCents > 0) {
    parts.push(`+$${(missingFeeCents / 100).toFixed(0)} missing-fuel fee`);
  }
  if (fuelCostEstimateCents != null && fuelCostEstimateCents > 0) {
    parts.push(`est. fuel top-up $${(fuelCostEstimateCents / 100).toFixed(2)}`);
  } else if (fuelShort) {
    parts.push("fuel $ estimate needs pump price (and tank size when known)");
  }

  return {
    policy: effectivePolicy,
    fuelShort,
    defShort,
    fuelMissingEighths,
    defMissingEighths,
    fuelMissingGallons,
    fuelCostEstimateCents,
    missingFeeCents,
    totalClaimEstimateCents,
    claimStatus: short ? "flagged" : "none",
    summaryEn: parts.length ? parts.join(" · ") : "Fuel/DEF within policy",
  };
}

export function formatFuelPolicySummary(
  policy: FuelPolicySnapshot | null | undefined,
): string | null {
  if (!policy) return null;
  const fee = `$${(policy.missingFeeCents / 100).toFixed(0)}`;
  if (policy.policy === "prepaid_full_tank") {
    return policy.tracksDef
      ? `Fuel: prepaid full tank · DEF recorded at start/return · ${fee} fee if DEF returned empty without settling`
      : `Fuel: prepaid full tank (levels still recorded at start/return)`;
  }
  return policy.tracksDef
    ? `Fuel + DEF: full-to-full · missing fuel/DEF cost + ${fee} fee if returned short`
    : `Fuel: full-to-full · missing fuel cost + ${fee} fee if returned not full`;
}
