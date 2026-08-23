/**
 * Host store Live tumbler — garage open/closed for neighbors.
 * Shelf listings (active) stay in host inventory; neighbors only see them when store is Live and item not paused.
 */

import { loadManageableListings } from "./hostAccess";
import { resolveHostAccountId } from "./hostIdentity";
import { isListingOnShelf, loadPublishedListings } from "./listingStorage";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const STORE_LIVE_KEY = "allbyrent_store_live_by_host";
const STORE_LIVE_EVENT = "allbyrent:store-live";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function readLocalMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORE_LIVE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (k.trim()) out[k.trim()] = Boolean(v);
    }
    return out;
  } catch {
    return {};
  }
}

function writeLocalMap(map: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_LIVE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function getLocalStoreLive(hostId: string | null | undefined): boolean {
  const id = hostId?.trim() ?? "";
  if (!id) return false;
  return Boolean(readLocalMap()[id]);
}

export function setLocalStoreLive(hostId: string, live: boolean): void {
  const id = hostId.trim();
  if (!id) return;
  const map = readLocalMap();
  if (map[id] === live) return;
  map[id] = live;
  writeLocalMap(map);
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(STORE_LIVE_EVENT, { detail: { hostId: id, storeLive: live } }),
      );
    } catch {
      /* ignore */
    }
  }
}

export function onStoreLiveChanged(
  listener: (hostId: string, storeLive: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ hostId: string; storeLive: boolean }>).detail;
    if (detail?.hostId) listener(detail.hostId, Boolean(detail.storeLive));
  };
  window.addEventListener(STORE_LIVE_EVENT, handler);
  return () => window.removeEventListener(STORE_LIVE_EVENT, handler);
}

export async function fetchStoreLiveByHostIds(
  hostIds: string[],
): Promise<Record<string, boolean>> {
  const ids = [...new Set(hostIds.map((id) => id.trim()).filter(Boolean))];
  const local = readLocalMap();
  const out: Record<string, boolean> = {};
  for (const id of ids) {
    if (local[id] != null) out[id] = Boolean(local[id]);
  }

  const uuids = ids.filter(isUuid);
  if (uuids.length === 0 || !isSupabaseConfigured()) return out;
  const supabase = getSupabaseClient();
  if (!supabase) return out;

  const { data, error } = await supabase
    .from("garage_storefronts")
    .select("host_id, store_live")
    .in("host_id", uuids);
  if (error || !data) return out;

  for (const row of data) {
    const hostId = typeof row.host_id === "string" ? row.host_id : "";
    if (!hostId) continue;
    const live = Boolean(row.store_live);
    out[hostId] = live;
    // Keep local cache in sync for signed-in host browsing own feed.
    const map = readLocalMap();
    map[hostId] = live;
    writeLocalMap(map);
  }
  return out;
}

export async function pushStoreLiveRemote(
  hostId: string | null | undefined,
  storeLive: boolean,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const id = hostId?.trim() ?? "";
  if (!id) return { ok: false, reason: "Sign in to open your store." };
  setLocalStoreLive(id, storeLive);

  if (!isUuid(id) || !isSupabaseConfigured()) {
    return { ok: true };
  }
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from("garage_storefronts").upsert({
    host_id: id,
    store_live: storeLive,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return { ok: false, reason: error.message || "Could not update store status." };
  }
  return { ok: true };
}

/** True when this signed-in host still has ≥1 on-shelf listing (same rules as Garage “On shelf”). */
export function hostHasShelfItems(
  authUserId: string | null | undefined,
  authUserEmail: string | null | undefined,
): boolean {
  return loadManageableListings(authUserId ?? null, authUserEmail ?? null).some(
    (listing) => isListingOnShelf(listing),
  );
}

/**
 * If the shelf is empty, force store Live off (local + remote).
 * Call after deletes / when listings change so an empty garage cannot stay public.
 */
export async function closeStoreIfShelfEmpty(
  authUserId: string | null | undefined,
  authUserEmail: string | null | undefined,
): Promise<void> {
  const hostId = resolveHostAccountId(authUserId ?? null);
  if (!hostId) return;
  if (hostHasShelfItems(authUserId, authUserEmail)) return;
  await pushStoreLiveRemote(hostId, false);
}

/** After a delete when we only know owner/host id (no email). Empty hostId rows count for this host. */
export async function closeStoreIfShelfEmptyForHostId(
  hostId: string | null | undefined,
): Promise<void> {
  const id = hostId?.trim() ?? "";
  if (!id) return;
  const hasShelf = loadPublishedListings().some((listing) => {
    if (!isListingOnShelf(listing)) return false;
    const listingHost = listing.hostId?.trim() ?? "";
    return listingHost === id || listingHost === "";
  });
  if (hasShelf) return;
  await pushStoreLiveRemote(id, false);
}

/** Neighbor-facing: shelf item + store Live + not paused. */
export function isStoreOpenForHost(
  hostId: string | null | undefined,
  storeLiveByHost?: Record<string, boolean>,
): boolean {
  const id = hostId?.trim() ?? "";
  if (!id) return false;
  if (storeLiveByHost && Object.prototype.hasOwnProperty.call(storeLiveByHost, id)) {
    return Boolean(storeLiveByHost[id]);
  }
  return getLocalStoreLive(id);
}
