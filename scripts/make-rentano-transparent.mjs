/**
 * Removes white background connected to image edges (keeps inner whites like shirt).
 * Run: node scripts/make-rentano-transparent.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const input = path.join(root, "src/imports/rentano_splash.png");
const output = path.join(root, "src/imports/rentano_splash_transparent.png");

const WHITE_THRESH = 248;

function isEdgeWhite(r, g, b, a) {
  return a > 200 && r >= WHITE_THRESH && g >= WHITE_THRESH && b >= WHITE_THRESH;
}

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const transparent = new Uint8Array(data.length);
transparent.set(data);

const visited = new Uint8Array(width * height);
const queue = [];

for (let x = 0; x < width; x += 1) {
  queue.push([x, 0], [x, height - 1]);
}
for (let y = 0; y < height; y += 1) {
  queue.push([0, y], [width - 1, y]);
}

while (queue.length > 0) {
  const [x, y] = queue.pop();
  const idx = y * width + x;
  if (x < 0 || y < 0 || x >= width || y >= height || visited[idx]) continue;

  const i = idx * channels;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (!isEdgeWhite(r, g, b, a)) continue;

  visited[idx] = 1;
  transparent[i + 3] = 0;

  queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

await sharp(transparent, { raw: { width, height, channels } })
  .png()
  .toFile(output);

console.log("Wrote transparent PNG:", output);
