import type { VercelRequest } from "@vercel/node";
import { z } from "zod";
import type { ClassifyImage } from "./classify";

export function readJsonBody(req: VercelRequest): unknown {
  if (typeof req.body === "string") {
    const trimmed = req.body.trim();
    if (!trimmed) return {};
    return JSON.parse(trimmed) as unknown;
  }
  if (req.body && typeof req.body === "object") return req.body;
  return {};
}

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Client downscales to ~1024px before upload; this is the hard ceiling. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const imagePayloadSchema = z.object({
  mimeType: z.enum(SUPPORTED_IMAGE_TYPES),
  data: z.string().min(32),
});

export type ImageValidation =
  | { ok: true; images: ClassifyImage[] }
  | { ok: false; code: "unsupported_image" | "invalid_request"; message: string };

function decodedByteLength(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function validateImages(raw: unknown, max: number): ImageValidation {
  const parsed = z.array(imagePayloadSchema).min(1).max(max).safeParse(raw);
  if (!parsed.success) {
    const hasWrongType = parsed.error.issues.some((issue) => issue.path.includes("mimeType"));
    return hasWrongType
      ? { ok: false, code: "unsupported_image", message: "Only JPEG, PNG, or WebP photos are supported" }
      : { ok: false, code: "invalid_request", message: "images must be a non-empty array" };
  }

  for (const image of parsed.data) {
    if (decodedByteLength(image.data) > MAX_IMAGE_BYTES) {
      return { ok: false, code: "unsupported_image", message: "Photo is too large to analyze" };
    }
  }

  return { ok: true, images: parsed.data };
}
