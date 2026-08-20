/**
 * Age gate for Vehicles and powered watercraft — market-standard default (min 25).
 * Hosts may opt in to 18–24 with a higher deductible-sized hold.
 */

import type { ListingDraft } from "../screens/listing/types";
import { listingCaptainMode, listingRequiresAgeGate } from "./categoryTrustRules";
import { loadUserProfile } from "./userProfileStorage";

export const DEFAULT_VEHICLE_MIN_AGE = 25;
export const YOUNG_DRIVER_MIN_AGE = 18;
/** Default multiplier on security deposit / deductible hold for 18–24. */
export const DEFAULT_YOUNG_DRIVER_HOLD_MULTIPLIER = 1.5;

export type VehicleAgeGateResult =
  | {
      ok: true;
      ageYears: number;
      youngDriver: boolean;
      /** Extra cents added to deposit when young driver (beyond base deposit). */
      youngDriverHoldAddOnCents: number;
      /** Effective deposit after young-driver uplift (base already includes toll). */
      adjustedDepositAmountCents: number;
      minAgeRequired: number;
    }
  | {
      ok: false;
      reason: "need_dob" | "underage" | "host_blocks_young";
      ageYears: number | null;
      minAgeRequired: number;
      messageKey:
        | "needDob"
        | "underage"
        | "hostBlocksYoung";
    };

function parseDob(raw: string | null | undefined): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  // YYYY-MM-DD preferred
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (m) {
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function ageYearsFromDob(dob: Date, now = new Date()): number {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const month = now.getUTCMonth() - dob.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export function listingIsVehicleCategory(
  listing: Pick<ListingDraft, "category"> | null | undefined,
): boolean {
  return (listing?.category ?? "").trim() === "Vehicles";
}

/** Vehicles or powered boats/PWC — same min-age policy. */
export function listingUsesVehicleStyleAgeGate(
  listing:
    | Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">
    | null
    | undefined,
): boolean {
  return listingRequiresAgeGate(listing ?? undefined);
}

export function listingAllowsYoungDrivers(
  listing:
    | Pick<ListingDraft, "handoff" | "category" | "subcategory" | "modes" | "categorySpecs">
    | null
    | undefined,
): boolean {
  if (!listingUsesVehicleStyleAgeGate(listing)) return true;
  return listing?.handoff?.allowYoungDrivers === true;
}

export function listingYoungDriverHoldMultiplier(
  listing: Pick<ListingDraft, "handoff"> | null | undefined,
): number {
  const raw = listing?.handoff?.youngDriverHoldMultiplier;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1 && raw <= 3) {
    return raw;
  }
  return DEFAULT_YOUNG_DRIVER_HOLD_MULTIPLIER;
}

/**
 * Resolve DOB from profile first; optional override from start-ID / license OCR later.
 */
export function resolveRenterDateOfBirth(options?: {
  dateOfBirthOverride?: string | null;
}): string | null {
  const override = options?.dateOfBirthOverride?.trim();
  if (override) return override;
  const profile = loadUserProfile();
  const dob = (profile.dateOfBirth ?? "").trim();
  return dob || null;
}

/**
 * Enforce Vehicles / powered-watercraft min age at booking.
 * @param baseDepositCents security + toll hold before young-driver uplift
 */
export function assessVehicleAgeGate(input: {
  listing:
    | Pick<
        ListingDraft,
        "category" | "subcategory" | "handoff" | "pricing" | "modes" | "categorySpecs"
      >
    | null
    | undefined;
  dateOfBirth?: string | null;
  /** Security deposit portion (not including toll) used for young-driver multiplier. */
  securityDepositCents: number;
  /** Full deposit already computed (security + toll). */
  baseDepositAmountCents: number;
  now?: Date;
}): VehicleAgeGateResult {
  if (!listingUsesVehicleStyleAgeGate(input.listing)) {
    return {
      ok: true,
      ageYears: 99,
      youngDriver: false,
      youngDriverHoldAddOnCents: 0,
      adjustedDepositAmountCents: input.baseDepositAmountCents,
      minAgeRequired: DEFAULT_VEHICLE_MIN_AGE,
    };
  }

  const captainIncluded =
    input.listing != null && listingCaptainMode(input.listing) === "captain_included";
  const allowsYoung = captainIncluded || listingAllowsYoungDrivers(input.listing);
  const minAgeRequired = captainIncluded
    ? YOUNG_DRIVER_MIN_AGE
    : allowsYoung
      ? YOUNG_DRIVER_MIN_AGE
      : DEFAULT_VEHICLE_MIN_AGE;
  const dobStr = (input.dateOfBirth ?? resolveRenterDateOfBirth())?.trim() || null;
  const dob = parseDob(dobStr);
  if (!dob) {
    return {
      ok: false,
      reason: "need_dob",
      ageYears: null,
      minAgeRequired,
      messageKey: "needDob",
    };
  }

  const ageYears = ageYearsFromDob(dob, input.now ?? new Date());
  if (ageYears < YOUNG_DRIVER_MIN_AGE) {
    return {
      ok: false,
      reason: "underage",
      ageYears,
      minAgeRequired: YOUNG_DRIVER_MIN_AGE,
      messageKey: "underage",
    };
  }

  if (captainIncluded) {
    return {
      ok: true,
      ageYears,
      youngDriver: false,
      youngDriverHoldAddOnCents: 0,
      adjustedDepositAmountCents: input.baseDepositAmountCents,
      minAgeRequired: YOUNG_DRIVER_MIN_AGE,
    };
  }

  if (ageYears < DEFAULT_VEHICLE_MIN_AGE) {
    if (!allowsYoung) {
      return {
        ok: false,
        reason: "host_blocks_young",
        ageYears,
        minAgeRequired: DEFAULT_VEHICLE_MIN_AGE,
        messageKey: "hostBlocksYoung",
      };
    }
    const mult = listingYoungDriverHoldMultiplier(input.listing);
    const security = Math.max(0, Math.round(input.securityDepositCents));
    const upliftedSecurity = Math.round(security * mult);
    const addOn = Math.max(0, upliftedSecurity - security);
    return {
      ok: true,
      ageYears,
      youngDriver: true,
      youngDriverHoldAddOnCents: addOn,
      adjustedDepositAmountCents: input.baseDepositAmountCents + addOn,
      minAgeRequired: YOUNG_DRIVER_MIN_AGE,
    };
  }

  return {
    ok: true,
    ageYears,
    youngDriver: false,
    youngDriverHoldAddOnCents: 0,
    adjustedDepositAmountCents: input.baseDepositAmountCents,
    minAgeRequired: DEFAULT_VEHICLE_MIN_AGE,
  };
}
