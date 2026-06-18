const PROFILE_KEY = "allbyrent_user_profile";
const LEGACY_HOST_ID = "demo-user";
const LEGACY_HOST_EMAIL = "alex@example.com";

function readProfileField(field: "id" | "email"): string | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const value = parsed[field];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/** Stable account id for host-scoped data (listings, co-hosts, booking stats). */
export function resolveHostAccountId(authUserId: string | null): string {
  if (authUserId?.trim()) return authUserId.trim();
  return readProfileField("id") ?? LEGACY_HOST_ID;
}

export function resolveHostAccountEmail(authUserEmail: string | null): string {
  const fromAuth = authUserEmail?.trim().toLowerCase() ?? "";
  if (fromAuth) return fromAuth;
  return (readProfileField("email") ?? LEGACY_HOST_EMAIL).toLowerCase();
}
