import { loadUserProfile } from "./userProfileStorage";

/** Stable account id for host-scoped data (listings, co-hosts, booking stats). */
export function resolveHostAccountId(authUserId: string | null): string {
  if (authUserId?.trim()) return authUserId.trim();
  return loadUserProfile().id;
}

export function resolveHostAccountEmail(authUserEmail: string | null): string {
  const fromAuth = authUserEmail?.trim().toLowerCase() ?? "";
  if (fromAuth) return fromAuth;
  return loadUserProfile().email.trim().toLowerCase();
}
