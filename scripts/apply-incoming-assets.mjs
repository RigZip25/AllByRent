#!/usr/bin/env node
/**
 * Copy marketing PNGs from src/imports/incoming/ into canonical asset paths.
 * Drop files here (any listed name) and run: node scripts/apply-incoming-assets.mjs
 */
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imports = path.join(root, "src", "imports");
const incoming = path.join(imports, "incoming");

/** incoming filename → path under src/imports/ */
const MAP = {
  "evorios-platform-hero.png": "onboarding/evorios_garage_roles.png",
  "evorios-hero.png": "onboarding/evorios_garage_roles.png",
  "platform-hero.png": "onboarding/evorios_garage_roles.png",
  "hero.png": "onboarding/evorios_garage_roles.png",
  "garage-roles.png": "onboarding/evorios_garage_roles.png",
  "browse-block.png": "onboarding/evorios_browse_block.png",
  "evorios-browse.png": "onboarding/evorios_browse_block.png",
  "stock-garage.png": "onboarding/evorios_stock_garage.png",
  "earn.png": "onboarding/evorios_stock_garage.png",
  "on-block.png": "onboarding/evorios_on_block.png",
  "neighborhood.png": "onboarding/evorios_on_block.png",
  "trip-destination.png": "onboarding/evorios_trip_destination.png",
  "traveler.png": "onboarding/evorios_traveler.png",
  "mr-evorios-full.png": "onboarding/evorios_mr_full.png",
  "mr-evorios.png": "No_back_rentano.png",
  "mascot.png": "No_back_rentano.png",
  "splash-garage.png": "evorios_splash_garage.png",
};

async function optimizePng(inputPath, outputPath, maxWidth = 1536) {
  const image = sharp(inputPath);
  const meta = await image.metadata();
  const width = meta.width && meta.width > maxWidth ? maxWidth : meta.width;
  await image
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .png({ compressionLevel: 9, palette: true, quality: 82 })
    .toFile(outputPath);
}

async function knockOutNearBlack(inputPath, outputPath) {
  const { spawn } = await import("node:child_process");
  const tmp = `${outputPath}.keyed.png`;
  await new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      ["-y", "-i", inputPath, "-vf", "colorkey=0x000000:0.08:0.12", "-frames:v", "1", tmp],
      { stdio: "inherit" },
    );
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
  });
  await optimizePng(tmp, outputPath);
  await import("node:fs/promises").then((fs) => fs.unlink(tmp).catch(() => undefined));
}

async function copyAsset(relTarget, sourcePath, { processBlackBg = false, optimize = true } = {}) {
  const target = path.join(imports, relTarget);
  await mkdir(path.dirname(target), { recursive: true });
  if (processBlackBg) {
    await knockOutNearBlack(sourcePath, target);
  } else if (optimize) {
    await optimizePng(sourcePath, target);
  } else {
    await copyFile(sourcePath, target);
  }
  console.log(`✓ ${path.basename(sourcePath)} → ${relTarget}`);
}

async function applyIncoming() {
  await mkdir(incoming, { recursive: true });
  let applied = 0;

  for (const [name, relTarget] of Object.entries(MAP)) {
    const src = path.join(incoming, name);
    if (!existsSync(src)) continue;
    const processBlackBg = name === "traveler.png";
    await copyAsset(relTarget, src, { processBlackBg });
    if (relTarget === "No_back_rentano.png") {
      await copyAsset("onboarding/evorios_mr_full.png", src);
      await copyAsset("rentano_full.png", src);
    }
    applied++;
  }

  return applied;
}

async function applyWorkspaceStaged() {
  const staged = [
    { src: path.join(root, "out.png"), targets: ["No_back_rentano.png", "onboarding/evorios_mr_full.png", "rentano_full.png"] },
    { src: path.join(root, "traveler.png.png"), targets: ["onboarding/evorios_traveler.png"], processBlackBg: true },
    { src: path.join(imports, "earn.png"), targets: ["onboarding/evorios_stock_garage.png"] },
    { src: path.join(imports, "choose_to_rent.png"), targets: ["onboarding/evorios_browse_block.png"] },
    { src: path.join(imports, "neighborhood_economy.png"), targets: ["onboarding/evorios_on_block.png"] },
  ];

  for (const item of staged) {
    if (!existsSync(item.src)) continue;
    for (const rel of item.targets) {
      await copyAsset(rel, item.src, { processBlackBg: item.processBlackBg });
    }
  }
}

const incomingCount = await applyIncoming();
await applyWorkspaceStaged();

if (incomingCount === 0) {
  console.log("\nDrop PNGs into src/imports/incoming/ — see MAP in scripts/apply-incoming-assets.mjs");
  console.log("Hero (First Hello): evorios-platform-hero.png → evorios_garage_roles.png");
}
