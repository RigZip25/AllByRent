import type { ListingDraft } from "../screens/listing/types";
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
    typeof raw.hostId === "string" && raw.hostId.trim() ? raw.hostId.trim() : "demo-user";

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
  const normalizedHostId = hostId.trim() || "demo-user";
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
          : "demo-user";
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

export function updatePublishedListing(listingId: string, patch: PublishedListingPatch): void {
  try {
    const existing = loadPublishedListings();
    const index = existing.findIndex((item) => item.id === listingId);
    if (index < 0) return;
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
  } catch {
    /* ignore */
  }
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
  if (!isSupabaseConfigured()) {
    savePublishedListing(draft);
    return;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    savePublishedListing(draft);
    return;
  }
  const { error } = await supabase
    .from("listings")
    .upsert(draftToRow(draft, ownerId), { onConflict: "id" });
  if (error) {
    // Fallback keeps UX working when network/Supabase is down.
    savePublishedListing(draft);
  }
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
  return rowToDraft(data as SupabaseListingRow);
}

export async function fetchListingsByOwnerIdsRemote(ownerIds: string[]): Promise<ListingDraft[]> {
  if (!isSupabaseConfigured()) {
    return loadPublishedListings().filter((l) => ownerIds.includes(l.hostId ?? "demo-user"));
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadPublishedListings().filter((l) => ownerIds.includes(l.hostId ?? "demo-user"));
  }
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("owner_id", ownerIds)
    .order("updated_at", { ascending: false });
  if (error || !data) {
    return loadPublishedListings().filter((l) => ownerIds.includes(l.hostId ?? "demo-user"));
  }
  return (data as SupabaseListingRow[]).map(rowToDraft);
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
    .order("updated_at", { ascending: false });
  const { data, error } = cityNorm ? await query.ilike("city", `%${cityNorm}%`) : await query;
  if (error || !data) {
    return loadPublishedListings().filter((l) => l.listingStatus === "active");
  }
  return (data as SupabaseListingRow[]).map(rowToDraft);
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
  return (data as SupabaseListingRow[]).map(rowToDraft);
}
