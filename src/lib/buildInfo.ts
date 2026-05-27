/** Injected at build time from Vercel env (see vite.config.ts). */
export const APP_BUILD_ID: string = import.meta.env.VITE_APP_BUILD_ID ?? "dev";
export const APP_BUILD_TIME: string = import.meta.env.VITE_APP_BUILD_TIME ?? "";

const LAST_BUILD_ID_KEY = "allbyrent_last_build_id";

export function formatBuildStamp(): string {
  const id = APP_BUILD_ID === "dev" ? "dev" : APP_BUILD_ID.slice(0, 7);
  if (!APP_BUILD_TIME) return `Build ${id}`;
  const when = new Date(APP_BUILD_TIME);
  const date =
    Number.isNaN(when.getTime()) ? APP_BUILD_TIME : when.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `Build ${id} · ${date}`;
}

export function readStoredBuildId(): string | null {
  try {
    return localStorage.getItem(LAST_BUILD_ID_KEY);
  } catch {
    return null;
  }
}

export function writeStoredBuildId(id: string): void {
  try {
    localStorage.setItem(LAST_BUILD_ID_KEY, id);
  } catch {
    /* private mode */
  }
}

/** True when a new deployment shipped since the user last loaded the app shell. */
export function hasBuildIdChanged(): boolean {
  const stored = readStoredBuildId();
  if (!stored || APP_BUILD_ID === "dev") return false;
  return stored !== APP_BUILD_ID;
}
