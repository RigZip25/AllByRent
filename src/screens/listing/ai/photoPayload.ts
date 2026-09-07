import { getMediaBlob, type MediaRef } from "../../../lib/mediaStore";
import { downscaleBlobForVision } from "../photoUtils";
import { AI_CATEGORY_CONFIG } from "./aiConfig";

export type AiImagePayload = { mimeType: "image/jpeg" | "image/png" | "image/webp"; data: string };

function supportedMimeType(blob: Blob): AiImagePayload["mimeType"] {
  if (blob.type === "image/png") return "image/png";
  if (blob.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === "string" ? result.split(",")[1] : "";
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

/** Cover shot first, downscaled for vision so payloads stay small. */
export async function buildAiImagePayload(photos: MediaRef[]): Promise<AiImagePayload[]> {
  const sample = photos.slice(0, AI_CATEGORY_CONFIG.maxPhotos);
  const payloads: AiImagePayload[] = [];

  for (const ref of sample) {
    const blob = await getMediaBlob(ref.id);
    if (!blob) continue;
    const lean = await downscaleBlobForVision(blob);
    payloads.push({ mimeType: supportedMimeType(lean), data: await blobToBase64(lean) });
  }

  return payloads;
}
