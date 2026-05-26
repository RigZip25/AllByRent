const MS_MIN = 60_000;
const MS_HOUR = 60 * MS_MIN;
const MS_DAY = 24 * MS_HOUR;

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export function getCountdownParts(targetIso: string, now = Date.now()): CountdownParts {
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / MS_DAY);
  const hours = Math.floor((diff % MS_DAY) / MS_HOUR);
  const minutes = Math.floor((diff % MS_HOUR) / MS_MIN);
  const seconds = Math.floor((diff % MS_MIN) / 1000);
  return { days, hours, minutes, seconds, totalMs: diff };
}

export function getOverdueParts(sinceIso: string, now = Date.now()): CountdownParts {
  const since = new Date(sinceIso).getTime();
  const diff = Math.max(0, now - since);
  const days = Math.floor(diff / MS_DAY);
  const hours = Math.floor((diff % MS_DAY) / MS_HOUR);
  const minutes = Math.floor((diff % MS_HOUR) / MS_MIN);
  const seconds = Math.floor((diff % MS_MIN) / 1000);
  return { days, hours, minutes, seconds, totalMs: diff };
}

export function formatCountdownShort(parts: CountdownParts): string {
  if (parts.days > 0) {
    return `${parts.days} day${parts.days === 1 ? "" : "s"} ${parts.hours} hr${parts.hours === 1 ? "" : "s"}`;
  }
  if (parts.hours > 0) {
    return `${parts.hours} hr${parts.hours === 1 ? "" : "s"} ${parts.minutes} min`;
  }
  return `${parts.minutes} min ${parts.seconds} sec`;
}

export function formatOverdueShort(parts: CountdownParts): string {
  if (parts.days > 0) {
    return `${parts.days} day${parts.days === 1 ? "" : "s"} ${parts.hours} hr${parts.hours === 1 ? "" : "s"}`;
  }
  return `${parts.hours} hr${parts.hours === 1 ? "" : "s"} ${parts.minutes} min`;
}

export function formatPickupWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Pickup time TBD";
  }
  const datePart = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const startTime = start.toLocaleTimeString(undefined, timeFmt);
  const endTime = end.toLocaleTimeString(undefined, timeFmt);
  return `Pickup: ${datePart}, ${startTime}–${endTime}`;
}

export function canMarkNoShow(pickupScheduledAt: string, now = Date.now()): boolean {
  const pickup = new Date(pickupScheduledAt).getTime();
  if (Number.isNaN(pickup)) return false;
  return now - pickup >= 60 * MS_MIN;
}

export function isReviewWindowOpen(completedAt: string | undefined, now = Date.now()): boolean {
  if (!completedAt) return true;
  const completed = new Date(completedAt).getTime();
  if (Number.isNaN(completed)) return true;
  return now - completed < 48 * MS_HOUR;
}

export function formatDisputeDeadline(deadlineIso: string, now = Date.now()): string {
  const parts = getCountdownParts(deadlineIso, now);
  if (parts.totalMs <= 0) return "Deadline passed";
  return `${formatCountdownShort(parts)} left to submit evidence`;
}
