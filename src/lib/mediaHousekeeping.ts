/**
 * Occasional sweep of the on-device media cache.
 *
 * Photo blobs live in IndexedDB and were only ever removed by the size-based
 * eviction, which means a phone could carry hundreds of megabytes of dead
 * intermediate images. This runs at most once a day, while the app is idle.
 */
const LAST_RUN_KEY = "evorios_media_sweep_at";
const INTERVAL_MS = 1000 * 60 * 60 * 24;

function dueForSweep(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(LAST_RUN_KEY);
    const last = raw ? Number.parseInt(raw, 10) : 0;
    if (!Number.isFinite(last)) return true;
    return Date.now() - last > INTERVAL_MS;
  } catch {
    return false;
  }
}

function markSwept(): void {
  try {
    localStorage.setItem(LAST_RUN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function scheduleMediaHousekeeping(): void {
  if (!dueForSweep()) return;

  const run = () => {
    markSwept();
    void import("../screens/listing/photoroomApi")
      .then(({ prunePhotoRoomMediaCache }) => prunePhotoRoomMediaCache())
      .catch(() => 0);
  };

  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (typeof idle === "function") {
    idle(run);
  } else {
    window.setTimeout(run, 4000);
  }
}
