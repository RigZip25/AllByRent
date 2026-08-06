const FIRST_SEEN_KEY = "allbyrent_garage_first_seen_v1";

type FirstSeenMap = Record<string, string>;

function readMap(): FirstSeenMap {
  try {
    const raw = localStorage.getItem(FIRST_SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FirstSeenMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: FirstSeenMap): void {
  try {
    localStorage.setItem(FIRST_SEEN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Record first time this device saw a host garage on the feed. Returns ISO first-seen. */
export function noteGarageFirstSeen(hostId: string): string {
  const id = hostId.trim();
  if (!id) return "";
  const map = readMap();
  if (map[id]) return map[id]!;
  const iso = new Date().toISOString();
  map[id] = iso;
  writeMap(map);
  return iso;
}

export function getGarageFirstSeen(hostId: string): string | null {
  const id = hostId.trim();
  if (!id) return null;
  return readMap()[id] ?? null;
}

/** Newly noticed on this device within N days (supplement to profile created_at). */
export function isRecentlyDiscoveredGarage(hostId: string, days = 7, now = Date.now()): boolean {
  const first = getGarageFirstSeen(hostId);
  if (!first) return true;
  const t = Date.parse(first);
  if (!Number.isFinite(t)) return false;
  return now - t <= days * 24 * 60 * 60 * 1000;
}
