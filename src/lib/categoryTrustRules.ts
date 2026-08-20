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

/* ─── P1 category trust ─────────────────────────────────────────────── */

const TRAILER_SUBS = new Set(["trailers", "equipment trailers"]);
const RV_SUBS = new Set(["rvs & campers"]);

const HIGH_RISK_SPORTS_SUBS = new Set([
  "snow sports",
  "water sports",
  "pro water sports",
]);
const HIGH_RISK_OUTDOOR_SUBS = new Set([
  "survival gear",
  "expedition tents",
]);

const PARTY_POWER_SUBS = new Set([
  "stage & risers",
  "sound systems",
  "event lighting",
  "photo booths",
  "catering equipment",
]);

const E_SCOOTER_SUBS = new Set([
  "electric scooters",
  "professional scooters",
]);

/** Default min age for e-scooters (market / municipal common floor). */
export const DEFAULT_E_SCOOTER_MIN_AGE = 16;

/** Hull ID / registration for Boats & Water rentals (US market standard). */
export function listingRequiresBoatIdentity(
  listing: Pick<ListingDraft, "category" | "modes">,
): boolean {
  return rentOn(listing) && listing.category.trim() === "Boats & Water";
}

/** USCG-style safety kit checklist — powered watercraft. */
export function listingRequiresUscgSafetyKit(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingIsPoweredWatercraft(listing);
}

export function listingUscgSafetyKitComplete(
  listing: Pick<ListingDraft, "categorySpecs">,
): boolean {
  return (listing.categorySpecs?.uscgSafetyKitConfirmed ?? "").trim() === "kit_complete";
}

/** Photo & Video or Electronics & Tech — serial + kit inventory for rent. */
export function listingIsHighValueGearCategory(
  listing: Pick<ListingDraft, "category">,
): boolean {
  const cat = listing.category.trim();
  return cat === "Photo & Video" || cat === "Electronics & Tech" || cat === "Drones";
}

export function listingRequiresKitInventory(
  listing: Pick<ListingDraft, "category" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing) || !listingIsHighValueGearCategory(listing)) return false;
  // High-value gear always needs kit inventory ack for claims / handoff parity.
  return true;
}

export function listingKitInventoryText(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.kitInventoryChecklist ?? "").trim();
}

export function listingIsTrailer(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Vehicles") return false;
  const sub = subKey(listing);
  return TRAILER_SUBS.has(sub) || sub.includes("trailer");
}

export function listingIsRv(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Vehicles") return false;
  const sub = subKey(listing);
  return RV_SUBS.has(sub) || sub.includes("rv") || sub.includes("camper");
}

export function listingRequiresTrailerSpecs(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  return rentOn(listing) && listingIsTrailer(listing);
}

export function listingRequiresRvChecklist(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  return rentOn(listing) && listingIsRv(listing);
}

/** Gym + high-risk Sports/Outdoor (water / snow / climb / survival). */
export function listingRequiresLiabilityWaiver(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing)) return false;
  const flag = (listing.categorySpecs?.liabilityWaiverRequired ?? "").trim();
  if (flag === "not_required") return false;
  if (flag === "required") return true;
  const cat = listing.category.trim();
  if (cat === "Gym & Fitness") return true;
  const sub = subKey(listing);
  if (cat === "Sports & Recreation") {
    if (HIGH_RISK_SPORTS_SUBS.has(sub)) return true;
    if (/\b(climb|ski|snowboard|surf|kayak|wake|dive)\b/i.test(sub)) return true;
  }
  if (cat === "Outdoor & Camping") {
    if (HIGH_RISK_OUTDOOR_SUBS.has(sub)) return true;
    if (/\b(climb|rappel|ice|alpine|survival)\b/i.test(sub)) return true;
  }
  return false;
}

/** Host left powered-boat USCG kit incomplete — block booking. */
export function listingUscgSafetyBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresUscgSafetyKit(listing)) return false;
  return !listingUscgSafetyKitComplete(listing);
}

export function listingIsBikesScooters(
  listing: Pick<ListingDraft, "category">,
): boolean {
  return listing.category.trim() === "Bikes & Scooters";
}

export function listingRequiresHelmetLockPolicy(
  listing: Pick<ListingDraft, "category" | "modes">,
): boolean {
  return rentOn(listing) && listingIsBikesScooters(listing);
}

