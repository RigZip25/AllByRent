/**
 * Re-encodes the full-bleed illustrations the app imports as modules.
 *
 * Onboarding, the guest tour, the QR story and the splash art shipped as PNG
 * renders of 1.6–2.1 MB each: 45 MB of the bundle, all of it precached by the
 * service worker, all of it downloaded before the first screen could be shown.
 * They are photographic illustrations, so WebP at quality 82 is indisplaceably
 * smaller with no visible difference at phone sizes.
 *
 * Run: node scripts/optimize-illustrations.mjs   (add --check to verify only)
 */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const importsDir = path.join(root, "src/imports");
const srcDirs = [path.join(root, "src")];

/** Twice the widest place any of these are drawn (a 430px phone screen). */
const MAX_WIDTH = 1080;
const QUALITY = 82;
const checkOnly = process.argv.includes("--check");

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** PNGs that source files import, i.e. the ones that end up in the bundle. */
async function referencedPngs() {
  const sources = (await Promise.all(srcDirs.map(walk)))
    .flat()
    .filter((file) => /\.(ts|tsx)$/.test(file));

  const referenced = new Set();
  for (const file of sources) {
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(/["'][^"']*imports\/([A-Za-z0-9_/-]+\.png)["']/g)) {
      referenced.add(match[1]);
    }
  }
  return [...referenced].sort();
}

async function main() {
  const names = await referencedPngs();
  if (names.length === 0) {
    console.log("No PNG imports left — nothing to re-encode.");
    return;
  }

  let missing = 0;
  let savedBytes = 0;

  for (const name of names) {
    const source = path.join(importsDir, name);
    const target = source.replace(/\.png$/, ".webp");

    let sourceSize;
    try {
      sourceSize = (await stat(source)).size;
    } catch {
      console.warn(`missing  ${name}`);
      missing += 1;
      continue;
    }

    if (checkOnly) {
      console.warn(`still PNG  ${name} (${(sourceSize / 1024 / 1024).toFixed(2)} MB)`);
      missing += 1;
      continue;
    }

    const image = sharp(source);
    const meta = await image.metadata();
    const resized =
      meta.width && meta.width > MAX_WIDTH
        ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true })
        : image;
    const output = await resized.webp({ quality: QUALITY, effort: 6 }).toBuffer();
    await writeFile(target, output);

    savedBytes += sourceSize - output.length;
    console.log(
      `${name} -> ${path.basename(target)}  ` +
        `${(sourceSize / 1024 / 1024).toFixed(2)} MB -> ${(output.length / 1024).toFixed(0)} KB`,
    );
  }

  if (checkOnly && missing > 0) {
    console.error(
      `\n${missing} illustration(s) are still imported as PNG. ` +
        "Run: node scripts/optimize-illustrations.mjs",
    );
    process.exit(1);
  }

  if (!checkOnly) {
    console.log(`\nSaved ${(savedBytes / 1024 / 1024).toFixed(1)} MB across ${names.length} files.`);
    console.log("Now point the imports at the .webp files and delete the PNG sources.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
