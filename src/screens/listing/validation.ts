import type { ListingDraft, MinimumRentalPeriod } from "./types";
import { getCategoryModeRules } from "./listingItemCategories";

function getRateFieldsForMinimumPeriod(minimumPeriod: MinimumRentalPeriod) {
  if (minimumPeriod === "1 day") {
    return { showDaily: true, showWeekly: false, showMonthly: false };
  }
  if (minimumPeriod === "3 days" || minimumPeriod === "1 week") {
    return { showDaily: false, showWeekly: true, showMonthly: true };
  }
  return { showDaily: false, showWeekly: false, showMonthly: true };
}

export function isListingStepValid(step: number, draft: ListingDraft): boolean {
  switch (step) {
    case 1:
      return (
        draft.photos.length > 0 &&
        !draft.aiAnalysisPending &&
        !draft.photoEnhancementPending
      );

    case 2: {
      const itemInfoValid =
        draft.title.trim() !== "" &&
        draft.category.trim() !== "" &&
        draft.subcategory.trim() !== "" &&
        draft.grade !== "" &&
        draft.condition !== "" &&
        draft.replacementValue.trim() !== "";
      if (!itemInfoValid) return false;

      const { modes, pricing, category } = draft;
      const rules = getCategoryModeRules(category);
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

        if (showDaily && (!pricing.dailyRate.trim() || pricing.dailyRate === "0")) {
          return false;
        }
        if (showWeekly && (!pricing.weeklyRate.trim() || pricing.weeklyRate === "0")) {
          return false;
        }
        if (showMonthly && (!pricing.monthlyRate.trim() || pricing.monthlyRate === "0")) {
          return false;
        }

        if (pricing.longTermEnabled) {
          const rate = pricing.longTermMonthlyRate?.trim() ?? "";
          if (!rate || rate === "0") return false;
        }
      }
      if (modes.sell && rules.sell && !pricing.salePrice.trim()) return false;
      return true;
    }

    case 3:
      return true;

    default:
      return false;
  }
}
