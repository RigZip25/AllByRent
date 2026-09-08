import { sanitizeImageBlob } from "./imageSanitize";

export type MediaKind = "image" | "video";

export type MediaRef = {
  id: string;
  kind: MediaKind;
  mimeType: string;
  createdAt: number;
  sizeBytes: number;
  /** Optional thumbnail media id (stored as a separate blob). */
  thumbId?: string;
  /** Supabase Storage path after cloud sync. */
  storagePath?: string;
  /** Optional thumbnail path in Supabase Storage. */
  thumbStoragePath?: string;
  /**
   * Which bucket `storagePath` lives in. Absent means the public listing
   * gallery; documents sit in a private bucket and need a signed link, so a
   * public URL built for them would only ever be a broken image.
   */
  storageBucket?: "listing-photos" | "listing-verification";
};

/**
 * Prefer ArrayBuffer (`bytes`) over Blob — iOS Safari often fails structured-clone
 * of camera `File` / some Blobs ("Could not save media to device storage").
 * Legacy records may still have `blob`.
 */
type MediaRecord = {
  id: string;
  bytes?: ArrayBuffer;
  blob?: Blob;
  kind: MediaKind;
  mimeType: string;
  createdAt: number;
  sizeBytes: number;
  lastAccessedAt: number;
  thumbForId?: string;
};

type MediaStoreLimits = {
  maxBytes: number;
  maxItems: number;
};

export const DB_NAME = "allbyrent_media";
const DB_VERSION = 1;
const STORE = "media";

const DEFAULT_LIMITS: MediaStoreLimits = {
  // iOS PWA quotas vary; keep conservative but still useful.
  maxBytes: 180 * 1024 * 1024,
  maxItems: 600,
};

function now() {
  return Date.now();
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}:${crypto.randomUUID()}`;
  }
  return `${prefix}:${now().toString(36)}:${Math.random().toString(36).slice(2)}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("lastAccessedAt", "lastAccessedAt");
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onblocked = () => reject(new Error("IndexedDB open blocked (close other tabs)."));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = await fn(store);
    await txDone(tx);
    return result;
  } finally {
    db.close();
  }
}

function req<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

async function listAllRecords(): Promise<MediaRecord[]> {
  return withStore("readonly", async (store) => {
    const all = await req(store.getAll());
    return (all as MediaRecord[]) ?? [];
  });
}

function totalBytes(records: MediaRecord[]): number {
  return records.reduce((sum, r) => sum + (Number.isFinite(r.sizeBytes) ? r.sizeBytes : 0), 0);
}

/**
 * Media that is being published right now.
 *
 * Eviction is least-recently-used across the whole store, and the first photo
 * of a twelve-photo listing is exactly the least recently used one by the time
 * the last is added — so the sweep that makes room for photo twelve could take
 * photo one with it, and the host would publish a gallery with a hole. Anything
 * held here is off limits until the work that holds it is done; if that means
 * no room can be freed, the write fails loudly instead.
 */
const pinnedIds = new Set<string>();

export function pinMedia(ids: Iterable<string | undefined>): void {
  for (const id of ids) {
    if (id) pinnedIds.add(id);
  }
}

export function unpinMedia(ids: Iterable<string | undefined>): void {
  for (const id of ids) {
    if (id) pinnedIds.delete(id);
  }
}

/** Keep these blobs through whatever `run` does — an upload, a publish. */
export async function withPinnedMedia<T>(
  ids: Iterable<string | undefined>,
  run: () => Promise<T>,
): Promise<T> {
  const held = [...ids].filter((id): id is string => Boolean(id));
  pinMedia(held);
  try {
    return await run();
  } finally {
    unpinMedia(held);
  }
}

function isPinned(record: MediaRecord): boolean {
  if (pinnedIds.has(record.id)) return true;
  // A pinned photo keeps its thumbnail: the grid would otherwise fall back to
  // decoding the full-size blob for every tile.
  return Boolean(record.thumbForId && pinnedIds.has(record.thumbForId));
}

