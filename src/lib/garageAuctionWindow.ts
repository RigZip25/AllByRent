import {
  formatTime12h,
  getGarageSaleSchedule,
  type GarageSaleSchedule,
} from "./garageSaleStorage";

export type AuctionWindow = {
  startsAt: string;
  endsAt: string;
};

function parseLocalTime(base: Date, time24: string): Date {
  const [hourRaw, minuteRaw] = time24.split(":");
  const next = new Date(base);
  next.setHours(Number.parseInt(hourRaw, 10), Number.parseInt(minuteRaw, 10), 0, 0);
  return next;
}

/** Next bidding window from garage open hours (local time). */
export function computeNextAuctionWindow(
  schedule: GarageSaleSchedule,
  from: Date = new Date(),
): AuctionWindow {
  const days = [...new Set(schedule.daysOfWeek)].sort((a, b) => a - b);
  if (days.length === 0) {
    const startsAt = from.toISOString();
    return { startsAt, endsAt: new Date(from.getTime() + 4 * 3_600_000).toISOString() };
  }

  for (let offset = 0; offset < 14; offset += 1) {
    const day = new Date(from);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + offset);
    const dow = day.getDay();
    if (!days.includes(dow)) continue;

    const open = parseLocalTime(day, schedule.startTime);
    const close = parseLocalTime(day, schedule.endTime);

    if (offset === 0) {
      if (from >= close) continue;
      const startsAt = from >= open ? from : open;
      return { startsAt: startsAt.toISOString(), endsAt: close.toISOString() };
    }

    return { startsAt: open.toISOString(), endsAt: close.toISOString() };
  }

  const startsAt = from.toISOString();
  return { startsAt, endsAt: new Date(from.getTime() + 4 * 3_600_000).toISOString() };
}

export function defaultAuctionWindow(schedule?: GarageSaleSchedule): AuctionWindow {
  return computeNextAuctionWindow(schedule ?? getGarageSaleSchedule());
}

export function isAuctionBiddingOpen(window: AuctionWindow, now = Date.now()): boolean {
  const startMs = new Date(window.startsAt).getTime();
  const endMs = new Date(window.endsAt).getTime();
  return now >= startMs && now < endMs;
}

export function isAuctionNotStarted(window: AuctionWindow, now = Date.now()): boolean {
  return now < new Date(window.startsAt).getTime();
}

export function isAuctionEnded(window: AuctionWindow, now = Date.now()): boolean {
  return now >= new Date(window.endsAt).getTime();
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatShortDate(date: Date): string {
  const today = new Date();
  if (isSameCalendarDay(date, today)) return "Today";
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameCalendarDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/** e.g. "Sat · 9am – 1pm" or "Today · 9am – 1pm" */
export function formatAuctionWindowLabel(window: AuctionWindow): string {
  const start = new Date(window.startsAt);
  const end = new Date(window.endsAt);
  const dayLabel = formatShortDate(start);
  const endSameDay = isSameCalendarDay(start, end);
  const endTime = formatTime12h(
    `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
  );
  if (isAuctionNotStarted(window)) {
    const startTime = formatTime12h(
      `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
    );
    return `${dayLabel} · opens ${startTime} – closes ${endTime}`;
  }
  if (endSameDay) {
    return `${dayLabel} · closes ${endTime}`;
  }
  return `${dayLabel} · closes ${formatShortDate(end)} ${endTime}`;
}

/** Compact line for shop cards — status-aware. */
export function formatAuctionTiming(window: AuctionWindow): string {
  const now = Date.now();
  const endMs = new Date(window.endsAt).getTime();
  const startMs = new Date(window.startsAt).getTime();

  if (now >= endMs) return "Ended";

  if (now < startMs) {
    const start = new Date(window.startsAt);
    return `Opens ${formatShortDate(start)} ${formatTime12h(
      `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
    )}`;
  }

  const msLeft = endMs - now;
  const hours = Math.floor(msLeft / 3_600_000);
  const minutes = Math.floor((msLeft % 3_600_000) / 60_000);
  const end = new Date(window.endsAt);
  const closes = formatTime12h(
    `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
  );
  if (hours > 0) return `Closes ${closes} · ${hours}h ${minutes}m left`;
  return `Closes ${closes} · ${minutes}m left`;
}

/** Infer start when legacy offers only stored `endsAt`. */
export function inferAuctionStartsAt(endsAt: string, schedule?: GarageSaleSchedule): string {
  const end = new Date(endsAt);
  const sched = schedule ?? getGarageSaleSchedule();
  const open = parseLocalTime(end, sched.startTime);
  if (open.getTime() < end.getTime()) return open.toISOString();
  return new Date(end.getTime() - 4 * 3_600_000).toISOString();
}
