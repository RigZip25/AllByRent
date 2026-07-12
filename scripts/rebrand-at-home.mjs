#!/usr/bin/env node
/**
 * Rebrand at_home scene (couch + phone grid) from AllByRent → Evorios™.
 * Replace with final PNG via src/imports/incoming/on-block.png when available.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src/imports/at_home.png");
const targets = [
  path.join(root, "src/imports/onboarding/evorios_on_block.png"),
  path.join(root, "src/imports/onboarding/evorios_browse_block.png"),
];

const BRAND_GREEN = "#0D5C3A";

/** Phone header band on 1024×682 at_home art */
const HEADER = { left: 520, top: 66, width: 340, height: 56 };

const brandSvg = Buffer.from(`
<svg width="${HEADER.width}" height="${HEADER.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="128" y="36" font-family="system-ui, -apple-system, Segoe UI, sans-serif"
        font-size="24" font-weight="700" fill="${BRAND_GREEN}" text-anchor="middle">Evorios™</text>
</svg>
`);

const pipeline = sharp(source)
  .composite([{ input: brandSvg, left: HEADER.left, top: HEADER.top }])
  .png({ compressionLevel: 9, palette: true, quality: 82 });

for (const target of targets) {
  await pipeline.clone().toFile(target);
  console.log(`✓ ${path.relative(root, target)}`);
}
