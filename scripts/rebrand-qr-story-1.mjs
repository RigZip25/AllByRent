#!/usr/bin/env node
/**
 * Rebrand QR sticker story slide (camera + verification photo) AllByRent → Evorios™.
 * Replace with final PNG via src/imports/incoming/qr-story-1.png when available.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src/imports/qr_story_1.png");
const target = path.join(root, "src/imports/qr_story_1.png");

const BRAND_GREEN = "#0D5C3A";

/** Sticker label bars on physical sticker + phone viewfinder (1536×1024 art) */
const LABELS = [
  { left: 400, top: 614, width: 124, height: 34, fontSize: 16 },
  { left: 1024, top: 562, width: 78, height: 24, fontSize: 10 },
];

function labelSvg({ width, height, fontSize }) {
  return Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${BRAND_GREEN}"/>
  <text x="50%" y="70%" font-family="system-ui, -apple-system, Segoe UI, sans-serif"
        font-size="${fontSize}" font-weight="700" fill="#ffffff" text-anchor="middle">Evorios™</text>
</svg>
`);
}

const composites = LABELS.map((label) => ({
  input: labelSvg(label),
  left: label.left,
  top: label.top,
}));

await sharp(source)
  .composite(composites)
  .png({ compressionLevel: 9, quality: 90 })
  .toFile(`${target}.tmp`);

await import("node:fs/promises").then((fs) =>
  fs.rename(`${target}.tmp`, target),
);

console.log(`✓ ${path.relative(root, target)}`);
