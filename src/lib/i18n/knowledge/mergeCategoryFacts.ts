import type {
  CategoryFactBlock,
  CategoryFactsBundle,
  CategoryFactsOverlay,
} from "./types";
import { categoryFactsEn } from "./categoryFacts.en";

function mergeFactBlock(
  base: CategoryFactBlock | undefined,
  overlay: CategoryFactBlock | undefined,
): CategoryFactBlock | undefined {
  if (!overlay && !base) return undefined;
  if (!overlay) return base;
  if (!base) return overlay;
  return {
    ...base,
    ...overlay,
    qa: overlay.qa ?? base.qa,
  };
}

function mergeByCategory(
  base: CategoryFactsBundle["byCategory"],
  overlay: CategoryFactsOverlay["byCategory"] | undefined,
): CategoryFactsBundle["byCategory"] {
  const keys = new Set([
    ...Object.keys(base ?? {}),
    ...Object.keys(overlay ?? {}),
  ]);
  const out: CategoryFactsBundle["byCategory"] = {};
  for (const key of keys) {
    const merged = mergeFactBlock(base?.[key], overlay?.[key]);
    if (merged) out[key] = merged;
  }
  return out;
}

function mergeBySubcategory(
  base: CategoryFactsBundle["bySubcategory"],
  overlay: CategoryFactsOverlay["bySubcategory"] | undefined,
): CategoryFactsBundle["bySubcategory"] {
  const catKeys = new Set([
    ...Object.keys(base ?? {}),
    ...Object.keys(overlay ?? {}),
  ]);
  const out: NonNullable<CategoryFactsBundle["bySubcategory"]> = {};
  for (const cat of catKeys) {
    const baseSubs = base?.[cat] ?? {};
    const overSubs = overlay?.[cat] ?? {};
    const subKeys = new Set([
      ...Object.keys(baseSubs),
      ...Object.keys(overSubs),
    ]);
    const mergedSubs: Record<string, CategoryFactBlock> = {};
    for (const sub of subKeys) {
      const merged = mergeFactBlock(baseSubs[sub], overSubs[sub]);
      if (merged) mergedSubs[sub] = merged;
    }
    if (Object.keys(mergedSubs).length) out[cat] = mergedSubs;
  }
  return out;
}

/**
 * Resolve locale FactCards against canonical EN.
 * Missing category / subcategory shelves (and chrome strings) fall back to EN
 * so new languages inherit the KB, then override gradually.
 */
export function resolveCategoryFacts(
  overlay?: CategoryFactsOverlay | null,
  canonical: CategoryFactsBundle = categoryFactsEn,
): CategoryFactsBundle {
  if (!overlay) return canonical;
  return {
    expand: overlay.expand ?? canonical.expand,
    collapse: overlay.collapse ?? canonical.collapse,
    byCategory: mergeByCategory(canonical.byCategory, overlay.byCategory),
    bySubcategory: mergeBySubcategory(
      canonical.bySubcategory,
      overlay.bySubcategory,
    ),
  };
}
