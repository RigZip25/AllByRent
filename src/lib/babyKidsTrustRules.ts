/**
 * Baby & Kids trust gates — portable safety patterns.
 * Host attests; Evorios does not certify compliance.
 */
import type { ListingDraft } from "../screens/listing/types";

function subKey(listing: Pick<ListingDraft, "subcategory">): string {
  return listing.subcategory.trim().toLowerCase();
}
function rentOn(listing: Pick<ListingDraft, "modes">): boolean {
  return listing.modes?.rent === true;
}

const CAR_SEAT_SUBS = new Set(["car seats"]);
const CRIB_SUBS = new Set(["cribs & beds"]);
const BABY_CONTACT_HYGIENE_SUBS = new Set([
  "strollers", "baby carriers", "toys & games", "childcare equipment",
  "commercial play equipment", "group activity gear", "educational tools",
]);
const BABY_SAFETY_SYSTEM_SUBS = new Set(["safety systems"]);
const CAR_SEAT_STANDARD_OK = new Set(["fmvss_us", "ece_r129", "ece_r44", "other_regional"]);
const CRIB_SLEEP_STANDARD_OK = new Set(["cpsc_compliant", "en_716_eu", "other_regional_standard"]);

export function listingIsCarSeat(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  return listing.category.trim() === "Baby & Kids" && CAR_SEAT_SUBS.has(subKey(listing));
}
export function listingIsCrib(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  return listing.category.trim() === "Baby & Kids" && CRIB_SUBS.has(subKey(listing));
}
export function listingIsCommercialPlay(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  return listing.category.trim() === "Baby & Kids" && subKey(listing) === "commercial play equipment";
}
export function listingIsToysGames(listing: Pick<ListingDraft, "category" | "subcategory">): boolean {
  return listing.category.trim() === "Baby & Kids" && subKey(listing) === "toys & games";
}
export function parseCarSeatExpiryDate(raw: string | null | undefined): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const d = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const ym = /(?:exp(?:iry)?|expires?)[^\d]*(\d{4})[-/](\d{1,2})/i.exec(trimmed) || /^(\d{4})[-/](\d{1,2})$/.exec(trimmed);
  if (ym) {
    const y = Number(ym[1]); const m = Number(ym[2]);
    if (y >= 1990 && m >= 1 && m <= 12) return new Date(Date.UTC(y, m, 0));
  }
  return null;
}
export function carSeatExpiryIsValid(raw: string | null | undefined, now = new Date()): boolean {
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
  const expiry = (specs.carSeatExpiryDate ?? specs.expiresOrRecallCheck ?? "").trim();
  if (!carSeatExpiryIsValid(expiry, now)) return true;
  if ((specs.recallAcknowledged ?? "").trim() !== "acknowledged") return true;
  if ((specs.sanitizationAttested ?? "").trim() !== "attested") return true;
  if ((specs.labelPhotoConfirmed ?? "").trim() !== "photo_on_listing") return true;
  if (!CAR_SEAT_STANDARD_OK.has((specs.carSeatStandardRegion ?? "").trim())) return true;
  return false;
}
export function listingCarSeatBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
  now = new Date(),
): boolean {
  return listingCarSeatSafetyBlocksPublish(listing, now);
}
export function listingCribSafetyBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing) || !listingIsCrib(listing)) return false;
  const specs = listing.categorySpecs ?? {};
  if ((specs.recallAcknowledged ?? "").trim() !== "acknowledged") return true;
  if ((specs.dropSideAcknowledged ?? "").trim() !== "no_drop_side") return true;
  if (!CRIB_SLEEP_STANDARD_OK.has((specs.cpscCompliant ?? "").trim())) return true;
  const mattress = (specs.mattressIncluded ?? "").trim();
  if (!["firm_mattress_included", "pack_n_play_pad", "mattress_not_included"].includes(mattress)) return true;
  if ((specs.sanitizationAttested ?? "").trim() !== "attested") return true;
  return false;
}
export function listingCribBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingCribSafetyBlocksPublish(listing);
}
export function listingRequiresBabyContactHygiene(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing) || listing.category.trim() !== "Baby & Kids") return false;
  const sub = subKey(listing);
  if (CAR_SEAT_SUBS.has(sub) || CRIB_SUBS.has(sub)) return false;
  return BABY_CONTACT_HYGIENE_SUBS.has(sub);
}
export function listingBabyContactHygieneBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresBabyContactHygiene(listing)) return false;
  const specs = listing.categorySpecs ?? {};
  if ((specs.sanitizationAttested ?? "").trim() !== "attested") return true;
  if ((specs.recallAcknowledged ?? "").trim() !== "acknowledged") return true;
  return false;
}
export function listingBabyContactHygieneBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingBabyContactHygieneBlocksPublish(listing);
}
export function listingRequiresBabySafetyInstall(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes">,
): boolean {
  if (!rentOn(listing) || listing.category.trim() !== "Baby & Kids") return false;
  return BABY_SAFETY_SYSTEM_SUBS.has(subKey(listing));
}
export function listingBabySafetyInstallBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listingRequiresBabySafetyInstall(listing)) return false;
  const install = (listing.categorySpecs?.safetyInstallAttested ?? "").trim();
  return !["install_documented", "renter_installs_with_guide", "professionally_installed"].includes(install);
}
export function listingBabySafetyInstallBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingBabySafetyInstallBlocksPublish(listing);
}
export function listingToyHazardBlocksPublish(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!rentOn(listing) || !listingIsToysGames(listing)) return false;
  const band = (listing.categorySpecs?.toyHazardBand ?? "").trim();
  return !["ages_0_plus_no_small_parts", "ages_3_plus", "ages_8_plus", "not_a_toy"].includes(band);
}
export function listingToyHazardBlocksBooking(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  return listingToyHazardBlocksPublish(listing);
}
