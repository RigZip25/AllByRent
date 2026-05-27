const FOUNDING_HOST_PROMO_SEEN_KEY = "founding_host_promo_seen";

export const RESET_APP_CONFIRM_MESSAGE =
  "Reset all app data? Onboarding, profile, listings, and rentals will be cleared.";

/** URL params that trigger a full reset on load (`?resetApp=1` preferred). */
export function isResetAppQueryParam(params: URLSearchParams): boolean {
  return params.get("resetApp") === "1" || params.get("reset") === "1";
}

function shouldClearStorageKey(key: string): boolean {
  return (
    key.startsWith("allbyrent_") ||
    key === FOUNDING_HOST_PROMO_SEEN_KEY ||
    key.startsWith("all-by-rent-")
  );
}

function clearMatchingKeys(storage: Storage): void {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && shouldClearStorageKey(key)) keys.push(key);
  }
  for (const key of keys) storage.removeItem(key);
}

function clearWebStorage(): void {
  clearMatchingKeys(window.localStorage);
  clearMatchingKeys(window.sessionStorage);
}

async function unregisterServiceWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

async function clearCacheStorage(): Promise<void> {
  if (!("caches" in window)) return;
  const names = await caches.keys();
  await Promise.all(names.map((name) => caches.delete(name)));
}

/** Wipe AllByRent local state, PWA caches/service workers, and reload. */
export async function resetAllAppData(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    clearWebStorage();
    await Promise.all([unregisterServiceWorkers(), clearCacheStorage()]);
  } catch {
    try {
      clearWebStorage();
    } catch {
      /* still reload */
    }
  }
  window.location.reload();
}

export function confirmAndResetAppData(): void {
  if (window.confirm(RESET_APP_CONFIRM_MESSAGE)) {
    void resetAllAppData();
  }
}
