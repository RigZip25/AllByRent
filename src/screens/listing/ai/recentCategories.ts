import { findTaxonomyCategoryByName, taxonomyIdsForNames } from "../taxonomyCatalog";

export type RecentCategory = { category: string; subcategory: string };

const KEY = "evorios:listing:recent-categories";
const LIMIT = 4;

/** Recent shelves, newest first — used to shortcut the manual selector. */
export function loadRecentCategories(): RecentCategory[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is RecentCategory => {
        if (!entry || typeof entry !== "object") return false;
        const { category, subcategory } = entry as RecentCategory;
        return typeof category === "string" && typeof subcategory === "string";
      })
      // Drop entries whose shelf no longer exists after a taxonomy change.
      .filter((entry) => Boolean(taxonomyIdsForNames(entry.category, entry.subcategory)))
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

export function rememberRecentCategory(category: string, subcategory: string): void {
  if (!findTaxonomyCategoryByName(category) || !subcategory.trim()) return;
  try {
    const next = [
      { category, subcategory },
      ...loadRecentCategories().filter(
        (entry) => entry.category !== category || entry.subcategory !== subcategory,
      ),
    ].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Recents are a convenience only.
  }
}
