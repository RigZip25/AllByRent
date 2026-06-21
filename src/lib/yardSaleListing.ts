import type { ListingDraft } from "../screens/listing/types";

const YARD_SALE_LISTING_KEY = "evorios_yard_sale_listing";

export function setYardSaleListingActive(active: boolean): void {
  try {
    if (active) sessionStorage.setItem(YARD_SALE_LISTING_KEY, "1");
    else sessionStorage.removeItem(YARD_SALE_LISTING_KEY);
  } catch {
    /* */
  }
}

export function isYardSaleListingActive(): boolean {
  try {
    return sessionStorage.getItem(YARD_SALE_LISTING_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearYardSaleListingActive(): void {
  setYardSaleListingActive(false);
}

/** Garage-sale listings skip category pickers — photo + price on the sale shelf. */
export function applyYardSaleListingDefaults(draft: ListingDraft): ListingDraft {
  return {
    ...draft,
    category: draft.category.trim() ? draft.category : "Unique & Other",
    subcategory: draft.subcategory.trim() ? draft.subcategory : "Unusual Items",
    grade: draft.grade || "personal",
    modes: {
      ...draft.modes,
      rent: false,
      rentToOwn: false,
      sell: true,
      buy: false,
      gift: false,
    },
    condition: draft.condition || "good",
  };
}
