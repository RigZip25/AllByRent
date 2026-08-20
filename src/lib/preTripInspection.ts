import type { MediaRef } from "./mediaStore";
import type { ListingDraft } from "../screens/listing/types";
import { listingIsConstructionSoftPpe } from "./categoryTrustRules";
import {
  listingIsCommercialTransport,
  listingIsSemiOrCommercialTrailer,
} from "./listingRentRules";

/** Categories that require mandatory pre-trip (and return) photo inspection. */
export const PRE_TRIP_INSPECTION_CATEGORIES = new Set([
  "Vehicles",
  "Heavy Equipment",
  "Construction",
  "Boats & Water",
]);

export type InspectionStage = "pickup" | "return";

/** Exterior / interior damage checklist areas (one photo each). */
export type InspectionBodyAreaId =
  | "exterior_front"
  | "exterior_rear"
  | "exterior_left"
  | "exterior_right"
  | "interior";

/**
 * Per-wheel tire slots — photos are mandatory (brand/tread visible when possible).
 * Corner ids for 4-wheel vehicles; `tire_1`…`tire_N` for other counts; spare optional.
 */
export type InspectionTireSlotId = string;

export type InspectionAreaId = InspectionBodyAreaId | InspectionTireSlotId;

export type DamageKind =
  | "none"
  | "chip"
  | "scratch"
  | "stain"
  | "dent"
  | "wear"
  | "other";

export type InspectionAreaEntry = {
  areaId: InspectionAreaId;
  photo?: MediaRef | null;
  damageKinds: DamageKind[];
  comment: string;
  /** Optional readable tire brand / model (tires only). */
  tireBrandModel?: string;
};

export type PreTripInspectionRecord = {
  stage: InspectionStage;
  areas: InspectionAreaEntry[];
  /**
   * Tire positions required for this checklist (from listing wheel count).
   * Stamped when the inspection is created so pickup/return stay consistent.
   */
  requiredWheelCount?: number;
  /** Renter submitted the checklist. */
  renterSubmittedAt?: string;
  /** Host confirmed / co-acknowledged the checklist. */
  hostConfirmedAt?: string;
};

export const BODY_AREA_IDS: readonly InspectionBodyAreaId[] = [
  "exterior_front",
  "exterior_rear",
  "exterior_left",
  "exterior_right",
  "interior",
] as const;

/** Classic passenger / light-vehicle corner set (default when count === 4). */
export const CORNER_TIRE_SLOT_IDS = [
  "tire_fl",
  "tire_fr",
  "tire_rl",
  "tire_rr",
] as const satisfies readonly InspectionTireSlotId[];

/** @deprecated Use requiredTireSlotIds(wheelCount) — kept for light 4-wheel default. */
export const REQUIRED_TIRE_SLOT_IDS: readonly InspectionTireSlotId[] = CORNER_TIRE_SLOT_IDS;

export const OPTIONAL_TIRE_SLOT_IDS: readonly InspectionTireSlotId[] = ["tire_spare"] as const;

export const SPARE_TIRE_SLOT_ID = "tire_spare" as const;

export const MIN_WHEEL_COUNT = 2;
export const MAX_WHEEL_COUNT = 26;
export const DEFAULT_LIGHT_WHEEL_COUNT = 4;
/** Dualies / box trucks / day cabs — host can edit. */
export const DEFAULT_COMMERCIAL_WHEEL_COUNT = 10;
/** Tractor + trailer combination — host can edit. */
export const DEFAULT_SEMI_WHEEL_COUNT = 18;

export function clampWheelCount(raw: number): number {
  if (!Number.isFinite(raw)) return DEFAULT_LIGHT_WHEEL_COUNT;
  return Math.min(MAX_WHEEL_COUNT, Math.max(MIN_WHEEL_COUNT, Math.round(raw)));
}

function parseWheelCountRaw(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return clampWheelCount(raw);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim().replace(/,/g, "");
    if (!trimmed) return null;
    const n = Number.parseFloat(trimmed);
    if (Number.isFinite(n) && n > 0) return clampWheelCount(n);
  }
  return null;
}

