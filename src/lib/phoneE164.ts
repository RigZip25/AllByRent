/** Normalize user input to E.164 for Supabase phone OTP. */
export function normalizePhoneToE164(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (raw.startsWith("+")) {
    const digits = raw.slice(1).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

/** Prefer US display format when +1; otherwise keep E.164. */
export function phoneDigitsForDisplay(e164OrStored: string): string {
  const trimmed = e164OrStored.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    const n = digits.slice(1);
    return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return trimmed.startsWith("+") ? trimmed : digits ? `+${digits}` : trimmed;
}

export function isPhoneOtpClientEnabled(): boolean {
  const flag = String(import.meta.env.VITE_PHONE_OTP_ENABLED ?? "")
    .trim()
    .toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off" || flag === "no") return false;
  if (flag === "1" || flag === "true" || flag === "on" || flag === "yes") return true;
  // Default OFF until Twilio/MessageBird is configured in Supabase + env flags set.
  return false;
}

/** Soft user-facing copy when SMS OTP is off. */
export function phoneOtpSoftUnavailableMessage(): string {
  return "Phone SMS verification is temporarily unavailable. You can still publish listings and connect payouts without it.";
}

/** Dev/console only — never show to end users. */
export function phoneOtpDevSetupHint(): string {
  return "Phone SMS OTP off. Enable Phone in Supabase Auth (Twilio), set VITE_PHONE_OTP_ENABLED=true and PHONE_OTP_ENABLED=true, ensure SUPABASE_SERVICE_ROLE_KEY.";
}

/** True when a string looks like provider/env setup dump (never show in UI). */
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
    (lower.includes("phone") &&
      (lower.includes("provider") ||
        lower.includes("not enabled") ||
        lower.includes("unsupported") ||
        lower.includes("sms otp off") ||
        lower.includes("enable phone")))
  );
}

/**
 * Strip provider/env setup text from any client-facing phone OTP reason.
 * Safe fallbacks keep TestFlight users away from developer dump.
 */
export function sanitizePhoneOtpUserReason(
  raw: string | null | undefined,
  fallback: string = phoneOtpSoftUnavailableMessage(),
): string {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return fallback;
  if (looksLikePhoneOtpTechDump(trimmed)) return phoneOtpSoftUnavailableMessage();
  return trimmed;
}
