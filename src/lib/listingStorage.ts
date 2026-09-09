import type { ListingDraft } from "../screens/listing/types";
import { withoutBlocked } from "./moderation/blockStorage";
import { deleteMediaMany } from "./mediaStore";
import { WIZARD_FLOW_VERSION } from "../screens/listing/types";
import {
  canonicalShelf,
  categoryQueryNames,
} from "../screens/listing/listingItemCategories";
import type { MediaRef } from "./mediaStore";
import { applyGiftAsZeroSell } from "./listingGift";
import {
  collectListingPhotoStoragePaths,
  deleteListingPhotosFromRemote,
  hasRemoteListingPhoto,
  uploadListingPhotosToRemote,
} from "./listingPhotoStorage";
import { getAccessToken } from "./stripePayments";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { emptyVehicleExtras, normalizeVehicleExtras } from "./vehicleExtras";
import {
  categorySupportsTravelOutsideRule,
  normalizeHomeTerritory,
  normalizeTravelOutsideHomeArea,
} from "./vehicleHomeTerritory";
import {
  fetchStoreLiveByHostIds,
  isStoreOpenForHost,
} from "./garageStoreLive";
import {
  cityKeyFromLabel,
  localityLabelFromParts,
} from "./geoLocality";

const LISTINGS_STORAGE_KEY = "allbyrent_published_listings";
const PROFILE_CITY_KEY = "allbyrent_profile_city";
const PROFILE_LOCATION_KEY = "allbyrent_profile_location";
const TRIP_DESTINATION_KEY = "allbyrent_trip_destination";
const RENT_CONTEXT_KEY = "allbyrent_rent_context";
const QR_BULK_QUEUE_KEY = "allbyrent_qr_bulk_queue_listing_ids";

export type RentLocationContext = "home" | "trip";

export type ProfileLocation = {
  displayName: string;
  lat: number;
  lng: number;
};

export type TripDestination = {
  displayName: string;
  lat: number;
  lng: number;
};

export function getRentContext(): RentLocationContext | null {
  try {
    const raw = localStorage.getItem(RENT_CONTEXT_KEY);
    if (raw === "home" || raw === "trip") return raw;
    return null;
  } catch {
    return null;
  }
}

export function setRentContext(context: RentLocationContext): void {
  try {
    localStorage.setItem(RENT_CONTEXT_KEY, context);
  } catch {
    /* ignore */
  }
}

export function getProfileCity(): string {
  const home = getHomeLocation();
  if (home) {
    return localityLabelFromParts({ label: home.displayName });
  }
  try {
    return localityLabelFromParts({ label: localStorage.getItem(PROFILE_CITY_KEY) ?? "" });
  } catch {
    return "";
  }
}

export function hasProfileCity(): boolean {
  return getProfileCity().trim().length > 0;
}

/** Rent browse needs at-home or trip destination chosen at least once. */
export function hasRentLocationSetup(): boolean {
  return getHomeLocation() !== null || getTripDestination().trim().length > 0;
}

/** @deprecated Prefer setHomeLocation or setTripDestination */
export function setProfileCity(city: string): void {
  try {
    localStorage.setItem(PROFILE_CITY_KEY, city);
  } catch {
    /* ignore */
  }
}

export function getHomeLocation(): ProfileLocation | null {
  try {
    const raw = localStorage.getItem(PROFILE_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileLocation;
    if (
      typeof parsed.displayName === "string" &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setHomeLocation(location: ProfileLocation): void {
  setRentContext("home");
  const locality = localityLabelFromParts({ label: location.displayName });
  setProfileCity(locality);
  try {
    localStorage.setItem(
      PROFILE_LOCATION_KEY,
      JSON.stringify({ ...location, displayName: locality }),
    );
  } catch {
    /* ignore */
  }
  try {
    // Side-effect import avoided — callers sync agent prefs after auth when needed.
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) localStorage.setItem("allbyrent_user_timezone", tz);
  } catch {
    /* ignore */
  }
  void syncActiveListingsGeoForHost(locality, location.lat, location.lng);
}

export function getTripDestination(): string {
  return getTripDestinationLocation()?.displayName ?? "";
}

export function getTripDestinationLocation(): TripDestination | null {
  try {
    const raw = localStorage.getItem(TRIP_DESTINATION_KEY);
    if (!raw) return null;
    if (raw.startsWith("{")) {
      const parsed = JSON.parse(raw) as TripDestination;
      if (
        typeof parsed.displayName === "string" &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        return {
          displayName: localityLabelFromParts({ label: parsed.displayName }),
          lat: parsed.lat,
          lng: parsed.lng,
        };
      }
      return null;
    }
    // Legacy string-only trip destination (G8).
    const label = localityLabelFromParts({ label: raw });
    return label ? { displayName: label, lat: 0, lng: 0 } : null;
  } catch {
    return null;
  }
}

export function setTripDestination(
  displayNameOrLocation: string | TripDestination,
): void {
  setRentContext("trip");
  try {
    if (typeof displayNameOrLocation === "string") {
      const locality = localityLabelFromParts({ label: displayNameOrLocation });
      localStorage.setItem(TRIP_DESTINATION_KEY, locality);
      return;
    }
    const locality = localityLabelFromParts({
      label: displayNameOrLocation.displayName,
    });
    localStorage.setItem(
      TRIP_DESTINATION_KEY,
      JSON.stringify({
        displayName: locality,
        lat: displayNameOrLocation.lat,
        lng: displayNameOrLocation.lng,
      }),
    );
  } catch {
    /* ignore */
  }
}

/** Viewer center for radius browse (home or trip). */
export function getBrowseCenter(): { lat: number; lng: number } | null {
  const context = getRentContext();
  if (context === "trip") {
    const trip = getTripDestinationLocation();
    if (trip && Number.isFinite(trip.lat) && Number.isFinite(trip.lng) && (trip.lat !== 0 || trip.lng !== 0)) {
      return { lat: trip.lat, lng: trip.lng };
    }
  }
  const home = getHomeLocation();
  if (home && Number.isFinite(home.lat) && Number.isFinite(home.lng)) {
    return { lat: home.lat, lng: home.lng };
  }
  const trip = getTripDestinationLocation();
  if (trip && Number.isFinite(trip.lat) && Number.isFinite(trip.lng) && (trip.lat !== 0 || trip.lng !== 0)) {
    return { lat: trip.lat, lng: trip.lng };
  }
  return null;
}

/** Label shown on Home Feed — follows last at-home vs trip choice. */
export function getActiveRentLocationLabel(): string {
  const context = getRentContext();
  if (context === "trip") {
    return getTripDestination().trim();
  }
  if (context === "home") {
    return getHomeLocation()?.displayName.trim() ?? getProfileCity().trim();
  }

  const trip = getTripDestination().trim();
  const home = getHomeLocation()?.displayName.trim() ?? "";
  return home || trip || getProfileCity().trim();
}

/** @deprecated Use setHomeLocation */
export function getProfileLocation(): ProfileLocation | null {
  return getHomeLocation();
}

/** @deprecated Use setHomeLocation */
export function setProfileLocation(location: ProfileLocation): void {
  setHomeLocation(location);
}

export function savePublishedListing(
  draft: ListingDraft,
  opts?: { emitChange?: boolean },
): { ok: true } | { ok: false; reason: string } {
  const existing = loadPublishedListings();
  const normalized = normalizeListingDraft(draft);
  const next = existing.filter((item) => item.id !== normalized.id);
  next.unshift(normalized);

  const write = (rows: ListingDraft[]): boolean => {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(rows));
    return true;
  };

  try {
    write(next);
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      return { ok: false, reason: "Could not save listing to device storage." };
    }
    // Free space: drop other abandoned drafts first, keep the row we just edited.
    const pruned = pruneListingsForQuota(next, normalized.id);
    try {
      write(pruned);
    } catch (retryError) {
      if (isQuotaExceededError(retryError)) {
        notifyListingStorageFull();
        return {
          ok: false,
          reason: "Device storage is full. Free space or remove old drafts, then try again.",
        };
      }
      return { ok: false, reason: "Could not save listing to device storage." };
    }
  }

  if (opts?.emitChange !== false && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("evorios-listings-changed", { detail: { id: normalized.id } }));
  }
  return { ok: true };
}

