/**
 * Category trust gates beyond Vehicles (operator certs, boats, drones,
 * car seats, real-estate Airbnb basics). Mirrors CDL / pro / age patterns.
 */

import type { ListingDraft } from "../screens/listing/types";
import { listingIsCommercialPlay } from "./babyKidsTrustRules";

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
  if (listingIsConstructionSoftPpe(listing)) return null;
  if ((CRANE_SUBS.has(sub) || sub.includes("crane")) && (listing.categorySpecs?.craneOperatorMode ?? "").trim() === "operator_included") return null;
  if (FORKLIFT_SUBS.has(sub) || sub.includes("forklift")) return "forklift";
  if (CRANE_SUBS.has(sub) || sub.includes("crane")) return "crane";
  if (EXCAVATOR_SUBS.has(sub) || sub.includes("excavator")) return "excavator";
  if (GENERAL_HEAVY_SUBS.has(sub)) return "general_heavy";
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
  if (!listingIsPoweredWatercraft(listing)) return false;
  // Captain-included charters: host/crew operates — renter license not required.
  if (listingCaptainMode(listing) === "captain_included") return false;
  return true;
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

/* ─── Baby & Kids (canonical rules in babyKidsTrustRules) ─────────────── */
export {
  listingIsCarSeat,
  parseCarSeatExpiryDate,
  carSeatExpiryIsValid,
  listingCarSeatSafetyBlocksPublish,
  listingCarSeatBlocksBooking,
  listingIsCrib,
  listingCribSafetyBlocksPublish,
  listingCribBlocksBooking,
  listingIsCommercialPlay,
  listingIsToysGames,
  listingRequiresBabyContactHygiene,
  listingBabyContactHygieneBlocksPublish,
  listingBabyContactHygieneBlocksBooking,
  listingRequiresBabySafetyInstall,
  listingBabySafetyInstallBlocksPublish,
  listingBabySafetyInstallBlocksBooking,
  listingToyHazardBlocksPublish,
  listingToyHazardBlocksBooking,
} from "./babyKidsTrustRules";

/* ─── Tools / Garden / Home / Baby P0 ─────────────────────────────────── */

const WELDING_SUBS = new Set(["welding equipment"]);
const STUMP_GRINDER_SUBS = new Set(["stump grinders"]);
const COMMERCIAL_COFFEE_SUBS = new Set(["commercial coffee"]);

export function listingIsWeldingEquipment(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  return listing.category.trim() === "Tools & DIY" && WELDING_SUBS.has(subKey(listing));
}

export function listingIsStumpGrinder(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  return listing.category.trim() === "Garden & Yard" && STUMP_GRINDER_SUBS.has(subKey(listing));
}

export function listingIsCommercialCoffee(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  return (
    listing.category.trim() === "Home & Kitchen" && COMMERCIAL_COFFEE_SUBS.has(subKey(listing))
  );
}

export function listingRequiresPpeAck(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing)) return false;
  return listingIsWeldingEquipment(listing) || listingIsStumpGrinder(listing);
}

export function listingRequiresStumpGrinderInsurance(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsStumpGrinder(listing);
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

/**
 * Hull ID (HIN / CIN / local reg) for Boats & Water rentals.
 * Required for powered craft; optional for non-motor paddle / inflatable.
 */
export function listingRequiresBoatIdentity(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingIsPoweredWatercraft(listing);
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

const COSTUME_INVENTORY_SUBS = new Set([
  "halloween costumes",
  "character costumes",
  "period costumes",
  "masks & makeup",
  "theater costumes",
  "film & tv props",
  "professional makeup kits",
  "full character suits",
  "other",
]);

export function listingRequiresKitInventory(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing)) return false;
  if (listingIsHighValueGearCategory(listing)) return true;
  if (listingIsConstructionFormwork(listing)) return true;
  if (listingIsCostumeCategory(listing) && COSTUME_INVENTORY_SUBS.has(subKey(listing))) {
    return true;
  }
  return false;
}

