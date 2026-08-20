import { postLlmChat, type LlmImagePart } from "../../lib/llmClient";
import type { MediaRef } from "../../lib/mediaStore";
import { getMediaBlob } from "../../lib/mediaStore";

export type ListingPhotoModerationReason =
  | "ok"
  | "nsfw"
  | "not_an_item"
  | "prohibited_item"
  | "category_mismatch"
  | "bad_angle"
  | "unusable_photo"
  | "verification_failed";

export type ListingPhotoModerationResult = {
  ok: boolean;
  reasonCode: ListingPhotoModerationReason;
  safe: boolean;
  isListableItem: boolean;
  /** null when host category is empty (Evorios-decide) or model skipped the check. */
  matchesCategory: boolean | null;
};

export type ListingPhotoModerationContext = {
  category?: string;
  subcategory?: string;
};

const MODERATION_SYSTEM_PROMPT =
  "You moderate rental/sale listing photos for a neighborhood marketplace. Be calm and practical. Reject unsafe content, prohibited items, and photos that are not a rentable/sellable item. Respond with JSON only.";

function buildModerationUserPrompt(ctx: ListingPhotoModerationContext): string {
  const category = (ctx.category ?? "").trim();
  const subcategory = (ctx.subcategory ?? "").trim();
  const categoryLine = category
    ? `Host-selected category: "${category}"${subcategory ? `; subcategory: "${subcategory}"` : ""}.
Set matchesCategory to true if the photo clearly shows an item that belongs in that category/subcategory, false if it clearly does not, null only if you truly cannot tell.`
    : `Host did not select a category (AI will decide later). Set matchesCategory to null and do NOT reject for category mismatch.`;

  return `Evaluate this listing photo.

${categoryLine}

Return ONLY valid JSON:
{
  "safe": <boolean — false if NSFW, sexual content, graphic violence, gore, or illegal content>,
  "isListableItem": <boolean — true only if the main subject is a rentable/sellable object or gear (tools, electronics, furniture, vehicles, sports gear, etc.). false for body parts as subject, person-as-subject selfies, pets-as-only-subject, empty scenes, screenshots of text, or junk that is not a marketplace item>,
  "prohibited": <boolean — true for weapons/firearms, explosives, drugs/drug paraphernalia, stolen-goods vibes, counterfeit IDs, hazardous chemicals, live animals as merchandise, or other clearly banned marketplace goods>,
  "matchesCategory": <boolean or null — see rules above>,
  "reasonCode": "ok" | "nsfw" | "not_an_item" | "prohibited_item" | "category_mismatch" | "bad_angle" | "unusable_photo"
}

Rules for reasonCode (pick the strongest applicable):
- "nsfw" if unsafe
- "prohibited_item" if the item itself is banned (weapons, drugs, explosives, etc.) even if "safe" framing
- "not_an_item" if safe but not a listable item
- "category_mismatch" if category was provided and the item clearly does not match
- "bad_angle" or "unusable_photo" if it is an item but too dark, extreme close-up of nothing useful, fully blurred, or otherwise unusable for a listing
- "ok" only if safe, listable, not prohibited, usable, and category matches when required`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image"));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Invalid image data"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

function mediaTypeFromBlob(blob: Blob): "image/jpeg" | "image/png" | "image/webp" {
  if (blob.type === "image/png") return "image/png";
  if (blob.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

async function blobToImagePart(blob: Blob): Promise<LlmImagePart> {
  return {
    type: "image",
    mimeType: mediaTypeFromBlob(blob),
    data: await blobToBase64(blob),
  };
}

function normalizeReasonCode(raw: unknown): ListingPhotoModerationReason {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (value === "ok") return "ok";
  if (value === "nsfw" || value === "unsafe") return "nsfw";
  if (value === "prohibited_item" || value === "prohibited" || value === "banned_item") {
    return "prohibited_item";
  }
  if (value === "not_an_item" || value === "not_item" || value === "person") return "not_an_item";
  if (value === "category_mismatch" || value === "wrong_category") return "category_mismatch";
  if (value === "bad_angle") return "bad_angle";
  if (value === "unusable_photo" || value === "unusable") return "unusable_photo";
  return "unusable_photo";
}

function parseModerationResponse(
  raw: string,
  ctx: ListingPhotoModerationContext,
): ListingPhotoModerationResult {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("No JSON in moderation response");
  }

  const parsed = JSON.parse(jsonText) as {
    safe?: unknown;
    isListableItem?: unknown;
    prohibited?: unknown;
    matchesCategory?: unknown;
    reasonCode?: unknown;
  };

  const categorySet = Boolean((ctx.category ?? "").trim());
  const safe = parsed.safe !== false;
  const isListableItem = parsed.isListableItem !== false;
  const prohibited = parsed.prohibited === true;
  let matchesCategory: boolean | null;
  if (!categorySet) {
    matchesCategory = null;
  } else if (parsed.matchesCategory === null || parsed.matchesCategory === undefined) {
    matchesCategory = null;
  } else {
    matchesCategory = Boolean(parsed.matchesCategory);
  }

  let reasonCode = normalizeReasonCode(parsed.reasonCode);

  // Fail closed on clear unsafe / non-item signals even if reasonCode is soft.
  if (!safe) reasonCode = "nsfw";
  else if (prohibited || reasonCode === "prohibited_item") reasonCode = "prohibited_item";
  else if (!isListableItem) reasonCode = "not_an_item";
  else if (categorySet && matchesCategory === false) reasonCode = "category_mismatch";
  else if (reasonCode === "ok" && categorySet && matchesCategory === false) {
    reasonCode = "category_mismatch";
  }

  // When category is empty, never hard-block on category_mismatch from the model.
  if (!categorySet && reasonCode === "category_mismatch") {
    reasonCode = isListableItem && safe && !prohibited ? "ok" : reasonCode;
  }

  const ok =
    reasonCode === "ok" &&
    safe &&
    !prohibited &&
    isListableItem &&
    (matchesCategory === null || matchesCategory === true);

  return {
    ok,
    reasonCode: ok ? "ok" : reasonCode === "ok" ? "unusable_photo" : reasonCode,
    safe,
    isListableItem,
    matchesCategory,
  };
}

async function requestWithRetry<T>(run: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      const retryable = /429|500|502|503|504|rate limit|temporarily unavailable/i.test(message);
      if (!retryable || attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, attempt === 1 ? 400 : 900));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Photo moderation failed");
}

const verificationFailedResult = (): ListingPhotoModerationResult => ({
  ok: false,
  reasonCode: "verification_failed",
  safe: false,
  isListableItem: false,
  matchesCategory: null,
});

/** Vision gate before PhotoRoom / listing AI. Fail-closed on API errors (NSFW risk). */
export async function moderateListingPhotoBlob(
  blob: Blob,
  ctx: ListingPhotoModerationContext = {},
): Promise<ListingPhotoModerationResult> {
  try {
    const image = await blobToImagePart(blob);
    const fullResponse = await requestWithRetry(async () => {
      const result = await postLlmChat({
        purpose: "vision",
        max_tokens: 300,
        system: MODERATION_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              image,
              {
                type: "text",
                text: buildModerationUserPrompt(ctx),
              },
            ],
          },
        ],
      });
      return result.text;
    });

    if (!fullResponse.trim()) {
      return verificationFailedResult();
    }

    return parseModerationResponse(fullResponse, ctx);
  } catch {
    // Safer to block with retry than silently proceed toward publish/enhancement.
    return verificationFailedResult();
  }
}

