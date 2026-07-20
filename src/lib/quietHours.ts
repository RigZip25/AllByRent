/** Quiet hours for Mr. Evorios push/in-app nudges (local wall clock). */

export const DEFAULT_QUIET_HOURS_START = 21; // 21:00 inclusive
export const DEFAULT_QUIET_HOURS_END = 8; // 08:00 exclusive
export const DEFAULT_TIMEZONE = "America/Chicago"; // Arkansas pilot

export type QuietHoursConfig = {
  timezone: string;
  startHour: number;
  endHour: number;
};

export function detectBrowserTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz?.trim() || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** True when local hour is inside the quiet window (overnight-aware). */
export function isWithinQuietHours(
  now: Date,
  config: QuietHoursConfig = {
    timezone: DEFAULT_TIMEZONE,
    startHour: DEFAULT_QUIET_HOURS_START,
    endHour: DEFAULT_QUIET_HOURS_END,
  },
): boolean {
  const hour = localHourInTimeZone(now, config.timezone);
  const start = clampHour(config.startHour, DEFAULT_QUIET_HOURS_START);
  const end = clampHour(config.endHour, DEFAULT_QUIET_HOURS_END);
  if (start === end) return false;
  if (start < end) {
    return hour >= start && hour < end;
  }
  // Overnight window, e.g. 21 → 8
  return hour >= start || hour < end;
}

export function localHourInTimeZone(date: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || DEFAULT_TIMEZONE,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(date);
    const hourPart = parts.find((p) => p.type === "hour")?.value;
    const hour = Number.parseInt(hourPart ?? "", 10);
    return Number.isFinite(hour) ? hour : date.getHours();
  } catch {
    return date.getHours();
  }
}

function clampHour(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(23, Math.max(0, Math.floor(value)));
}
