/**
 * Turns the raw category artwork into small transparent icons.
 *
 * The source renders sit on a warm off-white card with a soft shadow. Icons
 * replace emoji in chips and tiles, so that card has to go: the background is
 * flood-filled away from the edges, leftover shadow specks are dropped, and the
 * subject is trimmed and re-centred on a square canvas.
 *
 * Run: node scripts/prepare-category-art.mjs   (add --check to verify only)
 */
import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(root, "src/imports/categories/raw");
const OUT_DIR = path.join(root, "src/imports/categories");

/** Output edge in px: 2x the largest place an icon is drawn (64px tiles). */
const SIZE = 128;
/** How far a pixel may drift from the sampled background and still be background. */
const BACKGROUND_TOLERANCE = 26;
/** Shadow crumbs left behind by the flood fill, as a share of total pixels. */
const MIN_ISLAND_SHARE = 0.002;
/** Anything this thin is a scan line in the source render, not artwork. */
const HAIRLINE_PX = 3;
/** Breathing room around the subject, as a share of the trimmed edge. */
const PADDING_SHARE = 0.04;

function sampleBackground(data, width, height, channels) {
  const samples = [];
  const step = Math.max(1, Math.floor(width / 32));
  for (let x = 0; x < width; x += step) {
    samples.push((0 * width + x) * channels, ((height - 1) * width + x) * channels);
  }
  for (let y = 0; y < height; y += step) {
    samples.push((y * width + 0) * channels, (y * width + (width - 1)) * channels);
  }
  const total = samples.reduce(
    (acc, i) => {
      acc[0] += data[i];
      acc[1] += data[i + 1];
      acc[2] += data[i + 2];
      return acc;
    },
    [0, 0, 0],
  );
  return total.map((sum) => sum / samples.length);
}

function distance(data, i, [r, g, b]) {
  return Math.max(
    Math.abs(data[i] - r),
    Math.abs(data[i + 1] - g),
    Math.abs(data[i + 2] - b),
  );
}

/** Marks every background pixel reachable from the border. */
function fillFromEdges(data, width, height, channels, background) {
  const isBackground = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x += 1) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y += 1) stack.push(y * width, y * width + width - 1);

  while (stack.length > 0) {
    const idx = stack.pop();
    if (isBackground[idx]) continue;
    if (distance(data, idx * channels, background) > BACKGROUND_TOLERANCE) continue;

    isBackground[idx] = 1;
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) stack.push(idx - 1);
    if (x < width - 1) stack.push(idx + 1);
    if (y > 0) stack.push(idx - width);
    if (y < height - 1) stack.push(idx + width);
  }
  return isBackground;
}

/**
 * Drops everything the flood fill left behind that is not artwork.
 *
 * Two kinds of debris survive it: crumbs of the soft drop shadow, and the
 * hairline streaks the renders carry across the card. Both would otherwise
 * size the trim below around a shadow instead of the object.
 */
function dropSpecks(isBackground, width, height) {
  const minPixels = Math.round(width * height * MIN_ISLAND_SHARE);
  const seen = new Uint8Array(width * height);

  for (let start = 0; start < isBackground.length; start += 1) {
    if (isBackground[start] || seen[start]) continue;

    const island = [];
    const stack = [start];
    seen[start] = 1;
    let left = width;
    let right = 0;
    let top = height;
    let bottom = 0;

    while (stack.length > 0) {
      const idx = stack.pop();
      island.push(idx);
      const x = idx % width;
      const y = (idx - x) / width;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;

      const neighbours = [];
      if (x > 0) neighbours.push(idx - 1);
      if (x < width - 1) neighbours.push(idx + 1);
      if (y > 0) neighbours.push(idx - width);
      if (y < height - 1) neighbours.push(idx + width);
      for (const next of neighbours) {
        if (seen[next] || isBackground[next]) continue;
        seen[next] = 1;
        stack.push(next);
      }
    }

    const hairline = Math.min(right - left, bottom - top) < HAIRLINE_PX;
    if (island.length < minPixels || hairline) {
      for (const idx of island) isBackground[idx] = 1;
    }
  }
}

