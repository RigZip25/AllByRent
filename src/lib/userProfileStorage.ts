import { getAppMode, setAppMode, type AppMode } from "./appMode";
import { countOwnListings } from "./hostAccess";
import {
  getActiveRentLocationLabel,
  getHomeLocation,
  getRentContext,
  hasRentLocationSetup,
} from "./listingStorage";
import { hasAvatarPhoto, loadAvatarDataUrl } from "./avatarStorage";
import { readLastKnownFullName } from "./pendingAuthProfile";

const PROFILE_KEY = "allbyrent_user_profile";

const DEMO_DISPLAY_NAMES = new Set(
  ["Alex Morgan", "Demo User", "Test User"].map((name) => name.toLowerCase()),
);

const DEMO_EMAILS = new Set(
  ["alex@example.com", "demo@example.com", "test@example.com"].map((email) =>
    email.toLowerCase(),
  ),
);

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isDemoDisplayName(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return DEMO_DISPLAY_NAMES.has(trimmed.toLowerCase());
}

function isDemoEmail(value: string): boolean {
  const normalized = normalizeEmail(value);
  if (!normalized) return false;
  if (DEMO_EMAILS.has(normalized)) return true;
  return normalized.endsWith("@example.com") || normalized.endsWith("@example.org");
}

function isStaleDemoField(
  value: string,
  authEmail: string | null | undefined,
  kind: "name" | "email",
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (kind === "name") return isDemoDisplayName(trimmed);
  if (!isDemoEmail(trimmed)) return false;
  const signedInEmail = normalizeEmail(authEmail ?? "");
  return !signedInEmail || normalizeEmail(trimmed) !== signedInEmail;
}

export type UserProfile = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  memberSince: string;
  preferredMode: AppMode;
  avatarUrl: string | null;
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  host: {
    listingsCount: number;
    rating: number;
    reviewCount: number;
    /** Manual booking (approve/decline requests) — enables response rate stat */
    usesManualBooking: boolean;
  };
  renter: {
    completedRentals: number;
    rating: number;
    reviewCount: number;
    noShowCount: number;
  };
  payoutConnected: boolean;
  notificationsEnabled: boolean;
};

function createDefaultProfile(authUserId?: string | null): UserProfile {
  const listingsCount = countOwnListings(authUserId ?? null);
  const id = authUserId?.trim() ?? "";

  return {
    id,
    displayName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    memberSince: new Date().toISOString().slice(0, 10),
    preferredMode: getAppMode(),
    avatarUrl: id ? loadAvatarDataUrl(id) : null,
    verification: {
      email: false,
      phone: false,
      identity: false,
    },
    host: {
      listingsCount,
      rating: 0,
      reviewCount: 0,
      usesManualBooking: true,
    },
    renter: {
      completedRentals: 0,
      rating: 0,
      reviewCount: 0,
      noShowCount: 0,
    },
    payoutConnected: false,
    notificationsEnabled: true,
  };
}

