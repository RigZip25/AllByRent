import { postLlmChat, type LlmImagePart } from "../../lib/llmClient";
import type { MediaRef } from "../../lib/mediaStore";
import { getMediaBlob } from "../../lib/mediaStore";
import { downscaleBlobForVision } from "./photoUtils";

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
  /** 1-based position of the photo that failed, when a gallery was checked. */
  photoNumber?: number;
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
    const lean = await downscaleBlobForVision(blob);
    const image = await blobToImagePart(lean);
    const fullResponse = await requestWithRetry(async () => {
      const result = await postLlmChat({
        purpose: "vision",
        max_tokens: 220,
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

/** A vision call takes a second or two; three at a time keeps twelve photos bearable. */
const GALLERY_CONCURRENCY = 3;

/**
 * Verdicts already paid for, keyed by the photo and by the shelf it was judged
 * against. The gallery is checked twice — once on the photos step, again once
 * the shelf is known — and without this the second pass would re-bill every
 * photo whose answer cannot have changed.
 */
const verdicts = new Map<string, ListingPhotoModerationResult>();
const VERDICT_LIMIT = 240;

function verdictKey(mediaId: string, ctx: ListingPhotoModerationContext): string {
  const category = (ctx.category ?? "").trim().toLowerCase();
  const subcategory = (ctx.subcategory ?? "").trim().toLowerCase();
  return `${mediaId}|${category}|${subcategory}`;
}

function rememberVerdict(key: string, result: ListingPhotoModerationResult) {
  // A failure to reach the model says nothing about the photo — ask again.
  if (result.reasonCode === "verification_failed") return;
  if (verdicts.size >= VERDICT_LIMIT) {
    const oldest = verdicts.keys().next();
    if (!oldest.done) verdicts.delete(oldest.value);
  }
  verdicts.set(key, result);
}

/**
 * Carry the verdict from the upload check over to the stored photo, so the
 * gate on Continue does not pay a second time for an answer it already has.
 */
export function rememberPhotoModerationVerdict(
  mediaId: string,
  ctx: ListingPhotoModerationContext,
  result: ListingPhotoModerationResult,
) {
  rememberVerdict(verdictKey(mediaId, ctx), result);
}

async function moderateStoredPhoto(
  ref: MediaRef,
  ctx: ListingPhotoModerationContext,
): Promise<ListingPhotoModerationResult> {
  const key = verdictKey(ref.id, ctx);
  const known = verdicts.get(key);
  if (known) return known;

  const blob = await getMediaBlob(ref.id);
  if (!blob) return verificationFailedResult();
  const result = await moderateListingPhotoBlob(blob, ctx);
  rememberVerdict(key, result);
  return result;
}

/**
 * Vision gate on Continue, on re-analyze and once the shelf is picked.
 *
 * Every photo is checked, not a sample of two: the eleven photos after the
 * cover reach the same neighbours, and a shelf mismatch cannot be seen at all
 * until the host has picked a shelf, which happens after this step.
 */
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

  const results: (ListingPhotoModerationResult | undefined)[] = new Array(photos.length);
  let next = 0;
  let rejected = false;

  const worker = async () => {
    for (;;) {
      // One bad photo stops the rest: the host has to deal with it either way.
      if (rejected) return;
      const index = next;
      next += 1;
      if (index >= photos.length) return;
      const result = await moderateStoredPhoto(photos[index], ctx);
      results[index] = result;
      if (!result.ok) rejected = true;
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(GALLERY_CONCURRENCY, photos.length) }, worker),
  );

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    if (result && !result.ok) return { ...result, photoNumber: index + 1 };
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
  moderationPhotoNumber: (position: number) => string;
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

/** Same message, but says which shot it is — the cover is rarely the problem one. */
export function messageForGalleryModeration(
  result: ListingPhotoModerationResult,
  copy: ListingPhotoModerationCopy,
): string {
  const message = messageForPhotoModeration(result.reasonCode, copy);
  if (!result.photoNumber || result.photoNumber < 2) return message;
  return `${copy.moderationPhotoNumber(result.photoNumber)}${message}`;
}
