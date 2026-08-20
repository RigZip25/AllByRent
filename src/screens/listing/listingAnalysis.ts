import { postLlmChat, type LlmImagePart } from "../../lib/llmClient";
import type { MediaRef } from "../../lib/mediaStore";
import { getMediaBlob } from "../../lib/mediaStore";
import { getSearchCountryCode } from "../../lib/locationCountry";
import {
  buildListingValuePricingInstructions,
  listingPricingMarket,
  roundMoneyForSuggestion,
} from "../../lib/regionalDisplay";
import type { ListingAiSuggestions } from "./types";

const ANALYSIS_PROMPT_VERSION = "2026-08-20-vehicle-year-color-v1";

const ANALYSIS_SYSTEM_PROMPT =
  "You are a product identification and local-market pricing expert. Analyze product photos and return accurate item details. Always respond in the same language the user's device is set to. Replacement/estimated values MUST use the marketplace currency given in the user message — never default to USD unless that is the marketplace currency.";

function buildAnalysisUserPrompt(): string {
  const market = listingPricingMarket();
  return `Analyze these product photos carefully.
READ ALL VISIBLE TEXT — brand names, model numbers, size markings, specifications, labels.
Return ONLY valid JSON, no other text:
{
  "title": "Brand + Model + key spec (max 80 chars)",
  "category": "MUST be exactly one of: Outdoor & Camping, Electronics & Tech, Photo & Video, Garden & Yard, Drones, Party & Events, Gym & Fitness, Boats & Water, Real Estate, Furniture, Music & Audio, Vehicles, Costume & Cosplay, Tools & DIY, Heavy Equipment, Construction, Bikes & Scooters, Home & Kitchen, Office & Business, Unique & Other",
  "subcategory": "2-3 word description fitting the category",
  "grade": "personal or professional",
  "condition": "new or like_new or good or fair",
  "description": "2-3 sentences: what it is, key features visible, what's included, ideal use case. Professional tone. Max 300 chars.",
  "estimatedValue": <integer NEW retail price in ${market.currencyCode}>,
  "estimatedValueCurrency": "${market.currencyCode}",
  "brand": "Manufacturer brand only (e.g. HP, Sony, Nissan). Empty string if unknown.",
  "model": "Model / product line without brand or screen size (e.g. OmniBook X, Altima). Empty string if unknown.",
  "screenInches": <number diagonal inches if a screen is visible/labeled, else omit>,
  "personCapacity": <integer sleeps/seats when labeled (e.g. 4 for a 4-person tent), else omit>,
  "seasonRating": <1|2|3|4 when a season rating is labeled on tents/bags, else omit>,
  "year": <integer model year for vehicles when body style/generation is recognizable — pick best guess or midpoint of the generation range (e.g. current-gen Altima is not 2019); omit if not a vehicle or not confident>,
  "color": "Dominant exterior/item color key — MUST be exactly one of: black, white, gray, red, blue, green, yellow, pink, purple, orange, brown, multicolor, other_color. Omit if unsure."
}

${buildListingValuePricingInstructions()}

Examples (illustrative — always adapt to the market above):
- Mid-range cordless drill kit → typical NEW shelf price in ${market.countryLabel} (${market.currencyCode})
- 4-person camping tent → typical NEW outdoor-store price in ${market.countryLabel}
- Entry DSLR/mirrorless body → typical NEW electronics price in ${market.countryLabel}
Do not invent used marketplace prices. Prefer current NEW retail.`;
}

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
  const market = listingPricingMarket();
  return `${ANALYSIS_PROMPT_VERSION}|${market.countryCode}|${market.currencyCode}|${stable.join(",")}`;
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

  const parsed = JSON.parse(jsonText) as Partial<ListingAiSuggestions> & {
    estimatedValueCurrency?: string;
    screenInches?: number | string;
    personCapacity?: number | string;
    seasonRating?: number | string;
    year?: number | string;
    yearMin?: number | string;
    yearMax?: number | string;
    color?: string;
  };
  const market = listingPricingMarket(getSearchCountryCode());
  const rawValue = Number(parsed.estimatedValue ?? 0);
  const brand = String(parsed.brand ?? "").trim();
  const model = String(parsed.model ?? "").trim();
  const screenRaw = Number(parsed.screenInches);
  const screenInches =
    Number.isFinite(screenRaw) && screenRaw > 0 ? screenRaw : undefined;
  const personRaw = Number(parsed.personCapacity);
  const personCapacity =
    Number.isFinite(personRaw) && personRaw > 0 ? Math.round(personRaw) : undefined;
  const seasonRaw = Number(parsed.seasonRating);
  const seasonRating =
    Number.isFinite(seasonRaw) && seasonRaw >= 1 && seasonRaw <= 4
      ? Math.round(seasonRaw)
      : undefined;
  const year = resolveSuggestedYear(parsed);
  const color = normalizeSuggestedColor(String(parsed.color ?? ""));
  return {
    title: String(parsed.title ?? "").trim(),
    category: String(parsed.category ?? "").trim(),
    subcategory: String(parsed.subcategory ?? "").trim(),
    grade: normalizeGrade(String(parsed.grade ?? "personal")),
    condition: normalizeCondition(String(parsed.condition ?? "good")),
    description: String(parsed.description ?? "").trim(),
    estimatedValue: roundMoneyForSuggestion(rawValue),
    estimatedValueCurrency: market.currencyCode,
    ...(brand ? { brand } : {}),
    ...(model ? { model } : {}),
    ...(screenInches != null ? { screenInches } : {}),
    ...(personCapacity != null ? { personCapacity } : {}),
    ...(seasonRating != null ? { seasonRating } : {}),
    ...(year != null ? { year } : {}),
    ...(color ? { color } : {}),
  };
}

const KNOWN_COLOR_KEYS = new Set([
  "black",
  "white",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
  "purple",
  "orange",
  "brown",
  "multicolor",
  "other_color",
]);

const COLOR_ALIASES: Record<string, string> = {
  grey: "gray",
  silver: "gray",
  charcoal: "gray",
  beige: "brown",
  tan: "brown",
  gold: "yellow",
  navy: "blue",
  teal: "green",
  maroon: "red",
  burgundy: "red",
  cream: "white",
  ivory: "white",
  multi: "multicolor",
  multicolour: "multicolor",
  other: "other_color",
};

function normalizeSuggestedColor(raw: string): string | undefined {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (!key) return undefined;
  const mapped = COLOR_ALIASES[key] ?? key;
  return KNOWN_COLOR_KEYS.has(mapped) ? mapped : undefined;
}

function clampModelYear(year: number): number | undefined {
  const max = new Date().getFullYear() + 1;
  if (!Number.isFinite(year)) return undefined;
  const rounded = Math.round(year);
  if (rounded < 1950 || rounded > max) return undefined;
  return rounded;
}

function resolveSuggestedYear(parsed: {
  year?: number | string;
  yearMin?: number | string;
  yearMax?: number | string;
}): number | undefined {
  const direct = clampModelYear(Number(parsed.year));
  if (direct != null) return direct;
  const min = clampModelYear(Number(parsed.yearMin));
  const max = clampModelYear(Number(parsed.yearMax));
  if (min != null && max != null) {
    return clampModelYear(Math.round((min + max) / 2));
  }
  return min ?? max;
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
              text: buildAnalysisUserPrompt(),
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
