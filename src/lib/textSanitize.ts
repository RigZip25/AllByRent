/**
 * Strip stealth / zero-width / bidi-override characters used to obfuscate abuse.
 * Also NFKC-normalize so lookalike forms collapse before moderation.
 */
const STEALTH_CHARS_RE =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\u00AD\u180E]/g;

export function stripStealthCharacters(text: string): string {
  return text.replace(STEALTH_CHARS_RE, "");
}

export function sanitizeUserText(text: string): string {
  return stripStealthCharacters(text).normalize("NFKC");
}

/** Collapse spaced-out single letters that often mask insults (f u c k). Soft helper only. */
export function collapseSpacedLetters(text: string): string {
  return text.replace(/\b(?:[a-zа-яё]\s+){2,}[a-zа-яё]\b/giu, (match) =>
    match.replace(/\s+/g, ""),
  );
}
