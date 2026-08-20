import { APP_ORIGIN } from "./brand";
import { getMessages } from "./i18n";
import {
  detectPasskeyEnvironment,
  isPasskeyProductionHost,
  isStandalonePwa,
} from "./passkeyEnvironment";

function withHostNote(base: string, hostNote: string): string {
  if (!hostNote) return base;
  const i = base.indexOf(". ");
  if (i < 0) return base + hostNote;
  return base.slice(0, i + 1) + hostNote + base.slice(i + 1);
}

function looksLikeRawEngineError(msg: string, name: string): boolean {
  if (name === "TypeError" || name === "ReferenceError" || name === "SyntaxError") return true;
  return (
    /undefined is not an object|null is not an object|Cannot read propert|is not a function|evaluating ['`].*challenge/i.test(
      msg,
    ) || /\[object Object\]|at Object\.|@https?:\/\//i.test(msg)
  );
}

/**
 * User-facing messages for WebAuthn / passkey (Face ID) failures.
 * Never surfaces raw JS engine / stack strings in the UI.
 */
export function formatPasskeyError(err: unknown): string {
  const e = getMessages().passkey.errors;

  if (!(err instanceof Error)) {
    return e.generic;
  }

  const msg = err.message;
  const name = "name" in err && typeof err.name === "string" ? err.name : "";

  if (
    name === "NotAllowedError" ||
    /NotAllowedError|operation either timed out or was not allowed|user denied|cancelled|canceled/i.test(
      msg,
    )
  ) {
    return e.cancelled;
  }

  if (
    /invalid for this domain|invalid domain|ERROR_INVALID_RP_ID|ERROR_INVALID_DOMAIN|rpId|RP ID|origin/i.test(
      msg,
    )
  ) {
    const env = detectPasskeyEnvironment();
    const hostNote = !isPasskeyProductionHost() ? e.hostNote(APP_ORIGIN) : "";
    if (env === "ios-pwa") return withHostNote(e.domainIosPwa, hostNote);
    if (env === "ios-safari") return withHostNote(e.domainIosSafari, hostNote);
    return withHostNote(e.domainGeneric, hostNote);
  }

  if (/Request failed \(5\d\d\)|server error has occurred|FUNCTION_INVOCATION_FAILED/i.test(msg)) {
    return e.serverUnavailable;
  }

  if (
    /Invalid or expired challenge|missing (passkey )?challenge|registration options|authentication options/i.test(
      msg,
    )
  ) {
    return e.challengeExpired;
  }

  if (/No passkey registered|Passkey not found/i.test(msg)) {
    return e.noPasskey;
  }

  if (name === "InvalidStateError" || /InvalidStateError|already registered|credential.*exists/i.test(msg)) {
    return e.alreadyEnabled;
  }

  if (name === "SecurityError" || /SecurityError/i.test(msg)) {
    return isStandalonePwa() ? e.blockedPwa : e.blockedBrowser;
  }

  if (/Passkeys are not supported/i.test(msg)) {
    return e.unsupported;
  }

  if (/Passkeys require Supabase|not configured on the server|Face ID is not available/i.test(msg)) {
    return e.notConfigured;
  }

  if (
    /verification failed|could not be verified|authentication failed|authenticator was unable/i.test(
      msg,
    )
  ) {
    return e.verificationFailed;
  }

  if (msg === "Failed to fetch" || /NetworkError/i.test(msg)) {
    return e.network;
  }

  if (/Sign in with email before/i.test(msg)) {
    return msg;
  }

  // Safari/WebKit often throws TypeError on bad optionsJSON ("t.challenge") — never show raw.
  if (looksLikeRawEngineError(msg, name) || /\.challenge\b/i.test(msg)) {
    if (typeof console !== "undefined") {
      console.warn("[passkey]", name || "Error", msg);
    }
    return e.generic;
  }

  // Allowlist: only known soft API strings; everything else → generic.
  if (/Face ID|passkey|email sign-in|Sign-in service/i.test(msg) && msg.length < 180) {
    return msg;
  }

  if (typeof console !== "undefined") {
    console.warn("[passkey] sanitized unknown error:", name || "Error", msg);
  }
  return e.generic;
}
