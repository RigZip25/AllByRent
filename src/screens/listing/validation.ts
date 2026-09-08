import type { ListingDraft } from "./types";
import { LISTING_STEP } from "./types";
import {
  getCategoryModeRules,
  requiresAssetSerialNumber,
  requiresAssetVin,
} from "./listingItemCategories";
import { areCategorySpecsValid, isPlantListingSubcategory } from "./categorySpecs";
import { isValidVin } from "../../lib/vinValidate";
import { isYardSaleListingActive } from "../../lib/yardSaleListing";
import { getRateFieldsForMinimumPeriod } from "../../lib/listingRateFields";
import {
  isValidInsuranceOwnerProofEmail,
} from "../../lib/listingInsurance";
import { listingIsCommercialTransport } from "../../lib/listingRentRules";
import {
  MAX_WHEEL_COUNT,
  MIN_WHEEL_COUNT,
  listingRequiresHostWheelCount,
} from "../../lib/preTripInspection";

/** Stable DOM anchors for Continue-blocked scroll targets. */
export const LISTING_FIELD_ANCHOR = {
  photos: "listing-field-photos",
  category: "listing-field-category",
  grade: "listing-field-grade",
  subcategory: "listing-field-subcategory",
  title: "listing-field-title",
  condition: "listing-field-condition",
  replacementValue: "listing-field-replacement-value",
  serialNumber: "listing-field-serial-number",
  vin: "listing-field-vin",
  categorySpecs: "listing-field-category-specs",
  modes: "listing-field-modes",
  dailyRate: "listing-field-daily-rate",
  weeklyRate: "listing-field-weekly-rate",
  monthlyRate: "listing-field-monthly-rate",
  securityDeposit: "listing-field-security-deposit",
  longTermMonthlyRate: "listing-field-long-term-monthly-rate",
  salePrice: "listing-field-sale-price",
  includedMiles: "listing-field-included-miles",
  overagePerMile: "listing-field-overage-per-mile",
  insuranceEmail: "listing-field-insurance-email",
  wheelCount: "listing-field-wheel-count",
} as const;

export type ListingFieldAnchorId =
  (typeof LISTING_FIELD_ANCHOR)[keyof typeof LISTING_FIELD_ANCHOR];

export type ListingStepFailure = {
  message: string;
  anchorId: ListingFieldAnchorId;
};

/** Optional copy for first-failure Continue banners (falls back to English). */
export type ListingValidationCopy = {
  addPhoto: string;
  pickCategory: string;
  pickGrade: string;
  pickSubcategory: string;
  enterTitle: string;
  pickCondition: string;
  enterReplacementValue: string;
  enterSerial: string;
  enterVin: string;
  completeCategorySpecs: string;
  pickMode: string;
  enterDailyRate: string;
  enterWeeklyRate: string;
  enterMonthlyRate: string;
  enterSecurityDeposit: string;
  enterLongTermRate: string;
  enterSalePrice: string;
  enterIncludedMiles: string;
  enterOveragePerMile: string;
  enterInsuranceEmail: string;
  enterWheelCount: string;
};

const DEFAULT_VALIDATION_COPY: ListingValidationCopy = {
  addPhoto: "Add at least one photo to continue.",
  pickCategory: "Choose a category to continue.",
  pickGrade: "Choose personal or professional to continue.",
  pickSubcategory: "Choose a subcategory to continue.",
  enterTitle: "Add a title to continue.",
  pickCondition: "Choose the item condition to continue.",
  enterReplacementValue: "Enter a replacement value to continue.",
  enterSerial: "Enter the serial number to continue.",
  enterVin: "Enter a valid VIN to continue.",
  completeCategorySpecs: "Complete the required item specs to continue.",
  pickMode: "Turn on Rent, Sell, or Free to continue.",
  enterDailyRate: "Enter a daily rate to continue.",
  enterWeeklyRate: "Enter a weekly rate to continue.",
  enterMonthlyRate: "Enter a monthly rate to continue.",
  enterSecurityDeposit: "Enter a security deposit (use 0 for none) to continue.",
  enterLongTermRate: "Enter a long-term monthly rate to continue.",
  enterSalePrice: "Enter a sale price to continue.",
  enterIncludedMiles: "Enter included miles per day to continue.",
  enterOveragePerMile: "Enter the overage price per mile to continue.",
  enterInsuranceEmail: "Enter a valid insurance owner-proof email to continue.",
  enterWheelCount: "Enter the tire / wheel count to continue.",
};

