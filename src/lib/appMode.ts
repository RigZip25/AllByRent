export const APP_MODE_STORAGE_KEY = "allbyrent_mode";

export type AppMode = "earn" | "rent";

export function getAppMode(): AppMode {
  try {
    const saved = localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (saved === "rent") return "rent";
    if (saved === "earn") return "earn";
    // Default to host/garage — browse is secondary while we grow stores.
    return "earn";
  } catch {
    return "earn";
  }
}

export function setAppMode(mode: AppMode): void {
  try {
    localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent("allbyrent-mode", { detail: mode }));
  } catch {
    /* ignore */
  }
}
