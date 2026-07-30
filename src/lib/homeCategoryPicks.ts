import { CATEGORIES, CATEGORY_NAMES } from "../screens/listing/listingItemCategories";

/** Featured browse categories — compact strips when space is tight. */
export const HOME_CATEGORY_PICKS = [
  "Tools & DIY",
  "Garden & Yard",
  "Photo & Video",
  "Electronics & Tech",
  "Party & Events",
  "Sports & Recreation",
  "Baby & Kids",
  "Home & Kitchen",
] as const;

export type HomeCategoryPick = (typeof HOME_CATEGORY_PICKS)[number];

export function getHomeCategoryChips(): { name: string; icon: string }[] {
  return HOME_CATEGORY_PICKS.filter((name) => name in CATEGORIES).map((name) => ({
    name,
    icon: CATEGORIES[name]?.icon ?? "📦",
  }));
}

/** Full catalog chips — intro, guide, and browse hub. */
export function getAllCategoryChips(): { name: string; icon: string }[] {
  return CATEGORY_NAMES.map((name) => ({
    name,
    icon: CATEGORIES[name]?.icon ?? "📦",
  }));
}