export function listingKitInventoryText(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  const structured = (listing.categorySpecs?.kitInventoryItems ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const free = (listing.categorySpecs?.kitInventoryChecklist ?? "").trim();
  return [...structured, ...(free ? [free] : [])].join(", ");
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
  if (listingIsStumpGrinder(listing) || listingIsCommercialPlay(listing)) return true;
  const sub = subKey(listing);
  if (cat === "Sports & Recreation") {
    if (HIGH_RISK_SPORTS_SUBS.has(sub)) return true;
    if (/\b(climb|ski|snowboard|surf|kayak|wake|dive)\b/i.test(sub)) return true;
  }
  if (cat === "Outdoor & Camping") {
    if (HIGH_RISK_OUTDOOR_SUBS.has(sub)) return true;
    if (/\b(climb|rappel|ice|alpine|survival)\b/i.test(sub)) return true;
  }
  if (cat === "Bikes & Scooters") {
    if (sub === "mountain bikes" || sub === "racing bikes") return true;
  }
  if (cat === "Costume & Cosplay") {
    if (sub === "animatronic props" || sub === "full character suits") return true;
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
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing)) return false;
  if (listingIsBikesScooters(listing)) return true;
  // Snow Sports: helmet policy is required at publish; ack at booking (no bike lock).
  if (listing.category.trim() === "Sports & Recreation" && subKey(listing) === "snow sports") {
    return true;
  }
  return listingIsAtv(listing) || listingIsMotorcycle(listing);
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

export function listingIsElectricBike(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  if (listing.category.trim() !== "Bikes & Scooters") return false;
  if (listingIsElectricScooter(listing)) return false;
  const electric = (listing.categorySpecs?.electric ?? "").trim().toLowerCase();
  if (electric === "no") return false;
  const sub = subKey(listing);
  if (sub === "e-bikes" || sub === "e-bikes pro" || sub.includes("e-bike")) return true;
  return electric === "yes";
}

export function listingIsEBikePro(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  return listingIsElectricBike(listing);
}

export function listingIsElectricMicromobility(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  return listingIsElectricScooter(listing) || listingIsElectricBike(listing);
}

export function listingEScooterMinAge(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): number {
  if (!listingIsElectricMicromobility(listing)) return 0;
  const raw = (listing.categorySpecs?.minRiderAge ?? "").trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 12 && n <= 21) return n;
  return DEFAULT_E_SCOOTER_MIN_AGE;
}

export function listingRequiresEScooterAgeGate(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsElectricMicromobility(listing);
}


export function listingRequiresEBikeClass(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsElectricBike(listing);
}
export function listingOvernightStorageRule(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.overnightStorageRule ?? "").trim();
}
export function listingIsKidsBike(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  return listing.category.trim() === "Bikes & Scooters" && subKey(listing) === "kids bikes";
}
export function listingRequiresKidsGuardianAttest(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  return rentOn(listing) && listingIsKidsBike(listing);
}
export function listingKidsHelmetBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresKidsGuardianAttest(listing)) return false;
  return (listing.categorySpecs?.helmetPolicy ?? "").trim() === "not_required";
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
  if (!rentOn(listing)) return false;
  if (listing.category.trim() === "Electronics & Tech") {
    const sub = subKey(listing);
    if (["laptops","smart home devices","network gear","servers & workstations"].includes(sub)) return true;
    if (sub === "gaming gear") {
      return (listing.categorySpecs?.gamingHasInternalStorage ?? "").trim() === "has_internal_storage";
    }
    if (sub === "other") {
      return (listing.categorySpecs?.deviceHasStorage ?? "").trim() === "has_storage";
    }
  }
  if (typeof listingIsOfficeStorageCapableSub === "function" && listingIsOfficeStorageCapableSub(listing)) {
    return listingDeviceHasStorage(listing);
  }
  return false;
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
    status !== "account_unlinked" &&
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
/** Host left PA cable/stand inventory blank — soft block at book (still allow ack). */
export function listingPaCableStandBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresPaCableStandInventory(listing)) return false;
  return !listingPaCableStandInventoryText(listing);
}

/* ─── P2 category trust ─────────────────────────────────────────────── */

const OUTDOOR_PARTY_FOOTPRINTS = new Set(["backyard", "outdoor_large"]);
const OUTDOOR_PARTY_SUBS = new Set(["tents & canopies"]);

/** Tools that need a PPE / safety briefing before handoff. */
const SAFETY_BRIEF_TOOL_SUBS = new Set([
  "welding equipment",
  "scaffolding systems",
  "power saws",
]);

const HYGIENE_OUTDOOR_SUBS = new Set([
  "tents",
  "sleeping bags",
  "expedition tents",
]);

export type WeatherCancelPolicy =
  | "full_refund_24h"
  | "full_refund_12h"
  | "host_discretion"
  | "not_outdoor";

