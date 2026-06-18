import type { ListingDraft } from "./types";

/** Sensible defaults when pickup / hours were skipped in the fast wizard. */
export function applyFrictionlessDefaults(draft: ListingDraft): ListingDraft {
  const handoff = { ...draft.handoff };
  if (!handoff.inPerson && !handoff.contactless && !handoff.delivery) {
    handoff.inPerson = true;
  }
  return { ...draft, handoff };
}
