/**
 * Phone SMS OTP via Supabase Auth (Twilio / MessageBird configured in Dashboard).
 * Set PHONE_OTP_ENABLED=true (or VITE_PHONE_OTP_ENABLED=true) after enabling Phone in Supabase.
 */
export function isPhoneOtpEnabled(): boolean {
  const flag =
    process.env.PHONE_OTP_ENABLED?.trim().toLowerCase() ||
    process.env.VITE_PHONE_OTP_ENABLED?.trim().toLowerCase() ||
    "";
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;
  if (flag === "1" || flag === "true" || flag === "on" || flag === "yes") return true;
  // Default OFF — require explicit enable after Phone provider + Twilio/MessageBird are ready.
  return false;
}

/** User-facing soft copy — never dump env var / Dashboard setup instructions. */
export function phoneOtpSetupMessage(): string {
  return "Phone SMS verification is temporarily unavailable. You can still publish listings and connect payouts without it.";
}

/** Server/dev logs only — do not return to clients. */
export function phoneOtpSetupMessageForLogs(): string {
  return "Phone SMS OTP off. Enable Phone auth in Supabase (Twilio/MessageBird), set PHONE_OTP_ENABLED=true and VITE_PHONE_OTP_ENABLED=true, ensure SUPABASE_SERVICE_ROLE_KEY.";
}

/** True when upstream/error text looks like provider or env setup dump. */
export function looksLikePhoneOtpTechDump(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("twilio") ||
    lower.includes("messagebird") ||
    lower.includes("account sid") ||
    lower.includes("auth token") ||
    lower.includes("vite_phone_otp") ||
    lower.includes("phone_otp_enabled") ||
    lower.includes("supabase_service_role") ||
    lower.includes("service_role_key") ||
    lower.includes("service role") ||
    lower.includes("provider") ||
    lower.includes("not enabled") ||
    (lower.includes("phone") &&
      (lower.includes("unsupported") || lower.includes("sms") || lower.includes("enable phone")))
  );
}

/** Never forward provider/env dumps to API clients. */
export function sanitizePhoneOtpClientError(
  raw: string | null | undefined,
  fallback: string = phoneOtpSetupMessage(),
): string {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return fallback;
  if (looksLikePhoneOtpTechDump(trimmed)) return phoneOtpSetupMessage();
  return trimmed;
}
