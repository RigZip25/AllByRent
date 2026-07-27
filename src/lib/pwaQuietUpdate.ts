/** Quiet-hour PWA updates — device local time. iOS cannot wake a closed PWA at 2 AM;
 *  we apply when the app is open/resumed in the window, or on the next launch after it. */

export const PWA_QUIET_UPDATE_HOUR = 2; // 02:00–02:59 local
export const PWA_QUIET_UPDATE_END_HOUR = 4; // allow apply through 03:59

const PENDING_AT_KEY = "evorios_pwa_update_pending_at";

export function isQuietUpdateHour(now = new Date()): boolean {
  const hour = now.getHours();
  return hour >= PWA_QUIET_UPDATE_HOUR && hour < PWA_QUIET_UPDATE_END_HOUR;
}

/** Next local quiet-window start (02:00). If already inside the window, returns now. */
export function nextQuietUpdateAt(now = new Date()): Date {
  if (isQuietUpdateHour(now)) return now;
  const next = new Date(now);
  next.setHours(PWA_QUIET_UPDATE_HOUR, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function msUntilNextQuietUpdate(now = new Date()): number {
  return Math.max(0, nextQuietUpdateAt(now).getTime() - now.getTime());
}

export function markPwaUpdatePending(at = Date.now()): void {
  try {
    localStorage.setItem(PENDING_AT_KEY, String(at));
  } catch {
    /* private mode */
  }
}

export function clearPwaUpdatePending(): void {
  try {
    localStorage.removeItem(PENDING_AT_KEY);
  } catch {
    /* ignore */
  }
}

export function readPwaUpdatePendingAt(): number | null {
  try {
    const raw = localStorage.getItem(PENDING_AT_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Auto-apply when:
 * - local quiet hours (2–4 AM), or
 * - an update has been waiting past the quiet window after it was detected
 *   (next launch after 2 AM — safe cold start, not mid-session daytime).
 */
export function shouldAutoApplyDeferredUpdate(now = new Date()): boolean {
  if (isQuietUpdateHour(now)) return true;
  const pendingAt = readPwaUpdatePendingAt();
  if (pendingAt == null) return false;
  const quietAfterDetect = nextQuietUpdateAt(new Date(pendingAt));
  return now.getTime() >= quietAfterDetect.getTime();
}
