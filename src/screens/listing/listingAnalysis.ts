import { postLlmChat, type LlmImagePart } from "../../lib/llmClient";
import type { MediaRef } from "../../lib/mediaStore";
import { getMediaBlob } from "../../lib/mediaStore";
import type { ListingAiSuggestions } from "./types";

const ANALYSIS_PROMPT_VERSION = "2026-07-09-llm-v1";

const ANALYSIS_SYSTEM_PROMPT =
  "You are a product identification expert. Analyze product photos and return accurate item details. Always respond in the same language the user's device is set to.";

const ANALYSIS_USER_PROMPT = `Analyze these product photos carefully.
READ ALL VISIBLE TEXT — brand names, model numbers, size markings, specifications, labels.
Return ONLY valid JSON, no other text:
{
  "title": "Brand + Model + key spec (max 80 chars)",
  "category": "MUST be exactly one of: Outdoor & Camping, Electronics & Tech, Photo & Video, Garden & Yard, Drones, Party & Events, Gym & Fitness, Boats & Water, Real Estate, Furniture, Music & Audio, Vehicles, Costume & Cosplay, Tools & DIY, Heavy Equipment, Construction, Bikes & Scooters, Home & Kitchen, Office & Business, Unique & Other",
  "subcategory": "2-3 word description fitting the category",
  "grade": "personal or professional",
  "condition": "new or like_new or good or fair",
  "description": "2-3 sentences: what it is, key features visible, what's included, ideal use case. Professional tone. Max 300 chars.",
  "estimatedValue": <current retail price to buy this item NEW today>
}
estimatedValue: current retail price to buy this item NEW today. Use MSRP or current Amazon/Home Depot/Best Buy price — not used/secondhand price.
This is replacement value — what we'd use to size a deposit hold if the item is lost or damaged.
Always round to nearest $10.
Examples:
- ECHO CS-3410 chainsaw → 230 (Home Depot current price)
- Milwaukee M18 drill kit → 299 (current retail)
- Panasonic 75 inch TV → 598 (current retail)
- Beach Cruiser bike → 560 (current retail)
- REI tent 4-person → 349 (current retail)`;

const CACHE_PREFIX = "allbyrent:listings:ai-analysis:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const RATE_LIMIT_PREFIX = "allbyrent:listings:ai-analysis:rate:";
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 2;

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

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function blobHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return sha256Hex(buffer);
}

function cacheKeyForHashes(hashes: string[]): string {
  const stable = [...hashes].sort();
  return `${ANALYSIS_PROMPT_VERSION}|${stable.join(",")}`;
}

function getCachedSuggestions(key: string): ListingAiSuggestions | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; value: ListingAiSuggestions };
    if (!parsed?.at || !parsed?.value) return null;
    if (Date.now() - parsed.at > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function setCachedSuggestions(key: string, value: ListingAiSuggestions) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ at: Date.now(), value }),
    );
  } catch {
    // Best-effort cache only (quota/serialization may fail).
  }
}

function enforceRateLimit() {
  const now = Date.now();
  const bucketKey = `${RATE_LIMIT_PREFIX}${ANALYSIS_PROMPT_VERSION}`;
  const arr = (() => {
    try {
      const raw = localStorage.getItem(bucketKey);
      const parsed = raw ? (JSON.parse(raw) as number[]) : [];
      return parsed.filter((ts) => typeof ts === "number" && now - ts < RATE_LIMIT_WINDOW_MS);
    } catch {
      return [];
    }
  })();

  if (arr.length >= RATE_LIMIT_MAX) {
    throw new Error("AI analysis rate limit exceeded. Try again in a minute.");
  }

  arr.push(now);
  try {
    localStorage.setItem(bucketKey, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

async function requestWithRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      const retryable = /429|500|502|503|504|rate limit|temporarily unavailable/i.test(message);
      if (!retryable || attempt === attempts) break;
      const waitMs = attempt === 1 ? 500 : 1200;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("AI analysis failed");
}

async function blobToImagePart(blob: Blob): Promise<LlmImagePart> {
  return {
    type: "image",
    mimeType: mediaTypeFromBlob(blob),
    data: await blobToBase64(blob),
  };
}

function normalizeGrade(value: string): ListingAiSuggestions["grade"] {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("professional")) return "professional";
  return "personal";
}

function normalizeCondition(value: string): ListingAiSuggestions["condition"] {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "like_new" || normalized.includes("like")) return "like_new";
  if (normalized === "new") return "new";
  if (normalized === "fair") return "fair";
  return "good";
}

