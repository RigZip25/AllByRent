import type { ShelfPrefill } from "./shelfListings";
import { withoutBlocked } from "./moderation/blockStorage";
import {
  canonicalShelf,
  categoryQueryNames,
} from "../screens/listing/listingItemCategories";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const REQUESTS_KEY = "allbyrent_requests_v1";

/** How long an ask stays on the shelf before it stops being shown. */
export const REQUEST_LIFETIME_DAYS = 30;

export type RequestStatus = "open" | "fulfilled" | "cancelled";
export type RequestIntent = "rent" | "buy" | "either";

export type WantedRequest = {
  id: string;
  renterId: string;
  category: string;
  subcategory: string;
  description: string;
  locationLabel: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  status: RequestStatus;
  fulfilledAt?: string;
  fulfilledListingId?: string;
  intent?: RequestIntent;
  budgetCents?: number;
  radiusMiles?: number;
  expiresAt?: string;
};

type SupabaseRequestRow = {
  id: string;
  renter_id: string;
  category: string;
  subcategory: string;
  description: string;
  location_label: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  status?: string | null;
  fulfilled_at?: string | null;
  fulfilled_listing_id?: string | null;
  intent?: string | null;
  budget_cents?: number | null;
  radius_miles?: number | null;
  expires_at?: string | null;
};

function normalizeStatus(raw: unknown): RequestStatus {
  return raw === "fulfilled" || raw === "cancelled" ? raw : "open";
}

function normalizeIntent(raw: unknown): RequestIntent | undefined {
  return raw === "rent" || raw === "buy" || raw === "either" ? raw : undefined;
}

function rowToRequest(row: SupabaseRequestRow): WantedRequest {
  return {
    id: row.id,
    renterId: row.renter_id,
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    locationLabel: row.location_label,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
    status: normalizeStatus(row.status),
    fulfilledAt: row.fulfilled_at ?? undefined,
    fulfilledListingId: row.fulfilled_listing_id ?? undefined,
    intent: normalizeIntent(row.intent),
    budgetCents:
      typeof row.budget_cents === "number" && Number.isFinite(row.budget_cents)
        ? row.budget_cents
        : undefined,
    radiusMiles:
      typeof row.radius_miles === "number" && Number.isFinite(row.radius_miles)
        ? row.radius_miles
        : undefined,
    expiresAt: row.expires_at ?? undefined,
  };
}

function normalizeRequest(raw: WantedRequest): WantedRequest {
  return {
    ...raw,
    status: normalizeStatus(raw.status),
    intent: normalizeIntent(raw.intent),
    expiresAt: raw.expiresAt ?? expiryFromCreatedAt(raw.createdAt),
  };
}

