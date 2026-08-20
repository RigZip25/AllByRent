/**
 * Client-side VIN-from-photo via Tesseract.js OCR + ISO 3779 checksum.
 * Dynamically imports tesseract so the listing bundle stays light until Scan VIN.
 */

import { validateVinFormat } from "./vinValidate";

export type VinOcrResult =
  | { ok: true; vin: string; rawTextLength: number }
  | {
      ok: false;
      reason: "ocr_failed" | "no_vin" | "invalid_image";
      rawTextLength?: number;
    };

/** OCR often confuses O/0 and I/1/l — map to VIN-legal charset. */
function ocrNormalizeChar(ch: string): string {
  const upper = ch.toUpperCase();
  if (upper === "O" || upper === "Q") return "0";
  if (upper === "I" || upper === "L" || upper === "|") return "1";
  return upper;
}

function sanitizeCandidate(raw: string): string {
  return raw
    .split("")
    .map(ocrNormalizeChar)
    .join("")
    .replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

/**
 * Pull plausible 17-char VIN candidates from OCR text.
 * Prefers strings that pass the check digit; otherwise returns best format match.
 */
export function findVinInText(text: string): string | null {
  if (!text.trim()) return null;

  const collapsed = sanitizeCandidate(text);
  const candidates = new Set<string>();

  // Sliding windows over the sanitized stream (handles glued OCR).
  for (let i = 0; i + 17 <= collapsed.length; i++) {
    candidates.add(collapsed.slice(i, i + 17));
  }

  // Also try line-by-line / token-ish chunks after light cleanup.
  for (const chunk of text.split(/[\s\n\r|,;:]+/)) {
    const cleaned = sanitizeCandidate(chunk);
    if (cleaned.length === 17) candidates.add(cleaned);
    if (cleaned.length > 17) {
      for (let i = 0; i + 17 <= cleaned.length; i++) {
        candidates.add(cleaned.slice(i, i + 17));
      }
    }
  }

  for (const candidate of candidates) {
    const result = validateVinFormat(candidate);
    if (result.ok) return result.vin;
  }

  // Reject format-only / check-digit failures — caller must retake or type manually.
  return null;
}

type TesseractModule = typeof import("tesseract.js");

let tesseractModulePromise: Promise<TesseractModule> | null = null;

function loadTesseract(): Promise<TesseractModule> {
  if (!tesseractModulePromise) {
    tesseractModulePromise = import("tesseract.js");
  }
  return tesseractModulePromise;
}

/**
 * Downscale large camera photos so OCR stays responsive on mobile.
 * Returns a canvas/blob-friendly ImageBitmap or HTMLCanvasElement source.
 */
async function prepareImageForOcr(file: File): Promise<HTMLCanvasElement | File> {
  if (typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale >= 0.98) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas;
  } catch {
    return file;
  }
}

/** OCR an image file/blob and return the first checksum-valid VIN. */
export async function extractVinFromImage(file: File): Promise<VinOcrResult> {
  if (!file || !file.type.startsWith("image/")) {
    return { ok: false, reason: "invalid_image" };
  }

  try {
    const { createWorker } = await loadTesseract();
    const image = await prepareImageForOcr(file);
    const worker = await createWorker("eng", 1, {
      // Use CDN-hosted worker/lang data so we don't ship WASM in the main bundle.
      // Offline: OCR will fail gracefully → manual VIN entry.
      logger: () => {
        /* quiet */
      },
    });

    try {
      // VIN stickers are usually a single line of caps + digits.
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHJKLMNPRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz",
        preserve_interword_spaces: "1",
      });
      const {
        data: { text },
      } = await worker.recognize(image);
      const vin = findVinInText(text ?? "");
      if (!vin) {
        return { ok: false, reason: "no_vin", rawTextLength: (text ?? "").length };
      }
      return { ok: true, vin, rawTextLength: (text ?? "").length };
    } finally {
      await worker.terminate();
    }
  } catch {
    return { ok: false, reason: "ocr_failed" };
  }
}
