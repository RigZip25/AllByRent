import {
  startAuthentication,
  startRegistration,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import { formatPasskeyError } from "./passkeyErrors";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const DEVICE_PASSKEY_KEY = "abr_device_passkey_v1";

export type PasskeyRegistrationBundle = {
  options: Parameters<typeof startRegistration>[0]["optionsJSON"];
  challengeToken: string;
};

export type PasskeyAuthenticationBundle = {
  options: Parameters<typeof startAuthentication>[0]["optionsJSON"];
  challengeToken: string;
};

/**
 * Always use a relative `/api` base.
 * Absolute `window.location.origin + /api` breaks Capacitor: the native API bridge
 * only rewrites paths that start with `/api/`, so Face ID options never reach
 * app.evorios.com and the WebView serves the SPA HTML (empty JSON → missing challenge).
 */
function apiBase(): string {
  return "/api";
}

function mapApiStatus(status: number, serverError?: string): string {
  if (serverError?.trim()) {
    return formatPasskeyError(new Error(serverError.trim()));
  }
  if (status === 401) return "Sign in with email before using Face ID.";
  if (status === 404) {
    return "Face ID sign-in is not available on this server. Use email sign-in for now.";
  }
  if (status === 503) return "Sign-in service is not configured. Use email sign-in.";
  if (status >= 500) {
    return "Sign-in service is temporarily unavailable. Use email sign-in, or try again shortly.";
  }
  return "Face ID could not be completed. Try again or sign in with email.";
}

async function postJson<T>(path: string, body: unknown, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Failed to fetch");
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(mapApiStatus(res.status, data?.error));
  }
  return data;
}

function wrapWebAuthn<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((err) => {
    throw new Error(formatPasskeyError(err));
  });
}

function assertRegistrationBundle(data: Partial<PasskeyRegistrationBundle>): PasskeyRegistrationBundle {
  const options = data?.options;
  const challengeToken = data?.challengeToken;
  const challenge =
    options && typeof options === "object" && "challenge" in options
      ? (options as { challenge?: unknown }).challenge
      : undefined;
  if (
    !options ||
    typeof options !== "object" ||
    typeof challenge !== "string" ||
    !challenge ||
    typeof challengeToken !== "string" ||
    !challengeToken
  ) {
    throw new Error("Invalid or expired challenge — missing registration options.");
  }
  return { options, challengeToken };
}

function assertAuthenticationBundle(
  data: Partial<PasskeyAuthenticationBundle>,
): PasskeyAuthenticationBundle {
  const options = data?.options;
  const challengeToken = data?.challengeToken;
  const challenge =
    options && typeof options === "object" && "challenge" in options
      ? (options as { challenge?: unknown }).challenge
      : undefined;
  if (
    !options ||
    typeof options !== "object" ||
    typeof challenge !== "string" ||
    !challenge ||
    typeof challengeToken !== "string" ||
    !challengeToken
  ) {
    throw new Error("Invalid or expired challenge — missing authentication options.");
  }
  return { options, challengeToken };
}

async function requireAccessToken(): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error("Sign in with email before enabling Face ID.");
  }
  return token;
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

function assertPasskeyEnvironment(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(formatPasskeyError(new Error("Passkeys require Supabase configuration.")));
  }
  if (!isPasskeySupported()) {
    throw new Error(formatPasskeyError(new Error("Passkeys are not supported in this browser.")));
  }
}

/** Prefetch before the Enable tap so iOS Safari can show Face ID immediately. */
export async function fetchPasskeyRegistrationBundle(): Promise<PasskeyRegistrationBundle> {
  assertPasskeyEnvironment();
  const token = await requireAccessToken();
  const data = await postJson<Partial<PasskeyRegistrationBundle>>(
    "/auth/passkey-register-options",
    {},
    token,
  );
  return assertRegistrationBundle(data);
}

export async function verifyPasskeyRegistration(
  attestationResponse: RegistrationResponseJSON,
  challengeToken: string,
): Promise<void> {
  assertPasskeyEnvironment();
  const token = await requireAccessToken();
  await postJson("/auth/passkey-register-verify", { attestationResponse, challengeToken }, token);
  markDeviceHasPasskey();
}

export async function registerPasskey(): Promise<void> {
  const bundle = await fetchPasskeyRegistrationBundle();
  const attestationResponse = await wrapWebAuthn(() =>
    startRegistration({ optionsJSON: bundle.options }),
  );
  try {
    await verifyPasskeyRegistration(attestationResponse, bundle.challengeToken);
  } catch (err) {
    throw new Error(formatPasskeyError(err));
  }
}

export async function fetchPasskeyAuthenticationBundle(
  email?: string,
): Promise<PasskeyAuthenticationBundle> {
  assertPasskeyEnvironment();
  const data = await postJson<Partial<PasskeyAuthenticationBundle>>("/auth/passkey-auth-options", {
    email: email?.trim().toLowerCase() || undefined,
  });
  return assertAuthenticationBundle(data);
}

export async function verifyPasskeyAuthentication(
  assertionResponse: AuthenticationResponseJSON,
  challengeToken: string,
): Promise<void> {
  assertPasskeyEnvironment();
  const result = await postJson<{
    access_token: string;
    refresh_token: string;
  }>("/auth/passkey-auth-verify", { assertionResponse, challengeToken });
  await applySessionTokens(result.access_token, result.refresh_token);
  markDeviceHasPasskey();
}

export async function signInWithPasskey(email?: string): Promise<void> {
  try {
    const bundle = await fetchPasskeyAuthenticationBundle(email);
    const assertionResponse = await wrapWebAuthn(() =>
      startAuthentication({ optionsJSON: bundle.options }),
    );
    await verifyPasskeyAuthentication(assertionResponse, bundle.challengeToken);
  } catch (err) {
    throw new Error(formatPasskeyError(err));
  }
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
