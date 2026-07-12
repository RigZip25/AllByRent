#!/usr/bin/env node
/**
 * Rebrand trip-planning scene (desk + phone grid) AllByRent → Evorios™.
 * Replace with final PNG via src/imports/incoming/trip-destination.png when available.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src/imports/while_traveling.png");
const target = path.join(root, "src/imports/onboarding/evorios_trip_destination.png");

const BRAND_GREEN = "#0D5C3A";

/** Phone header on 1024×682 trip art — text only, pin stays visible */
const HEADER = { left: 612, top: 36, width: 278, height: 58 };

const brandSvg = Buffer.from(`
<svg width="${HEADER.width}" height="${HEADER.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="124" y="38" font-family="system-ui, -apple-system, Segoe UI, sans-serif"
        font-size="24" font-weight="700" fill="${BRAND_GREEN}" text-anchor="middle">Evorios™</text>
</svg>
`);

await sharp(source)
  .composite([{ input: brandSvg, left: HEADER.left, top: HEADER.top }])
  .png({ compressionLevel: 9, palette: true, quality: 82 })
  .toFile(target);

console.log(`✓ ${path.relative(root, target)}`);
