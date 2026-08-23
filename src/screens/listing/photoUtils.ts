const MAX_WIDTH = 2048;
const JPEG_QUALITY = 0.9;

/** Edge length for vision LLM calls — much smaller payloads, faster round-trips. */
export const VISION_MAX_EDGE = 1024;
const VISION_JPEG_QUALITY = 0.72;

export async function compressImageFile(
  file: File,
  maxWidth = MAX_WIDTH,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImageFile(file)));
}

/** Downscale a stored listing photo for moderation / product recognition. */
export async function downscaleBlobForVision(
  blob: Blob,
  maxEdge = VISION_MAX_EDGE,
): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return blob;
  try {
    const bitmap = await createImageBitmap(blob);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= maxEdge) {
      bitmap.close();
      // Still re-encode large PNG/HEIC-derived blobs as lean JPEG when oversized by bytes.
      if (blob.size <= 350_000 && (blob.type === "image/jpeg" || blob.type === "image/jpg")) {
        return blob;
      }
    }
    const scale = Math.min(1, maxEdge / longest);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return blob;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const out = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", VISION_JPEG_QUALITY);
    });
    return out ?? blob;
  } catch {
    return blob;
  }
}

export const MAX_LISTING_PHOTOS = 12;
/** Video upload disabled — keep listings photo-only (storage + moderation risk). */
export const MAX_LISTING_VIDEOS = 0;
