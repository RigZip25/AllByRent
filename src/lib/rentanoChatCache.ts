const CACHE_KEY = "abr_rentano_chat_cache_v1";
const MAX_ENTRIES = 80;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEntry = {
  answer: string;
  at: number;
};

type CacheStore = Record<string, CacheEntry>;

function readStore(): CacheStore {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CacheStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

export function buildRentanoCacheKey(query: string, screen?: string): string {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  return `${screen?.trim() || "app"}::${normalized}`;
}

export function readCachedRentanoAnswer(key: string): string | null {
  const store = readStore();
  const entry = store[key];
  if (!entry?.answer) return null;
  if (Date.now() - entry.at > TTL_MS) {
    delete store[key];
    writeStore(store);
    return null;
  }
  return entry.answer;
}

export function writeCachedRentanoAnswer(key: string, answer: string): void {
  const trimmed = answer.trim();
  if (!trimmed) return;

  const store = readStore();
  store[key] = { answer: trimmed, at: Date.now() };

  const keys = Object.keys(store);
  if (keys.length > MAX_ENTRIES) {
    const sorted = keys.sort((a, b) => (store[a]?.at ?? 0) - (store[b]?.at ?? 0));
    for (const stale of sorted.slice(0, keys.length - MAX_ENTRIES)) {
      delete store[stale];
    }
  }

  writeStore(store);
}