function parseSuggestions(raw: string): ListingAiSuggestions {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("No JSON in AI response");
  }

  const parsed = JSON.parse(jsonText) as Partial<ListingAiSuggestions>;
  return {
    title: String(parsed.title ?? "").trim(),
    category: String(parsed.category ?? "").trim(),
    subcategory: String(parsed.subcategory ?? "").trim(),
    grade: normalizeGrade(String(parsed.grade ?? "personal")),
    condition: normalizeCondition(String(parsed.condition ?? "good")),
    description: String(parsed.description ?? "").trim(),
    estimatedValue: Math.round(Number(parsed.estimatedValue ?? 0) / 10) * 10,
  };
}

async function requestListingAnalysis(imageBlocks: LlmImagePart[]): Promise<ListingAiSuggestions> {
  if (imageBlocks.length === 0) {
    throw new Error("No photos to analyze");
  }

  const fullResponse = await requestWithRetry(async () => {
    const result = await postLlmChat({
      purpose: "vision",
      max_tokens: 800,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: ANALYSIS_USER_PROMPT,
            },
          ],
        },
      ],
    });
    return result.text;
  });

  if (!fullResponse.trim()) {
    throw new Error("Empty AI response");
  }

  return parseSuggestions(fullResponse);
}

const inFlight = new Map<string, Promise<ListingAiSuggestions>>();

export async function analyzeListingPhotos(
  photoUrls: string[],
): Promise<ListingAiSuggestions> {
  if (photoUrls.length === 0) {
    throw new Error("No photos to analyze");
  }

  const blobs = await Promise.all(
    photoUrls.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to read photo");
      return response.blob();
    }),
  );

  const hashes = await Promise.all(blobs.map((blob) => blobHash(blob)));
  const key = cacheKeyForHashes(hashes);

  const cached = getCachedSuggestions(key);
  if (cached) return cached;

  const existing = inFlight.get(key);
  if (existing) return existing;

  enforceRateLimit();

  const promise = (async () => {
    const imageBlocks = await Promise.all(blobs.map((blob) => blobToImagePart(blob)));
    const suggestions = await requestListingAnalysis(imageBlocks);
    setCachedSuggestions(key, suggestions);
    return suggestions;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

export async function analyzeListingPhoto(blob: Blob): Promise<ListingAiSuggestions> {
  return requestListingAnalysis([await blobToImagePart(blob)]);
}

export async function analyzeListingMediaPhotos(photos: MediaRef[]): Promise<ListingAiSuggestions> {
  const blobs = await Promise.all(
    photos.map(async (ref) => {
      const blob = await getMediaBlob(ref.id);
      if (!blob) throw new Error("Missing photo");
      return blob;
    }),
  );
  const hashes = await Promise.all(blobs.map((blob) => blobHash(blob)));
  const key = cacheKeyForHashes(hashes);

  const cached = getCachedSuggestions(key);
  if (cached) return cached;

  const existing = inFlight.get(key);
  if (existing) return existing;

  enforceRateLimit();

  const promise = (async () => {
    const imageBlocks = await Promise.all(blobs.map((blob) => blobToImagePart(blob)));
    const suggestions = await requestListingAnalysis(imageBlocks);
    setCachedSuggestions(key, suggestions);
    return suggestions;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}
