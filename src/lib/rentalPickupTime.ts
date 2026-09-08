import type { ListingDraft } from "../screens/listing/types";
import { parseIsoDateLocal } from "./availabilityBusy";
import {
  parseTimeOfDay,
  zonedEndOfDayIso,
  zonedWallTime,
  type WallClockTime,
} from "./zonedTime";

/** Used when the host never stated hours (older drafts had no handoff times). */
export const FALLBACK_PICKUP_TIME: WallClockTime = { hour: 14, minute: 0 };

const WEEKEND_DAY_INDEXES = new Set([0, 6]);

type HandoffHours = Pick<
  ListingDraft["handoff"],
  "inPersonTimeStart" | "inPersonTimeEnd" | "inPersonWeekendTimeStart" | "inPersonWeekendTimeEnd"
>;

function isWeekend(dateIso: string): boolean {
  const parsed = parseIsoDateLocal(dateIso);
  return parsed ? WEEKEND_DAY_INDEXES.has(parsed.getDay()) : false;
}

/** Opening time the host published for the weekday `dateIso` falls on. */
export function hostPickupTimeForDate(
  handoff: HandoffHours | undefined,
  dateIso: string,
): WallClockTime {
  const raw = isWeekend(dateIso) ? handoff?.inPersonWeekendTimeStart : handoff?.inPersonTimeStart;
  return parseTimeOfDay(raw) ?? FALLBACK_PICKUP_TIME;
}

/** Closing time the host published for the weekday `dateIso` falls on. */
export function hostReturnTimeForDate(
  handoff: HandoffHours | undefined,
  dateIso: string,
): WallClockTime | null {
  const raw = isWeekend(dateIso) ? handoff?.inPersonWeekendTimeEnd : handoff?.inPersonTimeEnd;
  return parseTimeOfDay(raw);
}

/** When the renter is expected: the host's own opening hour, not a fixed 2pm. */
export function resolvePickupInstantIso(
  startDate: string,
  handoff: HandoffHours | undefined,
  timeZone: string,
): string | null {
  const time = hostPickupTimeForDate(handoff, startDate);
  return zonedWallTime(startDate, time, timeZone)?.toISOString() ?? null;
}

/** Two hours, for hosts who published an opening time but no closing time. */
const DEFAULT_PICKUP_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Pickup window in the item's zone: the host's own hours on the start date. */
export function resolvePickupWindowIso(
  startDate: string,
  handoff: HandoffHours | undefined,
  timeZone: string,
): { start: string; end: string } | null {
  const start = zonedWallTime(startDate, hostPickupTimeForDate(handoff, startDate), timeZone);
  if (!start) return null;
  const closing = hostReturnTimeForDate(handoff, startDate);
  const closingInstant = closing ? zonedWallTime(startDate, closing, timeZone) : null;
  const end =
    closingInstant && closingInstant.getTime() > start.getTime()
      ? closingInstant
      : new Date(start.getTime() + DEFAULT_PICKUP_WINDOW_MS);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * The return deadline: end of the last rented day where the item lives.
 *
 * Deliberately not the host's closing hour — the renter paid for the whole day,
 * and late fees hang off this instant.
 */
export function resolveReturnDeadlineIso(endDate: string, timeZone: string): string | null {
  return zonedEndOfDayIso(endDate, timeZone);
}