function migrateLegacyProfile(parsed: Record<string, unknown>): Partial<UserProfile> {
  const patch: Partial<UserProfile> = {};
  if ("avatarEmoji" in parsed) {
    patch.avatarUrl = null;
  }
  return patch;
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const seeded = createDefaultProfile();
      saveUserProfile(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const migrated = migrateLegacyProfile(parsed);
    const base = createDefaultProfile();
    const parsedHost =
      parsed.host && typeof parsed.host === "object"
        ? (parsed.host as UserProfile["host"])
        : {};
    const parsedRenter =
      parsed.renter && typeof parsed.renter === "object"
        ? (parsed.renter as UserProfile["renter"])
        : {};
    const merged = {
      ...base,
      ...parsed,
      ...migrated,
      host: { ...base.host, ...parsedHost },
      renter: { ...base.renter, ...parsedRenter },
    } as UserProfile;
    if (merged.host.usesManualBooking === undefined) {
      merged.host.usesManualBooking = true;
    }
    if (merged.renter.noShowCount === undefined) {
      merged.renter.noShowCount = 0;
    }
    merged.avatarUrl = hasAvatarPhoto(merged.id)
      ? loadAvatarDataUrl(merged.id)
      : null;
    return merged;
  } catch {
    const seeded = createDefaultProfile();
    saveUserProfile(seeded);
    return seeded;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export function refreshProfileStats(
  profile: UserProfile,
  authUserId: string | null = null,
): UserProfile {
  const listingsCount = countOwnListings(authUserId ?? profile.id);
  return {
    ...profile,
    avatarUrl: hasAvatarPhoto(profile.id) ? loadAvatarDataUrl(profile.id) : null,
    host: {
      ...profile.host,
      listingsCount,
      rating: listingsCount > 0 ? profile.host.rating || 4.9 : 0,
      reviewCount: listingsCount > 0 ? profile.host.reviewCount || 12 : 0,
    },
    preferredMode: getAppMode(),
  };
}

export function getProfileLocationSummary(): string {
  if (!hasRentLocationSetup()) return "Not set";
  const context = getRentContext();
  const label = getActiveRentLocationLabel();
  if (!label) return "Not set";
  return context === "trip" ? `Trip · ${label}` : label;
}

export function getProfileLocationCoords(): { lat: number; lng: number } | null {
  const home = getHomeLocation();
  if (!home) return null;
  return { lat: home.lat, lng: home.lng };
}

export function updatePreferredMode(mode: AppMode): void {
  setAppMode(mode);
  const profile = refreshProfileStats(loadUserProfile());
  profile.preferredMode = mode;
  saveUserProfile(profile);
}

export function updateProfileFields(
  patch: Partial<
    Pick<
      UserProfile,
      | "displayName"
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "bio"
      | "avatarUrl"
    >
  >,
): UserProfile {
  const profile = loadUserProfile();
  const next = { ...profile, ...patch };
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const name = `${next.firstName} ${next.lastName}`.trim();
    if (name) next.displayName = name;
  }
  saveUserProfile(next);
  return next;
}

export function setProfileAvatarUrl(url: string | null): UserProfile {
  return updateProfileFields({ avatarUrl: url });
}

export function getProfileDisplayLabel(displayName: string): string {
  const trimmed = displayName.trim();
  return trimmed || "Add your name";
}

export function getProfileEmailLabel(email: string, signedInEmail?: string | null): string {
  const trimmed = email.trim() || signedInEmail?.trim() || "";
  return trimmed || "Add email";
}

/** Drop legacy v0 demo placeholders so they never appear after real sign-in. */
export function sanitizeDemoProfileFields(
  profile: UserProfile,
  authUserId?: string | null,
  authEmail?: string | null,
): UserProfile {
  const next = { ...profile };
  const signedInEmail = authEmail?.trim() ?? "";

  if (authUserId?.trim()) {
    next.id = authUserId.trim();
  }

  if (isStaleDemoField(next.displayName, signedInEmail, "name")) {
    next.displayName = "";
    next.firstName = "";
    next.lastName = "";
  }

  if (signedInEmail) {
    if (!next.email.trim() || isStaleDemoField(next.email, signedInEmail, "email")) {
      next.email = signedInEmail;
      next.verification = { ...next.verification, email: true };
    }
  } else if (isDemoEmail(next.email)) {
    next.email = "";
  }

  return next;
}

export type ProfileAuthSyncInput = {
  userId: string;
  userEmail?: string | null;
  remoteDisplayName?: string | null;
  remoteEmail?: string | null;
};

/** Bind local profile to the signed-in account and replace stale demo fields. */
export function syncUserProfileFromAuth(input: ProfileAuthSyncInput): UserProfile {
  const userId = input.userId.trim();
  if (!userId) return loadUserProfile();

  const current = loadUserProfile();
  let next = sanitizeDemoProfileFields(current, userId, input.userEmail ?? null);

  const remoteName = input.remoteDisplayName?.trim() ?? "";
  const pendingName = readLastKnownFullName().trim();
  const resolvedName =
    remoteName ||
    (next.displayName.trim() && !isDemoDisplayName(next.displayName) ? next.displayName.trim() : "") ||
    pendingName;

  if (resolvedName) {
    next.displayName = resolvedName;
  }

  if (input.userEmail?.trim()) {
    next.email = input.userEmail.trim();
    next.verification = { ...next.verification, email: true };
  } else if (input.remoteEmail?.trim()) {
    next.email = input.remoteEmail.trim();
    next.verification = { ...next.verification, email: true };
  }

  next.avatarUrl = hasAvatarPhoto(userId) ? loadAvatarDataUrl(userId) : null;
  next = refreshProfileStats(next, userId);
  saveUserProfile(next);
  return next;
}
