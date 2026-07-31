import { CATEGORIES, CATEGORY_NAMES, type ListingCategory } from "../../screens/listing/listingItemCategories";

/** URL-safe slug from category display name ("Tools & DIY" → "tools-diy"). */
export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type SeoCategory = {
  slug: string;
  name: ListingCategory;
  icon: string;
  /** Short phrase for search intent, e.g. "tools" */
  searchNoun: string;
};

/** Human search nouns for titles — keep aligned with CATEGORY_NAMES. */
const SEARCH_NOUNS: Partial<Record<ListingCategory, string>> = {
  "Tools & DIY": "tools",
  "Garden & Yard": "garden and yard gear",
  "Home & Kitchen": "home and kitchen items",
  "Baby & Kids": "baby and kids gear",
  "Party & Events": "party and event gear",
  "Sports & Recreation": "sports gear",
  "Outdoor & Camping": "camping and outdoor gear",
  "Electronics & Tech": "electronics",
  "Photo & Video": "cameras and video gear",
  "Bikes & Scooters": "bikes and scooters",
  "Gym & Fitness": "fitness equipment",
  "Music & Audio": "music and audio gear",
  Vehicles: "vehicles",
  "Costume & Cosplay": "costumes",
  "Office & Business": "office equipment",
  Construction: "construction equipment",
  "Heavy Equipment": "heavy equipment",
  "Boats & Water": "boats and watercraft",
  "Real Estate": "spaces",
  "Unique & Other": "unique items",
};

function buildSeoCategories(): SeoCategory[] {
  return CATEGORY_NAMES.map((name) => ({
    slug: slugifyCategoryName(name),
    name,
    icon: CATEGORIES[name]?.icon ?? "📦",
    searchNoun: SEARCH_NOUNS[name] ?? name.toLowerCase(),
  }));
}

export const SEO_CATEGORIES: readonly SeoCategory[] = buildSeoCategories();

export function getSeoCategoryBySlug(slug: string): SeoCategory | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  return SEO_CATEGORIES.find((c) => c.slug === key) ?? null;
}

export function getRelatedSeoCategories(slug: string, limit = 6): SeoCategory[] {
  const current = getSeoCategoryBySlug(slug);
  if (!current) return SEO_CATEGORIES.slice(0, limit);
  return SEO_CATEGORIES.filter((c) => c.slug !== current.slug).slice(0, limit);
}
