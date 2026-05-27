import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const DEVICE_PASSKEY_KEY = "abr_device_passkey_v1";

function apiBase(): string {
  if (typeof window === "undefined") return "/api";
  return `${window.location.origin}/api`;
}

async function postJson<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : `Request failed (${res.status})`,
    );
  }
  return data;
}

export function markDeviceHasPasskey(): void {
  try {
    localStorage.setItem(DEVICE_PASSKEY_KEY, "1");
  } catch {
    // ignore
  }
}

export function deviceHasPasskeyHint(): boolean {
  try {
    return localStorage.getItem(DEVICE_PASSKEY_KEY) === "1";
  } catch {
    return false;
  }
}

export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator.credentials !== "undefined"
  );
}

async function applySessionTokens(access_token: string, refresh_token: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
}

export async function registerPasskey(): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Passkeys require Supabase configuration.");
  }
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported in this browser.");
  }

  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error("Sign in with email before enabling Face ID.");
  }

  const { options, challengeToken } = await postJson<{
    options: Parameters<typeof startRegistration>[0];
    challengeToken: string;
  }>("/passkey/register/options", {}, token);

  const attestationResponse = await startRegistration({ optionsJSON: options });

  await postJson(
    "/passkey/register/verify",
    { attestationResponse, challengeToken },
    token,
  );

  markDeviceHasPasskey();
}

export async function signInWithPasskey(email?: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Passkeys require Supabase configuration.");
  }
  if (!isPasskeySupported()) {
    throw new Error("Passkeys are not supported in this browser.");
  }

  const { options, challengeToken } = await postJson<{
    options: Parameters<typeof startAuthentication>[0];
    challengeToken: string;
  }>("/passkey/auth/options", { email: email?.trim().toLowerCase() || undefined });

  const assertionResponse = await startAuthentication({ optionsJSON: options });

  const result = await postJson<{
    access_token: string;
    refresh_token: string;
  }>("/passkey/auth/verify", { assertionResponse, challengeToken });

  await applySessionTokens(result.access_token, result.refresh_token);
  markDeviceHasPasskey();
}

export async function userHasPasskey(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  if (deviceHasPasskeyHint()) return true;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return deviceHasPasskeyHint();

  const { data, error } = await supabase
    .from("profiles")
    .select("passkey_credential_id")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.passkey_credential_id) return false;
  markDeviceHasPasskey();
  return true;
}
