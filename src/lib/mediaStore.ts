export type MediaKind = "image" | "video";

export type MediaRef = {
  id: string;
  kind: MediaKind;
  mimeType: string;
  createdAt: number;
  sizeBytes: number;
  /** Optional thumbnail media id (stored as a separate blob). */
  thumbId?: string;
};

type MediaRecord = {
  id: string;
  blob: Blob;
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

const DB_NAME = "allbyrent_media";
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
  const tx = db.transaction(STORE, mode);
  const store = tx.objectStore(STORE);
  const result = await fn(store);
  await txDone(tx);
  db.close();
  return result;
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

function pickEvictionCandidates(records: MediaRecord[]): MediaRecord[] {
  // Evict thumbnails first, then least-recently-used.
  const thumbs = records.filter((r) => r.thumbForId);
  const nonThumbs = records.filter((r) => !r.thumbForId);
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

  // Evict until within BOTH constraints.
  const targetBytes = Math.max(0, currentBytes - Math.max(0, overBytes));
  const minCount = Math.max(0, limits.maxItems);

  const byId = new Map(records.map((r) => [r.id, r]));
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

  // Silence unused var warning in some TS configs (even though Map is useful while debugging).
  void byId;
  return { evicted, bytesFreed };
}

export type MediaPutResult =
  | { ok: true; ref: MediaRef; warning?: string }
  | { ok: false; message: string };

export async function putMediaBlob(
  blob: Blob,
  opts: { kind: MediaKind; id?: string; thumbForId?: string; limits?: Partial<MediaStoreLimits> },
): Promise<MediaPutResult> {
  const limits: MediaStoreLimits = { ...DEFAULT_LIMITS, ...(opts.limits ?? {}) };
  const id = opts.id ?? createId("media");
  const sizeBytes = blob.size ?? 0;
  const createdAt = now();

  // Pre-evict to make room, but do not guarantee success on iOS (quota may still fail).
  await enforceLimits(limits);

  try {
    const record: MediaRecord = {
      id,
      blob,
      kind: opts.kind,
      mimeType: blob.type || (opts.kind === "video" ? "video/mp4" : "image/jpeg"),
      createdAt,
      sizeBytes,
      lastAccessedAt: createdAt,
      thumbForId: opts.thumbForId,
    };

    await withStore("readwrite", async (store) => {
      await req(store.put(record as unknown as never));
      return undefined;
    });

    // Post-evict in case totals now exceed limits.
    const eviction = await enforceLimits(limits);
    const warning =
      eviction.evicted > 0
        ? "Storage was near capacity; older media was evicted."
        : undefined;

    return {
      ok: true,
      warning,
      ref: {
        id,
        kind: opts.kind,
        mimeType: record.mimeType,
        createdAt,
        sizeBytes,
      },
    };
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "Storage is full. Remove some media and try again."
        : "Could not save media to device storage.";
    return { ok: false, message };
  }
}

export async function getMediaBlob(id: string): Promise<Blob | null> {
  if (!id) return null;
  const record = await withStore("readonly", async (store) => {
    const found = (await req(store.get(id))) as MediaRecord | undefined;
    return found ?? null;
  });
  if (!record) return null;

  // Touch LRU.
  void withStore("readwrite", async (store) => {
    const next: MediaRecord = { ...record, lastAccessedAt: now() };
    await req(store.put(next as unknown as never));
    return undefined;
  }).catch(() => undefined);

  return record.blob ?? null;
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