function pickEvictionCandidates(records: MediaRecord[]): MediaRecord[] {
  // Evict thumbnails first, then least-recently-used.
  const evictable = records.filter((r) => !isPinned(r));
  const thumbs = evictable.filter((r) => r.thumbForId);
  const nonThumbs = evictable.filter((r) => !r.thumbForId);
  thumbs.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
  nonThumbs.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
  return [...thumbs, ...nonThumbs];
}

async function enforceLimits(limits: MediaStoreLimits): Promise<{ evicted: number; bytesFreed: number }> {
  const records = await listAllRecords();
  const currentBytes = totalBytes(records);
  const overBytes = currentBytes - limits.maxBytes;
  const overItems = records.length - limits.maxItems;
  if (overBytes <= 0 && overItems <= 0) {
    return { evicted: 0, bytesFreed: 0 };
  }

  const candidates = pickEvictionCandidates(records);
  let bytesFreed = 0;
  let evicted = 0;

  const minCount = Math.max(0, limits.maxItems);

  const idsToDelete: string[] = [];
  let remainingBytes = currentBytes;
  let remainingCount = records.length;

  for (const record of candidates) {
    if (remainingBytes <= limits.maxBytes && remainingCount <= minCount) break;
    idsToDelete.push(record.id);
    remainingBytes -= record.sizeBytes;
    remainingCount -= 1;
    bytesFreed += record.sizeBytes;
    evicted += 1;

    // If we evict a primary media item, also evict its thumbnail if present.
    if (!record.thumbForId && record.id && record.kind === "image") {
      const thumb = records.find((r) => r.thumbForId === record.id);
      if (thumb && !idsToDelete.includes(thumb.id)) {
        idsToDelete.push(thumb.id);
        remainingBytes -= thumb.sizeBytes;
        remainingCount -= 1;
        bytesFreed += thumb.sizeBytes;
        evicted += 1;
      }
    }
  }

  if (idsToDelete.length === 0) return { evicted: 0, bytesFreed: 0 };

  await withStore("readwrite", async (store) => {
    await Promise.all(idsToDelete.map((id) => req(store.delete(id)).then(() => undefined)));
    return undefined;
  });

  return { evicted, bytesFreed };
}

export type MediaPutResult =
  | { ok: true; ref: MediaRef; warning?: string }
  | { ok: false; message: string };

/** Copy camera File/Blob into a plain ArrayBuffer for reliable IndexedDB writes on iOS. */
async function materializeBytes(blob: Blob): Promise<{ bytes: ArrayBuffer; mimeType: string; sizeBytes: number }> {
  if (!blob || typeof blob.arrayBuffer !== "function") {
    throw new Error("Invalid photo data.");
  }
  if (!Number.isFinite(blob.size) || blob.size <= 0) {
    throw new Error("Photo is empty. Try again or pick from the library.");
  }
  const bytes = await blob.arrayBuffer();
  if (!bytes.byteLength) {
    throw new Error("Photo is empty. Try again or pick from the library.");
  }
  const mimeType = (blob.type || "").trim() || "image/jpeg";
  return { bytes, mimeType, sizeBytes: bytes.byteLength };
}

function formatPutError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "QuotaExceededError") {
      return "Storage is full. Remove some media and try again.";
    }
    if (error.name === "DataCloneError") {
      return "This device can’t store that photo format. Try JPEG from the library.";
    }
    if (error.name === "UnknownError" || error.name === "InvalidStateError") {
      return "Device storage blocked this photo. Try again, or clear site data for Evorios.";
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Could not save media to device storage.";
}

function recordToBlob(record: MediaRecord): Blob | null {
  if (record.bytes && record.bytes.byteLength > 0) {
    return new Blob([record.bytes], { type: record.mimeType || "image/jpeg" });
  }
  if (record.blob && record.blob.size > 0) {
    return record.blob;
  }
  return null;
}