function expiryFromCreatedAt(createdAt: string): string | undefined {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return undefined;
  return new Date(created + REQUEST_LIFETIME_DAYS * 86_400_000).toISOString();
}

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}`;
}

/** An ask still worth showing: open, and not past its expiry. */
export function isRequestLive(request: WantedRequest, now = Date.now()): boolean {
  if (request.status !== "open") return false;
  const expires = request.expiresAt ? new Date(request.expiresAt).getTime() : Number.NaN;
  if (!Number.isFinite(expires)) return true;
  return expires > now;
}

export function isRequestExpired(request: WantedRequest, now = Date.now()): boolean {
  const expires = request.expiresAt ? new Date(request.expiresAt).getTime() : Number.NaN;
  return Number.isFinite(expires) && expires <= now;
}

/** True when the ask sits on this shelf, allowing for renamed categories. */
export function requestBelongsToShelf(
  request: WantedRequest,
  filter: { category: string; subcategory: string },
): boolean {
  const asked = canonicalShelf(request.category, request.subcategory);
  const wanted = canonicalShelf(filter.category, filter.subcategory);
  return asked.category === wanted.category && asked.subcategory === wanted.subcategory;
}

export function loadLocalRequests(): WantedRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WantedRequest[];
    return Array.isArray(parsed) ? parsed.map(normalizeRequest) : [];
  } catch {
    return [];
  }
}

function saveLocalRequests(next: WantedRequest[]): void {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(next.slice(0, 50)));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("evorios-requests-changed"));
    }
  } catch {
    /* ignore */
  }
}

export function addLocalRequest(req: WantedRequest): void {
  const list = loadLocalRequests();
  list.unshift(normalizeRequest(req));
  saveLocalRequests(list);
}

function patchLocalRequest(requestId: string, patch: Partial<WantedRequest>): void {
  const list = loadLocalRequests();
  const index = list.findIndex((item) => item.id === requestId);
  if (index < 0) return;
  list[index] = normalizeRequest({ ...list[index]!, ...patch });
  saveLocalRequests(list);
}

function removeLocalRequest(requestId: string): void {
  saveLocalRequests(loadLocalRequests().filter((item) => item.id !== requestId));
}

export type CreateRequestResult =
  | { ok: true; request: WantedRequest; savedRemotely: boolean }
  | { ok: false; reason: string; request: WantedRequest };

function requestToRow(request: WantedRequest): SupabaseRequestRow {
  return {
    id: request.id,
    renter_id: request.renterId,
    category: request.category,
    subcategory: request.subcategory,
    description: request.description,
    location_label: request.locationLabel,
    start_date: request.startDate ?? null,
    end_date: request.endDate ?? null,
    created_at: request.createdAt,
    status: request.status,
    intent: request.intent ?? null,
    budget_cents: request.budgetCents ?? null,
    radius_miles: request.radiusMiles ?? null,
    expires_at: request.expiresAt ?? null,
  };
}

/** Insert, retrying without the 050 columns for deployments still on 049. */
async function insertRequestRow(request: WantedRequest): Promise<{ ok: boolean; reason?: string }> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase) return { ok: false, reason: "offline" };

  const row = requestToRow(request);
  let { error } = await supabase.from("requests").insert(row);

  if (error) {
    const legacy = {
      id: row.id,
      renter_id: row.renter_id,
      category: row.category,
      subcategory: row.subcategory,
      description: row.description,
      location_label: row.location_label,
      start_date: row.start_date,
      end_date: row.end_date,
    };
    const retry = await supabase.from("requests").insert(legacy);
    error = retry.error;
  }

  return error ? { ok: false, reason: error.message } : { ok: true };
}

/** Second attempt for an ask that only made it to this device. */
export async function publishPendingRequest(
  request: WantedRequest,
): Promise<{ ok: boolean; reason?: string }> {
  return insertRequestRow(request);
}

export async function createRequestRemote(params: {
  renterId: string;
  category: string;
  subcategory: string;
  description: string;
  locationLabel: string;
  startDate?: string;
  endDate?: string;
  intent?: RequestIntent;
  budgetCents?: number;
  radiusMiles?: number;
}): Promise<CreateRequestResult> {
  const createdAt = new Date().toISOString();
  const request: WantedRequest = {
    id: safeUuid(),
    renterId: params.renterId,
    category: params.category,
    subcategory: params.subcategory,
    description: params.description,
    locationLabel: params.locationLabel,
    startDate: params.startDate,
    endDate: params.endDate,
    createdAt,
    status: "open",
    intent: params.intent,
    budgetCents: params.budgetCents,
    radiusMiles: params.radiusMiles,
    expiresAt: expiryFromCreatedAt(createdAt),
  };

  if (!isSupabaseConfigured()) {
    addLocalRequest(request);
    return { ok: true, request, savedRemotely: false };
  }

  const result = await insertRequestRow(request);
  addLocalRequest(request);
  if (!result.ok) {
    // Keep the ask on the device so the renter can retry, but say so: the old
    // behavior silently pretended it had been published to the neighborhood.
    return { ok: false, reason: result.reason ?? "insert failed", request };
  }
  return { ok: true, request, savedRemotely: true };
}

async function updateRequestRemote(
  requestId: string,
  patch: Record<string, unknown>,
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("requests").update(patch).eq("id", requestId);
  return error ? { ok: false, reason: error.message } : { ok: true };
}

/** Renter got what they asked for — optionally crediting the listing that did it. */
export async function markRequestFulfilled(
  requestId: string,
  listingId?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const fulfilledAt = new Date().toISOString();
  patchLocalRequest(requestId, {
    status: "fulfilled",
    fulfilledAt,
    fulfilledListingId: listingId,
  });
  return updateRequestRemote(requestId, {
    status: "fulfilled",
    fulfilled_at: fulfilledAt,
    fulfilled_listing_id: listingId ?? null,
  });
}

export async function reopenRequest(requestId: string): Promise<{ ok: boolean; reason?: string }> {
  patchLocalRequest(requestId, {
    status: "open",
    fulfilledAt: undefined,
    fulfilledListingId: undefined,
  });
  return updateRequestRemote(requestId, { status: "open" });
}

export async function cancelRequest(requestId: string): Promise<{ ok: boolean; reason?: string }> {
  patchLocalRequest(requestId, { status: "cancelled" });
  return updateRequestRemote(requestId, { status: "cancelled" });
}

export async function editRequestDescription(
  requestId: string,
  description: string,
): Promise<{ ok: boolean; reason?: string }> {
  const next = description.trim();
  patchLocalRequest(requestId, { description: next });
  return updateRequestRemote(requestId, { description: next });
}

export async function deleteRequest(requestId: string): Promise<{ ok: boolean; reason?: string }> {
  removeLocalRequest(requestId);
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase) return { ok: true };
  const { error } = await supabase.from("requests").delete().eq("id", requestId);
  return error ? { ok: false, reason: error.message } : { ok: true };
}

export async function fetchRequestsForShelfRemote(filter: {
  category: string;
  subcategory: string;
  locationLabel: string;
}): Promise<WantedRequest[]> {
  const rows = await loadShelfRequests(filter);
  const live = rows.filter((request) => isRequestLive(request));
  return withoutBlocked(live, (r) => r.renterId);
}

function localShelfRequests(filter: {
  category: string;
  subcategory: string;
  locationLabel: string;
}): WantedRequest[] {
  return loadLocalRequests().filter(
    (r) => requestBelongsToShelf(r, filter) && r.locationLabel === filter.locationLabel,
  );
}

async function loadShelfRequests(filter: {
  category: string;
  subcategory: string;
  locationLabel: string;
}): Promise<WantedRequest[]> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase) return localShelfRequests(filter);

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    // Asks posted before a category was renamed still belong on this shelf.
    .in("category", categoryQueryNames(filter.category))
    .eq("subcategory", filter.subcategory)
    .ilike("location_label", `%${filter.locationLabel}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return localShelfRequests(filter);

  // Renamed shelves keep their old subcategory in the row, so match after
  // canonicalizing rather than trusting the equality filter alone.
  return (data as SupabaseRequestRow[])
    .map(rowToRequest)
    .filter((request) => requestBelongsToShelf(request, filter));
}

/** Asks this person posted, newest first — for the garage. */
export async function fetchMyRequests(renterId: string): Promise<WantedRequest[]> {
  const id = renterId.trim();
  if (!id) return [];

  const local = loadLocalRequests().filter((r) => r.renterId === id);
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase) return local;

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("renter_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return local;

  const remote = (data as SupabaseRequestRow[]).map(rowToRequest);
  const byId = new Map<string, WantedRequest>();
  for (const request of local) byId.set(request.id, request);
  for (const request of remote) byId.set(request.id, request);
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function fetchRequestByIdRemote(requestId: string): Promise<WantedRequest | null> {
  const id = requestId.trim();
  if (!id) return null;

  const local = loadLocalRequests().find((r) => r.id === id) ?? null;

  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase) return local;

  const { data, error } = await supabase.from("requests").select("*").eq("id", id).maybeSingle();
  if (error || !data) return local;
  return rowToRequest(data as SupabaseRequestRow);
}

export function requestTitleFromPrefill(prefill?: ShelfPrefill | null): string {
  if (!prefill) return "Wanted";
  const parts = [prefill.subcategory?.trim(), prefill.category?.trim()].filter(Boolean);
  return parts.length ? `Wanted: ${parts.join(" · ")}` : "Wanted";
}