const REMOVED_TOMBSTONES_KEY = "allbyrent_removed_listing_tombstones";
/** Keep deletes from resurrecting via a stale remote merge for a long time. */
const REMOVED_TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type ListingTombstone = { id: string; removedAt: number };

function loadListingTombstones(): ListingTombstone[] {
  try {
    const raw = localStorage.getItem(REMOVED_TOMBSTONES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const id = typeof (row as { id?: unknown }).id === "string" ? (row as { id: string }).id.trim() : "";
        const removedAt =
          typeof (row as { removedAt?: unknown }).removedAt === "number"
            ? (row as { removedAt: number }).removedAt
            : 0;
        if (!id || !Number.isFinite(removedAt) || removedAt <= 0) return null;
        if (now - removedAt > REMOVED_TOMBSTONE_TTL_MS) return null;
        return { id, removedAt };
      })
      .filter((row): row is ListingTombstone => Boolean(row));
  } catch {
    return [];
  }
}

function persistListingTombstones(rows: ListingTombstone[]): void {
  try {
    localStorage.setItem(REMOVED_TOMBSTONES_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
}

/** Drop oldest other drafts so a quota write can succeed. */
function pruneListingsForQuota(rows: ListingDraft[], keepId: string): ListingDraft[] {
  const keep = keepId.trim();
  const drafts = rows
    .filter((row) => row.listingStatus === "draft" && row.id !== keep)
    .sort((a, b) => {
      const aMs = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bMs = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return (Number.isFinite(aMs) ? aMs : 0) - (Number.isFinite(bMs) ? bMs : 0);
    });
  if (drafts.length === 0) return rows;
  const dropIds = new Set(drafts.slice(0, Math.max(1, Math.ceil(drafts.length / 2))).map((d) => d.id));
  return rows.filter((row) => !dropIds.has(row.id));
}

function notifyListingStorageFull(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("evorios-listing-storage-full"));
}

/** Listings removed locally that should not be resurrected by a stale remote merge. */
export function noteListingRemovedLocally(id: string): void {
  const trimmed = id.trim();
  if (!trimmed) return;
  const now = Date.now();
  const next = loadListingTombstones().filter((row) => row.id !== trimmed);
  next.push({ id: trimmed, removedAt: now });
  persistListingTombstones(next);
}

export function isListingRecentlyRemoved(id: string): boolean {
  const trimmed = id.trim();
  if (!trimmed) return false;
  return loadListingTombstones().some((row) => row.id === trimmed);
}

export function clearListingRemovedTombstone(id: string): void {
  const trimmed = id.trim();
  if (!trimmed) return;
  persistListingTombstones(loadListingTombstones().filter((row) => row.id !== trimmed));
}

export function removePublishedListing(id: string): void {
  noteListingRemovedLocally(id);
  try {
    const existing = loadPublishedListings();
    const victim = existing.find((item) => item.id === id) ?? null;
    const next = existing.filter((item) => item.id !== id);
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(next));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("evorios-listings-changed", { detail: { id, removed: true } }),
      );
    }
    // Best-effort: drop remote gallery files when we still know the paths.
    if (victim?.photos?.length) {
      const paths = collectListingPhotoStoragePaths(victim.photos);
      if (paths.length > 0) {
        void deleteListingPhotosFromRemote(paths).catch(() => undefined);
      }
    }
    // The blobs on this device outlive the listing otherwise, and a discarded
    // draft leaves the biggest files behind.
    const localMediaIds = [...(victim?.photos ?? []), ...(victim?.videos ?? [])]
      .flatMap((media) => [media.id, media.thumbId])
      .filter((id): id is string => Boolean(id?.trim()));
    if (localMediaIds.length > 0) {
      void deleteMediaMany(localMediaIds).catch(() => undefined);
    }
    const ownerId = victim?.hostId?.trim() ?? "";
    if (ownerId) {
      void import("./garageStoreLive").then(({ closeStoreIfShelfEmptyForHostId }) =>
        closeStoreIfShelfEmptyForHostId(ownerId),
      );
    }
  } catch {
    /* ignore */
  }
}

export type RemoveListingResult = { ok: true } | { ok: false; reason: string };

/**
 * Delete the listing everywhere, or nowhere.
 *
 * The local copy used to go first and the remote error was ignored, so a
 * refused delete left the host with no listing on their device and the row
 * still live — and since migration 059 refuses to delete a listing with a
 * rental booked, out, or in dispute, that refusal is now a normal answer.
 */
