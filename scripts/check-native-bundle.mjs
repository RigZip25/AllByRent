#!/usr/bin/env node
/**
 * Guards the store bundle. Running `npm run build` without CAPACITOR_BUILD=1
 * and then `cap sync` ships the web service worker inside the native shell,
 * where it caches the wrong paths and pins users to a stale app.
 *
 * Prefer: `npm run build:native` (sets CAPACITOR_BUILD=1, checks, then syncs).
 * `npm run cap:sync` runs this check first so a plain `npm run build` cannot
 * be synced into the store binary by accident (Q11).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");

if (!fs.existsSync(dist)) {
  console.error("dist/ is missing — run CAPACITOR_BUILD=1 npm run build first.");
  console.error("Or use: npm run build:native");
  process.exit(1);
}

const entries = fs.readdirSync(dist);
const offenders = entries.filter(
  (name) =>
    name === "sw.js" ||
    name === "push-sw.js" ||
    name === "registerSW.js" ||
    /^workbox-.*\.js$/.test(name),
);

if (offenders.length > 0) {
  console.error("Web service worker artifacts found in the native bundle:");
  for (const name of offenders) console.error(`  dist/${name}`);
  console.error("");
  console.error("A plain `npm run build` produced a PWA bundle. For store apps use:");
  console.error("  npm run build:native");
  console.error("or:");
  console.error("  CAPACITOR_BUILD=1 npm run build && npm run cap:sync");
  process.exit(1);
}

console.log(`OK: no service worker artifacts in dist/ (${entries.length} entries).`);
