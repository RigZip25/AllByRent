/**
 * Host store Live tumbler — garage open/closed for neighbors.
 * Shelf listings (active) stay in host inventory; neighbors only see them when store is Live and item not paused.
 */

import { resolveGarageHostId, isGaragePrimaryOwner } from "./hostAccess";
import { loadPublishedListings } from "./listingStorage";
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
  const prev = Boolean(map[id]);
  map[id] = live;
  writeLocalMap(map);
  if (prev === live) return;
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

/** Matches Garage “On shelf” counter: active (or legacy pending_qr) and not item-paused. */
export function isCountableShelfItem(listing: {
  listingStatus?: string;
  paused?: boolean;
}): boolean {
  const status = listing.listingStatus ?? "";
  const onShelf = status === "active" || status === "pending_qr";
  return onShelf && !listing.paused;
}

/** True when the active garage still has ≥1 on-shelf listing. */
export function hostHasShelfItems(
  authUserId: string | null | undefined,
  authUserEmail: string | null | undefined,
): boolean {
  const garageId = resolveGarageHostId(authUserId ?? null, authUserEmail ?? null);
  if (!garageId) return false;
  return loadPublishedListings().some((listing) => {
    if (!isCountableShelfItem(listing)) return false;
    const host = listing.hostId?.trim() ?? "";
    if (host) return host === garageId;
    // Legacy unassigned rows count only on the owner's own garage.
    return garageId === (authUserId ?? "").trim();
  });
}

type FetchStoreLiveOptions = {
  /** When set, never resurrect Live for this host if their shelf is empty. */
  coerceEmptyShelfFor?: {
    userId: string | null | undefined;
    email: string | null | undefined;
  };
};

async function coerceOwnEmptyShelf(
  out: Record<string, boolean>,
  options?: FetchStoreLiveOptions,
): Promise<Record<string, boolean>> {
  const coerce = options?.coerceEmptyShelfFor;
  if (!coerce) return out;
  // Helpers must not auto-close someone else's Live from a partial local cache.
  if (!isGaragePrimaryOwner(coerce.userId ?? null)) return out;
  const selfHostId = resolveGarageHostId(coerce.userId ?? null, coerce.email ?? null);
  if (!selfHostId) return out;
  if (!out[selfHostId] && !getLocalStoreLive(selfHostId)) return out;
  if (hostHasShelfItems(coerce.userId, coerce.email)) return out;
  await pushStoreLiveRemote(selfHostId, false);
  out[selfHostId] = false;
  return out;
}

export async function fetchStoreLiveByHostIds(
  hostIds: string[],
  options?: FetchStoreLiveOptions,
): Promise<Record<string, boolean>> {
  const ids = [...new Set(hostIds.map((id) => id.trim()).filter(Boolean))];
  const local = readLocalMap();
  const out: Record<string, boolean> = {};
  for (const id of ids) {
    if (local[id] != null) out[id] = Boolean(local[id]);
  }

  const uuids = ids.filter(isUuid);
  if (uuids.length === 0 || !isSupabaseConfigured()) {
    return coerceOwnEmptyShelf(out, options);
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return coerceOwnEmptyShelf(out, options);
  }

  const { data, error } = await supabase
    .from("garage_storefronts")
    .select("host_id, store_live")
    .in("host_id", uuids);
  if (error || !data) {
    return coerceOwnEmptyShelf(out, options);
  }

  const coerce = options?.coerceEmptyShelfFor;
  const selfHostId = coerce
    ? resolveGarageHostId(coerce.userId ?? null, coerce.email ?? null)
    : "";

  for (const row of data) {
    const hostId = typeof row.host_id === "string" ? row.host_id : "";
    if (!hostId) continue;
    let live = Boolean(row.store_live);
    if (
      live &&
      selfHostId &&
      hostId === selfHostId &&
      coerce &&
      isGaragePrimaryOwner(coerce.userId ?? null, selfHostId) &&
      !hostHasShelfItems(coerce.userId, coerce.email)
    ) {
      // Remote still says Live after an empty shelf — force close so UI cannot reopen.
      await pushStoreLiveRemote(hostId, false);
      live = false;
    } else {
      setLocalStoreLive(hostId, live);
    }
    out[hostId] = live;
  }
  return coerceOwnEmptyShelf(out, options);
}

export async function pushStoreLiveRemote(
  hostId: string | null | undefined,
  storeLive: boolean,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const id = hostId?.trim() ?? "";
  if (!id) return { ok: false, reason: "Sign in to open your store." };
  // Always flip local first so UI cannot stay Live after an empty shelf.
  setLocalStoreLive(id, storeLive);

  if (!isUuid(id) || !isSupabaseConfigured()) {
    return { ok: true };
  }
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true };

  const stamp = new Date().toISOString();
  const { data: existing, error: readError } = await supabase
    .from("garage_storefronts")
    .select("host_id")
    .eq("host_id", id)
    .maybeSingle();

  if (readError) {
    return { ok: false, reason: readError.message || "Could not update store status." };
  }

  if (existing?.host_id) {
    const { error } = await supabase
      .from("garage_storefronts")
      .update({ store_live: storeLive, updated_at: stamp })
      .eq("host_id", id);
    if (error) {
      return { ok: false, reason: error.message || "Could not update store status." };
    }
    return { ok: true };
  }

  const { error } = await supabase.from("garage_storefronts").upsert({
    host_id: id,
    store_live: storeLive,
    shop_kind: "personal",
    accent_id: "forest",
    shop_name: "",
    updated_at: stamp,
  });
  if (error) {
    return { ok: false, reason: error.message || "Could not update store status." };
  }
  return { ok: true };
}

/**
 * If the shelf is empty, force store Live off (local + remote).
 * Call after deletes / when listings change so an empty garage cannot stay public.
 */
export async function closeStoreIfShelfEmpty(
  authUserId: string | null | undefined,
  authUserEmail: string | null | undefined,
): Promise<void> {
  if (!isGaragePrimaryOwner(authUserId ?? null)) return;
  const hostId = resolveGarageHostId(authUserId ?? null, authUserEmail ?? null);
  if (!hostId) return;
  if (hostHasShelfItems(authUserId, authUserEmail)) return;
  await pushStoreLiveRemote(hostId, false);
}

/** After a delete when we only know owner/host id. Only that host’s rows count (not orphan empty hostIds). */
export async function closeStoreIfShelfEmptyForHostId(
  hostId: string | null | undefined,
): Promise<void> {
  const id = hostId?.trim() ?? "";
  if (!id) return;
  const hasShelf = loadPublishedListings().some((listing) => {
    if (!isCountableShelfItem(listing)) return false;
    return (listing.hostId?.trim() ?? "") === id;
  });
  if (hasShelf) return;
  await pushStoreLiveRemote(id, false);
}

/**
 * After fetching remote store_live, never resurrect Live when the local shelf is empty.
 */
export function coerceStoreLiveForEmptyShelf(
  hostId: string,
  remoteLive: boolean,
  authUserId: string | null | undefined,
  authUserEmail: string | null | undefined,
): boolean {
  if (!remoteLive) return false;
  if (hostHasShelfItems(authUserId, authUserEmail)) return true;
  void pushStoreLiveRemote(hostId, false);
  return false;
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
