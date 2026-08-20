import type { ListingDraft } from "../screens/listing/types";
import { listingIsConstructionSoftPpe } from "./categoryTrustRules";

/** Class 7+ / commercial heavy vehicle class — physical damage insurance required. */
export const VEHICLE_PHYSICAL_DAMAGE_WEIGHT_LBS = 26_000;

/** Approximate kg for UI hints (26,000 lb ≈ 11,793 kg). */
export const VEHICLE_PHYSICAL_DAMAGE_WEIGHT_KG = 11_793;

/** Shelves that default to pro-only renters + physical damage on the rent path. */
export const COMMERCIAL_EQUIPMENT_CATEGORIES = new Set([
  "Heavy Equipment",
  "Construction",
]);

/**
 * Vehicle subcategories treated as semi / commercial trailer transport
 * (CDL + agent→owner insurance path) even below 26k when listed here.
 */
const SEMI_OR_COMMERCIAL_TRAILER_SUBS = new Set([
  "equipment trailers",
  "commercial trucks",
  "tow vehicles",
]);

export function isCommercialEquipmentCategory(category: string): boolean {
  return COMMERCIAL_EQUIPMENT_CATEGORIES.has(category.trim());
}

function parsePositiveLbs(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return Math.round(raw);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim().replace(/,/g, "");
    if (!trimmed) return null;
    const n = Number.parseFloat(trimmed);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  return null;
}

/**
 * Vehicle / machine weight in pounds.
 * Prefer categorySpecs.vehicleWeightLbs (GVWR / listed weight), then handoff.itemWeightLbs.
 * Values stored as kg by mistake are not auto-converted — hosts enter lb (app standard).
 */
export function listingVehicleWeightLbs(
  listing: Pick<ListingDraft, "categorySpecs" | "handoff">,
): number | null {
  const fromSpecs =
    parsePositiveLbs(listing.categorySpecs?.vehicleWeightLbs) ??
    parsePositiveLbs(listing.categorySpecs?.gvwrLbs) ??
    parsePositiveLbs(listing.categorySpecs?.weightLbs);
  if (fromSpecs != null) return fromSpecs;
  return parsePositiveLbs(listing.handoff?.itemWeightLbs);
}

export function vehicleWeightRequiresPhysicalDamage(weightLbs: number | null | undefined): boolean {
  return typeof weightLbs === "number" && weightLbs >= VEHICLE_PHYSICAL_DAMAGE_WEIGHT_LBS;
}

/**
 * Semi-trailer / commercial trailer identification via subcategory or “semi” tag.
 * Light personal “Trailers” alone do not qualify unless weight ≥ 26k or “semi” in the name.
 */
export function listingIsSemiOrCommercialTrailer(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  if (listing.category.trim() !== "Vehicles") return false;
  const sub = listing.subcategory.trim().toLowerCase();
  if (!sub) return false;
  if (SEMI_OR_COMMERCIAL_TRAILER_SUBS.has(sub)) return true;
  if (/\bsemi\b/.test(sub)) return true;
  if (sub.includes("semi-trailer") || sub.includes("semitrailer")) return true;
  const tag = (listing.categorySpecs?.vehicleClassTag ?? "").trim().toLowerCase();
  if (tag === "semi" || tag.includes("semi")) return true;
  // Personal “Trailers” only when explicitly tagged commercial in specs.
  if (sub === "trailers") {
    const grade = (listing.categorySpecs?.trailerDuty ?? "").trim().toLowerCase();
    return grade === "commercial" || grade === "semi";
  }
  return false;
}

/**
 * Commercial transport rent path: CDL + agent→owner insurance proof.
 * Vehicles ≥ 26,000 lb OR semi / commercial trailer / commercial truck subcategories.
 * Does not replace pro-only commercial equipment shelves (Heavy Equipment / Construction).
 */
export function listingIsCommercialTransport(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  if (!listing.modes?.rent) return false;
  if (listing.category.trim() !== "Vehicles") return false;
  if (vehicleWeightRequiresPhysicalDamage(listingVehicleWeightLbs(listing))) return true;
  return listingIsSemiOrCommercialTrailer(listing);
}

/** CDL attestation + document required before booking/start for commercial transport. */
export function listingRequiresCdl(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  return listingIsCommercialTransport(listing);
}

/**
 * Physical damage (collision / comprehensive / equipment PD) — not liability alone.
 * Rent path only. Forced for commercial equipment shelves and Vehicles ≥ 26,000 lb / semis.
 */
export function listingRequiresPhysicalDamage(
  listing: Pick<ListingDraft, "category" | "handoff" | "modes" | "categorySpecs" | "subcategory">,
): boolean {
  if (!listing.modes?.rent) return false;
  if (listingIsConstructionSoftPpe(listing)) return listing.handoff.requirePhysicalDamage === true;
  if (isCommercialEquipmentCategory(listing.category)) return true;
  if (listingIsCommercialTransport(listing)) return true;
  if (listing.category.trim() === "Vehicles") {
    if (vehicleWeightRequiresPhysicalDamage(listingVehicleWeightLbs(listing))) return true;
  }
  return listing.handoff.requirePhysicalDamage === true;
}

/**
 * Hosts on commercial equipment shelves default to pro-only renters (can turn off).
 * Other categories only when host explicitly enables the toggle.
 */
export function listingProRentersOnly(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  if (!listing.modes?.rent) return false;
  if (listingIsConstructionSoftPpe(listing)) return listing.handoff.proRentersOnly === true;
  if (isCommercialEquipmentCategory(listing.category)) return listing.handoff.proRentersOnly !== false;
  return listing.handoff.proRentersOnly === true;
}

/** Defaults applied when rent is on for commercial / heavy-vehicle listings. */
export function resolveRentRuleHandoffDefaults(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): {
  proRentersOnly?: boolean;
  requirePhysicalDamage?: boolean;
  requireInsuranceProof?: boolean;
  requireCdl?: boolean;
} {
  if (!listing.modes?.rent) return {};
  const patch: {
    proRentersOnly?: boolean;
    requirePhysicalDamage?: boolean;
    requireInsuranceProof?: boolean;
    requireCdl?: boolean;
  } = {};

  if (isCommercialEquipmentCategory(listing.category)) {
    if (listingIsConstructionSoftPpe(listing)) {
      if (listing.handoff.proRentersOnly === true) patch.proRentersOnly = true;
      if (listing.handoff.requirePhysicalDamage === true) patch.requirePhysicalDamage = true;
      if (listing.handoff.requireInsuranceProof === true) patch.requireInsuranceProof = true;
    } else {
      patch.proRentersOnly = listing.handoff.proRentersOnly ?? true;
      patch.requirePhysicalDamage = true;
      patch.requireInsuranceProof = true;
    }
  }

  if (listingIsCommercialTransport(listing)) {
    patch.requirePhysicalDamage = true;
    patch.requireInsuranceProof = true;
    patch.requireCdl = true;
  } else if (
    listing.category.trim() === "Vehicles" &&
    vehicleWeightRequiresPhysicalDamage(listingVehicleWeightLbs(listing))
  ) {
    patch.requirePhysicalDamage = true;
    patch.requireInsuranceProof = true;
  }

  return patch;
}

export function physicalDamageIsMandatory(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  if (!listing.modes?.rent) return false;
  if (listingIsConstructionSoftPpe(listing)) return false;
  if (isCommercialEquipmentCategory(listing.category)) return true;
  return listingIsCommercialTransport(listing);
}