/**
 * Suggested default when host has not set wheelCount yet.
 * Light vehicles → 4; commercial / ≥26k → 10; semi / commercial trailer → 18.
 */
export function defaultWheelCountForListing(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): number {
  if (listing.category.trim() === "Vehicles" && listingIsCommercialTransport(listing)) {
    if (listingIsSemiOrCommercialTrailer(listing)) return DEFAULT_SEMI_WHEEL_COUNT;
    return DEFAULT_COMMERCIAL_WHEEL_COUNT;
  }
  return DEFAULT_LIGHT_WHEEL_COUNT;
}

/**
 * Resolve tire/wheel photo count for a listing.
 * Prefer host `categorySpecs.wheelCount` (aliases: tirePositions, tireCount);
 * otherwise category defaults (4 light / 10 commercial / 18 semi).
 */
export function listingRequiredWheelCount(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs"> | null | undefined,
): number {
  if (!listing) return DEFAULT_LIGHT_WHEEL_COUNT;
  const specs = listing.categorySpecs ?? {};
  const fromHost =
    parseWheelCountRaw(specs.wheelCount) ??
    parseWheelCountRaw(specs.tirePositions) ??
    parseWheelCountRaw(specs.tireCount);
  if (fromHost != null) return fromHost;
  return defaultWheelCountForListing(listing);
}

/** True when commercial/heavy path should force the host to set wheel count explicitly. */
export function listingRequiresHostWheelCount(
  listing: Pick<ListingDraft, "category" | "subcategory" | "handoff" | "modes" | "categorySpecs">,
): boolean {
  return listingIsCommercialTransport(listing);
}

export function requiredTireSlotIds(wheelCount: number): InspectionTireSlotId[] {
  const n = clampWheelCount(wheelCount);
  if (n === 4) return [...CORNER_TIRE_SLOT_IDS];
  return Array.from({ length: n }, (_, i) => `tire_${i + 1}`);
}

export function allTireSlotIds(wheelCount: number): InspectionTireSlotId[] {
  return [...requiredTireSlotIds(wheelCount), SPARE_TIRE_SLOT_ID];
}

export function allInspectionAreaIds(wheelCount: number): InspectionAreaId[] {
  return [...BODY_AREA_IDS, ...allTireSlotIds(wheelCount)];
}

/** @deprecated Prefer allTireSlotIds(wheelCount). */
export const ALL_TIRE_SLOT_IDS: readonly InspectionTireSlotId[] = allTireSlotIds(
  DEFAULT_LIGHT_WHEEL_COUNT,
);

/** @deprecated Prefer allInspectionAreaIds(wheelCount). */
export const ALL_INSPECTION_AREA_IDS: readonly InspectionAreaId[] = allInspectionAreaIds(
  DEFAULT_LIGHT_WHEEL_COUNT,
);

export function isPreTripInspectionCategory(category: string): boolean {
  return PRE_TRIP_INSPECTION_CATEGORIES.has(category.trim());
}

export function listingRequiresPreTripInspection(
  listing: Pick<ListingDraft, "category" | "subcategory" | "modes" | "categorySpecs">,
): boolean {
  if (!listing.modes?.rent) return false;
  if (listingIsConstructionSoftPpe(listing)) return false;
  return isPreTripInspectionCategory(listing.category);
}

export function isTireSlot(areaId: InspectionAreaId): areaId is InspectionTireSlotId {
  return areaId.startsWith("tire_");
}

export function emptyInspectionArea(areaId: InspectionAreaId): InspectionAreaEntry {
  return {
    areaId,
    photo: null,
    damageKinds: [],
    comment: "",
    tireBrandModel: "",
  };
}

export function resolveInspectionWheelCount(
  record: Pick<PreTripInspectionRecord, "requiredWheelCount"> | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): number {
  const stamped = record?.requiredWheelCount;
  if (typeof stamped === "number" && Number.isFinite(stamped) && stamped > 0) {
    return clampWheelCount(stamped);
  }
  return clampWheelCount(fallbackWheelCount);
}

