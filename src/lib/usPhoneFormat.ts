/** Strip to up to 10 US national digits (drops a leading country code 1). */
export function stripUsPhoneDigits(input: string): string {
  const digits = input.replace(/\D/g, "");
  const national =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return national.slice(0, 10);
}

/** Progressive US display format: (555) 123-4567 */
export function formatUsPhoneInput(input: string): string {
  const digits = stripUsPhoneDigits(input);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Format stored values (+1…, raw digits, partial) for display. */
export function formatUsPhoneDisplay(stored: string): string {
  const trimmed = stored.trim();
  if (!trimmed) return "";
  const digits = stripUsPhoneDigits(trimmed);
  if (digits.length === 0) return trimmed;
  return formatUsPhoneInput(digits);
}

/** Canonical value saved in profile / auth (US display format, no +1 prefix). */
export function normalizeUsPhoneForStorage(input: string): string {
  const digits = stripUsPhoneDigits(input);
  if (digits.length === 0) return "";
  return formatUsPhoneInput(digits);
}
