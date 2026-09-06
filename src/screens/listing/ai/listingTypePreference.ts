import type { CategoryGrade } from "../listingItemCategories";

const KEY = "evorios:listing:last-listing-type";

/**
 * Last Personal/Professional answer.
 *
 * Used to pre-highlight one option; the host still has to confirm, because the
 * AI must never decide how someone is listing their item.
 */
export function loadPreferredListingType(): CategoryGrade | "" {
  try {
    const raw = localStorage.getItem(KEY);
    return raw === "personal" || raw === "professional" ? raw : "";
  } catch {
    return "";
  }
}

export function savePreferredListingType(listingType: CategoryGrade): void {
  try {
    localStorage.setItem(KEY, listingType);
  } catch {
    // Preference only.
  }
}
