/**
 * Category trust gates beyond Vehicles (operator certs, boats, drones,
 * car seats, real-estate Airbnb basics). Mirrors CDL / pro / age patterns.
 */

import type { ListingDraft } from "../screens/listing/types";

export type OperatorCertKind = "forklift" | "crane" | "excavator" | "general_heavy";

const FORKLIFT_SUBS = new Set(["forklifts"]);
const CRANE_SUBS = new Set(["crane & lifting"]);
const EXCAVATOR_SUBS = new Set(["excavation tools"]);
/** Other powered commercial shelves that need a general operator credential. */
const GENERAL_HEAVY_SUBS = new Set([
  "hydraulic equipment",
  "heavy pumps",
  "industrial generators",
  "industrial compressors",
  "large concrete equipment",
  "structural equipment",
  "winches",
]);

const MOTOR_BOAT_SUBS = new Set([
  "jet skis",
  "motorboats",
  "pontoon boats",
  "commercial fishing",
  "dive boats",
  "charter vessels",
  "fishing boats",
]);

const PWC_SUBS = new Set(["jet skis"]);

const CAR_SEAT_SUBS = new Set(["car seats"]);

function subKey(listing: Pick<ListingDraft, "subcategory">): string {
  return listing.subcategory.trim().toLowerCase();
}

function rentOn(
  listing: Pick<ListingDraft, "modes">,
): boolean {
  return listing.modes?.rent === true;
}

/** Forklift / crane / excavator / general heavy operator credential required. */
export function listingOperatorCertKind(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): OperatorCertKind | null {
  if (!rentOn(listing)) return null;
  const cat = listing.category.trim();
  if (cat !== "Heavy Equipment" && cat !== "Construction") return null;
  const sub = subKey(listing);
  if (!sub) return null;
  if (FORKLIFT_SUBS.has(sub) || sub.includes("forklift")) return "forklift";
  if (CRANE_SUBS.has(sub) || sub.includes("crane")) return "crane";
  if (EXCAVATOR_SUBS.has(sub) || sub.includes("excavator")) return "excavator";
  if (GENERAL_HEAVY_SUBS.has(sub)) return "general_heavy";
  // Construction crane_class job scale → treat as crane when sub is vague
  const jobScale = (listing.categorySpecs?.jobScale ?? "").trim().toLowerCase();
  if (cat === "Construction" && jobScale === "crane_class") return "crane";
  return null;
}

export function listingRequiresOperatorCredential(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingOperatorCertKind(listing) != null;
}

/** Powered watercraft: motorboats, PWC/jet skis, or motor included. */
export function listingIsPoweredWatercraft(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (listing.category.trim() !== "Boats & Water") return false;
  if (!rentOn(listing)) return false;
  const sub = subKey(listing);
  if (MOTOR_BOAT_SUBS.has(sub)) return true;
  const motor = (listing.categorySpecs?.motorIncluded ?? "").trim().toLowerCase();
  return motor === "yes" || motor === "electric_only";
}

export function listingIsPwc(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Boats & Water") return false;
  const sub = subKey(listing);
  return PWC_SUBS.has(sub) || sub.includes("jet ski") || sub.includes("pwc");
}

/** Boater / PWC / captain license attestation + upload. */
export function listingRequiresBoaterLicense(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingIsPoweredWatercraft(listing);
}

/** Age gate applies to Vehicles and powered watercraft (default 25). */
export function listingRequiresAgeGate(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs"> | null | undefined,
): boolean {
  if (!listing) return false;
  if (listing.category.trim() === "Vehicles") return true;
  return listingIsPoweredWatercraft(listing);
}

/** Drone under Photo & Video (or legacy top-level Drones). */
export function listingIsDrone(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  const cat = listing.category.trim();
  const sub = listing.subcategory.trim();
  if (cat === "Drones" || sub === "Drones") return true;
  const tag = (listing.categorySpecs?.equipmentTag ?? listing.categorySpecs?.kitIncludes ?? "")
    .trim()
    .toLowerCase();
  if (tag.includes("drone")) return true;
  return /\bdrone\b/i.test(sub);
}