function getFirstDetailsFailure(
  draft: ListingDraft,
  copy: ListingValidationCopy,
): ListingStepFailure | null {
  const yardSaleListing = isYardSaleListingActive();
  const plantListing = isPlantListingSubcategory(draft.subcategory);
  const { modes, pricing, category } = draft;
  const rules = getCategoryModeRules(category, draft.subcategory);

  if (!draft.title.trim()) {
    return { message: copy.enterTitle, anchorId: LISTING_FIELD_ANCHOR.title };
  }
  if (!yardSaleListing) {
    if (!draft.category.trim()) {
      return { message: copy.pickCategory, anchorId: LISTING_FIELD_ANCHOR.category };
    }
    if (!draft.subcategory.trim()) {
      return { message: copy.pickSubcategory, anchorId: LISTING_FIELD_ANCHOR.subcategory };
    }
  }
  if (!draft.condition) {
    return { message: copy.pickCondition, anchorId: LISTING_FIELD_ANCHOR.condition };
  }
  if (!plantListing && !draft.replacementValue.trim()) {
    return {
      message: copy.enterReplacementValue,
      anchorId: LISTING_FIELD_ANCHOR.replacementValue,
    };
  }

  if (!yardSaleListing) {
    if (requiresAssetSerialNumber(draft.category) && !draft.serialNumber.trim()) {
      return { message: copy.enterSerial, anchorId: LISTING_FIELD_ANCHOR.serialNumber };
    }
    if (requiresAssetVin(draft.category)) {
      if (!isValidVin(draft.vin)) {
        return { message: copy.enterVin, anchorId: LISTING_FIELD_ANCHOR.vin };
      }
    } else if (draft.vin.trim() && !isValidVin(draft.vin)) {
      return { message: copy.enterVin, anchorId: LISTING_FIELD_ANCHOR.vin };
    }

    if (
      !areCategorySpecsValid(draft.category, draft.subcategory, draft.categorySpecs, draft.modes)
    ) {
      return {
        message: copy.completeCategorySpecs,
        anchorId: LISTING_FIELD_ANCHOR.categorySpecs,
      };
    }

    if (
      modes.rent &&
      rules.rent &&
      draft.category.trim() === "Vehicles" &&
      !draft.vehicleExtras?.unlimitedMiles?.enabled
    ) {
      const included = (draft.categorySpecs?.includedMilesPerDay ?? "").trim();
      const overage = (draft.categorySpecs?.overagePerMile ?? "").trim();
      const includedN = Number(included);
      const overageN = Number(overage);
      if (!included || !Number.isFinite(includedN) || includedN < 0) {
        return {
          message: copy.enterIncludedMiles,
          anchorId: LISTING_FIELD_ANCHOR.includedMiles,
        };
      }
      if (!overage || !Number.isFinite(overageN) || overageN < 0) {
        return {
          message: copy.enterOveragePerMile,
          anchorId: LISTING_FIELD_ANCHOR.overagePerMile,
        };
      }
    }
  }

  const hasMode =
    (rules.rent && modes.rent) ||
    (rules.sell && modes.sell) ||
    (rules.gift && modes.gift);
  if (!hasMode) {
    return { message: copy.pickMode, anchorId: LISTING_FIELD_ANCHOR.modes };
  }
  if (modes.rent && rules.rent) {
    const periodFields = getRateFieldsForMinimumPeriod(pricing.minimumPeriod);
    const showDaily = rules.showDailyRate && periodFields.showDaily;
    const showWeekly = rules.showDailyRate && periodFields.showWeekly;
    const showMonthly = rules.showMonthlyRate && periodFields.showMonthly;

    if (periodFields.required === "daily" && showDaily) {
      if (!pricing.dailyRate.trim() || pricing.dailyRate === "0") {
        return { message: copy.enterDailyRate, anchorId: LISTING_FIELD_ANCHOR.dailyRate };
      }
    }
    if (periodFields.required === "weekly" && showWeekly) {
      if (!pricing.weeklyRate.trim() || pricing.weeklyRate === "0") {
        return { message: copy.enterWeeklyRate, anchorId: LISTING_FIELD_ANCHOR.weeklyRate };
      }
    }
    if (periodFields.required === "monthly" && showMonthly) {
      if (!pricing.monthlyRate.trim() || pricing.monthlyRate === "0") {
        return { message: copy.enterMonthlyRate, anchorId: LISTING_FIELD_ANCHOR.monthlyRate };
      }
    }

    if (!pricing.securityDeposit.trim()) {
      return {
        message: copy.enterSecurityDeposit,
        anchorId: LISTING_FIELD_ANCHOR.securityDeposit,
      };
    }

    if (pricing.longTermEnabled && pricing.minimumPeriod !== "1 month") {
      const rate = pricing.longTermMonthlyRate?.trim() ?? "";
      if (!rate || rate === "0") {
        return {
          message: copy.enterLongTermRate,
          anchorId: LISTING_FIELD_ANCHOR.longTermMonthlyRate,
        };
      }
    }

    if (listingIsCommercialTransport(draft)) {
      const email = (draft.handoff.insuranceOwnerProofEmail ?? "").trim();
      if (!isValidInsuranceOwnerProofEmail(email)) {
        return {
          message: copy.enterInsuranceEmail,
          anchorId: LISTING_FIELD_ANCHOR.insuranceEmail,
        };
      }
    }

    if (listingRequiresHostWheelCount(draft)) {
      const raw = (draft.categorySpecs?.wheelCount ?? "").trim();
      const n = Number(raw);
      if (
        !raw ||
        !Number.isFinite(n) ||
        n < MIN_WHEEL_COUNT ||
        n > MAX_WHEEL_COUNT
      ) {
        return { message: copy.enterWheelCount, anchorId: LISTING_FIELD_ANCHOR.wheelCount };
      }
    }
  }
  if (modes.sell && rules.sell && !pricing.salePrice.trim()) {
    return { message: copy.enterSalePrice, anchorId: LISTING_FIELD_ANCHOR.salePrice };
  }
  return null;
}