/** Outdoor party / event gear where weather cancel matters. */
export function listingIsOutdoorParty(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): boolean {
  if (listing.category.trim() !== "Party & Events") return false;
  const policy = (listing.categorySpecs?.weatherCancelPolicy ?? "").trim();
  if (policy === "not_outdoor") return false;
  if (
    policy === "full_refund_24h" ||
    policy === "full_refund_12h" ||
    policy === "host_discretion"
  ) {
    return true;
  }
  const footprint = (listing.categorySpecs?.setupFootprint ?? "").trim().toLowerCase();
  if (OUTDOOR_PARTY_FOOTPRINTS.has(footprint)) return true;
  const sub = subKey(listing);
  return OUTDOOR_PARTY_SUBS.has(sub) || sub.includes("canopy") || sub.includes("tent");
}

export function listingRequiresWeatherCancelPolicy(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsOutdoorParty(listing);
}

export function listingWeatherCancelPolicy(
  listing: Pick<ListingDraft, "categorySpecs">,
): WeatherCancelPolicy | "" {
  const raw = (listing.categorySpecs?.weatherCancelPolicy ?? "").trim();
  if (
    raw === "full_refund_24h" ||
    raw === "full_refund_12h" ||
    raw === "host_discretion" ||
    raw === "not_outdoor"
  ) {
    return raw;
  }
  return "";
}

/** Hours before start for weather full-refund; null = no automatic weather full refund. */
export function listingWeatherCancelFullRefundHours(
  listing: Pick<ListingDraft, "categorySpecs">,
): number | null {
  const policy = listingWeatherCancelPolicy(listing);
  if (policy === "full_refund_24h") return 24;
  if (policy === "full_refund_12h") return 12;
  return null;
}

export function listingRequiresSafetyBriefing(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing)) return false;
  const cat = listing.category.trim();
  const flag = (listing.categorySpecs?.safetyBriefingRequired ?? "").trim();
  if (flag === "not_required") return false;
  if (cat === "Garden & Yard") {
    if (flag === "required") return true;
    // Stump grinders default to briefing; ride-ons only when host marks required.
    return listingIsStumpGrinder(listing);
  }
  if (cat !== "Tools & DIY") return false;
  if (flag === "required") return true;
  const sub = subKey(listing);
  if (SAFETY_BRIEF_TOOL_SUBS.has(sub)) return true;
  return (
    sub.includes("weld") ||
    sub.includes("scaffold") ||
    sub.includes("saw") ||
    /\b(plasma|torch|angle grinder)\b/i.test(sub)
  );
}

export function listingSafetyBriefingHostReady(
  listing: Pick<ListingDraft, "categorySpecs">,
): boolean {
  return (listing.categorySpecs?.safetyBriefingConfirmed ?? "").trim() === "briefing_ready";
}

export function listingSafetyBriefingBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresSafetyBriefing(listing)) return false;
  return !listingSafetyBriefingHostReady(listing);
}

export function listingSafetyBriefingNotes(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.safetyBriefingNotes ?? "").trim();
}

export function listingRequiresHygieneChecklist(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing)) return false;
  if (listing.category.trim() !== "Outdoor & Camping") return false;
  const flag = (listing.categorySpecs?.hygieneChecklistRequired ?? "").trim();
  if (flag === "not_required") return false;
  if (flag === "required") return true;
  const sub = subKey(listing);
  return HYGIENE_OUTDOOR_SUBS.has(sub) || sub.includes("sleeping") || sub.includes("tent");
}

export function listingHygieneHostAttested(
  listing: Pick<ListingDraft, "categorySpecs">,
): boolean {
  return (listing.categorySpecs?.hygieneSanitizedAttested ?? "").trim() === "attested";
}

export function listingHygieneBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresHygieneChecklist(listing)) return false;
  return !listingHygieneHostAttested(listing);
}

export function listingHygieneChecklistNotes(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.hygieneChecklistNotes ?? "").trim();
}

export function listingIsCostumeCategory(
  listing: Pick<ListingDraft, "category">,
): boolean {
  return listing.category.trim() === "Costume & Cosplay";
}

export function listingRequiresCostumeReturnCondition(
  listing: Pick<ListingDraft, "category" | "modes">,
): boolean {
  return rentOn(listing) && listingIsCostumeCategory(listing);
}

export function listingDryCleanReturnFeeUsd(
  listing: Pick<ListingDraft, "categorySpecs">,
): number {
  const raw = listing.categorySpecs?.dryCleanReturnFeeUsd ?? "";
  const n = Number.parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

export function listingReturnConditionPolicy(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.returnConditionPolicy ?? "").trim();
}

const COSTUME_HYGIENE_SUBS = new Set([
  "professional makeup kits",
  "wigs & accessories",
  "masks & makeup",
  "full character suits",
]);