export function listingIsElectricScooter(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  if (listing.category.trim() !== "Bikes & Scooters") return false;
  const sub = subKey(listing);
  if (E_SCOOTER_SUBS.has(sub) || sub.includes("scooter")) {
    const electric = (listing.categorySpecs?.electric ?? "").trim().toLowerCase();
    // Professional scooters and Electric Scooters are e-class by shelf; "no" can clear.
    if (electric === "no") return false;
    return true;
  }
  const electric = (listing.categorySpecs?.electric ?? "").trim().toLowerCase();
  return electric === "yes" && sub.includes("scooter");
}

export function listingEScooterMinAge(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): number {
  if (!listingIsElectricScooter(listing)) return 0;
  const raw = (listing.categorySpecs?.minRiderAge ?? "").trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 12 && n <= 21) return n;
  return DEFAULT_E_SCOOTER_MIN_AGE;
}

export function listingRequiresEScooterAgeGate(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsElectricScooter(listing);
}

/** Party pro AV / stage shelves — setup fee + power when relevant. */
export function listingIsPartyCategory(
  listing: Pick<ListingDraft, "category">,
): boolean {
  return listing.category.trim() === "Party & Events";
}

export function listingRequiresPartyPowerSpecs(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing) || !listingIsPartyCategory(listing)) return false;
  const sub = subKey(listing);
  return PARTY_POWER_SUBS.has(sub);
}

export function listingSetupTeardownFeeUsd(
  listing: Pick<ListingDraft, "categorySpecs">,
): number {
  const raw = listing.categorySpecs?.setupTeardownFeeUsd ?? "";
  const n = Number.parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

export function listingHelmetPolicy(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.helmetPolicy ?? "").trim();
}

export function listingLockPolicy(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.lockPolicy ?? "").trim();
}

/* ─── P2 category trust (Office / Music) ─────────────────────────────── */

/** Office shelves that commonly store documents, jobs, or credentials. */
const OFFICE_STORAGE_SUBS = new Set([
  "printers",
  "monitors & displays",
  "webcams & streaming",
  "presentation gear",
  "large format printers",
  "pos systems",
  "commercial copiers",
  "conference systems",
  "server equipment",
  "other",
]);

const PA_KIT_SUBS = new Set(["pa systems"]);

export function listingIsOfficeCategory(
  listing: Pick<ListingDraft, "category">,
): boolean {
  return listing.category.trim() === "Office & Business";
}

export function listingIsMusicCategory(
  listing: Pick<ListingDraft, "category">,
): boolean {
  return listing.category.trim() === "Music & Audio";
}

/** Host marked the device as having onboard storage (HDD/SSD/NVRAM/jobs). */
export function listingDeviceHasStorage(
  listing: Pick<ListingDraft, "categorySpecs">,
): boolean {
  return (listing.categorySpecs?.deviceHasStorage ?? "").trim() === "has_storage";
}

export function listingIsOfficeStorageCapableSub(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (!listingIsOfficeCategory(listing)) return false;
  const sub = subKey(listing);
  return OFFICE_STORAGE_SUBS.has(sub);
}

/**
 * Rent path: devices with storage require host wipe status + renter data-wipe ack.
 * Furniture / no-storage picks skip the gate.
 */
export function listingRequiresDataWipe(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing) || !listingIsOfficeStorageCapableSub(listing)) return false;
  return listingDeviceHasStorage(listing);
}

export function listingHostDataWipeStatus(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.hostDataWipeStatus ?? "").trim();
}

/** Host must declare wipe status when the device has storage (publish gate). */
export function listingDataWipeBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresDataWipe(listing)) return false;
  const status = listingHostDataWipeStatus(listing);
  return (
    status !== "wiped_before_list" &&
    status !== "wipe_at_handoff" &&
    status !== "renter_responsible"
  );
}

export function listingDataWipeBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingDataWipeBlocksPublish(listing);
}

/** PA Systems (and PA-named) kits — cables / stands inventory for claims. */
export function listingIsPaKit(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (!listingIsMusicCategory(listing)) return false;
  const sub = subKey(listing);
  if (PA_KIT_SUBS.has(sub)) return true;
  return /\bpa\b/i.test(listing.subcategory.trim());
}

export function listingRequiresPaCableStandInventory(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  return rentOn(listing) && listingIsPaKit(listing);
}

export function listingPaCableStandInventoryText(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.paCableStandInventory ?? "").trim();
}

/** Host left PA cable/stand inventory blank — blocks publish via required field. */
export function listingPaCableStandBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresPaCableStandInventory(listing)) return false;
  return !listingPaCableStandInventoryText(listing);
}