function isDetailsAndPricingValid(draft: ListingDraft): boolean {
  return getFirstDetailsFailure(draft, DEFAULT_VALIDATION_COPY) === null;
}

/**
 * First failing field for the current wizard step — message + scroll anchor.
 * Returns null when the step is valid (or when photos are still analyzing).
 */
export function getFirstListingStepFailure(
  step: number,
  draft: ListingDraft,
  copy: ListingValidationCopy = DEFAULT_VALIDATION_COPY,
): ListingStepFailure | null {
  switch (step) {
    case LISTING_STEP.category:
      if (isYardSaleListingActive()) return null;
      if (!draft.category.trim()) {
        return { message: copy.pickCategory, anchorId: LISTING_FIELD_ANCHOR.category };
      }
      if (!draft.grade.trim()) {
        return { message: copy.pickGrade, anchorId: LISTING_FIELD_ANCHOR.grade };
      }
      if (!draft.subcategory.trim()) {
        return { message: copy.pickSubcategory, anchorId: LISTING_FIELD_ANCHOR.subcategory };
      }
      return null;

    case LISTING_STEP.details:
      return getFirstDetailsFailure(draft, copy);

    case LISTING_STEP.photos:
      if (draft.photos.length === 0) {
        return { message: copy.addPhoto, anchorId: LISTING_FIELD_ANCHOR.photos };
      }
      return null;

    case LISTING_STEP.review:
      return null;

    default:
      return null;
  }
}

export function isListingStepValid(step: number, draft: ListingDraft): boolean {
  switch (step) {
    case LISTING_STEP.category:
      if (isYardSaleListingActive()) return true;
      return (
        draft.category.trim() !== "" &&
        draft.grade.trim() !== "" &&
        draft.subcategory.trim() !== ""
      );

    case LISTING_STEP.details:
      return isDetailsAndPricingValid(draft);

    case LISTING_STEP.photos:
      return (
        draft.photos.length > 0 &&
        !draft.aiAnalysisPending &&
        !draft.photoEnhancementPending
      );

    case LISTING_STEP.review:
      return true;

    default:
      return false;
  }
}

export function scrollToListingFieldAnchor(anchorId: string): void {
  const node = document.getElementById(anchorId);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
}
