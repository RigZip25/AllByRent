import type { ListingDraft } from "./types";
import { categoryRequiresInsuranceProof } from "../../lib/listingInsurance";
import { resolveRentRuleHandoffDefaults } from "../../lib/listingRentRules";

/** Sensible defaults when pickup / hours were skipped in the fast wizard. */
export function applyFrictionlessDefaults(draft: ListingDraft): ListingDraft {
  const handoff = { ...draft.handoff };
  if (!handoff.inPerson && !handoff.contactless && !handoff.delivery) {
    handoff.inPerson = true;
  }

  if (categoryRequiresInsuranceProof(draft.category) && draft.modes.rent) {
    handoff.requireInsuranceProof = handoff.requireInsuranceProof ?? true;
    handoff.insuranceCoverageLeadDays = handoff.insuranceCoverageLeadDays ?? 1;
  }

  if (draft.modes.rent) {
    const rentRules = resolveRentRuleHandoffDefaults({ ...draft, handoff });
    if (rentRules.proRentersOnly !== undefined) {
      handoff.proRentersOnly = rentRules.proRentersOnly;
    }
    if (rentRules.requirePhysicalDamage) {
      handoff.requirePhysicalDamage = true;
      handoff.requireInsuranceProof = true;
    }
    if (rentRules.requireCdl) {
      handoff.requireCdl = true;
      handoff.requireInsuranceProof = true;
      handoff.requirePhysicalDamage = true;
    }
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
