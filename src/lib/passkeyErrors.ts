/**
 * User-facing messages for WebAuthn / passkey (Face ID) failures.
 */
export function formatPasskeyError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Face ID could not be completed. Try again or sign in with email.";
  }

  const msg = err.message;
  const name = "name" in err && typeof err.name === "string" ? err.name : "";

  if (
    name === "NotAllowedError" ||
    /NotAllowedError|operation either timed out or was not allowed|user denied|cancelled|canceled/i.test(
      msg,
    )
  ) {
    return "Face ID was cancelled. Try again when you're ready.";
  }

  if (
    /invalid for this domain|invalid domain|ERROR_INVALID_RP_ID|ERROR_INVALID_DOMAIN/i.test(msg)
  ) {
    return (
      "Face ID is not set up for this address. Open https://app.allbyrent.com " +
      "(same tab you used to sign up), not a preview or copy URL."
    );
  }

  if (/Request failed \(5\d\d\)|server error has occurred|FUNCTION_INVOCATION_FAILED/i.test(msg)) {
    return "Sign-in service is temporarily unavailable. Use email sign-in, or try again in a few minutes.";
  }

  if (/Invalid or expired challenge/i.test(msg)) {
    return "This Face ID attempt expired. Please try again.";
  }

  if (/No passkey registered|Passkey not found/i.test(msg)) {
    return "No Face ID passkey for this account. Sign in with email, then enable Face ID when prompted.";
  }

  if (/Passkeys are not supported/i.test(msg)) {
    return "This browser does not support Face ID passkeys. Use Safari on iPhone, or sign in with email.";
  }

  if (/Passkeys require Supabase|not configured on the server/i.test(msg)) {
    return "Face ID is not available right now. Sign in with email instead.";
  }

  if (
    /verification failed|could not be verified|authentication failed|authenticator was unable/i.test(
      msg,
    )
  ) {
    return (
      "Face ID verification failed. Sign in with email once, then enable Face ID again " +
      "(especially if you changed devices or reinstalled the app)."
    );
  }

  if (msg === "Failed to fetch" || /NetworkError/i.test(msg)) {
    return "Cannot reach the sign-in service. Check your connection and try again.";
  }

  if (/Sign in with email before/i.test(msg)) {
    return msg;
  }

  return msg || "Face ID could not be completed. Try again or sign in with email.";
}
