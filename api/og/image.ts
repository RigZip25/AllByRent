import type { VercelRequest, VercelResponse } from "@vercel/node";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const FONT_FAMILY = "OgSans";

function resolveFontPath(): string | null {
  const candidates = [
    join(__dirname, "fonts", "NotoSans-Bold.ttf"),
    join(process.cwd(), "api/og/fonts/NotoSans-Bold.ttf"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

function resolveRentanoPath(): string | null {
  const candidates = [
    join(__dirname, "assets", "rentano.png"),
    join(process.cwd(), "api/og/assets/rentano.png"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

let rentanoDataUriCache: string | null | undefined;

async function loadRentanoDataUri(): Promise<string | undefined> {
  if (rentanoDataUriCache !== undefined) return rentanoDataUriCache || undefined;
  const path = resolveRentanoPath();
  if (!path) {
    rentanoDataUriCache = null;
    return undefined;
  }
  try {
    const input = readFileSync(path);
    const png = await sharp(input)
      .resize(520, 520, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    rentanoDataUriCache = `data:image/png;base64,${png.toString("base64")}`;
    return rentanoDataUriCache;
  } catch {
    rentanoDataUriCache = null;
    return undefined;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function wrapLines(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1] ?? "";
    lines[lines.length - 1] = clip(last, Math.max(8, maxChars - 1));
  }
  return lines.slice(0, maxLines);
}

function chipSvg(label: string, x: number, y: number, fill: string, textFill: string): string {
  const safe = escapeXml(label);
  const width = Math.min(360, Math.max(110, safe.length * 13 + 40));
  return `
  <rect x="${x}" y="${y}" rx="18" ry="18" width="${width}" height="44" fill="${fill}"/>
  <text x="${x + 20}" y="${y + 29}" fill="${textFill}" font-size="22" font-weight="700" font-family="${FONT_FAMILY}">${safe}</text>`;
}

function buildRequestOgSvg(input: {
  title: string;
  subtitle: string;
  price: string;
  timing: string;
  badge: string;
  cta: string;
  characterDataUri?: string;
}): string {
  const titleLines = wrapLines(input.title, 22, 3).map(escapeXml);
  const subtitleLines = wrapLines(input.subtitle, 34, 2).map(escapeXml);
  const badge = escapeXml(input.badge || "Neighbor need");
  const cta = escapeXml(input.cta || "Got one? Help a neighbor");
  const badgeWidth = Math.min(340, Math.max(150, badge.length * 14 + 48));

  const titleStartY = 210;
  const titleText = titleLines
    .map(
      (line, index) =>
        `<text x="56" y="${titleStartY + index * 58}" fill="#FFF9F0" font-size="54" font-weight="700" font-family="${FONT_FAMILY}">${line}</text>`,
    )
    .join("");
  const subtitleStartY = titleStartY + titleLines.length * 58 + 18;
  const subtitleText = subtitleLines
    .map(
      (line, index) =>
        `<text x="56" y="${subtitleStartY + index * 34}" fill="#C8E6D4" font-size="26" font-family="${FONT_FAMILY}">${line}</text>`,
    )
    .join("");

  let chipX = 56;
  const chipY = Math.min(500, subtitleStartY + subtitleLines.length * 34 + 28);
  let chips = "";
  if (input.timing) {
    chips += chipSvg(input.timing, chipX, chipY, "#F0B429", "#0D5C3A");
    chipX += Math.min(360, Math.max(110, escapeXml(input.timing).length * 13 + 40)) + 14;
  }
  if (input.price) {
    chips += chipSvg(input.price, chipX, chipY, "rgba(255,249,240,0.16)", "#FFF9F0");
  }

  const character = input.characterDataUri
    ? `<image href="${input.characterDataUri}" x="760" y="90" width="400" height="400" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#062A1C"/>
      <stop offset="55%" stop-color="#0D5C3A"/>
      <stop offset="100%" stop-color="#1A9E6E"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="42%" r="45%">
      <stop offset="0%" stop-color="#F0B429" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#F0B429" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="1080" cy="80" r="160" fill="#FFF9F0" fill-opacity="0.06"/>
  <circle cx="980" cy="560" r="120" fill="#062A1C" fill-opacity="0.25"/>
  <rect x="48" y="44" rx="22" ry="22" width="${badgeWidth}" height="46" fill="#F0B429"/>
  <text x="70" y="75" fill="#0D5C3A" font-size="22" font-weight="700" font-family="${FONT_FAMILY}">${badge}</text>
  <text x="56" y="150" fill="#C8E6D4" font-size="22" font-weight="700" font-family="${FONT_FAMILY}">EVORIOS</text>
  ${titleText}
  ${subtitleText}
  ${chips}
  <text x="56" y="590" fill="#FFF9F0" font-size="26" font-weight="700" font-family="${FONT_FAMILY}">${cta} →</text>
  ${character}
</svg>`;
}

function buildOgSvg(input: {
  title: string;
  subtitle: string;
  price: string;
  badge: string;
  photoDataUri?: string;
}): string {
  const badge = escapeXml(input.badge);
  const price = escapeXml(input.price);
  const hasPhoto = Boolean(input.photoDataUri);
  const titleLines = wrapLines(input.title, hasPhoto ? 28 : 34, 3).map(escapeXml);
  const subtitleLines = wrapLines(input.subtitle, hasPhoto ? 42 : 48, 2).map(escapeXml);
  const badgeWidth = Math.min(360, Math.max(140, badge.length * 15 + 56));

  if (hasPhoto) {
    const titleStartY = 430;
    const titleText = titleLines
      .map(
        (line, index) =>
          `<text x="56" y="${titleStartY + index * 48}" fill="#ffffff" font-size="42" font-weight="700" font-family="${FONT_FAMILY}">${line}</text>`,
      )
      .join("");
    const subtitleStartY = titleStartY + titleLines.length * 48 + 14;
    const subtitleText = subtitleLines
      .map(
        (line, index) =>
          `<text x="56" y="${subtitleStartY + index * 30}" fill="#F3F4F6" font-size="24" font-family="${FONT_FAMILY}">${line}</text>`,
      )
      .join("");
    const priceBlock = price
      ? `<text x="56" y="390" fill="#F0B429" font-size="44" font-weight="700" font-family="${FONT_FAMILY}">${price}</text>`
      : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="scrim" x1="0%" y1="35%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="55%" stop-color="#0A3D28" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#062418" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <image href="${input.photoDataUri}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1200" height="630" fill="url(#scrim)"/>
  <rect x="48" y="44" rx="24" ry="999" width="${badgeWidth}" height="48" fill="#F0B429"/>
  <text x="72" y="76" fill="#0D5C3A" font-size="24" font-weight="700" font-family="${FONT_FAMILY}">${badge}</text>
  ${priceBlock}
  ${titleText}
  ${subtitleText}
</svg>`;
  }

  const titleStartY = price ? 300 : 280;
  const titleText = titleLines
    .map(
      (line, index) =>
        `<text x="56" y="${titleStartY + index * 56}" fill="#0D5C3A" font-size="52" font-weight="700" font-family="${FONT_FAMILY}">${line}</text>`,
    )
    .join("");
  const subtitleStartY = titleStartY + titleLines.length * 56 + 20;
  const subtitleText = subtitleLines
    .map(
      (line, index) =>
        `<text x="56" y="${subtitleStartY + index * 36}" fill="#3F5F4E" font-size="28" font-family="${FONT_FAMILY}">${line}</text>`,
    )
    .join("");
  const priceBlock = price
    ? `<text x="56" y="240" fill="#0D5C3A" font-size="56" font-weight="700" font-family="${FONT_FAMILY}">${price}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF9F0"/>
      <stop offset="55%" stop-color="#FDE9C3"/>
      <stop offset="100%" stop-color="#C8E6D4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="18" height="630" fill="#0D5C3A"/>
  <rect x="48" y="48" rx="24" ry="999" width="${badgeWidth}" height="48" fill="#F0B429"/>
  <text x="72" y="80" fill="#0D5C3A" font-size="24" font-weight="700" font-family="${FONT_FAMILY}">${badge}</text>
  ${priceBlock}
  ${titleText}
  ${subtitleText}
</svg>`;
}

async function loadPhotoDataUri(photoUrl: string): Promise<string | undefined> {
  if (!/^https:\/\//i.test(photoUrl)) return undefined;
  try {
    const response = await fetch(photoUrl, {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return undefined;
    const input = Buffer.from(await response.arrayBuffer());
    if (input.byteLength < 64) return undefined;
    const jpeg = await sharp(input)
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "centre" })
      .jpeg({ quality: 84 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return undefined;
  }
}

function renderSvgToPng(svg: string): Buffer {
  const fontPath = resolveFontPath();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontFiles: fontPath ? [fontPath] : [],
      loadSystemFonts: true,
      defaultFontFamily: FONT_FAMILY,
    },
  });
  return Buffer.from(resvg.render().asPng());
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).send("Method not allowed");
    return;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${Array.isArray(host) ? host[0] : host}`;
  const url = new URL(req.url ?? "/api/og/image", origin);

  const layout = (url.searchParams.get("layout") || "").trim().toLowerCase();
  const title = clip(url.searchParams.get("title") || "Garage sale", 70);
  const subtitle = clip(url.searchParams.get("subtitle") || "Buy or offer on Evorios", 90);
  const price = clip(url.searchParams.get("price") || "", 28);
  const badge = clip(url.searchParams.get("badge") || "Evorios", 28);
  const timing = clip(url.searchParams.get("timing") || "", 32);
  const cta = clip(url.searchParams.get("cta") || "Got one? Help a neighbor", 42);
  const photo = (url.searchParams.get("photo") || "").trim();
  const isRequest = layout === "request" || badge.toLowerCase().includes("neighbor");

  try {
    let svg: string;
    if (isRequest) {
      const characterDataUri = await loadRentanoDataUri();
      svg = buildRequestOgSvg({
        title,
        subtitle,
        price,
        timing,
        badge,
        cta,
        characterDataUri,
      });
    } else {
      const photoDataUri = photo ? await loadPhotoDataUri(photo) : undefined;
      svg = buildOgSvg({ title, subtitle, price, badge, photoDataUri });
    }
    const png = renderSvgToPng(svg);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }

    res.status(200).send(png);
  } catch (error) {
    console.error("[og/image]", error);
    res.status(500).send("OG image failed");
  }
}
