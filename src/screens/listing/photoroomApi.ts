import { getMediaBlob, putMediaBlob } from "../../lib/mediaStore";

type PhotoRoomEditOptions = {
  backgroundColor?: string;
  outputSize?: string;
  padding?: string;
};

type PhotoRoomCacheEntryV1 = {
  v: 1;
  at: number;
  expiresAt: number;
  mediaId: string;
  mimeType: string;
  sizeBytes: number;
};

const API_URL = "/api/photoroom";
const CACHE_PREFIX = "allbyrent:photoroom:edit:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const RATE_LIMIT_PREFIX = "allbyrent:photoroom:rate:";
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;

const DEFAULT_OPTIONS: Required<PhotoRoomEditOptions> = {
  backgroundColor: "ffffff",
  outputSize: "1200x1200",
  padding: "0.1",
};

function stableOptions(opts?: PhotoRoomEditOptions): Required<PhotoRoomEditOptions> {
  return {
    backgroundColor: opts?.backgroundColor ?? DEFAULT_OPTIONS.backgroundColor,
    outputSize: opts?.outputSize ?? DEFAULT_OPTIONS.outputSize,
    padding: opts?.padding ?? DEFAULT_OPTIONS.padding,
  };
}

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function blobHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return sha256Hex(buffer);
}

async function stringHash(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  return sha256Hex(bytes.buffer);
}

function cacheKey(imageHash: string, optsHash: string): string {
  return `${imageHash}:${optsHash}`;
}

function readCache(key: string): PhotoRoomCacheEntryV1 | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PhotoRoomCacheEntryV1;
    if (!parsed || parsed.v !== 1 || !parsed.mediaId || !parsed.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key: string, entry: PhotoRoomCacheEntryV1) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Best-effort only (quota/serialization may fail).
  }
}

function enforceRateLimit(rateKey: string) {
  const now = Date.now();
  const bucketKey = `${RATE_LIMIT_PREFIX}${rateKey}`;
  const arr = (() => {
    try {
      const raw = localStorage.getItem(bucketKey);
      const parsed = raw ? (JSON.parse(raw) as number[]) : [];
      return parsed.filter((ts) => typeof ts === "number" && now - ts < RATE_LIMIT_WINDOW_MS);
    } catch {
      return [];
    }
  })();

  if (arr.length >= RATE_LIMIT_MAX) {
    throw new Error("Photo enhancement rate limit exceeded. Try again in a minute.");
  }

  arr.push(now);
  try {
    localStorage.setItem(bucketKey, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(60_000, Math.round(seconds * 1000));
  const dateMs = Date.parse(value);
  if (Number.isFinite(dateMs)) {
    const diff = dateMs - Date.now();
    if (diff > 0) return Math.min(60_000, Math.round(diff));
  }
  return null;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(makeRequest: () => Promise<Response>, attempts = 4): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await makeRequest();
      if (response.ok) return response;

      const retryable = isRetryableStatus(response.status);
      if (!retryable || attempt === attempts) return response;

      const retryAfter = parseRetryAfterMs(response.headers.get("retry-after"));
      const base = Math.min(8000, 600 * 2 ** (attempt - 1));
      const jitter = Math.round(Math.random() * 250);
      await sleep(retryAfter ?? base + jitter);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const base = Math.min(8000, 600 * 2 ** (attempt - 1));
      const jitter = Math.round(Math.random() * 250);
      await sleep(base + jitter);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("PhotoRoom request failed");
}

const inFlight = new Map<string, Promise<Blob>>();

export async function processPhotoWithPhotoRoom(
  file: File,
  options?: PhotoRoomEditOptions,
): Promise<Blob> {
  const opts = stableOptions(options);
  const [imageHash, optsHash] = await Promise.all([
    blobHash(file),
    stringHash(JSON.stringify(opts)),
  ]);
  const key = cacheKey(imageHash, optsHash);

  const cached = readCache(key);
  if (cached) {
    const blob = await getMediaBlob(cached.mediaId);
    if (blob) return blob;
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // ignore
    }
  }

  const existing = inFlight.get(key);
  if (existing) return existing;

  enforceRateLimit("edit-v2");

  const promise = (async () => {
    const formData = new FormData();
    formData.append("imageFile", file);
    formData.append("background.color", opts.backgroundColor);
    formData.append("outputSize", opts.outputSize);
    formData.append("padding", opts.padding);

    const response = await requestWithRetry(() =>
      fetch(API_URL, {
        method: "POST",
        body: formData,
      }),
    );

    if (!response.ok) {
      throw new Error(`PhotoRoom request failed (${response.status})`);
    }

    const blob = await response.blob();

    // Cache in IndexedDB (via mediaStore) with deterministic ID so duplicates collapse.
    const mediaId = `photoroom:edit:${key}`;
    const put = await putMediaBlob(blob, { kind: "image", id: mediaId });
    if (put.ok) {
      writeCache(key, {
        v: 1,
        at: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
        mediaId: put.ref.id,
        mimeType: put.ref.mimeType,
        sizeBytes: put.ref.sizeBytes,
      });
    }

    return blob;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}
