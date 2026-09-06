/**
 * Converts onboarding illustrations to WebP for shipping.
 *
 * Art arrives as ~2 MB PNGs at roughly 1122x1402, while the slides never render
 * wider than 360 CSS px. MAX_WIDTH keeps enough pixels for a 3x screen.
 *
 * Usage: node scripts/optimize-onboarding-art.mjs [--replace]
 * Writes a .webp next to every .png; --replace also deletes the source PNG.
 */
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const DIR = resolve(import.meta.dirname, "../src/imports/onboarding");
const MAX_WIDTH = 1080;
const QUALITY = 82;

const replace = process.argv.includes("--replace");
const sources = readdirSync(DIR)
  .filter((name) => name.endsWith(".png"))
  .sort();

if (sources.length === 0) {
  console.log("No PNG sources found in src/imports/onboarding.");
  process.exit(0);
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
let before = 0;
let after = 0;

for (const name of sources) {
  const source = join(DIR, name);
  const target = source.replace(/\.png$/, ".webp");

  await sharp(source)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(target);

  const sourceSize = statSync(source).size;
  const targetSize = statSync(target).size;
  before += sourceSize;
  after += targetSize;

  console.log(`${name}: ${kb(sourceSize)} -> ${kb(targetSize)}`);
  if (replace) unlinkSync(source);
}

console.log(`\nTotal: ${kb(before)} -> ${kb(after)}`);
