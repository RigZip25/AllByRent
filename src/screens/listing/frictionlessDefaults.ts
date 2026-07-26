import type { ListingDraft } from "./types";

/** Sensible defaults when pickup / hours were skipped in the fast wizard. */
export function applyFrictionlessDefaults(draft: ListingDraft): ListingDraft {
  const handoff = { ...draft.handoff };
  if (!handoff.inPerson && !handoff.contactless && !handoff.delivery) {
    handoff.inPerson = true;
  }

  const title = draft.title.trim();
  if (title) {
    return { ...draft, handoff };
  }

  // Prefer a readable title over "Sale item" / empty publish labels.
  const subcategory = draft.subcategory.trim();
  const category = draft.category.trim();
  const inferred =
    subcategory ||
    (category ? `${category} item` : "") ||
    (draft.modes.sell && !draft.modes.rent ? "Garage sale find" : "Neighborhood listing");

  return { ...draft, handoff, title: inferred };
}
