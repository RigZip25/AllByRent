/**
 * Wall-clock date/time → instant, for automation that has to agree with what
 * the app showed the renter (server copy — keep in sync with src/lib/zonedTime.ts).
 *
 * Rows created before rentals.timezone existed have no zone; those fall back to
 * UTC, which is the behavior they were written with.
 */

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

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

/** First usable zone from the candidates, falling back to UTC. */
export function resolveTimeZone(...candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && isValidTimeZone(trimmed)) return trimmed;
  }
  return UTC_TIME_ZONE;
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
    hour === 24 ? 0 : hour,
    read("minute"),
    read("second"),
  );
  return Math.round((asUtc - instant.getTime()) / 60000);
}

export type WallClockTime = { hour: number; minute: number; second?: number; ms?: number };

/** The instant at which `timeZone` shows `dateIso` at `time`. */
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

/** End of `dateIso` (23:59:59.999) in `timeZone` — the rental return deadline. */
export function zonedEndOfDay(dateIso: string, timeZone: string): Date | null {
  return zonedWallTime(dateIso, { hour: 23, minute: 59, second: 59, ms: 999 }, timeZone);
}

export function zonedEndOfDayIso(dateIso: string, timeZone: string): string | null {
  return zonedEndOfDay(dateIso, timeZone)?.toISOString() ?? null;
}
