export const APP_MODE_STORAGE_KEY = "allbyrent_mode";

export type AppMode = "earn" | "rent";

export function getAppMode(): AppMode {
  try {
    const saved = localStorage.getItem(APP_MODE_STORAGE_KEY);
    return saved === "earn" ? "earn" : "rent";
  } catch {
    return "rent";
  }
}

export function setAppMode(mode: AppMode): void {
  try {
    localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