export async function removePublishedListingRemote(
  id: string,
  ownerId: string,
): Promise<RemoveListingResult> {
  const finishLocally = async (): Promise<RemoveListingResult> => {
    removePublishedListing(id);
    const { closeStoreIfShelfEmptyForHostId } = await import("./garageStoreLive");
    await closeStoreIfShelfEmptyForHostId(ownerId);
    return { ok: true };
  };

  if (!isSupabaseConfigured()) return finishLocally();
  const supabase = getSupabaseClient();
  if (!supabase) return finishLocally();

  // RLS scopes deletes to the signed-in owner. Prefer id-only so a mismatched
  // owner_id filter cannot silently no-op and let fetch merge resurrect the row.
  const byId = await supabase.from("listings").delete().eq("id", id);
  if (byId.error) {
    const oid = ownerId.trim();
    const retry = oid
      ? await supabase.from("listings").delete().eq("id", id).eq("owner_id", oid)
      : null;
    if (!retry || retry.error) {
      return { ok: false, reason: (retry?.error ?? byId.error).message };
    }
  }

  return finishLocally();
}

/** Persist an in-progress wizard draft (local always; remote when signed in). */
export function stampListingDraftProgress(
  draft: ListingDraft,
  ownerId: string | null | undefined,
  wizardStep: number,
): ListingDraft {
  const normalized = applyGiftAsZeroSell(draft);
  return {
    ...normalized,
    hostId: normalized.hostId || ownerId || normalized.hostId,
    listingStatus: "draft",
    wizardStep,
    wizardFlowVersion: WIZARD_FLOW_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Persist draft progress. Local write is always sync.
 * Remote sync uploads photos and can be slow — pass `{ syncRemote: false }` when
 * about to redirect (e.g. Stripe Connect) so the user isn’t stuck on “Opening…”.
 */
export async function saveListingDraftProgress(
  draft: ListingDraft,
  ownerId: string | null | undefined,
  wizardStep: number,
  opts?: { syncRemote?: boolean },
): Promise<ListingDraft> {
  const stamped = stampListingDraftProgress(draft, ownerId, wizardStep);
  const local = savePublishedListing(stamped);
  if (!local.ok) {
    throw new Error(local.reason);
  }
  if (ownerId && opts?.syncRemote !== false) {
    try {
      await savePublishedListingRemote(stamped, ownerId);
    } catch {
      /* local draft still saved */
    }
  }
  return stamped;
}

/** Unfinished wizard drafts for these host ids (local cache; hydrate via fetchManageableListings). */
export function getHostDraftListings(hostIds: string[]): ListingDraft[] {
  return loadPublishedListings()
    .filter((listing) => {
      if (listing.listingStatus !== "draft") return false;
      const host = listing.hostId?.trim() ?? "";
      if (host) return hostIds.includes(host);
      // Legacy local rows without hostId: visible once we have a signed-in host id.
      return hostIds.length > 0;
    })
    .sort((a, b) => {
      const aMs = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bMs = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return (Number.isFinite(bMs) ? bMs : 0) - (Number.isFinite(aMs) ? aMs : 0);
    });
}

export function getAbandonedListingDrafts(hostIds: string[]): ListingDraft[] {
  const idleMs = 30 * 60 * 1000;
  const now = Date.now();
  return getHostDraftListings(hostIds).filter((listing) => {
    const updated = listing.updatedAt ? Date.parse(listing.updatedAt) : 0;
    if (!Number.isFinite(updated) || updated <= 0) return true;
    return now - updated >= idleMs;
  });
}

function createQrTokenFallback(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `qr-${Date.now()}`;
}

function normalizeListingDraft(raw: ListingDraft): ListingDraft {
  const legacy = raw as ListingDraft & {
    verificationPhoto?: unknown;
  };
  const legacyStatus = (raw as { listingStatus?: string }).listingStatus;
  const status =
    legacyStatus === "pending_sticker" ? "pending_qr" : raw.listingStatus;
  const hostId =
    typeof raw.hostId === "string" && raw.hostId.trim() ? raw.hostId.trim() : "";
  // Categories get renamed and shelves get moved; a listing keeps the name it
  // was saved with, so the whole app reads the current one from here on.
  const shelf = canonicalShelf(raw.category ?? "", raw.subcategory ?? "");

  const base: ListingDraft = {
    ...raw,
    hostId,
    category: shelf.category,
    subcategory: shelf.subcategory,
    listingStatus: status,
    wizardStep:
      typeof raw.wizardStep === "number" && raw.wizardStep >= 1 && raw.wizardStep <= 4
        ? Math.floor(raw.wizardStep)
        : undefined,
    wizardFlowVersion:
      typeof (raw as { wizardFlowVersion?: unknown }).wizardFlowVersion === "number"
        ? Math.floor((raw as { wizardFlowVersion: number }).wizardFlowVersion)
        : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    nudgeCount: typeof raw.nudgeCount === "number" ? raw.nudgeCount : undefined,
    lastNudgedAt:
      typeof raw.lastNudgedAt === "string" || raw.lastNudgedAt === null
        ? raw.lastNudgedAt
        : undefined,
    photos: Array.isArray(raw.photos) && raw.photos.every((p) => p && typeof p === "object" && "id" in p)
      ? raw.photos
      : [],
    videos: Array.isArray((raw as unknown as { videos?: unknown }).videos) &&
      (raw as unknown as { videos: unknown[] }).videos.every(
        (v) => v && typeof v === "object" && "id" in (v as object),
      )
      ? (raw as unknown as { videos: ListingDraft["videos"] }).videos
      : [],
    verificationPhoto:
      legacy.verificationPhoto &&
      typeof legacy.verificationPhoto === "object" &&
      "id" in legacy.verificationPhoto
        ? (legacy.verificationPhoto as MediaRef)
        : null,
    handoff: {
      ...raw.handoff,
      itemHeavy: raw.handoff.itemHeavy ?? false,
      itemWeightLbs:
        typeof raw.handoff.itemWeightLbs === "number" &&
        Number.isFinite(raw.handoff.itemWeightLbs) &&
        raw.handoff.itemWeightLbs > 0
          ? Math.round(raw.handoff.itemWeightLbs)
          : undefined,
      deliveryMaxMiles: raw.handoff.deliveryMaxMiles ?? 20,
      deliveryRoundTripFee: raw.handoff.deliveryRoundTripFee ?? "",
      deliveryPrices: raw.handoff.deliveryPrices ?? [],
      tollHoldEnabled: Boolean(raw.handoff.tollHoldEnabled),
      tollHoldAmountUsd:
        typeof raw.handoff.tollHoldAmountUsd === "string" && raw.handoff.tollHoldAmountUsd.trim()
          ? raw.handoff.tollHoldAmountUsd
          : "50",
      travelOutsideHomeArea: categorySupportsTravelOutsideRule(raw.category ?? "")
        ? normalizeTravelOutsideHomeArea(raw.handoff.travelOutsideHomeArea)
        : undefined,
      homeTerritory: categorySupportsTravelOutsideRule(raw.category ?? "")
        ? normalizeHomeTerritory(raw.handoff.homeTerritory)
        : undefined,
      lateReturnFeeEnabled:
        raw.handoff.lateReturnFeeEnabled != null
          ? Boolean(raw.handoff.lateReturnFeeEnabled)
          : undefined,
      lateReturnGraceMinutes:
        typeof raw.handoff.lateReturnGraceMinutes === "number" &&
        Number.isFinite(raw.handoff.lateReturnGraceMinutes)
          ? Math.max(0, Math.min(1440, Math.round(raw.handoff.lateReturnGraceMinutes)))
          : undefined,
      lateReturnFlatFeeUsd:
        typeof raw.handoff.lateReturnFlatFeeUsd === "string"
          ? raw.handoff.lateReturnFlatFeeUsd
          : undefined,
      lateReturnPerHourFeeUsd:
        typeof raw.handoff.lateReturnPerHourFeeUsd === "string"
          ? raw.handoff.lateReturnPerHourFeeUsd
          : undefined,
      fuelPolicy:
        raw.handoff.fuelPolicy === "prepaid_full_tank" ? "prepaid_full_tank" : raw.handoff.fuelPolicy === "full_to_full" ? "full_to_full" : undefined,
      fuelMissingFeeUsd:
        typeof raw.handoff.fuelMissingFeeUsd === "string"
          ? raw.handoff.fuelMissingFeeUsd
          : undefined,
      fuelTankGallons:
        typeof raw.handoff.fuelTankGallons === "string"
          ? raw.handoff.fuelTankGallons
          : undefined,
      allowYoungDrivers:
        raw.handoff.allowYoungDrivers != null
          ? Boolean(raw.handoff.allowYoungDrivers)
          : undefined,
      youngDriverHoldMultiplier:
        typeof raw.handoff.youngDriverHoldMultiplier === "number" &&
        Number.isFinite(raw.handoff.youngDriverHoldMultiplier)
          ? Math.max(1, Math.min(3, raw.handoff.youngDriverHoldMultiplier))
          : undefined,
    },
    // QR is required for traceability; preserve stored value but default to true.
    generateQR: raw.generateQR ?? true,
    qrToken: raw.qrToken ?? createQrTokenFallback(),
    qrReady: raw.qrReady ?? false,
    qrPrintedConfirmed: raw.qrPrintedConfirmed ?? false,
    qrQueuedForBulk: raw.qrQueuedForBulk ?? false,
    serialNumber: typeof raw.serialNumber === "string" ? raw.serialNumber : "",
    vin: typeof raw.vin === "string" ? raw.vin : "",
    licensePlate: typeof raw.licensePlate === "string" ? raw.licensePlate : "",
    licensePlateState: typeof raw.licensePlateState === "string" ? raw.licensePlateState : "",
    vehicleExtras:
      raw.vehicleExtras && typeof raw.vehicleExtras === "object"
        ? normalizeVehicleExtras(raw.vehicleExtras)
        : emptyVehicleExtras(),
    categorySpecs:
      raw.categorySpecs &&
      typeof raw.categorySpecs === "object" &&
      !Array.isArray(raw.categorySpecs)
        ? Object.fromEntries(
            Object.entries(raw.categorySpecs as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : {},
  };
  return applyGiftAsZeroSell(base);
}

export function loadPublishedListings(): ListingDraft[] {
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ListingDraft[];
    return Array.isArray(parsed) ? parsed.map(normalizeListingDraft) : [];
  } catch {
    return [];
  }
}

export function countPublishedListingsForHost(hostId: string): number {
  const normalizedHostId = hostId.trim();
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return 0;
    let count = 0;
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const listing = item as { hostId?: unknown };
      const listingHost =
        typeof listing.hostId === "string" && listing.hostId.trim()
          ? listing.hostId.trim()
          : "";
      if (listingHost === normalizedHostId) count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}

export function getPublishedListingById(id: string): ListingDraft | null {
  const key = id.trim();
  if (!key) return null;
  return (
    loadPublishedListings().find(
      (listing) => listing.id === key || (listing.qrToken?.trim() ?? "") === key,
    ) ?? null
  );
}

export function updateStoredListing(draft: ListingDraft): void {
  savePublishedListing(draft);
}

export type PublishedListingPatch = Partial<Omit<ListingDraft, "pricing" | "handoff" | "modes">> & {
  pricing?: Partial<ListingDraft["pricing"]>;
  handoff?: Partial<ListingDraft["handoff"]>;
  modes?: Partial<ListingDraft["modes"]>;
};

export function updatePublishedListing(listingId: string, patch: PublishedListingPatch): boolean {
  try {
    const existing = loadPublishedListings();
    const index = existing.findIndex((item) => item.id === listingId);
    if (index < 0) return false;
    const current = existing[index]!;

    const nextListing: ListingDraft = {
      ...current,
      ...patch,
      modes: patch.modes ? { ...current.modes, ...patch.modes } : current.modes,
      pricing: patch.pricing ? { ...current.pricing, ...patch.pricing } : current.pricing,
      handoff: patch.handoff ? { ...current.handoff, ...patch.handoff } : current.handoff,
    };

    const next = existing.slice();
    next[index] = nextListing;
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

function mergePublishedListingPatch(
  current: ListingDraft,
  patch: PublishedListingPatch,
): ListingDraft {
  return {
    ...current,
    ...patch,
    modes: patch.modes ? { ...current.modes, ...patch.modes } : current.modes,
    pricing: patch.pricing ? { ...current.pricing, ...patch.pricing } : current.pricing,
    handoff: patch.handoff ? { ...current.handoff, ...patch.handoff } : current.handoff,
  };
}

/** Stamp hostId on legacy local listings the first time a signed-in host edits them. */
export async function claimListingOwnershipIfUnassigned(
  listingId: string,
  ownerId: string,
): Promise<ListingDraft | null> {
  const normalizedOwnerId = ownerId.trim();
  if (!normalizedOwnerId) return getPublishedListingById(listingId);

  let current = getPublishedListingById(listingId);
  if (!current) {
    current = await fetchListingByIdRemote(listingId);
  }
  if (!current) return null;
  if (current.hostId?.trim()) return current;

  const result = await updatePublishedListingRemote(
    listingId,
    { hostId: normalizedOwnerId },
    normalizedOwnerId,
  );
  return result.ok ? result.listing : current;
}

export async function updatePublishedListingRemote(
  listingId: string,
  patch: PublishedListingPatch,
  ownerId: string,
): Promise<{ ok: true; listing: ListingDraft } | { ok: false; reason: string }> {
  let current = getPublishedListingById(listingId);
  if (!current) {
    current = await fetchListingByIdRemote(listingId);
  }
  if (!current) {
    return { ok: false, reason: "Listing not found." };
  }

  const nextListing = mergePublishedListingPatch(current, patch);
  savePublishedListing(nextListing);

  const normalizedOwnerId = ownerId.trim() || nextListing.hostId?.trim() || "";
  if (normalizedOwnerId) {
    await savePublishedListingRemote(nextListing, normalizedOwnerId);
  }

  return { ok: true, listing: nextListing };
}

/** Published listings with QR enabled — for batch sticker sheets. */
export function loadStickerEligibleListings(): ListingDraft[] {
  return loadPublishedListings().filter(
    (listing) =>
      listing.generateQR &&
      (listing.listingStatus === "pending_qr" || listing.listingStatus === "active"),
  );
}

export function loadQrBulkQueueListingIds(): string[] {
  try {
    const raw = localStorage.getItem(QR_BULK_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const ids = parsed.filter((id): id is string => typeof id === "string" && id.trim() !== "");
    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

function saveQrBulkQueueListingIds(ids: string[]): void {
  try {
    localStorage.setItem(QR_BULK_QUEUE_KEY, JSON.stringify(Array.from(new Set(ids))));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("evorios-qr-bulk-changed", { detail: { count: ids.length } }),
      );
    }
  } catch {
    /* ignore */
  }
}

export function isListingQueuedForBulk(id: string): boolean {
  const key = id.trim();
  if (!key) return false;
  return loadQrBulkQueueListingIds().includes(key);
}

/** Queue listing ids for bulk QR print. Does not rewrite listing rows (avoids remount/refetch side effects). */
export function addListingToQrBulkQueue(id: string, capacity = 12): number {
  const key = id.trim();
  const current = loadQrBulkQueueListingIds();
  if (!key) return current.length;
  if (current.includes(key)) return current.length;
  if (current.length >= capacity) return current.length;
  current.push(key);
  saveQrBulkQueueListingIds(current);
  return current.length;
}

export function removeListingFromQrBulkQueue(id: string): number {
  const key = id.trim();
  const next = loadQrBulkQueueListingIds().filter((itemId) => itemId !== key);
  saveQrBulkQueueListingIds(next);
  return next.length;
}

export function clearQrBulkQueue(): void {
  saveQrBulkQueueListingIds([]);
}

type SupabaseListingRow = {
  id: string;
  owner_id: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  city_key?: string | null;
  title: string;
  category: string;
  subcategory: string;
  grade: string;
  condition: string;
  description: string;
  replacement_value: number | null;
  photos: unknown;
  modes: string[] | null;
  pricing: unknown;
  availability: unknown;
  handoff: unknown;
  qr_code: string | null;
  listing_status: string;
  boosted_until?: string | null;
  boosted_tier?: number | null;
  created_at: string;
  updated_at: string;
};

function publicHandoffPayload(handoff: ListingDraft["handoff"] | undefined) {
  if (!handoff || typeof handoff !== "object") return {};
  const { contactlessInstructions: _secret, ...rest } = handoff;
  return rest;
}

async function upsertListingAccessSecrets(
  listingId: string,
  ownerId: string,
  instructions: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const trimmed = instructions.trim();
  if (!trimmed) {
    await supabase.from("listing_access_secrets").delete().eq("listing_id", listingId);
    return;
  }
  await supabase.from("listing_access_secrets").upsert(
    {
      listing_id: listingId,
      owner_id: ownerId,
      contactless_instructions: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "listing_id" },
  );
}

export async function fetchListingAccessInstructions(
  listingId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("listing_access_secrets")
    .select("contactless_instructions")
    .eq("listing_id", listingId)
    .maybeSingle();
  if (error || !data) return null;
  const value = (data as { contactless_instructions?: string }).contactless_instructions;
  return typeof value === "string" ? value : null;
}

async function syncActiveListingsGeoForHost(
  city: string,
  lat: number,
  lng: number,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return;
  await supabase
    .from("listings")
    .update({
      city,
      city_key: cityKeyFromLabel(city),
      lat,
      lng,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_id", user.id)
    .in("listing_status", ["active", "draft", "paused"]);
}

const listingCoordsById = new Map<string, { lat: number; lng: number }>();

export function getListingCoords(listingId: string): { lat: number; lng: number } | null {
  return listingCoordsById.get(listingId) ?? null;
}

function rememberListingCoords(row: SupabaseListingRow): void {
  if (
    typeof row.lat === "number" &&
    typeof row.lng === "number" &&
    Number.isFinite(row.lat) &&
    Number.isFinite(row.lng)
  ) {
    listingCoordsById.set(row.id, { lat: row.lat, lng: row.lng });
  }
}

function draftToRow(draft: ListingDraft, ownerId: string): Partial<SupabaseListingRow> {
  const home = getHomeLocation();
  const city = getProfileCity();
  return {
    id: draft.id,
    owner_id: ownerId,
    city,
    city_key: city ? cityKeyFromLabel(city) : null,
    lat: home?.lat ?? null,
    lng: home?.lng ?? null,
    title: draft.title ?? "",
    category: draft.category ?? "",
    subcategory: draft.subcategory ?? "",
    grade: draft.grade ?? "",
    condition: draft.condition ?? "",
    description: draft.description ?? "",
    replacement_value:
      draft.replacementValue.trim().length > 0 ? Number(draft.replacementValue) : null,
    photos: draft.photos ?? [],
    modes: Object.entries(draft.modes)
      .filter(([, enabled]) => enabled)
      .map(([mode]) => mode),
    pricing: draft.pricing ?? {},
    availability: {
      blocked_dates: draft.blockedDates ?? [],
      paused: draft.paused ?? false,
      wizard_step: draft.wizardStep ?? null,
      wizard_flow_version: draft.wizardFlowVersion ?? null,
      nudge_count: draft.nudgeCount ?? 0,
      last_nudged_at: draft.lastNudgedAt ?? null,
      qr_ready: draft.qrReady ?? false,
      serial_number: draft.serialNumber?.trim() || null,
      vin: draft.vin?.trim() || null,
      license_plate: draft.licensePlate?.trim() || null,
      license_plate_state: draft.licensePlateState?.trim() || null,
      vehicle_extras: draft.vehicleExtras ?? emptyVehicleExtras(),
      category_specs: draft.categorySpecs ?? {},
      instructions_url: null,
    },
    handoff: publicHandoffPayload(draft.handoff),
    qr_code: draft.qrToken ?? null,
    listing_status: draft.listingStatus ?? "draft",
  };
}

function rowToDraft(row: SupabaseListingRow): ListingDraft {
  rememberListingCoords(row);
  const availability =
    row.availability && typeof row.availability === "object"
      ? (row.availability as Record<string, unknown>)
      : {};
  const blockedDates = Array.isArray(availability.blocked_dates)
    ? (availability.blocked_dates as ListingDraft["blockedDates"])
    : [];

  const modesArr = Array.isArray(row.modes) ? row.modes : [];
  const modes: ListingDraft["modes"] = {
    rent: modesArr.includes("rent"),
    sell: modesArr.includes("sell"),
    rentToOwn: modesArr.includes("rentToOwn") || modesArr.includes("rent_to_own") || modesArr.includes("rto"),
    gift: modesArr.includes("gift"),
  };

  return normalizeListingDraft({
    id: row.id,
    hostId: row.owner_id,
    listingStatus: (row.listing_status as ListingDraft["listingStatus"]) ?? "draft",
    wizardStep:
      typeof availability.wizard_step === "number" ? availability.wizard_step : undefined,
    wizardFlowVersion:
      typeof availability.wizard_flow_version === "number"
        ? Math.floor(availability.wizard_flow_version)
        : undefined,
    updatedAt: row.updated_at,
    nudgeCount: typeof availability.nudge_count === "number" ? availability.nudge_count : undefined,
    lastNudgedAt:
      typeof availability.last_nudged_at === "string" || availability.last_nudged_at === null
        ? (availability.last_nudged_at as string | null)
        : undefined,
    boostedUntil: row.boosted_until ?? null,
    boostedTier: typeof row.boosted_tier === "number" ? row.boosted_tier : null,
    photos: Array.isArray(row.photos) ? (row.photos as ListingDraft["photos"]) : [],
    videos: [],
    aiSuggestions: null,
    aiAnalysisPending: false,
    photoEnhancementPending: false,
    title: row.title ?? "",
    category: row.category ?? "",
    subcategory: row.subcategory ?? "",
    grade: (row.grade as ListingDraft["grade"]) ?? "",
    condition: (row.condition as ListingDraft["condition"]) ?? "",
    description: row.description ?? "",
    replacementValue: row.replacement_value != null ? String(row.replacement_value) : "",
    serialNumber: typeof availability.serial_number === "string" ? availability.serial_number : "",
    vin: typeof availability.vin === "string" ? availability.vin : "",
    licensePlate:
      typeof availability.license_plate === "string" ? availability.license_plate : "",
    licensePlateState:
      typeof availability.license_plate_state === "string"
        ? availability.license_plate_state
        : "",
    vehicleExtras: normalizeVehicleExtras(availability.vehicle_extras),
    categorySpecs:
      availability.category_specs &&
      typeof availability.category_specs === "object" &&
      !Array.isArray(availability.category_specs)
        ? Object.fromEntries(
            Object.entries(availability.category_specs as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : {},
    instructionsUrl:
      typeof availability.instructions_url === "string" ? availability.instructions_url : "",
    modes,
    pricing:
      row.pricing && typeof row.pricing === "object"
        ? (row.pricing as ListingDraft["pricing"])
        : createInitialPricingFallback(),
    blockedDates,
    paused: Boolean(availability.paused),
    handoff:
      row.handoff && typeof row.handoff === "object"
        ? (row.handoff as ListingDraft["handoff"])
        : createInitialHandoffFallback(),
    generateQR: true,
    qrToken: row.qr_code ?? createQrTokenFallback(),
    qrReady:
      typeof availability.qr_ready === "boolean"
        ? Boolean(availability.qr_ready)
        : row.listing_status === "active",
    qrPrintedConfirmed: false,
    verificationPhoto: null,
    qrQueuedForBulk: false,
  });
}

function interleaveBoosted(list: ListingDraft[], organicPerBoost = 5): ListingDraft[] {
  const now = Date.now();
  const boosted = list.filter((l) => {
    const until = l.boostedUntil ? new Date(l.boostedUntil).getTime() : 0;
    return until > now;
  });
  const organic = list.filter((l) => {
    const until = l.boostedUntil ? new Date(l.boostedUntil).getTime() : 0;
    return !(until > now);
  });

  if (boosted.length === 0) return organic;

  const out: ListingDraft[] = [];
  let b = 0;
  let o = 0;
  while (b < boosted.length || o < organic.length) {
    if (b < boosted.length) out.push(boosted[b++]);
    for (let i = 0; i < organicPerBoost && o < organic.length; i++) out.push(organic[o++]);
  }
  return out;
}

export async function boostListingRemote(input: {
  listingId: string;
  boostedUntil: string;
  boostedTier: number;
  ownerId: string;
}): Promise<void> {
  // Optimistic local only. Writing boosted_until from the device is refused by
  // listings_protect_boost (046/047); the Stripe webhook is the one that stamps
  // the column after payment succeeds.
  const listing = getPublishedListingById(input.listingId);
  if (listing) {
    updateStoredListing({
      ...listing,
      boostedUntil: input.boostedUntil,
      boostedTier: input.boostedTier,
    });
  }
}

function createInitialPricingFallback(): ListingDraft["pricing"] {
  return {
    dailyRate: "",
    weeklyRate: "",
    monthlyRate: "",
    longTermEnabled: false,
    longTermMonthlyRate: "",
    salePrice: "",
    rtoTotalPrice: "",
    rtoPeriodMonths: "",
    securityDeposit: "",
    minimumPeriod: "1 day",
  };
}

function createInitialHandoffFallback(): ListingDraft["handoff"] {
  return {
    inPerson: false,
    inPersonDays: ["Mo", "Tu", "We", "Th", "Fr"],
    inPersonTimeStart: "09:00",
    inPersonTimeEnd: "17:00",
    inPersonWeekendTimeStart: "10:00",
    inPersonWeekendTimeEnd: "14:00",
    contactless: false,
    contactlessInstructions: "",
    delivery: false,
    itemHeavy: false,
    deliveryMaxMiles: 20,
    deliveryRoundTripFee: "",
    deliveryPrices: [],
  };
}

export type RemoteListingSaveResult = {
  /** False when the listing row itself could not be written. */
  ok: boolean;
  /** Photos that stayed on this device, so neighbours would see an empty listing. */
  photosPending: number;
};

export async function savePublishedListingRemote(
  draft: ListingDraft,
  ownerId: string,
): Promise<RemoteListingSaveResult> {
  const normalizedOwnerId = ownerId.trim();
  if (!normalizedOwnerId) {
    savePublishedListing(draft);
    return { ok: false, photosPending: 0 };
  }
  const stamped: ListingDraft = {
    ...draft,
    hostId: draft.hostId?.trim() || normalizedOwnerId,
  };
  savePublishedListing(stamped);
  if (!isSupabaseConfigured()) {
    return { ok: true, photosPending: 0 };
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: true, photosPending: 0 };
  }

  // Upsert listing metadata first (no local blob photos) so My Garage can load it
  // while photo upload is still running — and so large data-URLs don't fail the row write.
  const earlyPhotos = (stamped.photos ?? []).filter((photo) => Boolean(photo.storagePath?.trim()));
  const { error: earlyError } = await supabase
    .from("listings")
    .upsert(draftToRow({ ...stamped, photos: earlyPhotos }, normalizedOwnerId), { onConflict: "id" });
  if (earlyError) {
    console.warn("savePublishedListingRemote early upsert failed:", earlyError.message);
  } else {
    await upsertListingAccessSecrets(
      stamped.id,
      normalizedOwnerId,
      stamped.handoff?.contactlessInstructions ?? "",
    );
  }

  const previous = getPublishedListingById(stamped.id);
  const previousPaths = collectListingPhotoStoragePaths(previous?.photos ?? []);

  let photos = stamped.photos;
  let photosPending = 0;
  try {
    const upload = await uploadListingPhotosToRemote({
      listingId: stamped.id,
      ownerId: normalizedOwnerId,
      photos: stamped.photos,
    });
    photos = upload.photos;
    photosPending = upload.pending;
  } catch (error) {
    console.warn("uploadListingPhotosToRemote failed:", error);
    photosPending = (stamped.photos ?? []).filter((photo) => !photo.storagePath?.trim()).length;
  }

  const nextPaths = collectListingPhotoStoragePaths(photos);
  const orphanPaths = previousPaths.filter((path) => !nextPaths.includes(path));
  if (orphanPaths.length > 0) {
    try {
      await deleteListingPhotosFromRemote(orphanPaths);
    } catch (error) {
      console.warn("deleteListingPhotosFromRemote failed:", error);
    }
  }

  const syncedDraft = photos !== stamped.photos ? { ...stamped, photos } : stamped;
  if (photos !== stamped.photos) {
    savePublishedListing(syncedDraft);
  }

  const { error } = await supabase
    .from("listings")
    .upsert(draftToRow(syncedDraft, normalizedOwnerId), { onConflict: "id" });
  if (error) {
    console.warn("savePublishedListingRemote failed:", error.message);
  } else {
    await upsertListingAccessSecrets(
      syncedDraft.id,
      normalizedOwnerId,
      syncedDraft.handoff?.contactlessInstructions ?? "",
    );
  }

  return { ok: !error, photosPending };
}

/** Ask the server to stamp the listing verified for a photo it can see. */
async function confirmQrVerificationRemote(params: {
  listingId: string;
  path: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: "Sign in again to finish verification." };

  try {
    const res = await fetch("/api/listings/verify-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    const payload = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && payload.ok) return { ok: true };
    return { ok: false, reason: payload.error ?? "Could not verify this listing." };
  } catch {
    return { ok: false, reason: "Could not reach the server to verify this listing." };
  }
}

export async function uploadQrVerificationPhotoRemote(params: {
  listingId: string;
  ownerId: string;
  file: File;
}): Promise<{ path: string } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const ext = params.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${params.ownerId}/${params.listingId}/qr_verification_${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("listing-verification")
    .upload(path, params.file, {
      upsert: true,
      contentType: params.file.type || "image/jpeg",
    });
  if (uploadError) throw uploadError;

  // "Verified" is a claim about a photo that exists, so the server checks the
  // object is really in the bucket before it stamps the listing.
  const verified = await confirmQrVerificationRemote({ listingId: params.listingId, path });
  if (!verified.ok) throw new Error(verified.reason);

  // Update local cache for instant UX.
  const listing = getPublishedListingById(params.listingId);
  if (listing) {
    updateStoredListing({
      ...listing,
      listingStatus: "active",
      qrReady: true,
      verificationPhoto: {
        id: path,
        kind: "image",
        mimeType: params.file.type || "image/jpeg",
        createdAt: Date.now(),
        sizeBytes: params.file.size,
        storagePath: path,
        storageBucket: "listing-verification",
      },
    });
  }

  return { path };
}

export async function fetchListingByIdRemote(id: string): Promise<ListingDraft | null> {
  const key = id.trim();
  if (!key) return null;
  if (!isSupabaseConfigured()) {
    return getPublishedListingById(key);
  }
  const supabase = getSupabaseClient();
  if (!supabase) return getPublishedListingById(key);

  // Public QR links use /item/:idOrQr — resolve by listing id or qr_code.
  const byId = await supabase.from("listings").select("*").eq("id", key).maybeSingle();
  if (!byId.error && byId.data) {
    const draft = rowToDraft(byId.data as SupabaseListingRow);
    savePublishedListing(draft, { emitChange: false });
    return draft;
  }

  const byQr = await supabase.from("listings").select("*").eq("qr_code", key).maybeSingle();
  if (!byQr.error && byQr.data) {
    const draft = rowToDraft(byQr.data as SupabaseListingRow);
    savePublishedListing(draft, { emitChange: false });
    return draft;
  }

  return getPublishedListingById(key);
}

export async function fetchListingsByOwnerIdsRemote(ownerIds: string[]): Promise<ListingDraft[]> {
  const ids = ownerIds.map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    return [];
  }
  if (!isSupabaseConfigured()) {
    return loadPublishedListings().filter((l) => ids.includes(l.hostId ?? ""));
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadPublishedListings().filter((l) => ids.includes(l.hostId ?? ""));
  }
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("owner_id", ids)
    .order("updated_at", { ascending: false });
  if (error || !data) {
    return loadPublishedListings().filter((l) => ids.includes(l.hostId ?? ""));
  }
  const drafts = (data as SupabaseListingRow[]).map(rowToDraft);
  // Cache remote rows (including drafts) so Garage can resume after reinstall / new device.
  for (const draft of drafts) {
    savePublishedListing(draft, { emitChange: false });
  }
  return drafts;
}

/** Host inventory after wizard — active / legacy pending_qr. Not necessarily neighbor-visible. */
export function isListingOnShelf(listing: ListingDraft): boolean {
  return listing.listingStatus === "active" || listing.listingStatus === "pending_qr";
}

/**
 * Neighbor-visible in browse: on shelf, not item-paused, and host store is Live.
 * Pass `storeLiveByHost` from `fetchStoreLiveByHostIds` when batching; otherwise local cache is used.
 */
export function isListingBrowsable(
  listing: ListingDraft,
  storeLiveByHost?: Record<string, boolean>,
): boolean {
  if (!isListingOnShelf(listing) || listing.paused) return false;
  // Photos that never reached storage exist only on the host's phone, so to a
  // neighbour the card would be blank. Local-only mode has no neighbours.
  if (
    isSupabaseConfigured() &&
    (listing.photos ?? []).length > 0 &&
    !hasRemoteListingPhoto(listing.photos)
  ) {
    return false;
  }
  return isStoreOpenForHost(listing.hostId, storeLiveByHost);
}

async function filterNeighborVisible(listings: ListingDraft[]): Promise<ListingDraft[]> {
  // A blocked neighbour disappears from browse before anything else is decided.
  const visible = withoutBlocked(listings, (l) => l.hostId);
  const hostIds = visible
    .map((l) => l.hostId?.trim() ?? "")
    .filter(Boolean);
  const storeLiveByHost = await fetchStoreLiveByHostIds(hostIds);
  return visible.filter((l) => isListingBrowsable(l, storeLiveByHost));
}

export async function fetchActiveListingsForCityRemote(
  city: string,
  options?: { radiusMi?: number; center?: { lat: number; lng: number } | null },
): Promise<ListingDraft[]> {
  const cityNorm = city.trim();
  const center = options?.center ?? getBrowseCenter();
  const radiusMi = options?.radiusMi;

  if (!cityNorm && !center) {
    // G9: no location center and no city → empty shelf, not the world.
    return [];
  }

  if (!isSupabaseConfigured()) {
    return filterNeighborVisible(loadPublishedListings().filter(isListingOnShelf));
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return filterNeighborVisible(loadPublishedListings().filter(isListingOnShelf));
  }

  if (center && radiusMi && radiusMi > 0) {
    const { data, error } = await supabase.rpc("listings_within_radius", {
      p_lat: center.lat,
      p_lng: center.lng,
      p_radius_mi: radiusMi,
      p_limit: 200,
    });
    if (!error && data) {
      return interleaveBoosted(
        await filterNeighborVisible((data as SupabaseListingRow[]).map(rowToDraft)),
      );
    }
  }

  const query = supabase
    .from("listings")
    .select("*")
    .eq("listing_status", "active")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  const cityKey = cityNorm ? cityKeyFromLabel(cityNorm) : "";
  const { data, error } = cityNorm
    ? await query.or(`city_key.eq.${cityKey},city.ilike.%${cityNorm}%`)
    : await query.limit(0); // G9: refuse worldwide without a center
  if (error || !data) {
    return filterNeighborVisible(loadPublishedListings().filter(isListingOnShelf));
  }
  return interleaveBoosted(
    await filterNeighborVisible((data as SupabaseListingRow[]).map(rowToDraft)),
  );
}

export async function searchActiveListingsRemote(params: {
  query: string;
  city: string;
  category?: string;
}): Promise<ListingDraft[]> {
  const q = params.query.trim().toLowerCase();
  const cityNorm = params.city.trim();
  const category = params.category?.trim() || "";

  const matchLocal = (list: ListingDraft[]) =>
    list
      .filter(isListingOnShelf)
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!q) return true;
        const specs = Object.values(l.categorySpecs ?? {}).join(" ");
        const hay = `${l.title} ${l.description} ${l.category} ${l.subcategory} ${l.vin} ${l.serialNumber} ${specs}`.toLowerCase();
        const tokens = q.split(/\s+/).filter(Boolean).slice(0, 6);
        return tokens.every((token) => hay.includes(token));
      });

  if (!isSupabaseConfigured()) {
    return filterNeighborVisible(matchLocal(loadPublishedListings()));
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return filterNeighborVisible(matchLocal(loadPublishedListings()));
  }

  let queryBuilder = supabase
    .from("listings")
    .select("*")
    .eq("listing_status", "active")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (cityNorm) {
    const cityKey = cityKeyFromLabel(cityNorm);
    queryBuilder = queryBuilder.or(`city_key.eq.${cityKey},city.ilike.%${cityNorm}%`);
  }
  // Rows keep the category name they were saved with, so match the old ones too.
  if (category) queryBuilder = queryBuilder.in("category", categoryQueryNames(category));
  if (q) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,subcategory.ilike.%${q}%`,
    );
  }

  const { data, error } = await queryBuilder.limit(50);
  if (error || !data) {
    return filterNeighborVisible(matchLocal(loadPublishedListings()));
  }
  return interleaveBoosted(
    await filterNeighborVisible((data as SupabaseListingRow[]).map(rowToDraft)),
  );
}