/** FAA Part 107 and/or Remote ID attestation before book (v1: attest + optional upload). */
export function listingRequiresDroneCert(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsDrone(listing);
}

export function listingIsCarSeat(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  return (
    listing.category.trim() === "Baby & Kids" &&
    CAR_SEAT_SUBS.has(subKey(listing))
  );
}

/** Parse host-entered expiry (YYYY-MM-DD preferred; also Exp 2028-06 / Mfr…). */
export function parseCarSeatExpiryDate(raw: string | null | undefined): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const d = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const ym = /(?:exp(?:iry)?|expires?)[^\d]*(\d{4})[-/](\d{1,2})/i.exec(trimmed);
  if (ym) {
    const y = Number(ym[1]);
    const m = Number(ym[2]);
    if (y >= 1990 && m >= 1 && m <= 12) {
      // End of that month
      const d = new Date(Date.UTC(y, m, 0));
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  const bare = /^(\d{4})[-/](\d{1,2})$/.exec(trimmed);
  if (bare) {
    const y = Number(bare[1]);
    const m = Number(bare[2]);
    if (y >= 1990 && m >= 1 && m <= 12) {
      return new Date(Date.UTC(y, m, 0));
    }
  }
  return null;
}

export function carSeatExpiryIsValid(
  raw: string | null | undefined,
  now = new Date(),
): boolean {
  const d = parseCarSeatExpiryDate(raw);
  if (!d) return false;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return d.getTime() >= today;
}

export function listingCarSeatSafetyBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
  now = new Date(),
): boolean {
  if (!rentOn(listing) || !listingIsCarSeat(listing)) return false;
  const specs = listing.categorySpecs ?? {};
  const expiry =
    (specs.carSeatExpiryDate ?? specs.expiresOrRecallCheck ?? "").trim();
  if (!carSeatExpiryIsValid(expiry, now)) return true;
  if ((specs.recallAcknowledged ?? "").trim() !== "acknowledged") return true;
  if ((specs.sanitizationAttested ?? "").trim() !== "attested") return true;
  if ((specs.labelPhotoConfirmed ?? "").trim() !== "photo_on_listing") return true;
  return false;
}

/** Renter cannot book an expired / unacknowledged car seat listing. */
export function listingCarSeatBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
  now = new Date(),
): boolean {
  return listingCarSeatSafetyBlocksPublish(listing, now);
}

export function listingIsRealEstate(
  listing: Pick<ListingDraft, "category">,
): boolean {
  return listing.category.trim() === "Real Estate";
}

export function listingRequiresHouseRules(
  listing: Pick<ListingDraft, "category" | "modes" | "categorySpecs" | "handoff">,
): boolean {
  return rentOn(listing) && listingIsRealEstate(listing);
}

export function listingHouseRulesText(
  listing: Pick<ListingDraft, "categorySpecs" | "handoff">,
): string {
  return (
    (listing.categorySpecs?.houseRules ?? listing.handoff?.houseRules ?? "").trim()
  );
}

export function listingCleaningFeeUsd(
  listing: Pick<ListingDraft, "categorySpecs" | "handoff" | "pricing">,
): number {
  const raw =
    listing.handoff?.cleaningFeeUsd ??
    listing.categorySpecs?.cleaningFeeUsd ??
    "";
  const n = Number.parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

/** Guest ID (selfie or ID upload) before check-in — reuse start-ID pattern. */
export function listingRequiresGuestStartId(
  listing: Pick<ListingDraft, "category" | "modes">,
): boolean {
  return rentOn(listing) && listingIsRealEstate(listing);
}

export function listingRequiresStartIdGate(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs"> | null | undefined,
): boolean {
  if (!listing) return false;
  if (listing.category.trim() === "Vehicles") return true;
  return listingRequiresGuestStartId(listing);
}
