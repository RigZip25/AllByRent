import type { ListingDraft } from "../screens/listing/types";
import {
  isCommercialEquipmentCategory,
  listingIsCommercialTransport,
  listingRequiresPhysicalDamage,
} from "./listingRentRules";

const INSURANCE_PROOF_CATEGORIES = new Set([
  "Vehicles",
  "Heavy Equipment",
  "Boats & Water",
  "Construction",
]);

const DEFAULT_COVERAGE_LEAD_DAYS = 1;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Vehicles / machines / boats / commercial — renter must upload active insurance for the host. */
export function categoryRequiresInsuranceProof(category: string): boolean {
  return INSURANCE_PROOF_CATEGORIES.has(category.trim());
}

export function listingRequiresInsuranceProof(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  if (!listing.modes?.rent) return false;
  // Physical damage mandate always requires insurance proof (cannot opt out).
  if (listingRequiresPhysicalDamage(listing)) return true;
  if (isCommercialEquipmentCategory(listing.category)) return true;
  if (listing.handoff.requireInsuranceProof === false) return false;
  if (listing.handoff.requireInsuranceProof === true) return true;
  return categoryRequiresInsuranceProof(listing.category);
}

/**
 * Heavy / semi commercial transport: renter’s insurance agent emails proof
 * directly to the vehicle owner — not the lighter “add to personal auto + upload” path.
 */
export function listingUsesAgentToOwnerInsuranceProof(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  return listingIsCommercialTransport(listing);
}

/** Dedicated inbox where the agent must send coverage proof (host-owned field). */
export function listingInsuranceOwnerProofEmail(
  listing: Pick<ListingDraft, "handoff">,
): string {
  return (listing.handoff.insuranceOwnerProofEmail ?? "").trim();
}

export function isValidInsuranceOwnerProofEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Free-text + structured insurance requirements shown to the renter at booking. */
export function listingInsuranceRequirementsSummary(
  listing: Pick<ListingDraft, "handoff" | "categorySpecs">,
): {
  notes: string;
  minLiabilityBand: string;
  maxDeductibleBand: string;
  pdMinUsd: string;
  liabilityMinUsd: string;
  renterFeeUsd: string;
  ownerProofEmail: string;
} {
  return {
    notes: (listing.handoff.insuranceRequirementsNotes ?? "").trim(),
    minLiabilityBand:
      (listing.categorySpecs?.insuranceMinLiability ??
        listing.handoff.insuranceMinLiability ??
        "").trim(),
    maxDeductibleBand:
      (listing.categorySpecs?.insuranceMaxDeductible ??
        listing.handoff.insuranceMaxDeductible ??
        "").trim(),
    pdMinUsd: (listing.handoff.insurancePdMinUsd ?? "").trim(),
    liabilityMinUsd: (listing.handoff.insuranceLiabilityMinUsd ?? "").trim(),
    renterFeeUsd: (listing.handoff.insuranceRenterFeeUsd ?? "").trim(),
    ownerProofEmail: listingInsuranceOwnerProofEmail(listing),
  };
}

/** Days before start that coverage must already be active (host setting, default 1). */
export function listingInsuranceCoverageLeadDays(
  listing: Pick<ListingDraft, "handoff">,
): number {
  const raw = listing.handoff.insuranceCoverageLeadDays;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
    return Math.min(30, Math.round(raw));
  }
  return DEFAULT_COVERAGE_LEAD_DAYS;
}

/**
 * ISO date the renter’s policy must cover through: rental end.
 * Policy must also be active by (start − leadDays).
 */
export function insuranceMustBeActiveByIso(startDate: string, leadDays: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate.trim());
  if (!m) return startDate;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setDate(d.getDate() - Math.max(0, leadDays));
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