export async function putMediaBlob(
  blob: Blob,
  opts: { kind: MediaKind; id?: string; thumbForId?: string; limits?: Partial<MediaStoreLimits> },
): Promise<MediaPutResult> {
  const limits: MediaStoreLimits = { ...DEFAULT_LIMITS, ...(opts.limits ?? {}) };
  const id = opts.id ?? createId("media");
  const createdAt = now();

  let materialized: { bytes: ArrayBuffer; mimeType: string; sizeBytes: number };
  try {
    materialized = await materializeBytes(blob);
  } catch (error) {
    return { ok: false, message: formatPutError(error) };
  }

  // Pre-evict to make room (best-effort — iOS quota may still fail).
  try {
    await enforceLimits(limits);
  } catch {
    /* ignore eviction failures */
  }

  try {
    const record: MediaRecord = {
      id,
      bytes: materialized.bytes,
      kind: opts.kind,
      mimeType: materialized.mimeType || (opts.kind === "video" ? "video/mp4" : "image/jpeg"),
      createdAt,
      sizeBytes: materialized.sizeBytes,
      lastAccessedAt: createdAt,
      thumbForId: opts.thumbForId,
    };

    await withStore("readwrite", async (store) => {
      await req(store.put(record as unknown as never));
      return undefined;
    });

    let warning: string | undefined;
    try {
      const eviction = await enforceLimits(limits);
      if (eviction.evicted > 0) {
        warning = "Storage was near capacity; older media was evicted.";
      }
    } catch {
      /* ignore */
    }

    return {
      ok: true,
      warning,
      ref: {
        id,
        kind: opts.kind,
        mimeType: record.mimeType,
        createdAt,
        sizeBytes: materialized.sizeBytes,
      },
    };
  } catch (error) {
    return { ok: false, message: formatPutError(error) };
  }
}

/**
 * Store a photo a person just supplied, without its metadata.
 *
 * Best-effort on purpose: condition and hand-off photos are evidence in a
 * running rental, so a device that cannot re-encode should still be able to
 * attach one rather than lose the record.
 */
export async function putUserPhoto(
  blob: Blob,
  opts: { kind: MediaKind; id?: string; thumbForId?: string; limits?: Partial<MediaStoreLimits> },
): Promise<MediaPutResult> {
  const sanitized = await sanitizeImageBlob(blob);
  if (!sanitized.stripped) {
    console.warn("[media] storing a photo without stripping its metadata");
  }
  return putMediaBlob(sanitized.blob, opts);
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  if (!id) return null;
  const record = await withStore("readonly", async (store) => {
    const found = (await req(store.get(id))) as MediaRecord | undefined;
    return found ?? null;
  });
  if (!record) return null;

  const out = recordToBlob(record);
  if (!out) return null;

  // Touch LRU (best-effort).
  void withStore("readwrite", async (store) => {
    const next: MediaRecord = { ...record, lastAccessedAt: now() };
    await req(store.put(next as unknown as never));
    return undefined;
  }).catch(() => undefined);

  return out;
}

export async function deleteMedia(id: string): Promise<void> {
  if (!id) return;
  await withStore("readwrite", async (store) => {
    await req(store.delete(id));
    return undefined;
  });
}

export async function getThumbIdFor(id: string): Promise<string | null> {
  const records = await listAllRecords();
  const thumb = records.find((r) => r.thumbForId === id);
  return thumb?.id ?? null;
}

/** Ids currently held, optionally narrowed to one id prefix. */
export async function listMediaIds(prefix?: string): Promise<string[]> {
  const records = await withStore("readonly", listAllRecords);
  const ids = records.map((record) => record.id);
  return prefix ? ids.filter((id) => id.startsWith(prefix)) : ids;
}

export async function deleteMediaMany(ids: string[]): Promise<number> {
  let removed = 0;
  for (const id of ids) {
    try {
      await deleteMedia(id);
      removed += 1;
    } catch {
      /* keep going: one stuck record must not stop the sweep */
    }
  }
  return removed;
}

export async function getMediaStats(): Promise<{
  ok: true;
  items: number;
  totalBytes: number;
  limits: MediaStoreLimits;
}> {
  const limits = DEFAULT_LIMITS;
  const records = await listAllRecords();
  return {
    ok: true,
    items: records.length,
    totalBytes: totalBytes(records),
    limits,
  };
}