/** Makeup kits / wigs / masks / full suits — hygiene / sanitization between renters. */
export function listingRequiresCostumeHygiene(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing) || !listingIsCostumeCategory(listing)) return false;
  return COSTUME_HYGIENE_SUBS.has(subKey(listing));
}

export function listingCostumeHygieneAttested(
  listing: Pick<ListingDraft, "categorySpecs">,
): boolean {
  return (listing.categorySpecs?.sanitizationAttested ?? "").trim() === "attested";
}

export function listingCostumeHygieneBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresCostumeHygiene(listing)) return false;
  return !listingCostumeHygieneAttested(listing);
}

/** Full character / mascot suits — host must attest heat + visibility guidance shared. */
export function listingRequiresCostumeHeatVisibility(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing) || !listingIsCostumeCategory(listing)) return false;
  return subKey(listing) === "full character suits";
}

export function listingCostumeHeatVisibilityAttested(
  listing: Pick<ListingDraft, "categorySpecs">,
): boolean {
  return (listing.categorySpecs?.heatVisibilityAttested ?? "").trim() === "attested";
}

export function listingCostumeHeatVisibilityBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresCostumeHeatVisibility(listing)) return false;
  return !listingCostumeHeatVisibilityAttested(listing);
}



/* ─── P2: Vehicles soft driving-record attestation ──────────────────── */

/**
 * Vehicles rent: soft self-attestation that the renter holds a valid license
 * and has no major recent driving-record issues. Honest scaffold — not a paid
 * MVR / DMV vendor pull.
 */
export function listingRequiresDriverRecordAttestation(
  listing: Pick<ListingDraft, "category" | "modes">,
): boolean {
  return rentOn(listing) && listing.category.trim() === "Vehicles";
}

/* ─── Vehicles / Boats P2: ATV · motorcycle · captain · PFD ──────────── */

const ATV_SUBS = new Set(["atvs"]);
const MOTORCYCLE_SUBS = new Set(["motorcycles"]);
const CAPTAIN_OPT_SUBS = new Set(["motorboats", "pontoon boats", "charter vessels"]);
const PADDLE_PFD_SUBS = new Set(["kayaks & canoes", "sup boards"]);
const INFLATABLE_BOAT_SUBS = new Set(["inflatable boats"]);

export function listingIsAtv(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Vehicles") return false;
  const sub = subKey(listing);
  return ATV_SUBS.has(sub) || sub.includes("atv") || sub.includes("utv") || sub.includes("side-by-side");
}

export function listingIsMotorcycle(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Vehicles") return false;
  const sub = subKey(listing);
  return MOTORCYCLE_SUBS.has(sub) || sub.includes("motorcycle") || sub.includes("motorbike");
}

/** ATV: OHV / terrain liability waiver at booking (default on). */
export function listingRequiresOhvTerrainWaiver(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing) || !listingIsAtv(listing)) return false;
  const flag = (listing.categorySpecs?.ohvTerrainWaiverRequired ?? "").trim();
  if (flag === "not_required") return false;
  return true;
}

/** Soft age note for ATV (often 16+ in market) — informational, not hard age gate. */
export function listingAtvMinAgeNote(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): number | null {
  if (!listingIsAtv(listing)) return null;
  const raw = (listing.categorySpecs?.minRiderAge ?? "").trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 12 && n <= 21) return n;
  return 16;
}

/** Motorcycle endorsement self-attestation (default required for motorcycle rent). */
export function listingRequiresMotorcycleEndorsement(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing) || !listingIsMotorcycle(listing)) return false;
  const flag = (listing.categorySpecs?.motorcycleEndorsementRequired ?? "").trim();
  if (flag === "not_required") return false;
  return true;
}

export type CaptainMode = "bareboat" | "captain_included" | "";

export function listingIsCaptainOptionVessel(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Boats & Water") return false;
  const sub = subKey(listing);
  return CAPTAIN_OPT_SUBS.has(sub) || sub.includes("charter") || sub.includes("pontoon");
}

export function listingCaptainMode(
  listing: Pick<ListingDraft, "category" | "subcategory" | "categorySpecs">,
): CaptainMode {
  if (!listingIsCaptainOptionVessel(listing)) return "";
  const raw = (listing.categorySpecs?.captainMode ?? "").trim();
  if (raw === "bareboat" || raw === "captain_included") return raw;
  return "";
}

/** Host offers captain-included vs bareboat on motorboat / pontoon / charter. */
export function listingRequiresCaptainModeField(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  return rentOn(listing) && listingIsCaptainOptionVessel(listing);
}

