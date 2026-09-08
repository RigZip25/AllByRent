import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

/** Inclusive YYYY-MM-DD range (overnight / multi-day rentals). */
export type BusyInterval = { start: string; end: string };

export const DEFAULT_MAX_ADVANCE_MONTHS = 6;

/** Rental statuses that occupy calendar days. Cancelled/completed free days. */
export const BUSY_RENTAL_STATUSES = [
  "pending_approval",
  "pending_checkin",
  "active",
  "upcoming",
  "overdue",
  "disputed",
  "no_show",
] as const;

export function parseIsoDateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function toIsoDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIsoLocal(): string {
  return toIsoDateLocal(new Date());
}

export function addMonthsIso(iso: string, months: number): string {
  const base = parseIsoDateLocal(iso) ?? new Date();
  const targetMonth = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  ).getDate();
  const day = Math.min(base.getDate(), lastDay);
  return toIsoDateLocal(
    new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day),
  );
}

/** UTC end-of-calendar-day for `due_at` / deposit windows (Stage 16 / W1). */
export function endOfUtcDayIso(dateIso: string): string {
  const day = dateIso.trim().slice(0, 10);
  return `${day}T23:59:59.000Z`;
}

/**
 * Interpret HH:mm on a YYYY-MM-DD as a local wall-clock instant, then ISO.
 * Used for host handoff hours → `pickup_at` (Stage 16 / W7).
 */
export function localHmOnDateToIso(dateIso: string, hm: string): string {
  const base = parseIsoDateLocal(dateIso.slice(0, 10));
  if (!base) return new Date().toISOString();
  const match = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  const hours = match ? Number(match[1]) : 9;
  const minutes = match ? Number(match[2]) : 0;
  base.setHours(
    Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 9,
    Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0,
    0,
    0,
  );
  return base.toISOString();
}

/** Format YYYY-MM-DD without UTC midnight day-shift (Stage 16 / W5). */
export function formatIsoDateLabel(
  dateIso: string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  const d = parseIsoDateLocal(dateIso.slice(0, 10));
  if (!d) return dateIso;
  return d.toLocaleDateString(undefined, opts);
}

/** Pending-approval expiry: always `created_at + 24h` (Stage 16 / W12). */
export function approvalDeadlineFromCreatedAt(createdAtIso: string): string {
  const ms = new Date(createdAtIso).getTime();
  const base = Number.isFinite(ms) ? ms : Date.now();
  return new Date(base + 24 * 60 * 60 * 1000).toISOString();
}

/** Calendar-month length in days for the month containing `dateIso`. */
export function daysInMonthContaining(dateIso: string): number {
  const base = parseIsoDateLocal(dateIso.slice(0, 10)) ?? new Date();
  return new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
}

/**
 * Minutes since local midnight for an IANA zone (Stage 16 / W9).
 * Falls back to the device zone when `timeZone` is missing/invalid.
 */
export function localMinutesInTimeZone(now: Date, timeZone?: string | null): {
  dayOfWeek: number;
  minutes: number;
} {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone || undefined,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const parts = fmt.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? now.getHours());
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? now.getMinutes());
    const dowMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    return {
      dayOfWeek: dowMap[weekday] ?? now.getDay(),
      minutes: hour * 60 + minute,
    };
  } catch {
    return {
      dayOfWeek: now.getDay(),
      minutes: now.getHours() * 60 + now.getMinutes(),
    };
  }
}

export function addDaysIso(iso: string, days: number): string {
  const base = parseIsoDateLocal(iso);
  if (!base) return iso;
  base.setDate(base.getDate() + days);
  return toIsoDateLocal(base);
}

export function daysInclusive(startIso: string, endIso: string): number {
  const start = parseIsoDateLocal(startIso);
  const end = parseIsoDateLocal(endIso);
  if (!start || !end) return 0;
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

function normalizeInterval(raw: unknown): BusyInterval | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const start =
    typeof row.start === "string"
      ? row.start.slice(0, 10)
      : typeof row.start_date === "string"
        ? row.start_date.slice(0, 10)
        : null;
  const end =
    typeof row.end === "string"
      ? row.end.slice(0, 10)
      : typeof row.end_date === "string"
        ? row.end_date.slice(0, 10)
        : null;
  if (!start || !end) return null;
  if (!parseIsoDateLocal(start) || !parseIsoDateLocal(end)) return null;
  if (end < start) return null;
  return { start, end };
}

