import type { ListingCategorySource, ListingDraft } from "../types";
import type { CategoryGrade } from "../listingItemCategories";
import { resolveShelfGrade, resolveTaxonomySelection, taxonomyIdsForNames } from "../taxonomyCatalog";
import type { CategoryCandidate, ClassificationOutcome } from "./listingClassifier";

/**
 * Pure state transitions for the category step.
 *
 * The UI only decides *when* these run; what they do — including the rule that
 * a category change always resets the listing type, the field schema, and any
 * AI-filled values — lives here so it can be tested without React.
 */
export function applyCategoryDecision(
  draft: ListingDraft,
  candidate: CategoryCandidate,
  source: ListingCategorySource,
  itemName: string,
  now: () => Date = () => new Date(),
): ListingDraft {
  return {
    ...draft,
    category: candidate.categoryName,
    subcategory: candidate.subcategoryLabel,
    // Shelf grade is derived only once the host answers Personal/Professional.
    grade: "",
    listingType: "",
    categorySpecs: {},
    aiFields: null,
    aiFilledSpecKeys: [],
    categoryDecision: {
      itemName,
      categoryId: candidate.categoryId,
      subcategoryId: candidate.subcategoryId,
      source,
      ...(source === "ai_confirmed" ? { score: candidate.score } : {}),
      decidedAt: now().toISOString(),
    },
  };
}

export function applyListingType(draft: ListingDraft, listingType: CategoryGrade): ListingDraft {
  return {
    ...draft,
    listingType,
    grade: resolveShelfGrade(draft.category, draft.subcategory, listingType),
  };
}

/** Category picked, subcategory still open — the manual two-step browse. */
export function selectCategoryOnly(draft: ListingDraft, categoryName: string): ListingDraft {
  return {
    ...draft,
    category: categoryName,
    subcategory: "",
    grade: "",
    listingType: "",
    categorySpecs: {},
  };
}

export function clearListingType(draft: ListingDraft): ListingDraft {
  return { ...draft, listingType: "", grade: "" };
}

export function clearSubcategory(draft: ListingDraft): ListingDraft {
  return { ...draft, subcategory: "", grade: "", listingType: "", categorySpecs: {} };
}

export function clearCategoryDecision(draft: ListingDraft): ListingDraft {
  return {
    ...draft,
    category: "",
    subcategory: "",
    grade: "",
    listingType: "",
    categorySpecs: {},
    aiFields: null,
    aiFilledSpecKeys: [],
    categoryDecision: null,
  };
}

/** Candidate for a category/subcategory pair the host picked by hand. */
export function candidateFromNames(
  categoryName: string,
  subcategoryLabel: string,
): CategoryCandidate | null {
  const ids = taxonomyIdsForNames(categoryName, subcategoryLabel);
  if (!ids) return null;
  return {
    categoryId: ids.categoryId,
    categoryName,
    subcategoryId: ids.subcategoryId,
    subcategoryLabel,
    score: 0,
  };
}

export function candidateFromIds(
  categoryId: string,
  subcategoryId: string,
  score = 0,
): CategoryCandidate | null {
  const selection = resolveTaxonomySelection(categoryId, subcategoryId);
  if (!selection) return null;
  return {
    categoryId: selection.categoryId,
    categoryName: selection.categoryName,
    subcategoryId: selection.subcategoryId,
    subcategoryLabel: selection.subcategoryLabel,
    score,
  };
}

/** Suggestions to offer in the manual selector, whatever the outcome was. */
export function suggestionsFromOutcome(
  outcome: ClassificationOutcome | null | undefined,
): CategoryCandidate[] {
  if (!outcome) return [];
  if (outcome.status === "match") return [outcome.primary, ...outcome.alternatives];
  return outcome.candidates;
}

/** True when the host's pick differs from what the model suggested first. */
export function isCorrectionOfSuggestion(
  outcome: ClassificationOutcome | null | undefined,
  picked: CategoryCandidate,
): boolean {
  const primary = suggestionsFromOutcome(outcome)[0];
  if (!primary) return false;
  return (
    primary.categoryId !== picked.categoryId || primary.subcategoryId !== picked.subcategoryId
  );
}
