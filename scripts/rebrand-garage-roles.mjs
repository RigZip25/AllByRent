#!/usr/bin/env node
/**
 * Rebrand roles hero (traveler + phone + owner) AllByRent → Evorios™.
 * Replace with final PNG via src/imports/incoming/evorios-platform-hero.png when available.
 */
import path from "node:path";
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src/imports/allbyrent_roles.png");
const primaryTarget = path.join(root, "src/imports/onboarding/evorios_garage_roles.png");
const legacyTarget = path.join(root, "src/imports/allbyrent_roles.png");

const BRAND_GREEN = "#0D5C3A";

/** Phone header band on 1024×682 roles art — covers legacy AllByRent wordmark */
const HEADER = { left: 384, top: 147, width: 270, height: 70 };

const brandSvg = Buffer.from(`
<svg width="${HEADER.width}" height="${HEADER.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="135" y="44" font-family="system-ui, -apple-system, Segoe UI, sans-serif"
        font-size="26" font-weight="700" fill="${BRAND_GREEN}" text-anchor="middle">Evorios™</text>
</svg>
`);

const pipeline = () =>
  sharp(source)
    .composite([{ input: brandSvg, left: HEADER.left, top: HEADER.top }])
    .png({ compressionLevel: 9, palette: true, quality: 82 });

await pipeline().toFile(primaryTarget);
console.log(`✓ ${path.relative(root, primaryTarget)}`);

await copyFile(primaryTarget, legacyTarget);
console.log(`✓ ${path.relative(root, legacyTarget)}`);
