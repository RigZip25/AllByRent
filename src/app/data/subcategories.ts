import {
  CATEGORIES,
  categoryIdFromName,
  type SubcategoryItem,
} from "../../screens/listing/listingItemCategories";

export interface Subcategory {
  id: string;
  label: string;
  emoji: string;
}

export interface CategoryData {
  personal: Subcategory[];
  professional: Subcategory[];
}

function subcategoryId(
  categoryName: string,
  label: string,
  grade: "personal" | "professional",
): string {
  return `${categoryIdFromName(categoryName)}-${grade}-${categoryIdFromName(label)}`;
}

function mapSubcategoryList(
  categoryName: string,
  items: SubcategoryItem[],
  grade: "personal" | "professional",
): Subcategory[] {
  return items.map((item) => ({
    id: subcategoryId(categoryName, item.label, grade),
    label: item.label,
    emoji: item.emoji,
  }));
}

/** Browse flow subcategories — derived from listing CATEGORIES. */
export const subcategoriesData: Record<string, CategoryData> = Object.fromEntries(
  Object.entries(CATEGORIES).map(([name, data]) => [
    name,
    {
      personal: mapSubcategoryList(name, data.personal, "personal"),
      professional: mapSubcategoryList(name, data.professional, "professional"),
    },
  ]),
);