export async function moderateListingMediaPhotos(
  photos: MediaRef[],
  ctx: ListingPhotoModerationContext = {},
): Promise<ListingPhotoModerationResult> {
  if (photos.length === 0) {
    return {
      ok: false,
      reasonCode: "unusable_photo",
      safe: true,
      isListableItem: false,
      matchesCategory: null,
    };
  }

  for (const ref of photos) {
    const blob = await getMediaBlob(ref.id);
    if (!blob) {
      return verificationFailedResult();
    }
    const result = await moderateListingPhotoBlob(blob, ctx);
    if (!result.ok) return result;
  }

  return {
    ok: true,
    reasonCode: "ok",
    safe: true,
    isListableItem: true,
    matchesCategory: (ctx.category ?? "").trim() ? true : null,
  };
}

export type ListingPhotoModerationCopy = {
  moderationNotListable: string;
  moderationProhibitedItem: string;
  moderationCategoryMismatch: string;
  moderationBadAngle: string;
  moderationVerifyFailed: string;
};

export function messageForPhotoModeration(
  reasonCode: ListingPhotoModerationReason,
  copy: ListingPhotoModerationCopy,
): string {
  switch (reasonCode) {
    case "category_mismatch":
      return copy.moderationCategoryMismatch;
    case "prohibited_item":
      return copy.moderationProhibitedItem;
    case "bad_angle":
    case "unusable_photo":
      return copy.moderationBadAngle;
    case "verification_failed":
      return copy.moderationVerifyFailed;
    case "nsfw":
    case "not_an_item":
    default:
      return copy.moderationNotListable;
  }
}
