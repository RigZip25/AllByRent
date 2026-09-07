/**
 * Light owner ops gate — client-side only (not production-grade auth).
 * Override credentials with VITE_OPS_USER / VITE_OPS_PASSWORD on Vercel.
 */

const SESSION_KEY = "abr_ops_session_v1";

/**
 * No built-in fallback: a shipped default password is readable in the client
 * bundle, and this console can change platform fees and SEO flags.
 * Set VITE_OPS_USER / VITE_OPS_PASSWORD in the deploy environment.
 */
export function getOpsCredentials(): { user: string; password: string } | null {
  const user = String(import.meta.env.VITE_OPS_USER ?? "").trim();
  const password = String(import.meta.env.VITE_OPS_PASSWORD ?? "").trim();
  if (!user || !password) return null;
  return { user, password };
}

export function isOpsConfigured(): boolean {
  return getOpsCredentials() !== null;
}

export function isOpsSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { ok?: boolean; at?: number };
    return Boolean(parsed?.ok);
  } catch {
    return false;
  }
}

export function setOpsSessionActive(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (active) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ok: true, at: Date.now() }));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* private mode */
  }
}

export function attemptOpsLogin(user: string, password: string): boolean {
  const expected = getOpsCredentials();
  if (!expected) return false;
  const ok =
    user.trim().toLowerCase() === expected.user.toLowerCase() &&
    password === expected.password;
  if (ok) setOpsSessionActive(true);
  return ok;
}

export function opsLogout(): void {
  setOpsSessionActive(false);
}

/** Pathname `/ops` (case-insensitive) — separate entry from the consumer app. */
export function isOpsPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path.toLowerCase() === "/ops";
}
