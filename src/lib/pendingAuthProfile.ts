import type { LocationSuggestion } from "./geocoding";

const KEY = "abr_pending_auth_profile_v1";
const LAST_NAME_KEY = "abr_last_full_name_v1";

export type PendingAuthProfile = {
  fullName: string;
  phone?: string;
  location: LocationSuggestion;
  createdAt: string;
};

export function savePendingAuthProfile(value: Omit<PendingAuthProfile, "createdAt">): void {
  try {
    const payload: PendingAuthProfile = { ...value, createdAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(payload));
    localStorage.setItem(LAST_NAME_KEY, payload.fullName);
  } catch {
    // ignore storage failures
  }
}

export function readLastKnownFullName(): string {
  try {
    return localStorage.getItem(LAST_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function peekPendingAuthProfile(): PendingAuthProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingAuthProfile;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.fullName !== "string") return null;
    if (!parsed.location || typeof parsed.location !== "object") return null;
    if (typeof parsed.createdAt !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function consumePendingAuthProfile(): PendingAuthProfile | null {
  const value = peekPendingAuthProfile();
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return value;
}

