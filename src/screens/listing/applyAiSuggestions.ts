import type { ListingAiSuggestions, ListingDraft } from "./types";
import {
  getMergedSubcategories,
  getSubcategories,
  gradeForSubcategory,
  matchListingCategory,
  type CategoryGrade,
} from "./listingItemCategories";
import { getCategorySpecFields, isPlantListingSubcategory } from "./categorySpecs";
import { BRAND_OTHER } from "./listingBrands";

const INCH_PATTERN = /(\d+(?:\.\d+)?)\s*-?\s*inch(?:es)?/i;

const GENERIC_MODEL_WORDS = [
  "laptop",
  "notebook",
  "ultrabook",
  "chromebook",
  "computer",
  "pc",
  "tablet",
  "phone",
  "smartphone",
  "monitor",
  "display",
  "television",
  "tv",
  "camera",
  "drone",
] as const;

function matchAiSubcategory(
  matchedCategory: string,
  aiSubcategory: string,
  grade: CategoryGrade | "",
): string {
  const subs = grade
    ? getSubcategories(matchedCategory, grade)
    : getMergedSubcategories(matchedCategory);
  const labels = subs.map((item) => item.label);
  const normalizedAi = aiSubcategory.trim().toLowerCase();
  if (!normalizedAi) return "Other";

  const exact = labels.find((label) => label.toLowerCase() === normalizedAi);
  if (exact) return exact;

  const partial = labels.find(
    (label) =>
      label.toLowerCase().includes(normalizedAi) ||
      normalizedAi.includes(label.toLowerCase()),
  );
  if (partial) return partial;

  const aiWords = normalizedAi.split(/[^a-z0-9]+/).filter((word) => word.length >= 2);
  const wordMatch = labels.find((label) => {
    const labelLower = label.toLowerCase();
    return aiWords.some(
      (word) => labelLower.includes(word) || word.includes(labelLower),
    );
  });
  if (wordMatch) return wordMatch;

  return labels.includes("Other") ? "Other" : labels[0] ?? "Other";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isEmptySpec(value: string | undefined): boolean {
  return !(value ?? "").trim();
}

function mapInchesToScreenSizeBand(inches: number): string | null {
  if (!Number.isFinite(inches) || inches <= 0) return null;
  if (inches < 13) return "under_13";
  if (inches < 15) return "13_15";
  if (inches < 17) return "15_17";
  if (inches < 32) return "17_32";
  if (inches < 55) return "32_55";
  return "55_plus";
}

function extractInchesFromTitle(title: string): number | undefined {
  const match = title.match(INCH_PATTERN);
  if (!match?.[1]) return undefined;
  const inches = Number(match[1]);
  return Number.isFinite(inches) && inches > 0 ? inches : undefined;
}

/** Map "4-Person", "sleeps 4", "4p" etc. → Outdoor personCapacityBand option keys. */
function mapPersonCountToCapacityBand(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null;
  if (count <= 1) return "1_person";
  if (count === 2) return "2_person";
  if (count <= 4) return "3_4_person";
  if (count <= 6) return "5_6_person";
  return "7_plus_person";
}

function extractPersonCapacityFromText(...texts: Array<string | undefined>): string | null {
  for (const raw of texts) {
    const text = (raw ?? "").trim();
    if (!text) continue;
    const patterns = [
      /(\d+)\s*[-–]?\s*(?:person|people|man|men|pax)\b/i,
      /\b(?:sleeps|seats)\s*[:\s]*(\d+)\b/i,
      /\b(\d+)\s*p\b/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (!match?.[1]) continue;
      const band = mapPersonCountToCapacityBand(Number(match[1]));
      if (band) return band;
    }
  }
  return null;
}

function extractSeasonRatingFromText(...texts: Array<string | undefined>): string | null {
  for (const raw of texts) {
    const text = (raw ?? "").trim();
    if (!text) continue;
    const match = text.match(/\b([1-4])\s*[-–]?\s*season\b/i);
    if (!match?.[1]) continue;
    return `${match[1]}_season`;
  }
  return null;
}

function deriveModelFromTitle(
  title: string,
  brandsToStrip: string[],
): string {
  let text = title.trim();
  for (const brand of brandsToStrip) {
    const trimmed = brand.trim();
    if (!trimmed || trimmed === BRAND_OTHER) continue;
    text = text.replace(new RegExp(`\\b${escapeRegExp(trimmed)}\\b`, "ig"), " ");
  }
  text = text.replace(INCH_PATTERN, " ");
  for (const word of GENERIC_MODEL_WORDS) {
    text = text.replace(new RegExp(`\\b${word}\\b`, "ig"), " ");
  }
  return text.replace(/[|,/]+/g, " ").replace(/\s+/g, " ").trim();
}

function softFillCategorySpecs(
  category: string,
  subcategory: string,
  currentSpecs: Record<string, string>,
  suggestions: ListingAiSuggestions,
  resolvedTitle: string,
): Record<string, string> {
  const fields = getCategorySpecFields(category, subcategory);
  if (fields.length === 0) return currentSpecs;

  const next = { ...currentSpecs };
  const fieldByKey = new Map(fields.map((field) => [field.key, field]));

  const brandField = fieldByKey.get("brand");
  if (brandField?.type === "brand" && isEmptySpec(next.brand)) {
    const aiBrand = (suggestions.brand ?? "").trim();
    if (aiBrand) {
      const matched = brandField.options?.find(
        (option) => option.toLowerCase() === aiBrand.toLowerCase(),
      );
      if (matched) {
        next.brand = matched;
      } else {
        next.brand = BRAND_OTHER;
        if (isEmptySpec(next.brandOther)) {
          next.brandOther = aiBrand;
        }
      }
    }
  }

  // Vehicles use `make` (not brand dropdown) — map photo AI brand → make.
  const makeField = fieldByKey.get("make");
  if (makeField && isEmptySpec(next.make)) {
    const aiMake = (suggestions.brand ?? "").trim();
    if (aiMake) next.make = aiMake;
  }

  const modelField = fieldByKey.get("model");
  if (modelField && isEmptySpec(next.model)) {
    const aiModel = (suggestions.model ?? "").trim();
    const brandsToStrip = [
      next.make,
      next.brand,
      next.brandOther,
      suggestions.brand,
    ].filter((value): value is string => Boolean(value?.trim()));
    const fromTitle = deriveModelFromTitle(resolvedTitle, brandsToStrip);
    const model = aiModel || fromTitle;
    if (model) next.model = model;
  }

  const screenField = fieldByKey.get("screenSizeBand");
  if (screenField && isEmptySpec(next.screenSizeBand)) {
    const inches =
      suggestions.screenInches != null &&
      Number.isFinite(suggestions.screenInches) &&
      suggestions.screenInches > 0
        ? suggestions.screenInches
        : extractInchesFromTitle(resolvedTitle);
    if (inches != null) {
      const band = mapInchesToScreenSizeBand(inches);
      if (band && (!screenField.options || screenField.options.includes(band))) {
        next.screenSizeBand = band;
      }
    }
  }

  const personField = fieldByKey.get("personCapacityBand");
  if (personField && isEmptySpec(next.personCapacityBand)) {
    const fromAi =
      suggestions.personCapacity != null
        ? mapPersonCountToCapacityBand(suggestions.personCapacity)
        : null;
    const band =
      fromAi ||
      extractPersonCapacityFromText(
        resolvedTitle,
        suggestions.title,
        suggestions.description,
        suggestions.model,
      );
    if (band && (!personField.options || personField.options.includes(band))) {
      next.personCapacityBand = band;
    }
  }

  const seasonField = fieldByKey.get("seasonRating");
  if (seasonField && isEmptySpec(next.seasonRating)) {
    const fromAi =
      suggestions.seasonRating != null && Number.isFinite(suggestions.seasonRating)
        ? `${Math.min(4, Math.max(1, Math.round(suggestions.seasonRating)))}_season`
        : null;
    const band =
      fromAi ||
      extractSeasonRatingFromText(
        resolvedTitle,
        suggestions.title,
        suggestions.description,
      );
    if (band && (!seasonField.options || seasonField.options.includes(band))) {
      next.seasonRating = band;
    }
  }

  // Vehicles: soft-fill year from photo appearance when VIN hasn't set it yet.
  const yearField = fieldByKey.get("year");
  if (yearField && isEmptySpec(next.year)) {
    const aiYear = suggestions.year;
    if (aiYear != null && Number.isFinite(aiYear)) {
      const max = new Date().getFullYear() + 1;
      const rounded = Math.round(aiYear);
      if (rounded >= 1950 && rounded <= max) {
        next.year = String(rounded);
      }
    }
  }

  // Soft-fill color from photos when the shelf has a color select (vehicles, costumes, etc.).
  const colorField = fieldByKey.get("color");
  if (colorField && isEmptySpec(next.color)) {
    const aiColor = (suggestions.color ?? "").trim().toLowerCase();
    if (aiColor && colorField.options?.includes(aiColor)) {
      next.color = aiColor;
    }
  }

  return next;
}

/** Soft-fill empty category specs from title / AI — safe to call on details step. */
export function softFillEmptyCategorySpecs(current: ListingDraft): ListingDraft {
  if (!current.category || !current.subcategory) return current;
  const suggestions: ListingAiSuggestions = current.aiSuggestions ?? {
    title: current.title,
    category: current.category,
    subcategory: current.subcategory,
    grade: current.grade === "professional" ? "professional" : "personal",
    condition:
      current.condition === "new" ||
      current.condition === "like_new" ||
      current.condition === "good" ||
      current.condition === "fair"
        ? current.condition
        : "good",
    description: current.description,
    estimatedValue: 0,
  };
  const nextSpecs = softFillCategorySpecs(
    current.category,
    current.subcategory,
    current.categorySpecs ?? {},
    suggestions,
    current.title.trim() || suggestions.title,
  );
  const prev = current.categorySpecs ?? {};
  const keys = new Set([...Object.keys(prev), ...Object.keys(nextSpecs)]);
  let changed = false;
  for (const key of keys) {
    if ((prev[key] ?? "") !== (nextSpecs[key] ?? "")) {
      changed = true;
      break;
    }
  }
  if (!changed) return current;
  return { ...current, categorySpecs: nextSpecs };
}

/** Fill empty draft fields from photo AI — never overwrite host-chosen category/sub. */
export function applyAiSuggestionsToDraft(
  current: ListingDraft,
  suggestions: ListingAiSuggestions,
): ListingDraft {
  const matchedCategory = matchListingCategory(suggestions.category);
  const nextCategory = current.category || matchedCategory || current.category;
  const suggestedGrade =
    current.grade ||
    (suggestions.grade === "professional" || suggestions.grade === "personal"
      ? suggestions.grade
      : "") ||
    "";
  const matchedSubcategory = nextCategory
    ? matchAiSubcategory(nextCategory, suggestions.subcategory, suggestedGrade)
    : "";
  const nextSubcategory =
    current.subcategory ||
    (nextCategory ? matchedSubcategory : current.subcategory);
  const nextGrade =
    current.grade ||
    suggestedGrade ||
    (nextCategory && nextSubcategory
      ? gradeForSubcategory(nextCategory, nextSubcategory)
      : "") ||
    current.grade;
  const plantListing = isPlantListingSubcategory(nextSubcategory);
  const nextCondition = plantListing
    ? "good"
    : current.condition || suggestions.condition || current.condition;
  const nextTitle = current.title.trim()
    ? current.title
    : suggestions.title || current.title;
  const nextCategorySpecs =
    nextCategory && nextSubcategory
      ? softFillCategorySpecs(
          nextCategory,
          nextSubcategory,
          current.categorySpecs ?? {},
          suggestions,
          nextTitle,
        )
      : current.categorySpecs;

  return {
    ...current,
    title: nextTitle,
    grade: nextGrade,
    category: nextCategory,
    subcategory: nextSubcategory,
    condition: nextCondition,
    description: current.description.trim()
      ? current.description
      : suggestions.description || current.description,
    replacementValue: plantListing
      ? current.replacementValue
      : current.replacementValue.trim()
        ? current.replacementValue
        : suggestions.estimatedValue != null
          ? String(suggestions.estimatedValue)
          : current.replacementValue,
    categorySpecs: nextCategorySpecs,
    aiSuggestions: suggestions,
    aiAnalysisPending: false,
  };
}
