/**
 * Date-of-birth helpers — profile storage is always YYYY-MM-DD (UTC calendar day).
 */

import type { AppLocale } from "./i18n/types";

const GREETED_YEAR_KEY = "evorios_birthday_greeted_year_v1";

export function parseDob(raw: string | null | undefined): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!m) {
    // Tolerate unformatted digits (e.g. 19700418) from older text fields.
    m = /^(\d{4})(\d{2})(\d{2})$/.exec(trimmed);
  }
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const date = new Date(Date.UTC(y, mo - 1, d));
    if (
      Number.isNaN(date.getTime()) ||
      date.getUTCFullYear() !== y ||
      date.getUTCMonth() !== mo - 1 ||
      date.getUTCDate() !== d
    ) {
      return null;
    }
    return date;
  }
  const fallback = new Date(trimmed);
  if (Number.isNaN(fallback.getTime())) return null;
  return fallback;
}

/** Normalize any accepted input to YYYY-MM-DD, or null if invalid. */
export function normalizeDobToIso(raw: string | null | undefined): string | null {
  const dob = parseDob(raw);
  if (!dob) return null;
  const y = dob.getUTCFullYear();
  const mo = String(dob.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dob.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

export function ageYearsFromDob(dob: Date, now = new Date()): number {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const month = now.getUTCMonth() - dob.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export function ageYearsFromIso(iso: string | null | undefined, now = new Date()): number | null {
  const dob = parseDob(iso);
  if (!dob) return null;
  const age = ageYearsFromDob(dob, now);
  return age >= 0 && age < 130 ? age : null;
}

function localeTag(locale: AppLocale): string {
  if (locale === "cs") return "cs-CZ";
  if (locale === "es") return "es";
  return "en-US";
}

/** Human-readable date for profile rows (UTC calendar day of the ISO value). */
export function formatDobDisplay(iso: string, locale: AppLocale): string {
  const dob = parseDob(iso);
  if (!dob) return iso;
  return new Intl.DateTimeFormat(localeTag(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(dob);
}

export function dobPickerMaxIso(now = new Date()): string {
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

export function dobPickerMinIso(now = new Date()): string {
  const y = now.getFullYear() - 120;
  return `${y}-01-01`;
}

/**
 * Birthday match in the user's local timezone (when they open the app).
 * Feb 29 → Mar 1 in non-leap years.
 */
export function isBirthdayToday(iso: string | null | undefined, now = new Date()): boolean {
  const dob = parseDob(iso);
  if (!dob) return false;
  const birthMonth = dob.getUTCMonth();
  const birthDay = dob.getUTCDate();
  const month = now.getMonth();
  const day = now.getDate();
  if (birthMonth === 1 && birthDay === 29) {
    const isLeap =
      (now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) ||
      now.getFullYear() % 400 === 0;
    if (!isLeap) return month === 2 && day === 1;
  }
  return month === birthMonth && day === birthDay;
}

export function hasBirthdayGreetingForYear(year = new Date().getFullYear()): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(GREETED_YEAR_KEY) === String(year);
  } catch {
    return true;
  }
}

export function markBirthdayGreetingShown(year = new Date().getFullYear()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GREETED_YEAR_KEY, String(year));
  } catch {
    /* ignore */
  }
}
