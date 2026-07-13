import type { ListingDraft } from "../screens/listing/types";
import {
  collectListingPhotoStoragePaths,
  deleteListingPhotosFromRemote,
  uploadListingPhotosToRemote,
} from "./listingPhotoStorage";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

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
  if (home) return home.displayName;
  try {
    return localStorage.getItem(PROFILE_CITY_KEY) ?? "";
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
  setProfileCity(location.displayName);
  try {
    localStorage.setItem(PROFILE_LOCATION_KEY, JSON.stringify(location));
  } catch {
    /* ignore */
  }
}

export function getTripDestination(): string {
  try {
    return localStorage.getItem(TRIP_DESTINATION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setTripDestination(displayName: string): void {
  setRentContext("trip");
  try {
    localStorage.setItem(TRIP_DESTINATION_KEY, displayName);
  } catch {
    /* ignore */
  }
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

export function savePublishedListing(draft: ListingDraft): void {
  try {
    const existing = loadPublishedListings();
    const normalized = normalizeListingDraft(draft);
    const next = existing.filter((item) => item.id !== normalized.id);
    next.unshift(normalized);
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function createQrTokenFallback(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `qr-${Date.now()}`;
}

function normalizeListingDraft(raw: ListingDraft): ListingDraft {
  const status =
    raw.listingStatus === "pending_sticker" ? "pending_qr" : raw.listingStatus;
  const hostId =
    typeof raw.hostId === "string" && raw.hostId.trim() ? raw.hostId.trim() : "";

  return {
    ...raw,
    hostId,
    listingStatus: status,
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
      raw.verificationPhoto && typeof raw.verificationPhoto === "object" && "id" in raw.verificationPhoto
        ? raw.verificationPhoto
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
    },
    // QR is required for traceability; preserve stored value but default to true.
    generateQR: raw.generateQR ?? true,
    qrToken: raw.qrToken ?? createQrTokenFallback(),
    qrReady: raw.qrReady ?? false,
    qrPrintedConfirmed: raw.qrPrintedConfirmed ?? false,
    qrQueuedForBulk: raw.qrQueuedForBulk ?? false,
  };
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
  return loadPublishedListings().find((listing) => listing.id === id) ?? null;
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
  } catch {
    /* ignore */
  }
}

export function isListingQueuedForBulk(id: string): boolean {
  return loadQrBulkQueueListingIds().includes(id);
}

export function addListingToQrBulkQueue(id: string): number {
  const current = loadQrBulkQueueListingIds();
  if (!current.includes(id)) {
    current.push(id);
    saveQrBulkQueueListingIds(current);
  }
  const listing = getPublishedListingById(id);
  if (listing && !listing.qrQueuedForBulk) {
    updateStoredListing({ ...listing, qrQueuedForBulk: true });
  }
  return loadQrBulkQueueListingIds().length;
}

export function removeListingFromQrBulkQueue(id: string): number {
  const next = loadQrBulkQueueListingIds().filter((itemId) => itemId !== id);
  saveQrBulkQueueListingIds(next);
  const listing = getPublishedListingById(id);
  if (listing?.qrQueuedForBulk) {
    updateStoredListing({ ...listing, qrQueuedForBulk: false });
  }
  return next.length;
}

export function clearQrBulkQueue(): void {
  saveQrBulkQueueListingIds([]);
  const listings = loadPublishedListings();
  listings
    .filter((l) => l.qrQueuedForBulk)
    .forEach((l) => updateStoredListing({ ...l, qrQueuedForBulk: false }));
}

type SupabaseListingRow = {
  id: string;
  owner_id: string;
  city?: string;
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

function draftToRow(draft: ListingDraft, ownerId: string): Partial<SupabaseListingRow> {
  return {
    id: draft.id,
    owner_id: ownerId,
    city: getProfileCity(),
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
    },
    handoff: draft.handoff ?? {},
    qr_code: draft.qrToken ?? null,
    listing_status: draft.listingStatus ?? "draft",
  };
}

function rowToDraft(row: SupabaseListingRow): ListingDraft {
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
    instructionsUrl: "",
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
    qrReady: row.listing_status === "active",
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
  const listing = getPublishedListingById(input.listingId);
  if (listing) {
    updateStoredListing({
      ...listing,
      boostedUntil: input.boostedUntil,
      boostedTier: input.boostedTier,
    });
  }

  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase
    .from("listings")
    .update({
      boosted_until: input.boostedUntil,
      boosted_tier: input.boostedTier,
    })
    .eq("id", input.listingId)
    .eq("owner_id", input.ownerId);
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

export async function savePublishedListingRemote(draft: ListingDraft, ownerId: string): Promise<void> {
  savePublishedListing(draft);
  if (!isSupabaseConfigured()) {
    return;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const previous = getPublishedListingById(draft.id);
  const previousPaths = collectListingPhotoStoragePaths(previous?.photos ?? []);

  let photos = draft.photos;
  try {
    photos = await uploadListingPhotosToRemote({
      listingId: draft.id,
      ownerId,
      photos: draft.photos,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("uploadListingPhotosToRemote failed:", error);
    }
  }

  const nextPaths = collectListingPhotoStoragePaths(photos);
  const orphanPaths = previousPaths.filter((path) => !nextPaths.includes(path));
  if (orphanPaths.length > 0) {
    try {
      await deleteListingPhotosFromRemote(orphanPaths);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("deleteListingPhotosFromRemote failed:", error);
      }
    }
  }

  const syncedDraft = photos !== draft.photos ? { ...draft, photos } : draft;
  if (photos !== draft.photos) {
    savePublishedListing(syncedDraft);
  }

  const { error } = await supabase
    .from("listings")
    .upsert(draftToRow(syncedDraft, ownerId), { onConflict: "id" });
  if (error && import.meta.env.DEV) {
    console.warn("savePublishedListingRemote failed:", error.message);
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

  const { error: updateError } = await supabase
    .from("listings")
    .update({
      qr_verification_photo_path: path,
      qr_verified_at: new Date().toISOString(),
      listing_status: "active",
    })
    .eq("id", params.listingId)
    .eq("owner_id", params.ownerId);
  if (updateError) throw updateError;

  // Update local cache for instant UX.
  const listing = getPublishedListingById(params.listingId);
  if (listing) {
    updateStoredListing({
      ...listing,
      listingStatus: "active",
      qrReady: true,
      verificationPhoto: URL.createObjectURL(params.file),
    });
  }

  return { path };
}

export async function fetchListingByIdRemote(id: string): Promise<ListingDraft | null> {
  if (!isSupabaseConfigured()) {
    return getPublishedListingById(id);
  }
  const supabase = getSupabaseClient();
  if (!supabase) return getPublishedListingById(id);
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return getPublishedListingById(id);
  const draft = rowToDraft(data as SupabaseListingRow);
  savePublishedListing(draft);
  return draft;
}

export async function fetchListingsByOwnerIdsRemote(ownerIds: string[]): Promise<ListingDraft[]> {
  if (!isSupabaseConfigured()) {
    return loadPublishedListings().filter((l) => ownerIds.includes(l.hostId ?? ""));
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadPublishedListings().filter((l) => ownerIds.includes(l.hostId ?? ""));
  }
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("owner_id", ownerIds)
    .order("updated_at", { ascending: false });
  if (error || !data) {
    return loadPublishedListings().filter((l) => ownerIds.includes(l.hostId ?? ""));
  }
  const drafts = (data as SupabaseListingRow[]).map(rowToDraft);
  for (const draft of drafts) {
    savePublishedListing(draft);
  }
  return drafts;
}

export async function fetchActiveListingsForCityRemote(city: string): Promise<ListingDraft[]> {
  const cityNorm = city.trim();
  if (!isSupabaseConfigured()) {
    return loadPublishedListings().filter((l) => l.listingStatus === "active");
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadPublishedListings().filter((l) => l.listingStatus === "active");
  }
  const query = supabase
    .from("listings")
    .select("*")
    .eq("listing_status", "active")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });
  const { data, error } = cityNorm ? await query.ilike("city", `%${cityNorm}%`) : await query;
  if (error || !data) {
    return loadPublishedListings().filter((l) => l.listingStatus === "active");
  }
  return interleaveBoosted((data as SupabaseListingRow[]).map(rowToDraft));
}

export async function searchActiveListingsRemote(params: {
  query: string;
  city: string;
  category?: string;
}): Promise<ListingDraft[]> {
  const q = params.query.trim().toLowerCase();
  const cityNorm = params.city.trim();
  const category = params.category?.trim() || "";

  if (!isSupabaseConfigured()) {
    return loadPublishedListings()
      .filter((l) => l.listingStatus === "active")
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!q) return true;
        const hay = `${l.title} ${l.description} ${l.category} ${l.subcategory}`.toLowerCase();
        return hay.includes(q);
      });
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadPublishedListings()
      .filter((l) => l.listingStatus === "active")
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!q) return true;
        const hay = `${l.title} ${l.description} ${l.category} ${l.subcategory}`.toLowerCase();
        return hay.includes(q);
      });
  }

  let queryBuilder = supabase
    .from("listings")
    .select("*")
    .eq("listing_status", "active")
    .order("boosted_until", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (cityNorm) queryBuilder = queryBuilder.ilike("city", `%${cityNorm}%`);
  if (category) queryBuilder = queryBuilder.eq("category", category);
  if (q) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,subcategory.ilike.%${q}%`,
    );
  }

  const { data, error } = await queryBuilder.limit(50);
  if (error || !data) {
    return loadPublishedListings()
      .filter((l) => l.listingStatus === "active")
      .filter((l) => (category ? l.category === category : true))
      .filter((l) => {
        if (!q) return true;
        const hay = `${l.title} ${l.description} ${l.category} ${l.subcategory}`.toLowerCase();
        return hay.includes(q);
      });
  }
  return interleaveBoosted((data as SupabaseListingRow[]).map(rowToDraft));
}
