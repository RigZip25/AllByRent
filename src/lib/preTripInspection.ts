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
export type InspectionVehicleBodyAreaId =
  | "exterior_front"
  | "exterior_rear"
  | "exterior_left"
  | "exterior_right"
  | "interior";

export type InspectionHullAreaId =
  | "hull_bow"
  | "hull_stern"
  | "hull_port"
  | "hull_starboard"
  | "hull_deck";

export type InspectionBodyAreaId = InspectionVehicleBodyAreaId | InspectionHullAreaId;

export type InspectionLayout = "vehicle" | "hull";

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
   * Hull layout stamps 0 (no tires).
   */
  requiredWheelCount?: number;
  /** vehicle = body + tires; hull = bow/stern/port/starboard/deck (boats). */
  layout?: InspectionLayout;
  /** Renter submitted the checklist. */
  renterSubmittedAt?: string;
  /** Host confirmed / co-acknowledged the checklist. */
  hostConfirmedAt?: string;
};

export const BODY_AREA_IDS: readonly InspectionVehicleBodyAreaId[] = [
  "exterior_front",
  "exterior_rear",
  "exterior_left",
  "exterior_right",
  "interior",
] as const;

export const HULL_AREA_IDS: readonly InspectionHullAreaId[] = [
  "hull_bow",
  "hull_stern",
  "hull_port",
  "hull_starboard",
  "hull_deck",
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
  if (listingInspectionLayout(listing) === "hull") return 0;
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

export function listingInspectionLayout(
  listing: Pick<ListingDraft, "category"> | null | undefined,
): InspectionLayout {
  if ((listing?.category ?? "").trim() === "Boats & Water") return "hull";
  return "vehicle";
}

export function requiredTireSlotIds(wheelCount: number): InspectionTireSlotId[] {
  const n = clampWheelCount(wheelCount);
  if (n === 4) return [...CORNER_TIRE_SLOT_IDS];
  return Array.from({ length: n }, (_, i) => `tire_${i + 1}`);
}

export function allTireSlotIds(wheelCount: number): InspectionTireSlotId[] {
  return [...requiredTireSlotIds(wheelCount), SPARE_TIRE_SLOT_ID];
}

export function allInspectionAreaIds(
  wheelCount: number,
  layout: InspectionLayout = "vehicle",
): InspectionAreaId[] {
  if (layout === "hull") return [...HULL_AREA_IDS];
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

export function isHullArea(areaId: InspectionAreaId): boolean {
  return areaId.startsWith("hull_");
}

export function resolveInspectionLayout(
  record:
    | Pick<PreTripInspectionRecord, "layout" | "areas">
    | Partial<Pick<PreTripInspectionRecord, "layout" | "areas">>
    | null
    | undefined,
  fallback: InspectionLayout = "vehicle",
): InspectionLayout {
  if (record?.layout === "hull" || record?.layout === "vehicle") return record.layout;
  if (record?.areas?.some((a) => isHullArea(a.areaId))) return "hull";
  return fallback;
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
  record:
    | Pick<PreTripInspectionRecord, "requiredWheelCount" | "layout" | "areas">
    | Partial<Pick<PreTripInspectionRecord, "requiredWheelCount" | "layout" | "areas">>
    | null
    | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
): number {
  const layout = resolveInspectionLayout(record);
  if (layout === "hull") return 0;
  const stamped = record?.requiredWheelCount;
  if (typeof stamped === "number" && Number.isFinite(stamped) && stamped > 0) {
    return clampWheelCount(stamped);
  }
  return clampWheelCount(fallbackWheelCount);
}

export function createEmptyInspection(
  stage: InspectionStage,
  wheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  layout: InspectionLayout = "vehicle",
): PreTripInspectionRecord {
  if (layout === "hull") {
    return {
      stage,
      layout: "hull",
      requiredWheelCount: 0,
      areas: HULL_AREA_IDS.map((id) => emptyInspectionArea(id)),
    };
  }
  const n = clampWheelCount(wheelCount);
  return {
    stage,
    layout: "vehicle",
    requiredWheelCount: n,
    areas: allInspectionAreaIds(n, "vehicle").map((id) => emptyInspectionArea(id)),
  };
}

export function mergeInspectionAreas(
  existing: InspectionAreaEntry[] | undefined,
  wheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  layout: InspectionLayout = "vehicle",
): InspectionAreaEntry[] {
  const ids = allInspectionAreaIds(wheelCount, layout);
  const byId = new Map((existing ?? []).map((a) => [a.areaId, a]));
  return ids.map((id) => {
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

export function inspectionBodyComplete(
  record: PreTripInspectionRecord | null | undefined,
  fallbackLayout: InspectionLayout = "vehicle",
): boolean {
  if (!record) return false;
  const layout = resolveInspectionLayout(record, fallbackLayout);
  const wheelCount = resolveInspectionWheelCount(record);
  const areas = mergeInspectionAreas(record.areas, wheelCount, layout);
  const ids = layout === "hull" ? HULL_AREA_IDS : BODY_AREA_IDS;
  return ids.every((id) => {
    const entry = areas.find((a) => a.areaId === id);
    return entry ? bodyAreaComplete(entry) : false;
  });
}

export function inspectionTiresComplete(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  fallbackLayout: InspectionLayout = "vehicle",
): boolean {
  if (!record) return false;
  const layout = resolveInspectionLayout(record, fallbackLayout);
  if (layout === "hull") return true;
  const wheelCount = resolveInspectionWheelCount(record, fallbackWheelCount);
  const areas = mergeInspectionAreas(record.areas, wheelCount, layout);
  return requiredTireSlotIds(wheelCount).every((id) => {
    const entry = areas.find((a) => a.areaId === id);
    return entry ? requiredTireComplete(entry) : false;
  });
}

/** Photos + required tire set present — comments alone never suffice for tires. */
export function inspectionChecklistComplete(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  fallbackLayout: InspectionLayout = "vehicle",
): boolean {
  return (
    inspectionBodyComplete(record, fallbackLayout) &&
    inspectionTiresComplete(record, fallbackWheelCount, fallbackLayout)
  );
}

/**
 * Ready for handoff start: renter submitted a complete checklist
 * and host confirmed (or both acknowledged).
 */
export function isPreTripInspectionReady(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  fallbackLayout: InspectionLayout = "vehicle",
): boolean {
  if (!record) return false;
  if (!inspectionChecklistComplete(record, fallbackWheelCount, fallbackLayout)) return false;
  return Boolean(record.renterSubmittedAt && record.hostConfirmedAt);
}

export function isReturnInspectionReady(
  record: PreTripInspectionRecord | null | undefined,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  fallbackLayout: InspectionLayout = "vehicle",
): boolean {
  return isPreTripInspectionReady(record, fallbackWheelCount, fallbackLayout);
}

export function normalizeInspectionRecord(
  raw: unknown,
  stage: InspectionStage,
  fallbackWheelCount: number = DEFAULT_LIGHT_WHEEL_COUNT,
  fallbackLayout: InspectionLayout = "vehicle",
): PreTripInspectionRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<PreTripInspectionRecord>;
  const layout = resolveInspectionLayout(row, fallbackLayout);
  const wheelCount =
    layout === "hull" ? 0 : resolveInspectionWheelCount(row, fallbackWheelCount);
  return {
    stage: row.stage === "return" || row.stage === "pickup" ? row.stage : stage,
    layout,
    requiredWheelCount: wheelCount,
    areas: mergeInspectionAreas(
      Array.isArray(row.areas) ? row.areas : [],
      wheelCount,
      layout,
    ),
    renterSubmittedAt:
      typeof row.renterSubmittedAt === "string" ? row.renterSubmittedAt : undefined,
    hostConfirmedAt:
      typeof row.hostConfirmedAt === "string" ? row.hostConfirmedAt : undefined,
  };
}
