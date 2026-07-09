import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { resolveSessionUserEmail } from "./authEmail";
import { clearPendingAuthEmail } from "./authReturn";
import { consumePendingAuthProfile, peekPendingAuthProfile } from "./pendingAuthProfile";
import {
  deviceHasPasskeyHint,
  isPasskeySupported,
  registerPasskey,
  signInWithPasskey as passkeySignIn,
  userHasPasskey as profileHasPasskey,
} from "./passkey";
import { isNetworkFetchError } from "./authErrors";
import { emailOtpEntryError, isCompleteEmailOtpLength, normalizeEmailOtpInput } from "./authOtp";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type AuthProvider = "google" | "apple";

export type AuthState = {
  configured: boolean;
  session: Session | null;
};

const OAUTH_PROVIDER_KEY = "abr_auth_last_oauth_provider";
const PASSKEY_SETUP_DISMISS_KEY = "abr_passkey_setup_dismissed_at_v1";
/** Set when OAuth callback finishes so App can skip splash without completing onboarding. */
export const AUTH_CALLBACK_RESUME_KEY = "abr_auth_callback_resume_v1";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function consumeAuthCallbackResume(): boolean {
  try {
    const value =
      sessionStorage.getItem(AUTH_CALLBACK_RESUME_KEY) ??
      localStorage.getItem(AUTH_CALLBACK_RESUME_KEY);
    sessionStorage.removeItem(AUTH_CALLBACK_RESUME_KEY);
    localStorage.removeItem(AUTH_CALLBACK_RESUME_KEY);
    return value != null && value !== "0" && value !== "";
  } catch {
    return false;
  }
}

function markAuthCallbackResume(): void {
  try {
    // Use a unique value so repeated callbacks always trigger `storage` events in other tabs.
    const value = String(Date.now());
    sessionStorage.setItem(AUTH_CALLBACK_RESUME_KEY, value);
    // Also write to localStorage so the original tab can detect the completion.
    localStorage.setItem(AUTH_CALLBACK_RESUME_KEY, value);
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("abr_auth_v1");
        channel.postMessage({ type: "auth_callback_complete", at: value });
        channel.close();
      }
    } catch {
      /* ignore */
    }
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
  const pending = peekPendingAuthProfile();
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        ...(pending
          ? {
              display_name: pending.fullName.trim(),
              phone: pending.phone ?? null,
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
  if (!error && pending) {
    consumePendingAuthProfile();
  }
}

/** Server fallback — mirrors `signInWithOtp`, never `signUp`. OTP-only (no email redirect). */
async function signInWithEmailOtpViaProxy(email: string): Promise<void> {
  const res = await fetch("/api/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
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
        : `Sign-in code request failed (${res.status})`,
    );
  }
}

/**
 * Passwordless email sign-in — `signInWithOtp` with a numeric code only (no magic link).
 * New users are created via the OTP endpoint when needed (`shouldCreateUser: true`).
 */
export async function signInWithEmailOtp(email: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Enter your email address.");

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      return;
    } catch (err) {
      if (!isNetworkFetchError(err)) throw err;
    }
  }

  await signInWithEmailOtpViaProxy(normalized);
}

export async function verifyEmailOtp(email: string, token: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const normalized = email.trim().toLowerCase();
  const code = normalizeEmailOtpInput(token);
  if (!normalized) throw new Error("Enter your email address.");
  if (!isCompleteEmailOtpLength(code.length)) {
    throw new Error(emailOtpEntryError());
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: normalized,
    token: code,
    type: "email",
  });
  if (error) throw error;
  if (data.user?.id) {
    const resolved = resolveSessionUserEmail(data.user) ?? normalized;
    await ensureProfileRow(data.user.id, resolved);
  }
  clearPendingAuthEmail();
  markAuthCallbackResume();
}

/**
 * Exchange PKCE `?code=` from OAuth redirects and strip auth params from the URL.
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
    if (data.user?.id) {
      const resolved = resolveSessionUserEmail(data.user);
      if (resolved) await ensureProfileRow(data.user.id, resolved);
    }
    clearPendingAuthEmail();
    markAuthCallbackResume();
    return true;
  }

  const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  if (hash && (hash.includes("access_token=") || hash.includes("error="))) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session) {
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      const resolved = resolveSessionUserEmail(data.session.user);
      if (data.session.user.id && resolved) {
        await ensureProfileRow(data.session.user.id, resolved);
      }
      clearPendingAuthEmail();
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

export async function requestAccountDeletion(): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Account deletion requires Supabase auth configuration." };
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    return { ok: false, message: "Sign in required to delete your account." };
  }

  try {
    const res = await fetch("/api/auth/delete_account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = (await res.json()) as { ok?: boolean; message?: string; reason?: string };
    if (!res.ok || !payload.ok) {
      const reason = payload.reason ?? payload.message ?? `Deletion failed (${res.status})`;
      return { ok: false, message: reason };
    }

    await supabase.auth.signOut();
    return {
      ok: true,
      message: payload.message ?? "Your account was permanently deleted.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Account deletion failed.",
    };
  }
}
