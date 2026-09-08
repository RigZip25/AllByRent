import {
  looksLikeMaskedHostileProfanity,
  looksLikeOffPlatformContact,
} from "./peerChatModeration";
import { sanitizeUserText } from "./textSanitize";

/**
 * What a renter writes into an ask.
 *
 * `requests` is readable by anyone, signed in or not, so a phone number or a
 * street address typed into "what I need" is published to the open internet.
 * The checks are deliberately local and deterministic: an ask must not fail to
 * post because a moderation API was unreachable, and the things we care about
 * here — contact details, an address, abuse — are recognisable without one.
 */

export type RequestTextReason =
  | "ok"
  | "empty"
  | "too_short"
  | "phone"
  | "email"
  | "address"
  | "off_platform"
  | "abusive";

export type RequestTextResult = {
  ok: boolean;
  reason: RequestTextReason;
  /** Stealth characters stripped and trimmed — store this, not the raw input. */
  cleaned: string;
};

const MIN_LENGTH = 8;

/** Seven or more digits with the usual separators: a phone number, not a size. */
const PHONE_RE = /(?:\+?\d[\s().-]{0,2}){7,}\d/u;

const EMAIL_RE = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/u;

/** "412 Oak St", "12 Elm Avenue #3" — a house number followed by a street word. */
const STREET_ADDRESS_RE =
  /\b\d{1,5}\s+[\p{L}\d'.-]+(?:\s+[\p{L}\d'.-]+){0,3}\s+(?:st|str|street|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|ct|court|pl|place|way|hwy|highway|pkwy|parkway|ter|terrace|cir|circle|apt|suite|ste|ulice|ulica|calle|avenida)\b\.?/iu;

/** US ZIP or a five-digit postal code sitting on its own. */
const POSTAL_RE = /\b\d{5}(?:-\d{4})?\b/u;

export function moderateRequestText(raw: string): RequestTextResult {
  const cleaned = sanitizeUserText(raw).trim();
  if (!cleaned) return { ok: false, reason: "empty", cleaned };
  if (cleaned.length < MIN_LENGTH) return { ok: false, reason: "too_short", cleaned };

  if (EMAIL_RE.test(cleaned)) return { ok: false, reason: "email", cleaned };
  if (PHONE_RE.test(cleaned)) return { ok: false, reason: "phone", cleaned };
  if (STREET_ADDRESS_RE.test(cleaned) || POSTAL_RE.test(cleaned)) {
    return { ok: false, reason: "address", cleaned };
  }
  if (looksLikeOffPlatformContact(cleaned)) {
    return { ok: false, reason: "off_platform", cleaned };
  }
  if (looksLikeMaskedHostileProfanity(cleaned)) {
    return { ok: false, reason: "abusive", cleaned };
  }

  return { ok: true, reason: "ok", cleaned };
}

export type RequestModerationCopy = {
  moderationEmpty: string;
  moderationTooShort: string;
  moderationPhone: string;
  moderationEmail: string;
  moderationAddress: string;
  moderationOffPlatform: string;
  moderationAbusive: string;
};

export function messageForRequestText(
  reason: RequestTextReason,
  copy: RequestModerationCopy,
): string {
  switch (reason) {
    case "empty":
      return copy.moderationEmpty;
    case "too_short":
      return copy.moderationTooShort;
    case "phone":
      return copy.moderationPhone;
    case "email":
      return copy.moderationEmail;
    case "address":
      return copy.moderationAddress;
    case "off_platform":
      return copy.moderationOffPlatform;
    case "abusive":
    default:
      return copy.moderationAbusive;
  }
}
