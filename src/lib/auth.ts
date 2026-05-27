import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type AuthProvider = "google" | "apple";

export type AuthState = {
  configured: boolean;
  session: Session | null;
};

const OAUTH_PROVIDER_KEY = "abr_auth_last_oauth_provider";
const ENABLE_PASSKEY_DISMISSED_KEY = "abr_auth_enable_passkey_dismissed_v1";

export function getAuthState(): Promise<AuthState> | AuthState {
  if (!isSupabaseConfigured()) {
    return { configured: false, session: null };
  }
  const supabase = getSupabaseClient();
  if (!supabase) return { configured: false, session: null };
  return supabase.auth.getSession().then(({ data }) => ({ configured: true, session: data.session }));
}

export function onAuthStateChange(
  cb: (event: AuthChangeEvent, session: Session | null) => void,
): { unsubscribe: () => void } {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { unsubscribe: () => undefined };
  }
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(event, session));
  return { unsubscribe: () => data.subscription.unsubscribe() };
}

export async function signInWithProvider(provider: AuthProvider): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    localStorage.setItem(OAUTH_PROVIDER_KEY, provider);
  } catch {
    // ignore
  }
  const redirectTo = typeof window === "undefined" ? undefined : window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
  if (error) throw error;
}

function getPasskeyApi():
  | {
      signInWithPasskey?: (args?: unknown) => Promise<unknown>;
      registerPasskey?: (args?: unknown) => Promise<unknown>;
      listPasskeys?: () => Promise<{ data?: unknown; error?: unknown }>;
    }
  | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  // Supabase exposes passkeys under `supabase.auth.passkey` in newer versions.
  const anyAuth = supabase.auth as unknown as { passkey?: Record<string, unknown> };
  const passkey = anyAuth.passkey as
    | undefined
    | {
        signInWithPasskey?: (args?: unknown) => Promise<unknown>;
        registerPasskey?: (args?: unknown) => Promise<unknown>;
        listPasskeys?: () => Promise<{ data?: unknown; error?: unknown }>;
      };
  return passkey ?? null;
}

export async function signInWithPasskey(): Promise<void> {
  const passkey = getPasskeyApi();
  if (!passkey?.signInWithPasskey) {
    throw new Error("Passkeys are not available in this build or browser.");
  }
  await passkey.signInWithPasskey();
}

export async function enrollPasskey(): Promise<void> {
  const passkey = getPasskeyApi();
  if (!passkey?.registerPasskey) {
    throw new Error("Passkey enrollment is not available in this build or browser.");
  }
  await passkey.registerPasskey();
}

export async function userHasPasskey(): Promise<boolean> {
  const passkey = getPasskeyApi();
  if (!passkey?.listPasskeys) return false;
  const result = await passkey.listPasskeys();
  if (result.error) return false;
  const data = result.data as unknown;
  // We avoid hard-typing response shape; treat any non-empty array as "has passkey".
  return Array.isArray(data) ? data.length > 0 : Boolean(data);
}

export function shouldPromptEnablePasskey(): boolean {
  try {
    return localStorage.getItem(ENABLE_PASSKEY_DISMISSED_KEY) !== "1";
  } catch {
    return true;
  }
}

export function dismissEnablePasskeyPrompt(): void {
  try {
    localStorage.setItem(ENABLE_PASSKEY_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
}

export function consumeLastOauthProvider(): AuthProvider | null {
  try {
    const value = localStorage.getItem(OAUTH_PROVIDER_KEY) as AuthProvider | null;
    if (value === "google" || value === "apple") return value;
    return null;
  } catch {
    return null;
  } finally {
    try {
      localStorage.removeItem(OAUTH_PROVIDER_KEY);
    } catch {
      // ignore
    }
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Frontend-only apps cannot delete Supabase Auth users securely because it requires a service role key.
 * This returns a clear, user-initiated "deletion request" flow placeholder.
 *
 * Recommended implementation:
 * - Create a Supabase Edge Function `delete-user` using the service role key.
 * - Require the user to re-authenticate (passkey/OAuth), then call the function.
 */
export async function requestAccountDeletion(): Promise<{ ok: true; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: true, message: "Demo mode: account deletion is not available." };
  }
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user?.email ?? "";
  const uid = data.session?.user?.id ?? "";
  const message = [
    "Account deletion requires a server-side component (Supabase Edge Function) to securely call the Admin API.",
    "For now, this app can only sign you out locally.",
    email || uid ? `Signed-in account: ${email || uid}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  await supabase.auth.signOut();
  return { ok: true, message };
}

