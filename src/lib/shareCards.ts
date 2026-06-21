import { getMediaBlob, type MediaRef } from "./mediaStore";
import { APP_NAME } from "./brand";

export type ShareCardFormat = "landscape" | "square" | "story";

export type GeneratedShareCard = {
  format: ShareCardFormat;
  width: number;
  height: number;
  blob: Blob;
  objectUrl: string;
  filename: string;
};

const PRIMARY = "#0D5C3A";
const CTA = "#F59E0B";

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBadge(ctx: CanvasRenderingContext2D, label: string) {
  ctx.save();
  ctx.font = "700 28px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  const padX = 18;
  const padY = 10;
  const metrics = ctx.measureText(label);
  const w = metrics.width + padX * 2;
  const h = 44;
  const x = 40;
  const y = 34;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PRIMARY;
  ctx.fillText(label, x + padX, y + h - padY - 6);
  ctx.restore();
}

function drawBottomOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grd = ctx.createLinearGradient(0, h * 0.55, 0, h);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(1, "rgba(0,0,0,0.72)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = w;
    if (lines.length >= maxLines - 1) break;
  }
  if (lines.length < maxLines) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;
  // Ellipsize last line if needed
  let last = lines[lines.length - 1] ?? "";
  while (last && ctx.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
  const truncated = lines.length === maxLines && words.join(" ") !== lines.join(" ");
  lines[lines.length - 1] = last ? last + (truncated ? "…" : "") : "";
  return lines;
}

function formatDailyRate(dailyRate: string): string | null {
  const raw = dailyRate.trim().replace(/^\$/, "");
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `$${Math.round(n)}/day`;
}

async function mediaRefToObjectUrl(ref: MediaRef | undefined): Promise<string | null> {
  if (!ref?.id) return null;
  const blob = await getMediaBlob(ref.id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

async function getRentanoLogoUrl(): Promise<string | null> {
  try {
    // shipped in repo at src/imports
    const mod = await import("../imports/rentano_full.png");
    return (mod as any).default as string;
  } catch {
    return null;
  }
}

async function generateOne(input: {
  format: ShareCardFormat;
  title: string;
  dailyRate: string;
  coverUrl: string | null;
}): Promise<GeneratedShareCard> {
  const dims =
    input.format === "story"
      ? { width: 1080, height: 1920 }
      : input.format === "square"
        ? { width: 1080, height: 1080 }
        : { width: 1200, height: 628 };

  const canvas = document.createElement("canvas");
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  // Background
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(0, 0, dims.width, dims.height);
  if (input.coverUrl) {
    try {
      const cover = await loadImage(input.coverUrl);
      drawCover(ctx, cover, dims.width, dims.height);
    } catch {
      // keep solid background
    }
  }

  // Brand / logo
  drawBadge(ctx, APP_NAME);

  // Bottom overlay
  drawBottomOverlay(ctx, dims.width, dims.height);

  // Title
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = "800 64px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  const maxTextWidth = dims.width - 80;
  const lines = fitText(ctx, input.title, maxTextWidth, input.format === "story" ? 3 : 2);
  const lineH = 74;
  const startY = dims.height - 220 - (lines.length - 1) * lineH;
  lines.forEach((line, i) => ctx.fillText(line, 40, startY + i * lineH));
  ctx.restore();

  // Daily rate bottom right
  const rate = formatDailyRate(input.dailyRate);
  if (rate) {
    ctx.save();
    ctx.font = "800 48px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    const tw = ctx.measureText(rate).width;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundedRect(ctx, dims.width - tw - 40 - 28, dims.height - 140, tw + 56, 64, 20);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(rate, dims.width - tw - 40, dims.height - 96);
    ctx.restore();
  }

  // CTA
  ctx.save();
  const cta = "Rent this →";
  ctx.font = "900 44px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  const ctw = ctx.measureText(cta).width;
  ctx.fillStyle = CTA;
  roundedRect(ctx, 40, dims.height - 140, ctw + 48, 64, 22);
  ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.fillText(cta, 40 + 24, dims.height - 96);
  ctx.restore();

  // Rentano small corner
  const rentanoLogo = await getRentanoLogoUrl();
  if (rentanoLogo) {
    try {
      const img = await loadImage(rentanoLogo);
      const size = 56;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, dims.width - size - 36, dims.height - size - 30, size, size);
      ctx.restore();
    } catch {
      // ignore
    }
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG generation failed"))), "image/png");
  });

  const objectUrl = URL.createObjectURL(blob);
  const filename = `evorios_share_${input.format}.png`;
  return { format: input.format, width: dims.width, height: dims.height, blob, objectUrl, filename };
}

export async function generateListingShareCards(input: {
  title: string;
  dailyRate: string;
  photos: MediaRef[];
}): Promise<GeneratedShareCard[]> {
  const coverUrl = await mediaRefToObjectUrl(input.photos?.[0]);
  const title = input.title?.trim() || "Listing";

  const cards = await Promise.all([
    generateOne({ format: "landscape", title, dailyRate: input.dailyRate, coverUrl }),
    generateOne({ format: "square", title, dailyRate: input.dailyRate, coverUrl }),
    generateOne({ format: "story", title, dailyRate: input.dailyRate, coverUrl }),
  ]);

  if (coverUrl) {
    // Note: coverUrl is an objectUrl for a MediaStore blob; safe to revoke after draw.
    try { URL.revokeObjectURL(coverUrl); } catch { /* ignore */ }
  }

  return cards;
}

