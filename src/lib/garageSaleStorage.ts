const SCHEDULE_KEY = "abr_garage_sale_schedule";
const LEGACY_WINDOW_KEY = "abr_garage_sale_open_window";

/** 0 = Sunday … 6 = Saturday (JS Date convention). */
export type GarageSaleSchedule = {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

export type GarageSalePresetId = "today" | "saturday" | "weekend";

export const GARAGE_SALE_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const GARAGE_SALE_DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const GARAGE_SALE_PRESETS: Array<{
  id: GarageSalePresetId;
  label: string;
  hint: string;
}> = [
  { id: "today", label: "Today", hint: "This day · 8am – 2pm" },
  { id: "saturday", label: "Saturday", hint: "Sat · 9am – 1pm" },
  { id: "weekend", label: "Weekend", hint: "Sat–Sun · 8am – 12pm" },
];

const DEFAULT_SCHEDULE: GarageSaleSchedule = {
  daysOfWeek: [6],
  startTime: "09:00",
  endTime: "13:00",
};

function isValidDay(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeSchedule(raw: Partial<GarageSaleSchedule> | null | undefined): GarageSaleSchedule {
  const days = Array.isArray(raw?.daysOfWeek)
    ? [...new Set(raw.daysOfWeek.filter(isValidDay))].sort((a, b) => a - b)
    : [];
  const startTime = raw?.startTime && isValidTime(raw.startTime) ? raw.startTime : DEFAULT_SCHEDULE.startTime;
  const endTime = raw?.endTime && isValidTime(raw.endTime) ? raw.endTime : DEFAULT_SCHEDULE.endTime;
  return {
    daysOfWeek: days.length > 0 ? days : DEFAULT_SCHEDULE.daysOfWeek,
    startTime,
    endTime,
  };
}

function readScheduleJson(): GarageSaleSchedule | null {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return null;
    return normalizeSchedule(JSON.parse(raw) as Partial<GarageSaleSchedule>);
  } catch {
    return null;
  }
}

function migrateLegacyWindow(): GarageSaleSchedule | null {
  try {
    const raw = localStorage.getItem(LEGACY_WINDOW_KEY);
    if (raw === "today" || raw === "saturday" || raw === "weekend") {
      return garageSalePresetSchedule(raw);
    }
  } catch {
    /* */
  }
  return null;
}

export function garageSalePresetSchedule(preset: GarageSalePresetId): GarageSaleSchedule {
  if (preset === "today") {
    return { daysOfWeek: [new Date().getDay()], startTime: "08:00", endTime: "14:00" };
  }
  if (preset === "weekend") {
    return { daysOfWeek: [6, 0], startTime: "08:00", endTime: "12:00" };
  }
  return { daysOfWeek: [6], startTime: "09:00", endTime: "13:00" };
}

export function getGarageSaleSchedule(): GarageSaleSchedule {
  return readScheduleJson() ?? migrateLegacyWindow() ?? DEFAULT_SCHEDULE;
}

export function setGarageSaleSchedule(schedule: GarageSaleSchedule): void {
  try {
    const normalized = normalizeSchedule(schedule);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(normalized));
    localStorage.removeItem(LEGACY_WINDOW_KEY);
    window.dispatchEvent(new Event("evorios-garage-schedule"));
  } catch {
    /* */
  }
}

export function formatTime12h(time24: string): string {
  if (!isValidTime(time24)) return time24;
  const [hourRaw, minuteRaw] = time24.split(":");
  const hour = Number.parseInt(hourRaw, 10);
  const minute = Number.parseInt(minuteRaw, 10);
  const period = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  if (minute === 0) return `${hour12}${period}`;
  return `${hour12}:${minuteRaw}${period}`;
}

export function formatGarageSaleDays(daysOfWeek: number[]): string {
  const days = [...new Set(daysOfWeek.filter(isValidDay))].sort((a, b) => a - b);
  if (days.length === 0) return "Pick a day";
  if (days.length === 1) return GARAGE_SALE_DAY_NAMES[days[0]];
  if (days.length === 2 && days.includes(6) && days.includes(0)) return "Sat–Sun";
  return days.map((day) => GARAGE_SALE_DAY_LABELS[day]).join(", ");
}

export function formatGarageSaleHours(schedule: GarageSaleSchedule): string {
  return `${formatTime12h(schedule.startTime)} – ${formatTime12h(schedule.endTime)}`;
}

export function garageSaleOpenLabel(schedule: GarageSaleSchedule = getGarageSaleSchedule()): string {
  const normalized = normalizeSchedule(schedule);
  return `${formatGarageSaleDays(normalized.daysOfWeek)} · ${formatGarageSaleHours(normalized)}`;
}

export function toggleGarageSaleDay(schedule: GarageSaleSchedule, day: number): GarageSaleSchedule {
  if (!isValidDay(day)) return schedule;
  const hasDay = schedule.daysOfWeek.includes(day);
  const nextDays = hasDay
    ? schedule.daysOfWeek.filter((item) => item !== day)
    : [...schedule.daysOfWeek, day].sort((a, b) => a - b);
  return { ...schedule, daysOfWeek: nextDays.length > 0 ? nextDays : [day] };
}

export function isGarageSaleScheduleValid(schedule: GarageSaleSchedule): boolean {
  const normalized = normalizeSchedule(schedule);
  if (normalized.daysOfWeek.length === 0) return false;
  if (!isValidTime(normalized.startTime) || !isValidTime(normalized.endTime)) return false;
  return normalized.endTime > normalized.startTime;
}

/** @deprecated Use getGarageSaleSchedule — kept for any stale imports. */
export type GarageSaleOpenWindow = GarageSalePresetId;

/** @deprecated */
export function getGarageSaleOpenWindow(): GarageSalePresetId {
  return "saturday";
}
