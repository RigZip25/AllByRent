import type { ListingAiSuggestions } from "./types";

const ANTHROPIC_API_URL = "/anthropic-api/v1/messages";

const ANALYSIS_MODEL = "claude-sonnet-4-5";

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
This is replacement value — what insurance would pay to replace it if lost or damaged.
Always round to nearest $10.
Examples:
- ECHO CS-3410 chainsaw → 230 (Home Depot current price)
- Milwaukee M18 drill kit → 299 (current retail)
- Panasonic 75 inch TV → 598 (current retail)
- Beach Cruiser bike → 560 (current retail)
- REI tent 4-person → 349 (current retail)`;

type AnthropicContentBlock = {
  type: string;
  text?: string;
};

type AnthropicResponse = {
  content?: AnthropicContentBlock[];
};

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

async function photoUrlToImageBlock(photoUrl: string) {
  const response = await fetch(photoUrl);
  if (!response.ok) {
    throw new Error("Failed to read photo");
  }
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: mediaTypeFromBlob(blob),
      data: base64,
    },
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

function extractResponseText(content: AnthropicContentBlock[] | undefined): string {
  if (!content?.length) return "";
  return content
    .map((item) => (item.type === "text" && item.text ? item.text : ""))
    .filter(Boolean)
    .join("");
}

function parseSuggestions(raw: string): ListingAiSuggestions {
  const trimmed = raw.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("No JSON in Claude response");
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

async function requestListingAnalysis(
  imageBlocks: Awaited<ReturnType<typeof photoUrlToImageBlock>>[],
): Promise<ListingAiSuggestions> {
  if (imageBlocks.length === 0) {
    throw new Error("No photos to analyze");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: ANALYSIS_MODEL,
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: ANALYSIS_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
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
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude request failed (${response.status}): ${errorBody.slice(0, 200)}`);
  }

  const data = (await response.json()) as AnthropicResponse;
  const fullResponse = extractResponseText(data.content);
  if (!fullResponse.trim()) {
    throw new Error("Empty Claude response");
  }

  return parseSuggestions(fullResponse);
}

export async function analyzeListingPhotos(
  photoUrls: string[],
): Promise<ListingAiSuggestions> {
  const imageBlocks = await Promise.all(photoUrls.map((url) => photoUrlToImageBlock(url)));
  return requestListingAnalysis(imageBlocks);
}

export async function analyzeListingPhoto(blob: Blob): Promise<ListingAiSuggestions> {
  const base64 = await blobToBase64(blob);
  const mediaType = mediaTypeFromBlob(blob);
  return requestListingAnalysis([
    {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: base64,
      },
    },
  ]);
}
