/**
 * Stable ID view over the listing taxonomy.
 *
 * `CATEGORIES` is keyed by display name and its subcategories are keyed by
 * label, which is fine for humans but unusable as an AI contract. This module
 * derives IDs from those names with the same slug function the browse flow
 * already uses, so IDs stay stable as long as the names do.
 *
 * Subcategory IDs deliberately ignore the personal/professional shelf: the
 * model classifies what the item is, and the host decides how they list it.
 */
import {
  CATEGORIES,
  CATEGORY_DISPLAY_ORDER,
  categoryIdFromName,
  getMergedSubcategories,
  gradeForSubcategory,
  type CategoryGrade,
} from "./listingItemCategories";

export type TaxonomySubcategoryEntry = {
  id: string;
  label: string;
  /** Shelf the label lives on, or "" when both shelves carry it. */
  nativeGrade: CategoryGrade | "";
};

export type TaxonomyCategoryEntry = {
  id: string;
  name: string;
  icon: string;
  subcategories: TaxonomySubcategoryEntry[];
};

export type TaxonomySelection = {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryLabel: string;
};

export function taxonomySubcategoryId(label: string): string {
  return categoryIdFromName(label);
}

function buildCatalog(): TaxonomyCategoryEntry[] {
  const names =
    CATEGORY_DISPLAY_ORDER.length > 0 ? CATEGORY_DISPLAY_ORDER : Object.keys(CATEGORIES);

  return names
    .filter((name) => Boolean(CATEGORIES[name]))
    .map((name) => {
      const data = CATEGORIES[name]!;
      const seen = new Set<string>();
      const subcategories: TaxonomySubcategoryEntry[] = [];

      for (const sub of getMergedSubcategories(name)) {
        const id = taxonomySubcategoryId(sub.label);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        subcategories.push({
          id,
          label: sub.label,
          nativeGrade: gradeForSubcategory(name, sub.label),
        });
      }

      return {
        id: categoryIdFromName(name),
        name,
        icon: data.icon,
        subcategories,
      };
    });
}

export const LISTING_TAXONOMY: TaxonomyCategoryEntry[] = buildCatalog();

const CATEGORY_BY_ID = new Map(LISTING_TAXONOMY.map((entry) => [entry.id, entry]));
const CATEGORY_BY_NAME = new Map(LISTING_TAXONOMY.map((entry) => [entry.name, entry]));

export function findTaxonomyCategory(categoryId: string): TaxonomyCategoryEntry | null {
  return CATEGORY_BY_ID.get(categoryId.trim()) ?? null;
}

export function findTaxonomyCategoryByName(name: string): TaxonomyCategoryEntry | null {
  return CATEGORY_BY_NAME.get(name.trim()) ?? null;
}

export function findTaxonomySubcategory(
  categoryId: string,
  subcategoryId: string,
): TaxonomySubcategoryEntry | null {
  const category = findTaxonomyCategory(categoryId);
  if (!category) return null;
  const id = subcategoryId.trim();
  return category.subcategories.find((sub) => sub.id === id) ?? null;
}

/** True only when both IDs exist and the subcategory belongs to that category. */
export function isTaxonomyPairValid(categoryId: string, subcategoryId: string): boolean {
  return findTaxonomySubcategory(categoryId, subcategoryId) !== null;
}

export function resolveTaxonomySelection(
  categoryId: string,
  subcategoryId: string,
): TaxonomySelection | null {
  const category = findTaxonomyCategory(categoryId);
  const subcategory = findTaxonomySubcategory(categoryId, subcategoryId);
  if (!category || !subcategory) return null;
  return {
    categoryId: category.id,
    categoryName: category.name,
    subcategoryId: subcategory.id,
    subcategoryLabel: subcategory.label,
  };
}

/** Names → IDs, for analytics and for seeding the AI panel from a saved draft. */
export function taxonomyIdsForNames(
  categoryName: string,
  subcategoryLabel: string,
): { categoryId: string; subcategoryId: string } | null {
  const category = findTaxonomyCategoryByName(categoryName);
  if (!category) return null;
  const subId = taxonomySubcategoryId(subcategoryLabel);
  const subcategory = category.subcategories.find((sub) => sub.id === subId);
  if (!subcategory) return null;
  return { categoryId: category.id, subcategoryId: subcategory.id };
}

/**
 * Shelf grade to store for a confirmed selection.
 *
 * `draft.grade` addresses a shelf, while the host's Personal/Professional
 * answer lives in `draft.listingType`. When a label sits on exactly one shelf
 * that shelf wins, so shelf lookups keep resolving; otherwise the host's answer
 * decides which of the two identical shelves to address.
 */
export function resolveShelfGrade(
  categoryName: string,
  subcategoryLabel: string,
  listingType: CategoryGrade,
): CategoryGrade {
  const entry = findTaxonomyCategoryByName(categoryName)?.subcategories.find(
    (sub) => sub.id === taxonomySubcategoryId(subcategoryLabel),
  );
  return entry?.nativeGrade || listingType;
}
