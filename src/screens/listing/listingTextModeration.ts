import { postLlmChat } from "../../lib/llmClient";
import { looksLikeMaskedHostileProfanity } from "../../lib/peerChatModeration";
import { sanitizeUserText } from "../../lib/textSanitize";

export type ListingTextModerationReason =
  | "ok"
  | "unsafe"
  | "not_suitable"
  | "category_mismatch"
  | "verification_failed";

export type ListingTextModerationResult = {
  ok: boolean;
  reasonCode: ListingTextModerationReason;
  safe: boolean;
  isAboutListableItem: boolean;
  /** null when category empty or check skipped / soft-inconclusive. */
  matchesCategory: boolean | null;
};

export type ListingTextModerationInput = {
  title: string;
  description: string;
  category?: string;
  subcategory?: string;
};

const TEXT_MODERATION_SYSTEM =
  "You moderate rental/sale listing title and description for a neighborhood marketplace. Be calm and practical. Prefer allowing creative but honest titles. Reject clear policy violations including obfuscated insults/hostile abuse (masked profanity, spaced letters, leetspeak, lookalikes, incomplete spellings in any language) when used as insults or hate. Respond with JSON only.";

function buildTextModerationPrompt(input: ListingTextModerationInput): string {
  const category = (input.category ?? "").trim();
  const subcategory = (input.subcategory ?? "").trim();
  const categoryLine = category
    ? `Host-selected category: "${category}"${subcategory ? `; subcategory: "${subcategory}"` : ""}.
matchesCategory: soft check only — set false ONLY if title/description clearly advertise a totally different kind of item (e.g. a car when category is Camping tents). Do NOT reject creative, short, or slightly vague titles that could still fit.`
    : `No host category selected. Set matchesCategory to null. Do not reject for category mismatch.`;

  return `Moderate this listing text.

Title: ${JSON.stringify(input.title.trim())}
Description: ${JSON.stringify(input.description.trim())}

${categoryLine}

Also reject obfuscated hostile language (f*ck, f..k, f u c k, leetspeak, lookalikes, EN/ES/CS/RU slang masks) when used as insult/harassment — not ordinary product words.

Return ONLY valid JSON:
{
  "safe": <boolean — false for NSFW, sexual content, harassment, hate, scams, fraud, threats, illegal activity, or obfuscated insults>,
  "isAboutListableItem": <boolean — true if text is about a rentable/sellable item or gear; false for garbage, spam, off-platform contact farming (phone/WhatsApp/Telegram/email spam with no item), or content that is not a marketplace listing>,
  "matchesCategory": <boolean or null — soft check; see rules above>,
  "reasonCode": "ok" | "unsafe" | "not_suitable" | "category_mismatch"
}

reasonCode rules (strongest first):
- "unsafe" if not safe (including obfuscated hostile abuse)
- "not_suitable" if safe but not about a listable item / garbage / contact spam
- "category_mismatch" only for a clear, obvious mismatch when category was provided
- "ok" otherwise — when unsure on soft category fit, prefer "ok"`;
}

function normalizeReason(raw: unknown): ListingTextModerationReason {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (value === "ok") return "ok";
  if (value === "unsafe" || value === "nsfw" || value === "harassment" || value === "scam") {
    return "unsafe";
  }
  if (value === "not_suitable" || value === "not_an_item" || value === "garbage" || value === "spam") {
    return "not_suitable";
  }
  if (value === "category_mismatch" || value === "wrong_category") return "category_mismatch";
  return "not_suitable";
}

function parseTextModeration(
  raw: string,
  input: ListingTextModerationInput,
): ListingTextModerationResult {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error("No JSON in text moderation response");

  const parsed = JSON.parse(jsonText) as {
    safe?: unknown;
    isAboutListableItem?: unknown;
    matchesCategory?: unknown;
    reasonCode?: unknown;
  };

  const categorySet = Boolean((input.category ?? "").trim());
  const safe = parsed.safe !== false;
  const isAboutListableItem = parsed.isAboutListableItem !== false;
  let matchesCategory: boolean | null;
  if (!categorySet) {
    matchesCategory = null;
  } else if (parsed.matchesCategory === null || parsed.matchesCategory === undefined) {
    matchesCategory = null;
  } else {
    matchesCategory = Boolean(parsed.matchesCategory);
  }

  let reasonCode = normalizeReason(parsed.reasonCode);
  if (!safe) reasonCode = "unsafe";
  else if (!isAboutListableItem) reasonCode = "not_suitable";
  else if (categorySet && matchesCategory === false) reasonCode = "category_mismatch";

  if (!categorySet && reasonCode === "category_mismatch") {
    reasonCode = safe && isAboutListableItem ? "ok" : reasonCode;
  }

  const ok =
    reasonCode === "ok" &&
    safe &&
    isAboutListableItem &&
    (matchesCategory === null || matchesCategory === true);

  return {
    ok,
    reasonCode: ok ? "ok" : reasonCode === "ok" ? "not_suitable" : reasonCode,
    safe,
    isAboutListableItem,
    matchesCategory,
  };
}

const verificationFailed = (): ListingTextModerationResult => ({
  ok: false,
  reasonCode: "verification_failed",
  safe: false,
  isAboutListableItem: false,
  matchesCategory: null,
});

/** Text-only LLM gate (purpose: chat). Fail-closed on API errors. */
export async function moderateListingText(
  input: ListingTextModerationInput,
): Promise<ListingTextModerationResult> {
  const title = sanitizeUserText(input.title).trim();
  const description = sanitizeUserText(input.description).trim();
  if (!title && !description) {
    return {
      ok: false,
      reasonCode: "not_suitable",
      safe: true,
      isAboutListableItem: false,
      matchesCategory: null,
    };
  }

  if (looksLikeMaskedHostileProfanity(`${title}\n${description}`)) {
    return {
      ok: false,
      reasonCode: "unsafe",
      safe: false,
      isAboutListableItem: true,
      matchesCategory: null,
    };
  }

  try {
    const result = await postLlmChat({
      purpose: "chat",
      max_tokens: 250,
      system: TEXT_MODERATION_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildTextModerationPrompt({
            ...input,
            title,
            description,
          }),
        },
      ],
    });

    if (!result.text.trim()) return verificationFailed();
    return parseTextModeration(result.text, input);
  } catch {
    return verificationFailed();
  }
}

export type ListingTextModerationCopy = {
  moderationTextNotSuitable: string;
  moderationTextCategoryMismatch: string;
  moderationTextVerifyFailed: string;
};

export function messageForTextModeration(
  reasonCode: ListingTextModerationReason,
  copy: ListingTextModerationCopy,
): string {
  switch (reasonCode) {
    case "category_mismatch":
      return copy.moderationTextCategoryMismatch;
    case "verification_failed":
      return copy.moderationTextVerifyFailed;
    case "unsafe":
    case "not_suitable":
    default:
      return copy.moderationTextNotSuitable;
  }
}
