import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { clearPendingAuthEmail } from "./authReturn";
import { consumePendingAuthProfile } from "./pendingAuthProfile";
import {
  deviceHasPasskeyHint,
  isPasskeySupported,
  registerPasskey,
  signInWithPasskey as passkeySignIn,
  userHasPasskey as profileHasPasskey,
} from "./passkey";
import { isNetworkFetchError } from "./authErrors";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type AuthProvider = "google" | "apple";

export type AuthState = {
  configured: boolean;
  session: Session | null;
};

const OAUTH_PROVIDER_KEY = "abr_auth_last_oauth_provider";
const PASSKEY_SETUP_DISMISS_KEY = "abr_passkey_setup_dismissed_at_v1";
/** Set when magic-link / OAuth callback finishes so App can skip splash without completing onboarding. */
export const AUTH_CALLBACK_RESUME_KEY = "abr_auth_callback_resume_v1";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function consumeAuthCallbackResume(): boolean {
  try {
    const value = sessionStorage.getItem(AUTH_CALLBACK_RESUME_KEY);
    sessionStorage.removeItem(AUTH_CALLBACK_RESUME_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

function markAuthCallbackResume(): void {
  try {
    sessionStorage.setItem(AUTH_CALLBACK_RESUME_KEY, "1");
  } catch {
    /* ignore */
  }
}

export { registerPasskey as enrollPasskey, passkeySignIn as signInWithPasskey };

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

export function getAuthRedirectUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

async function ensureProfileRow(userId: string, email: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const pending = consumePendingAuthProfile();
  await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        ...(pending
          ? {
              display_name: pending.fullName.trim(),
              location_label: pending.location.label,
              location_city: pending.location.city,
              location_region: pending.location.region,
              location_country: pending.location.country,
              location_country_code: pending.location.countryCode,
              location_lat: pending.location.lat,
              location_lng: pending.location.lng,
            }
          : {}),
      },
      { onConflict: "id" },
    );
}

async function readPkceChallengeForProxy(): Promise<{
  code_challenge?: string;
  code_challenge_method?: string;
}> {
  try {
    const storageKey = Object.keys(localStorage).find((key) => key.endsWith("-code-verifier"));
    if (!storageKey) return {};
    const verifier = localStorage.getItem(storageKey);
    if (!verifier) return {};
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hash = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return { code_challenge: hash, code_challenge_method: "s256" };
  } catch {
    return {};
  }
}

/** Server fallback — mirrors `signInWithOtp`, never `signUp`. */
async function signInWithEmailOtpViaProxy(email: string, redirectTo: string): Promise<void> {
  const pkce = await readPkceChallengeForProxy();
  const res = await fetch("/api/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo, ...pkce }),
  });

  let payload: { error?: string } = {};
  try {
    payload = (await res.json()) as { error?: string };
  } catch {
    // ignore
  }

  if (!res.ok) {
    throw new Error(
      typeof payload.error === "string" && payload.error.length > 0
        ? payload.error
        : `Magic link request failed (${res.status})`,
    );
  }
}

/**
 * Passwordless email sign-in — always `signInWithOtp` (magic link), never `signUp`.
 * New users are created via the OTP endpoint when needed (`shouldCreateUser: true`).
 */
export async function signInWithEmailOtp(email: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Enter your email address.");

  const redirectTo = getAuthRedirectUrl();
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      return;
    } catch (err) {
      if (!isNetworkFetchError(err)) throw err;
    }
  }

  await signInWithEmailOtpViaProxy(normalized, redirectTo);
}

export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const normalized = email.trim().toLowerCase();
  const code = token.replace(/\D/g, "");
  if (!normalized) throw new Error("Enter your email address.");
  if (code.length !== 8) throw new Error("Enter the 8-digit code from your email.");

  const { data, error } = await supabase.auth.verifyOtp({
    email: normalized,
    token: code,
    type: "email",
  });
  if (error) throw error;
  clearPendingAuthEmail();
  if (data.user?.id) {
    await ensureProfileRow(data.user.id, normalized);
  }
}

/**
 * Exchange PKCE `?code=` from magic-link redirects and strip auth params from the URL.
 */
export async function completeAuthCallbackFromUrl(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const authError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (authError) {
    url.searchParams.delete("error");
    url.searchParams.delete("error_description");
    url.searchParams.delete("error_code");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
    throw new Error(authError);
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete("code");
    url.searchParams.delete("type");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
    if (error) throw error;
    if (data.user?.id && data.user.email) {
      await ensureProfileRow(data.user.id, data.user.email);
    }
    markAuthCallbackResume();
    return true;
  }

  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  if (hash && (hash.includes("access_token=") || hash.includes("error="))) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) {
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      if (data.session.user.id && data.session.user.email) {
        await ensureProfileRow(data.session.user.id, data.session.user.email);
      }
      markAuthCallbackResume();
      return true;
    }
  }

  return false;
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
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function userHasPasskey(): Promise<boolean> {
  if (!isPasskeySupported()) return false;
  return profileHasPasskey();
}

export function shouldShowPasskeyLogin(): boolean {
  return isPasskeySupported() && deviceHasPasskeyHint();
}

export function shouldPromptEnablePasskey(): boolean {
  try {
    const raw = localStorage.getItem(PASSKEY_SETUP_DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (Number.isNaN(dismissedAt)) return true;
    return Date.now() - dismissedAt > THREE_DAYS_MS;
  } catch {
    return true;
  }
}

export function dismissEnablePasskeyPrompt(): void {
  try {
    localStorage.setItem(PASSKEY_SETUP_DISMISS_KEY, String(Date.now()));
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
