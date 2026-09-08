/**
 * Turning a calendar date plus a wall-clock time into an instant.
 *
 * Rental deadlines are wall-clock promises: "back by the end of the 15th" means
 * the end of the 15th where the item lives, not UTC midnight. Storing the zone
 * next to the instant is what lets the server recompute the same moment the
 * renter saw.
 *
 * Server copy: server/lib/zonedTime.ts — keep in sync.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_OF_DAY = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

export const UTC_TIME_ZONE = "UTC";

const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat | null {
  const cached = formatters.get(timeZone);
  if (cached) return cached;
  try {
    const next = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, next);
    return next;
  } catch {
    return null;
  }
}

export function isValidTimeZone(timeZone: string | null | undefined): boolean {
  const candidate = timeZone?.trim();
  if (!candidate) return false;
  return partsFormatter(candidate) !== null;
}

/** The zone this device is in, or UTC when the platform will not tell us. */
export function deviceTimeZone(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (isValidTimeZone(resolved)) return resolved;
  } catch {
    /* fall through */
  }
  return UTC_TIME_ZONE;
}

/** First usable zone from the candidates, falling back to this device. */
export function resolveTimeZone(...candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && isValidTimeZone(trimmed)) return trimmed;
  }
  return deviceTimeZone();
}

/** Minutes to add to UTC to get local time in `timeZone` at `instant`. */
export function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const formatter = partsFormatter(timeZone);
  if (!formatter) return 0;
  const parts = formatter.formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value ?? "0";
    return Number.parseInt(value, 10);
  };
  const hour = read("hour");
  const asUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    // Some ICU builds render midnight as hour 24.
    hour === 24 ? 0 : hour,
    read("minute"),
    read("second"),
  );
  return Math.round((asUtc - instant.getTime()) / 60000);
}

export type WallClockTime = { hour: number; minute: number; second?: number; ms?: number };

export function parseTimeOfDay(raw: string | null | undefined): WallClockTime | null {
  const match = TIME_OF_DAY.exec(raw?.trim() ?? "");
  if (!match) return null;
  const hour = Number.parseInt(match[1]!, 10);
  const minute = Number.parseInt(match[2]!, 10);
  const second = match[3] ? Number.parseInt(match[3], 10) : 0;
  if (hour > 23 || minute > 59 || second > 59) return null;
  return { hour, minute, second };
}

/**
 * The instant at which `timeZone` shows `dateIso` at `time`.
 *
 * Two passes: the first offset lookup can be taken from the wrong side of a DST
 * change, the second settles on the offset that actually applies.
 */
export function zonedWallTime(
  dateIso: string,
  time: WallClockTime,
  timeZone: string,
): Date | null {
  const match = DATE_ONLY.exec(dateIso.trim());
  if (!match) return null;
  const targetUtc = Date.UTC(
    Number.parseInt(match[1]!, 10),
    Number.parseInt(match[2]!, 10) - 1,
    Number.parseInt(match[3]!, 10),
    time.hour,
    time.minute,
    time.second ?? 0,
    time.ms ?? 0,
  );
  let guess = new Date(targetUtc);
  for (let pass = 0; pass < 2; pass += 1) {
    const next = new Date(targetUtc - zoneOffsetMinutes(guess, timeZone) * 60000);
    if (next.getTime() === guess.getTime()) break;
    guess = next;
  }
  return guess;
}

/** Start of `dateIso` (00:00:00.000) in `timeZone`. */
export function zonedStartOfDay(dateIso: string, timeZone: string): Date | null {
  return zonedWallTime(dateIso, { hour: 0, minute: 0, second: 0, ms: 0 }, timeZone);
}

/** End of `dateIso` (23:59:59.999) in `timeZone` — the rental return deadline. */
export function zonedEndOfDay(dateIso: string, timeZone: string): Date | null {
  return zonedWallTime(dateIso, { hour: 23, minute: 59, second: 59, ms: 999 }, timeZone);
}

export function zonedEndOfDayIso(dateIso: string, timeZone: string): string | null {
  return zonedEndOfDay(dateIso, timeZone)?.toISOString() ?? null;
}

/** The calendar date `timeZone` is on at `instant`, as YYYY-MM-DD. */
export function zonedDateIso(instant: Date, timeZone: string): string {
  const offset = zoneOffsetMinutes(instant, timeZone);
  return new Date(instant.getTime() + offset * 60000).toISOString().slice(0, 10);
}

/** Short zone label ("CDT", "GMT+2") for spelling out what a deadline means. */
export function timeZoneLabel(
  timeZone: string,
  locale?: string,
  instant: Date = new Date(),
): string {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(instant);
    return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