export function createEmptyInspection(
  stage: InspectionStage,
  wheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): PreTripInspectionRecord {
  const n = clampWheelCount(wheelCount);
  return {
    stage,
    requiredWheelCount: n,
    areas: allInspectionAreaIds(n).map((id) => emptyInspectionArea(id)),
  };
}

export function mergeInspectionAreas(
  existing: InspectionAreaEntry[] | undefined,
  wheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): InspectionAreaEntry[] {
  const n = clampWheelCount(wheelCount);
  const byId = new Map((existing ?? []).map((a) => [a.areaId, a]));
  return allInspectionAreaIds(n).map((id) => {
    const prev = byId.get(id);
    if (!prev) return emptyInspectionArea(id);
    return {
      areaId: id,
      photo: prev.photo ?? null,
      damageKinds: Array.isArray(prev.damageKinds) ? prev.damageKinds : [],
      comment: typeof prev.comment === "string" ? prev.comment : "",
      tireBrandModel:
        typeof prev.tireBrandModel === "string" ? prev.tireBrandModel : "",
    };
  });
}

function areaHasPhoto(entry: InspectionAreaEntry | undefined): boolean {
  return Boolean(entry?.photo?.id);
}

/** Body areas need a photo; damage comment optional unless damage flagged. */
function bodyAreaComplete(entry: InspectionAreaEntry): boolean {
  if (!areaHasPhoto(entry)) return false;
  const damaged = entry.damageKinds.some((k) => k !== "none");
  if (damaged && !entry.comment.trim()) return false;
  return true;
}

/** Required tires: photo mandatory. Brand/model and comments optional. */
function requiredTireComplete(entry: InspectionAreaEntry): boolean {
  return areaHasPhoto(entry);
}

export function inspectionBodyComplete(record: PreTripInspectionRecord | null | undefined): boolean {
  if (!record) return false;
  const wheelCount = resolveInspectionWheelCount(record);
  const areas = mergeInspectionAreas(record.areas, wheelCount);
  return BODY_AREA_IDS.every((id) => {
    const entry = areas.find((a) => a.areaId === id);
    return entry ? bodyAreaComplete(entry) : false;
  });
}

export function inspectionTiresComplete(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): boolean {
  if (!record) return false;
  const wheelCount = resolveInspectionWheelCount(record, fallbackWheelCount);
  const areas = mergeInspectionAreas(record.areas, wheelCount);
  return requiredTireSlotIds(wheelCount).every((id) => {
    const entry = areas.find((a) => a.areaId === id);
    return entry ? requiredTireComplete(entry) : false;
  });
}

/** Photos + required tire set present — comments alone never suffice for tires. */
export function inspectionChecklistComplete(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): boolean {
  return (
    inspectionBodyComplete(record) &&
    inspectionTiresComplete(record, fallbackWheelCount)
  );
}

/**
 * Ready for handoff start: renter submitted a complete checklist
 * and host confirmed (or both acknowledged).
 */
export function isPreTripInspectionReady(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): boolean {
  if (!record) return false;
  if (!inspectionChecklistComplete(record, fallbackWheelCount)) return false;
  return Boolean(record.renterSubmittedAt && record.hostConfirmedAt);
}

export function isReturnInspectionReady(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): boolean {
  // Same bar as pickup: full photo set incl. every required tire + host confirm.
  return isPreTripInspectionReady(record, fallbackWheelCount);
}

export function normalizeInspectionRecord(
  raw: unknown,
  stage: InspectionStage,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): PreTripInspectionRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PreTripInspectionRecord>;
  const wheelCount = resolveInspectionWheelCount(row, fallbackWheelCount);
  return {
    stage: row.stage === "return" || row.stage === "pickup" ? row.stage : stage,
    requiredWheelCount: wheelCount,
    areas: mergeInspectionAreas(Array.isArray(row.areas) ? row.areas : [], wheelCount),
    renterSubmittedAt:
      typeof row.renterSubmittedAt === "string" ? row.renterSubmittedAt : undefined,
    hostConfirmedAt:
      typeof row.hostConfirmedAt === "string" ? row.hostConfirmedAt : undefined,
  };
}
