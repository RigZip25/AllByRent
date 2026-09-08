/**
 * Grid-sized copy of a photo.
 *
 * A phone photo is 3–6 MB of pixels; a shelf grid draws it at 90 px. Without a
 * small copy every tile decodes the full-size blob, which is what made lists of
 * photos janky on older phones and, on a listing with twelve shots, meant
 * decoding fifty megapixels to show a strip of thumbnails.
 */

/** Twice the widest tile on a 3x screen — sharp in a grid, cheap to decode. */
const DEFAULT_MAX_EDGE = 480;

function pixelRatio(): number {
  if (typeof window === "undefined") return 2;
  const dpr = window.devicePixelRatio;
  return Number.isFinite(dpr) ? Math.min(3, Math.max(1, dpr)) : 2;
}

/**
 * Returns null when this device cannot produce one — callers keep the photo and
 * fall back to the full-size blob rather than losing the capture.
 */
export async function createImageThumbnail(
  blob: Blob,
  opts: { maxEdge?: number } = {},
): Promise<Blob | null> {
  if (!blob.type.startsWith("image/")) return null;
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return null;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(blob);
    const maxSize = Math.round((opts.maxEdge ?? DEFAULT_MAX_EDGE) * pixelRatio());
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    if (longestEdge <= maxSize) return null;

    const scale = maxSize / longestEdge;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.88);
    });
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}
