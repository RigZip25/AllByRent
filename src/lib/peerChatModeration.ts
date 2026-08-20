import { postLlmChat } from "./llmClient";
import { sanitizeUserText } from "./textSanitize";

export type PeerChatModerationReason =
  | "ok"
  | "blocked"
  | "off_platform"
  | "verification_failed";

export type PeerChatModerationResult = {
  ok: boolean;
  reasonCode: PeerChatModerationReason;
  /** Sanitized body (stealth chars stripped) — use this when sending. */
  cleanedBody: string;
};

/** Light pre-check for common masked English/ES/CS insults — LLM is still primary. */
const MASKED_HOSTILE_RE =
  /\b(?:f+[\s.*_\-]*u+[\s.*_\-]*c+[\s.*_\-]*k+|f[\s.*_\-]*ck|f+[\s.*_\-]*k+|sh[\s.*_\-]*[i1!][\s.*_\-]*t+|b[\s.*_\-]*[i1!][\s.*_\-]*t+[\s.*_\-]*c+[\s.*_\-]*h+|c[\s.*_\-]*u+[\s.*_\-]*n+[\s.*_\-]*t+|n+[\s.*_\-]*[i1!][\s.*_\-]*gg+[\s.*_\-]*[ae3]+r*|p[\s.*_\-]*u+[\s.*_\-]*t+[\s.*_\-]*[ao]|m[\s.*_\-]*[i1!][\s.*_\-]*[e3][\s.*_\-]*r+[\s.*_\-]*d[ao]|j[\s.*_\-]*[e3][\s.*_\-]*b+[\s.*_\-]*[aá]|k[\s.*_\-]*u+[\s.*_\-]*r+[\s.*_\-]*v[ao]|б[\s.*_\-]*л[\s.*_\-]*я[\s.*_\-]*[дт]|х[\s.*_\-]*у[\s.*_\-]*[йи]|п[\s.*_\-]*и[\s.*_\-]*[зд][\s.*_\-]*[ае])/iu;

/**
 * Off-platform contact / pay-outside patterns (store + trust safety).
 * Catches WhatsApp, Telegram, Signal, Venmo, Zelle, Cash App, PayPal.me, etc.
 */
const OFF_PLATFORM_RE =
  /(?:whats?\s*app|wa\.me\/|api\.whatsapp\.com|t(?:ele)?gram|t\.me\/|signal\.me|viber|line\.me|wechat|kakao|discord\.gg|pay\s*outside|pay\s*me\s*(?:outside|directly|cash)|cash\s*only|venmo|zelle|cash\s*app|cashapp|\$cashtag|paypal\.me|pay\s*pal\.me|wire\s*transfer|bitcoin|btc\s*wallet|crypto\s*wallet|iban\s*[:=]|call\s*me\s*(?:on|at)\s*\+?\d|text\s*me\s*(?:on|at)\s*\+?\d|(?:my|наш|mi)\s*(?:whats?app|telegram|номер|número|number)\s*[:：]?\s*\+?\d|\+\d[\d\s().-]{8,}\d)/iu;

export function looksLikeMaskedHostileProfanity(text: string): boolean {
  const normalized = sanitizeUserText(text).toLowerCase();
  return MASKED_HOSTILE_RE.test(normalized);
}

export function looksLikeOffPlatformContact(text: string): boolean {
  const normalized = sanitizeUserText(text).toLowerCase();
  return OFF_PLATFORM_RE.test(normalized);
}

const SYSTEM = `You moderate peer-to-peer marketplace chat between neighbors (rental/sale pickup).
Allow: polite coordination, prices, timing, addresses for handoff, mild frustration, in-app payment talk.
Block: insults, harassment, threats, hate, sexual harassment, scams, doxxing, extreme profanity directed at a person.
CRITICAL — also block OFF-PLATFORM contact and pay-outside: WhatsApp, Telegram, Signal, SMS/phone number sharing to leave the app, Venmo/Zelle/Cash App/PayPal.me/wire/crypto to pay outside the platform, "message me on WA", wa.me / t.me links. Keep payments and chat inside the app.
CRITICAL — also block obfuscated / evasive abuse: masked spelling (f*ck, f.u.c.k, f..k), spaced letters (f u c k), leetspeak, lookalike characters, partial words, zero-width / invisible character tricks, and hostile "fuck you" intent in ANY language (EN/ES/CS/RU slang etc.) even when spelling is incomplete. If context shows insult/hostile intent meant to bypass filters, set allowed=false.
Do not block normal logistics ("I'll be there at 5", pickup PINs, map links) or talking about the in-app deposit/payment hold.
Respond with JSON only.`;

function buildPrompt(body: string): string {
  return `Moderate this user-to-user chat message. Catch obfuscated insults, hostile intent, and off-platform contact/pay-outside.

Message: ${JSON.stringify(body)}

Return ONLY valid JSON:
{
  "allowed": <boolean>,
  "reasonCode": "ok" | "blocked" | "off_platform"
}`;
}

/** Fail-closed peer message gate. Not for automated/system messages. */
export async function moderatePeerChatMessage(
  body: string,
): Promise<PeerChatModerationResult> {
  const cleanedBody = sanitizeUserText(body).trim();
  if (!cleanedBody) {
    return { ok: false, reasonCode: "blocked", cleanedBody: "" };
  }

  if (looksLikeOffPlatformContact(cleanedBody)) {
    return { ok: false, reasonCode: "off_platform", cleanedBody };
  }

  if (looksLikeMaskedHostileProfanity(cleanedBody)) {
    return { ok: false, reasonCode: "blocked", cleanedBody };
  }

  try {
    const result = await postLlmChat({
      purpose: "chat",
      max_tokens: 80,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(cleanedBody) }],
    });
    const raw = result.text.trim();
    const jsonText = raw.startsWith("{") ? raw : raw.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonText) {
      return { ok: false, reasonCode: "verification_failed", cleanedBody };
    }
    const parsed = JSON.parse(jsonText) as {
      allowed?: unknown;
      reasonCode?: unknown;
    };
    const allowed = parsed.allowed !== false;
    const code = String(parsed.reasonCode ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const isOffPlatform =
      code === "off_platform" ||
      code === "offplatform" ||
      (!allowed && looksLikeOffPlatformContact(cleanedBody));
    if (isOffPlatform) {
      return { ok: false, reasonCode: "off_platform", cleanedBody };
    }
    if (!allowed || code === "blocked" || code === "unsafe") {
      return { ok: false, reasonCode: "blocked", cleanedBody };
    }
    return { ok: true, reasonCode: "ok", cleanedBody };
  } catch {
    return { ok: false, reasonCode: "verification_failed", cleanedBody };
  }
}

export class PeerChatModerationError extends Error {
  readonly reasonCode: PeerChatModerationReason;

  constructor(reasonCode: PeerChatModerationReason) {
    super(
      reasonCode === "verification_failed"
        ? "Could not verify message"
        : reasonCode === "off_platform"
          ? "Off-platform contact blocked"
          : "Message blocked by moderation",
    );
    this.name = "PeerChatModerationError";
    this.reasonCode = reasonCode;
  }
}
