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

function isDetailsAndPricingValid(draft: ListingDraft): boolean {
  const yardSaleListing = isYardSaleListingActive();
  const plantListing = isPlantListingSubcategory(draft.subcategory);
  const { modes, pricing, category } = draft;
  const rules = getCategoryModeRules(category, draft.subcategory);
  const itemInfoValid =
    draft.title.trim() !== "" &&
    (yardSaleListing ||
      (draft.category.trim() !== "" && draft.subcategory.trim() !== "")) &&
    draft.condition !== "" &&
    (plantListing || draft.replacementValue.trim() !== "");
  if (!itemInfoValid) return false;

  if (!yardSaleListing) {
    if (requiresAssetSerialNumber(draft.category) && !draft.serialNumber.trim()) {
      return false;
    }
    if (requiresAssetVin(draft.category)) {
      if (!isValidVin(draft.vin)) return false;
    } else if (draft.vin.trim() && !isValidVin(draft.vin)) {
      return false;
    }

    if (
      !areCategorySpecsValid(draft.category, draft.subcategory, draft.categorySpecs, draft.modes)
    ) {
      return false;
    }

    // Rent vehicles: need a miles allowance (included/day + overage) unless unlimited add-on is on.
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
      if (!included || !Number.isFinite(includedN) || includedN < 0) return false;
      if (!overage || !Number.isFinite(overageN) || overageN < 0) return false;
    }
  }

  const hasMode =
    (rules.rent && modes.rent) ||
    (rules.sell && modes.sell) ||
    (rules.gift && modes.gift);
  if (!hasMode) return false;
  if (modes.rent && rules.rent) {
    const periodFields = getRateFieldsForMinimumPeriod(pricing.minimumPeriod);
    const showDaily = rules.showDailyRate && periodFields.showDaily;
    const showWeekly = rules.showDailyRate && periodFields.showWeekly;
    const showMonthly = rules.showMonthlyRate && periodFields.showMonthly;

    if (periodFields.required === "daily" && showDaily) {
      if (!pricing.dailyRate.trim() || pricing.dailyRate === "0") return false;
    }
    if (periodFields.required === "weekly" && showWeekly) {
      if (!pricing.weeklyRate.trim() || pricing.weeklyRate === "0") return false;
    }
    if (periodFields.required === "monthly" && showMonthly) {
      if (!pricing.monthlyRate.trim() || pricing.monthlyRate === "0") return false;
    }

    // Security deposit is required when renting — use 0 for no card hold.
    if (!pricing.securityDeposit.trim()) {
      return false;
    }

    // Separate long-term monthly rate only when min period isn't already monthly.
    if (pricing.longTermEnabled && pricing.minimumPeriod !== "1 month") {
      const rate = pricing.longTermMonthlyRate?.trim() ?? "";
      if (!rate || rate === "0") return false;
    }

    // Commercial transport (≥26k / semi): dedicated owner email for agent proof.
    if (listingIsCommercialTransport(draft)) {
      const email = (draft.handoff.insuranceOwnerProofEmail ?? "").trim();
      if (!isValidInsuranceOwnerProofEmail(email)) return false;
    }

    // Heavy / semi / commercial trailer: host must set tire/wheel count (not silent 4).
    if (listingRequiresHostWheelCount(draft)) {
      const raw = (draft.categorySpecs?.wheelCount ?? "").trim();
      const n = Number(raw);
      if (
        !raw ||
        !Number.isFinite(n) ||
        n < MIN_WHEEL_COUNT ||
        n > MAX_WHEEL_COUNT
      ) {
        return false;
      }
    }
  }
  if (modes.sell && rules.sell && !pricing.salePrice.trim()) return false;
  return true;
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
