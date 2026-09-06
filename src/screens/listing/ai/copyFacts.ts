import { getCategorySpecFields } from "../categorySpecs";
import type { ListingDraft } from "../types";
import type { ListingCopyFact } from "./listingCopy";

/** Identity and money values never travel to the copy writer. */
const EXCLUDED_SPEC_KEYS = /(serial|vin|plate|price|value|deposit|rate|fee|insurance)/i;

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

/**
 * Confirmed facts for title/description generation.
 *
 * Only values the host has seen on the details step are included, which is what
 * keeps generated copy from asserting anything unverified.
 */
export function buildConfirmedCopyFacts(
  draft: ListingDraft,
  labels?: Record<string, string>,
): ListingCopyFact[] {
  const facts: ListingCopyFact[] = [];

  if (draft.condition) {
    facts.push({ label: "Condition", value: CONDITION_LABELS[draft.condition] ?? draft.condition });
  }

  const offered = [
    draft.modes.rent ? "rent" : "",
    draft.modes.sell ? "sale" : "",
    draft.modes.gift ? "gift" : "",
  ].filter(Boolean);
  if (offered.length > 0) {
    facts.push({ label: "Offered for", value: offered.join(", ") });
  }

  const schemaFields = getCategorySpecFields(draft.category, draft.subcategory, draft.modes);
  for (const field of schemaFields) {
    if (EXCLUDED_SPEC_KEYS.test(field.key)) continue;
    const value = draft.categorySpecs?.[field.key]?.trim();
    if (!value) continue;
    facts.push({ label: labels?.[field.key] ?? field.key, value });
  }

  return facts;
}