/** Inclusive overlap: overnight ranges share an endpoint day → busy. */
export function rangesOverlap(a: BusyInterval, b: BusyInterval): boolean {
  return a.start <= b.end && a.end >= b.start;
}

export function isDateInBusyIntervals(isoDate: string, busy: BusyInterval[]): boolean {
  for (const interval of busy) {
    if (isoDate >= interval.start && isoDate <= interval.end) return true;
  }
  return false;
}

export function isRangeBusy(start: string, end: string, busy: BusyInterval[]): boolean {
  if (!start || !end || end < start) return true;
  return busy.some((interval) => rangesOverlap({ start, end }, interval));
}

export function normalizeBusyIntervals(raw: unknown[]): BusyInterval[] {
  const out: BusyInterval[] = [];
  for (const item of raw) {
    const n = normalizeInterval(item);
    if (n) out.push(n);
  }
  return out;
}

/** Merge blocked host dates + rental occupancy into a single busy list. */
export function unionBusyIntervals(
  blockedDates: BusyInterval[] | undefined | null,
  rentalIntervals: BusyInterval[] | undefined | null,
): BusyInterval[] {
  return [
    ...normalizeBusyIntervals(blockedDates ?? []),
    ...normalizeBusyIntervals(rentalIntervals ?? []),
  ];
}

export type ListingBusyFetchResult = {
  intervals: BusyInterval[];
  /** True when RPC succeeded (or local-only blocked dates used without remote). */
  source: "rpc" | "blocked_only" | "empty";
};

/**
 * Fetch public busy intervals (blocked + occupying rentals) without renter PII.
 * Falls back to blockedDates from the listing when RPC is unavailable / not migrated yet.
 */
export async function fetchListingBusyIntervals(
  listingId: string,
  fallbackBlocked?: BusyInterval[] | null,
): Promise<ListingBusyFetchResult> {
  const blocked = normalizeBusyIntervals(fallbackBlocked ?? []);

  if (!isSupabaseConfigured()) {
    return { intervals: blocked, source: blocked.length ? "blocked_only" : "empty" };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { intervals: blocked, source: blocked.length ? "blocked_only" : "empty" };
  }

  const { data, error } = await supabase.rpc("get_listing_busy_intervals", {
    p_listing_id: listingId,
  });

  if (error) {
    // Migration may not be applied yet — still enforce host blocked dates client-side.
    console.warn("[availability] get_listing_busy_intervals failed:", error.message);
    return { intervals: blocked, source: blocked.length ? "blocked_only" : "empty" };
  }

  const fromRpc = normalizeBusyIntervals(Array.isArray(data) ? data : []);
  // RPC already unions blocked + rentals; keep blocked as safety if RPC returned only rentals somehow.
  const merged = fromRpc.length > 0 ? fromRpc : blocked;
  return { intervals: merged, source: "rpc" };
}

/**
 * Client-side overlap check before insert. Prefer server trigger when migration is applied.
 */
export async function listingHasOverlappingRental(params: {
  listingId: string;
  startDate: string;
  endDate: string;
  fallbackBlocked?: BusyInterval[] | null;
}): Promise<boolean> {
  const busy = await fetchListingBusyIntervals(params.listingId, params.fallbackBlocked);
  return isRangeBusy(params.startDate, params.endDate, busy.intervals);
}

export function maxBookableIso(maxAdvanceMonths = DEFAULT_MAX_ADVANCE_MONTHS): string {
  return addMonthsIso(todayIsoLocal(), maxAdvanceMonths);
}

export function expandBusyToDisabledMatchers(busy: BusyInterval[]): Date[] {
  const dates: Date[] = [];
  for (const interval of busy) {
    const start = parseIsoDateLocal(interval.start);
    const end = parseIsoDateLocal(interval.end);
    if (!start || !end) continue;
    const cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return dates;
}