/**
 * Fades the one-pixel rim that still carries the card's colour.
 *
 * Without it every icon keeps a cream outline, which is invisible on a white
 * sheet and obvious the moment an icon sits on a green chip.
 */
function featherEdges(alpha, data, isBackground, width, height, channels, background) {
  for (let idx = 0; idx < isBackground.length; idx += 1) {
    if (isBackground[idx]) continue;
    const x = idx % width;
    const y = (idx - x) / width;
    const touchesBackground =
      (x > 0 && isBackground[idx - 1]) ||
      (x < width - 1 && isBackground[idx + 1]) ||
      (y > 0 && isBackground[idx - width]) ||
      (y < height - 1 && isBackground[idx + width]);
    if (!touchesBackground) continue;

    const drift = distance(data, idx * channels, background);
    const ratio = (drift - BACKGROUND_TOLERANCE) / BACKGROUND_TOLERANCE;
    alpha[idx] = Math.round(Math.max(0, Math.min(1, ratio)) * 255);
  }
}

function boundingBox(isBackground, width, height) {
  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isBackground[y * width + x]) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  return { top, left, right, bottom };
}

async function prepare(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const background = sampleBackground(data, width, height, channels);
  const isBackground = fillFromEdges(data, width, height, channels, background);
  dropSpecks(isBackground, width, height);

  const alpha = new Uint8Array(isBackground.length).fill(255);
  for (let idx = 0; idx < isBackground.length; idx += 1) {
    if (isBackground[idx]) alpha[idx] = 0;
  }
  featherEdges(alpha, data, isBackground, width, height, channels, background);

  const cut = Buffer.from(data);
  for (let idx = 0; idx < isBackground.length; idx += 1) {
    cut[idx * channels + 3] = alpha[idx];
  }

  const box = boundingBox(isBackground, width, height);
  if (box.right < 0) throw new Error(`no subject found in ${path.basename(sourcePath)}`);

  const subjectWidth = box.right - box.left + 1;
  const subjectHeight = box.bottom - box.top + 1;
  const edge = Math.max(subjectWidth, subjectHeight);
  const padded = Math.round(edge * (1 + PADDING_SHARE * 2));

  return sharp(cut, { raw: { width, height, channels } })
    .extract({ left: box.left, top: box.top, width: subjectWidth, height: subjectHeight })
    .extend({
      top: Math.floor((padded - subjectHeight) / 2),
      bottom: Math.ceil((padded - subjectHeight) / 2),
      left: Math.floor((padded - subjectWidth) / 2),
      right: Math.ceil((padded - subjectWidth) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, effort: 6 })
    .toBuffer();
}

const checkOnly = process.argv.includes("--check");
await mkdir(OUT_DIR, { recursive: true });

const sources = (await readdir(SOURCE_DIR)).filter((name) => name.endsWith(".png")).sort();
if (sources.length === 0) throw new Error(`no source art in ${SOURCE_DIR}`);

const stale = [];
for (const name of sources) {
  const slug = name.replace(/\.png$/, "");
  const outPath = path.join(OUT_DIR, `${slug}.webp`);
  const next = await prepare(path.join(SOURCE_DIR, name));

  if (checkOnly) {
    const current = await readFile(outPath).catch(() => null);
    if (!current || !current.equals(next)) stale.push(slug);
    continue;
  }

  await writeFile(outPath, next);
  console.log(`${slug}.webp — ${(next.length / 1024).toFixed(1)} kB`);
}

if (checkOnly && stale.length > 0) {
  console.error(`Category art is out of date: ${stale.join(", ")}`);
  console.error("Run: npm run art:categories");
  process.exit(1);
}

console.log(checkOnly ? "Category art is up to date." : `Prepared ${sources.length} icons.`);