export function listingIsPaddleCraft(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Boats & Water") return false;
  const sub = subKey(listing);
  return (
    PADDLE_PFD_SUBS.has(sub) ||
    sub.includes("kayak") ||
    sub.includes("canoe") ||
    sub.includes("sup") ||
    sub.includes("paddle")
  );
}

export function listingIsInflatableBoat(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  if (listing.category.trim() !== "Boats & Water") return false;
  const sub = subKey(listing);
  return INFLATABLE_BOAT_SUBS.has(sub) || sub.includes("inflatable");
}

/** Kayak / SUP / non-motor inflatable: PFD attestation (powered inflatables use USCG kit). */
export function listingRequiresPfdAttestation(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing)) return false;
  const paddle = listingIsPaddleCraft(listing);
  const nonMotorInflatable =
    listingIsInflatableBoat(listing) && !listingIsPoweredWatercraft(listing);
  if (!paddle && !nonMotorInflatable) return false;
  const flag = (listing.categorySpecs?.pfdIncluded ?? "").trim();
  if (flag === "not_required") return false;
  return true;
}

export function listingPfdIncluded(
  listing: Pick<ListingDraft, "categorySpecs">,
): string {
  return (listing.categorySpecs?.pfdIncluded ?? "").trim();
}

export function listingPfdCount(
  listing: Pick<ListingDraft, "categorySpecs">,
): number | null {
  const raw = (listing.categorySpecs?.pfdCount ?? "").trim();
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n > 0 && n <= 24) return n;
  return null;
}


/* Party/Sports/Outdoor/Electronics/Photo P0 helpers */
export function listingDroneWeightClass(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.droneWeightClass ?? "").trim();
}
export function listingRemoteIdStatus(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.remoteIdStatus ?? "").trim();
}
export function listingDroneRemoteIdBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresDroneCert(listing)) return false;
  const weight = listingDroneWeightClass(listing);
  const rid = listingRemoteIdStatus(listing);
  if (!["under_250g", "250g_to_55lb", "over_55lb"].includes(weight)) return true;
  if (rid !== "broadcast_builtin" && rid !== "broadcast_add_on" && rid !== "rid_exempt_under_250g") return true;
  if (rid === "rid_exempt_under_250g" && weight !== "under_250g") return true;
  return false;
}
export function listingIsSnowSports(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  return listing.category.trim() === "Sports & Recreation" && subKey(listing) === "snow sports";
}
export function listingRequiresSnowSportsGates(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return rentOn(listing) && listingIsSnowSports(listing);
}
export function listingDinSettingBand(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.dinSettingBand ?? "").trim();
}
export function listingIsWaterSportsShelf(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  const sub = subKey(listing);
  return listing.category.trim() === "Sports & Recreation" && (sub === "water sports" || sub === "pro water sports");
}
export function listingRequiresPfdPolicy(listing: Pick<ListingDraft, "category" | "subcategory" | "modes">): boolean {
  return rentOn(listing) && listingIsWaterSportsShelf(listing);
}
export function listingPfdBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresPfdPolicy(listing)) return false;
  const pfd = listingPfdIncluded(listing);
  return pfd !== "included" && pfd !== "renter_provides" && pfd !== "not_applicable";
}
export function listingRequiresCateringSanitize(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing) || listing.category.trim() !== "Party & Events") return false;
  const sub = subKey(listing);
  return sub === "serving equipment" || sub === "catering equipment";
}
export function listingCateringSanitizeBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresCateringSanitize(listing)) return false;
  return (listing.categorySpecs?.cateringSanitizeAttested ?? "").trim() !== "attested";
}
export function listingSetPieceCountBand(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.setPieceCountBand ?? "").trim();
}
export function listingTentSizeBand(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.tentSizeBand ?? "").trim();
}
export function listingSleepingBagTempBand(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.sleepingBagTempBand ?? "").trim();
}
export function listingStoveFuelType(listing: Pick<ListingDraft, "categorySpecs">): string {
  return (listing.categorySpecs?.stoveFuelType ?? "").trim();
}

const CONSTRUCTION_FORMWORK_SUBS = new Set(["formwork basic", "professional formwork"]);

export function listingIsConstructionSoftPpe(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing)) return false;
  if (listing.category.trim() !== "Construction") return false;
  if (subKey(listing) !== "safety equipment") return false;
  return (listing.categorySpecs?.ppeRiskTier ?? "").trim() === "soft_ppe";
}

export function listingIsConstructionFormwork(
  listing: Pick<ListingDraft, "category" | "subcategory">,
): boolean {
  return listing.category.trim() === "Construction" && CONSTRUCTION_FORMWORK_SUBS.has(subKey(listing));
}
