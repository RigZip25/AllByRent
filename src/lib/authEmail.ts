import type { User } from "@supabase/supabase-js";
import { peekPendingAuthEmail } from "./authReturn";

/** Best-effort email from Supabase session (magic link tab may lack sessionStorage pending email). */
export function resolveSessionUserEmail(user: User | null | undefined): string | null {
  if (!user) return peekPendingAuthEmail();

  const direct = user.email?.trim();
  if (direct) return direct.toLowerCase();

  const metaEmail =
    typeof user.user_metadata?.email === "string" ? user.user_metadata.email.trim() : "";
  if (metaEmail) return metaEmail.toLowerCase();

  for (const identity of user.identities ?? []) {
    const raw = identity.identity_data?.email;
    if (typeof raw === "string" && raw.trim()) return raw.trim().toLowerCase();
  }

  return peekPendingAuthEmail();
}
