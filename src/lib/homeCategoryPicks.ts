import { CATEGORIES, CATEGORY_NAMES, type SubcategoryItem } from "../screens/listing/listingItemCategories";

/** Featured browse strip — same priority as CATEGORY_DISPLAY_ORDER head. */
export const HOME_CATEGORY_PICKS = [
  "Tools & DIY",
  "Garden & Yard",
  "Home & Kitchen",
  "Baby & Kids",
  "Party & Events",
  "Sports & Recreation",
  "Outdoor & Camping",
  "Electronics & Tech",
] as const;

export type HomeCategoryPick = (typeof HOME_CATEGORY_PICKS)[number];

export type CategoryChip = { name: string; icon: string };

export type CategoryCatalogEntry = CategoryChip & {
  personal: SubcategoryItem[];
  professional: SubcategoryItem[];
};

export function getHomeCategoryChips(): CategoryChip[] {
  return HOME_CATEGORY_PICKS.filter((name) => name in CATEGORIES).map((name) => ({
    name,
    icon: CATEGORIES[name]?.icon ?? "📦",
  }));
}

/** Full catalog chips — intro, guide, and browse hub. */
export function getAllCategoryChips(): CategoryChip[] {
  return CATEGORY_NAMES.map((name) => ({
    name,
    icon: CATEGORIES[name]?.icon ?? "📦",
  }));
}

/** Categories with personal + pro subcategories for intro / guide explorers. */
export function getCategoryCatalog(): CategoryCatalogEntry[] {
  return CATEGORY_NAMES.map((name) => {
    const data = CATEGORIES[name];
    return {
      name,
      icon: data?.icon ?? "📦",
      personal: (data?.personal ?? []).filter((s) => s.label !== "Other"),
      professional: (data?.professional ?? []).filter((s) => s.label !== "Other"),
    };
  });
}
