const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.9;

export type SanitizedImage = {
  blob: Blob;
  /** False when the pixels could not be re-encoded, so metadata may survive. */
  stripped: boolean;
};

/**
 * Re-encode a photo through a canvas, keeping nothing but pixels.
 *
 * A phone photo carries the shooting location, the device serial and the
 * capture time in EXIF, and these images are handed to strangers — the
 * neighbour browsing a listing, or the counterparty in a rental. Orientation is
 * read from the source before the tag is dropped, otherwise stripping it would
 * silently rotate half the photos.
 */
export async function sanitizeImageBlob(
  input: Blob,
  opts: { maxEdge?: number; quality?: number } = {},
): Promise<SanitizedImage> {
  const maxEdge = opts.maxEdge ?? MAX_EDGE;
  const quality = opts.quality ?? JPEG_QUALITY;

  if (!(input.type || "").toLowerCase().startsWith("image/")) {
    return { blob: input, stripped: false };
  }
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return { blob: input, stripped: false };
  }

  try {
    const bitmap = await createImageBitmap(input, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxEdge / Math.max(1, longest));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return { blob: input, stripped: false };
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const out = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });
    if (!out || out.size === 0) return { blob: input, stripped: false };
    return { blob: out, stripped: true };
  } catch {
    return { blob: input, stripped: false };
  }
}
