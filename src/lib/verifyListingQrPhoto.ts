import jsQR from "jsqr";
import { APP_ORIGIN, LISTING_QR_BASE_URL } from "./brand";

export type QrPhotoVerifyResult =
  | { ok: true; payload: string }
  | { ok: false; reason: string };

type ExpectedListingQr = {
  listingId: string;
  qrToken?: string;
  publicUrl: string;
};

function normalizePayload(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

function expectedPayloads(expected: ExpectedListingQr): string[] {
  const id = expected.listingId.trim();
  const token = expected.qrToken?.trim() || "";
  const publicUrl = normalizePayload(expected.publicUrl);
  const values = new Set<string>();

  const add = (value: string) => {
    const v = normalizePayload(value);
    if (v) values.add(v);
  };

  add(publicUrl);
  add(getListingPath(id));
  if (token) add(getListingPath(token));
  add(`${LISTING_QR_BASE_URL}/${encodeURIComponent(id)}`);
  if (token) add(`${LISTING_QR_BASE_URL}/${encodeURIComponent(token)}`);
  add(`${APP_ORIGIN}/item/${encodeURIComponent(id)}`);
  if (token) add(`${APP_ORIGIN}/item/${encodeURIComponent(token)}`);
  add(id);
  if (token) add(token);

  return Array.from(values);
}

function getListingPath(idOrToken: string): string {
  return `/item/${encodeURIComponent(idOrToken.trim())}`;
}

function payloadMatchesExpected(payload: string, expected: ExpectedListingQr): boolean {
  const normalized = normalizePayload(payload);
  if (!normalized) return false;

  const allowed = expectedPayloads(expected);
  if (allowed.some((v) => v === normalized || normalized.endsWith(v) || v.endsWith(normalized))) {
    return true;
  }

  // Accept absolute URLs that resolve to this listing id/token.
  try {
    const url = new URL(normalized, APP_ORIGIN);
    const path = url.pathname.replace(/\/+$/, "");
    const id = expected.listingId.trim();
    const token = expected.qrToken?.trim() || "";
    if (path === `/item/${encodeURIComponent(id)}` || path === `/item/${id}`) return true;
    if (token && (path === `/item/${encodeURIComponent(token)}` || path === `/item/${token}`)) {
      return true;
    }
  } catch {
    /* not a URL */
  }

  return false;
}

async function loadImageBitmap(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read the photo."));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function decodeQrFromCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = canvas;
  if (width < 8 || height < 8) return null;
  const imageData = ctx.getImageData(0, 0, width, height);
  const result = jsQR(imageData.data, width, height, {
    inversionAttempts: "attemptBoth",
  });
  return result?.data?.trim() || null;
}

/**
 * Decode any QR codes found in a verification photo and require a match
 * for this listing's public QR URL / id / token.
 */
export async function verifyListingQrInPhoto(
  file: Blob,
  expected: ExpectedListingQr,
): Promise<QrPhotoVerifyResult> {
  if (!file || file.size <= 0) {
    return { ok: false, reason: "No photo captured. Take a picture of the sticker on the item." };
  }

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await loadImageBitmap(file);
  } catch {
    return { ok: false, reason: "Could not read that photo. Try again with better lighting." };
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { ok: false, reason: "Camera verification is unavailable in this browser." };
  }

  const srcW = "naturalWidth" in source ? source.naturalWidth || source.width : source.width;
  const srcH = "naturalHeight" in source ? source.naturalHeight || source.height : source.height;
  if (!srcW || !srcH) {
    return { ok: false, reason: "That photo looks empty. Retake with the QR sticker in frame." };
  }

  // Try a few scales — phone photos are large; tiny QR stickers need enough resolution.
  const maxSides = [1400, 1000, 720, 480];
  let decoded: string | null = null;

  for (const maxSide of maxSides) {
    const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    decoded = decodeQrFromCanvas(canvas);
    if (decoded) break;
  }

  if ("close" in source && typeof source.close === "function") {
    try {
      source.close();
    } catch {
      /* ignore */
    }
  }

  if (!decoded) {
    return {
      ok: false,
      reason:
        "No QR code found in the photo. Print the sticker, attach it to the item, and photograph the QR clearly.",
    };
  }

  if (!payloadMatchesExpected(decoded, expected)) {
    return {
      ok: false,
      reason:
        "That QR doesn’t match this listing. Use the sticker for this item (not a random QR or another listing).",
    };
  }

  return { ok: true, payload: decoded };
}

/** Continuously scan a video frame for the expected listing QR. */
export function decodeListingQrFromVideoFrame(
  video: HTMLVideoElement,
  expected: ExpectedListingQr,
): string | null {
  if (video.readyState < 2 || video.videoWidth < 8 || video.videoHeight < 8) return null;
  const canvas = document.createElement("canvas");
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const payload = decodeQrFromCanvas(canvas);
  if (!payload) return null;
  return payloadMatchesExpected(payload, expected) ? payload : null;
}
