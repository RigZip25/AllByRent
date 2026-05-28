import type { ShelfPrefill } from "./shelfListings";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const REQUESTS_KEY = "allbyrent_requests_v1";

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
};

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
  };
}

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}`;
}

export function loadLocalRequests(): WantedRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WantedRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalRequests(next: WantedRequest[]): void {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(next.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function addLocalRequest(req: WantedRequest): void {
  const list = loadLocalRequests();
  list.unshift(req);
  saveLocalRequests(list);
}

export async function createRequestRemote(params: {
  renterId: string;
  category: string;
  subcategory: string;
  description: string;
  locationLabel: string;
  startDate?: string;
  endDate?: string;
}): Promise<WantedRequest> {
  const request: WantedRequest = {
    id: safeUuid(),
    renterId: params.renterId,
    category: params.category,
    subcategory: params.subcategory,
    description: params.description,
    locationLabel: params.locationLabel,
    startDate: params.startDate,
    endDate: params.endDate,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    addLocalRequest(request);
    return request;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    addLocalRequest(request);
    return request;
  }

  const row: Omit<SupabaseRequestRow, "created_at"> = {
    id: request.id,
    renter_id: request.renterId,
    category: request.category,
    subcategory: request.subcategory,
    description: request.description,
    location_label: request.locationLabel,
    start_date: request.startDate ?? null,
    end_date: request.endDate ?? null,
  };

  const { error } = await supabase.from("requests").insert(row);
  if (error) {
    addLocalRequest(request);
  }
  return request;
}

export async function fetchRequestsForShelfRemote(filter: {
  category: string;
  subcategory: string;
  locationLabel: string;
}): Promise<WantedRequest[]> {
  if (!isSupabaseConfigured()) {
    return loadLocalRequests().filter(
      (r) =>
        r.category === filter.category &&
        r.subcategory === filter.subcategory &&
        r.locationLabel === filter.locationLabel,
    );
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadLocalRequests().filter(
      (r) =>
        r.category === filter.category &&
        r.subcategory === filter.subcategory &&
        r.locationLabel === filter.locationLabel,
    );
  }
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("category", filter.category)
    .eq("subcategory", filter.subcategory)
    .ilike("location_label", `%${filter.locationLabel}%`)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error || !data) {
    return loadLocalRequests().filter(
      (r) =>
        r.category === filter.category &&
        r.subcategory === filter.subcategory &&
        r.locationLabel === filter.locationLabel,
    );
  }
  return (data as SupabaseRequestRow[]).map(rowToRequest);
}

export function requestTitleFromPrefill(prefill?: ShelfPrefill | null): string {
  if (!prefill) return "Wanted";
  const parts = [prefill.subcategory?.trim(), prefill.category?.trim()].filter(Boolean);
  return parts.length ? `Wanted: ${parts.join(" · ")}` : "Wanted";
}

