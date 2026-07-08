/** Supabase email OTP length varies by project (6 or 8 digits). */
export const EMAIL_OTP_LENGTHS = [6, 8] as const;

export const EMAIL_OTP_MAX_LENGTH = 8;

export function normalizeEmailOtpInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, EMAIL_OTP_MAX_LENGTH);
}

export function isCompleteEmailOtpLength(length: number): boolean {
  return EMAIL_OTP_LENGTHS.includes(length as (typeof EMAIL_OTP_LENGTHS)[number]);
}

export function emailOtpLengthHint(): string {
  return "6 or 8 digits";
}

export function emailOtpEntryError(): string {
  return `Enter the full code from your email (${emailOtpLengthHint()}).`;
}
