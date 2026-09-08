import { getSupabaseConfig } from "./supabaseConfig";

/**
 * A clock that does not belong to the device.
 *
 * Auction closing times, bid windows and 30-minute payment deadlines are all
 * decided by comparing `Date.now()` against a stored instant. On a phone whose
 * clock is wrong — or moved on purpose — that reopens closed bidding and
 * revives expired checkouts. We learn the offset between this device and the
 * server from the `Date` header any HTTP response carries, then read time
 * through it.
 *
 * The offset is a hint, not a guarantee: gating stays synchronous, and until
 * the first sync lands (or if it never does) this behaves exactly like
 * `Date.now()`.
 */

const OFFSET_STORAGE_KEY = "evorios_server_clock_offset";
/** Ignore sub-second drift; anything smaller is round-trip noise. */
const MIN_MEANINGFUL_OFFSET_MS = 1000;
const RESYNC_AFTER_MS = 10 * 60 * 1000;

let offsetMs = 0;
let lastSyncAt = 0;
let inFlight: Promise<number> | null = null;

function readStoredOffset(): number {
  try {
    const raw = sessionStorage.getItem(OFFSET_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function storeOffset(next: number): void {
  try {
    sessionStorage.setItem(OFFSET_STORAGE_KEY, String(next));
  } catch {
    /* private mode — in-memory offset still applies */
  }
}

if (typeof sessionStorage !== "undefined") {
  offsetMs = readStoredOffset();
}

/** Best guess at the current server time, in milliseconds. */
export function serverNow(): number {
  return Date.now() + offsetMs;
}

/** How far this device's clock is from the server, in milliseconds. */
export function serverClockOffsetMs(): number {
  return offsetMs;
}

/** True once a real server reading has been taken. */
export function serverClockSynced(): boolean {
  return lastSyncAt > 0;
}

function timeSourceUrl(): string | null {
  const config = getSupabaseConfig();
  if (config) return `${config.url.replace(/\/$/, "")}/auth/v1/health`;
  if (typeof location !== "undefined" && location.origin.startsWith("http")) {
    return `${location.origin}/manifest.webmanifest`;
  }
  return null;
}

/**
 * Offset implied by one reading, or null when the header is unusable.
 *
 * Half the round trip is credited to the response leg, which is the usual
 * approximation; we only care about being right to the second.
 */
export function clockOffsetFromReading(params: {
  sentAt: number;
  receivedAt: number;
  serverDateHeader: string | null;
}): number | null {
  if (!params.serverDateHeader) return null;
  const serverMs = new Date(params.serverDateHeader).getTime();
  if (!Number.isFinite(serverMs)) return null;
  const roundTrip = Math.max(0, params.receivedAt - params.sentAt);
  const localAtServerReading = params.sentAt + Math.round(roundTrip / 2);
  const offset = serverMs - localAtServerReading;
  return Math.abs(offset) >= MIN_MEANINGFUL_OFFSET_MS ? offset : 0;
}

/** Read the server's clock and remember the difference. */
export async function syncServerClock(force = false): Promise<number> {
  if (!force && lastSyncAt > 0 && Date.now() - lastSyncAt < RESYNC_AFTER_MS) {
    return offsetMs;
  }
  if (inFlight) return inFlight;

  const url = timeSourceUrl();
  if (!url || typeof fetch === "undefined") return offsetMs;

  inFlight = (async () => {
    try {
      const sentAt = Date.now();
      const response = await fetch(url, { method: "GET", cache: "no-store" });
      const receivedAt = Date.now();
      const next = clockOffsetFromReading({
        sentAt,
        receivedAt,
        serverDateHeader: response.headers.get("date"),
      });
      if (next == null) return offsetMs;

      lastSyncAt = receivedAt;
      offsetMs = next;
      storeOffset(offsetMs);
      return offsetMs;
    } catch {
      return offsetMs;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Test seam: pretend the device is `ms` behind (positive) or ahead (negative). */
export function __setServerClockOffsetForTests(ms: number): void {
  offsetMs = ms;
  lastSyncAt = ms === 0 ? 0 : Date.now();
}
