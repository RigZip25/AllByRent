/**
 * Submit apex URLs to IndexNow (Bing, Yandex, Seznam, Naver, …).
 *
 * Prerequisites:
 * 1. Deploy scripts/seo/allbyrent-web/<key>.txt to https://evorios.com/<key>.txt
 * 2. Deploy updated sitemap.xml to AllByRent-Web (includes locales)
 *
 * Usage:
 *   npm run seo:indexnow
 *   npm run seo:indexnow -- --limit=20
 *   npm run seo:indexnow -- --urls=https://evorios.com/,https://evorios.com/ru/
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyMeta = JSON.parse(
  readFileSync(join(__dirname, "indexnow-key.json"), "utf8"),
);
const sitemapPath = join(__dirname, "evorios-apex-sitemap.xml");

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const urlsArg = args.find((a) => a.startsWith("--urls="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

function urlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

let urls;
if (urlsArg) {
  urls = urlsArg
    .slice("--urls=".length)
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
} else {
  const xml = readFileSync(sitemapPath, "utf8");
  urls = urlsFromSitemap(xml);
}

if (limit && Number.isFinite(limit) && limit > 0) {
  urls = urls.slice(0, limit);
}

if (!urls.length) {
  console.error("[indexnow] No URLs to submit");
  process.exit(1);
}

const endpoint = "https://api.indexnow.org/indexnow";
const body = {
  host: keyMeta.host,
  key: keyMeta.key,
  keyLocation: keyMeta.keyLocation,
  urlList: urls,
};

console.log(`[indexnow] Submitting ${urls.length} URL(s) → ${endpoint}`);
console.log(`[indexnow] keyLocation: ${keyMeta.keyLocation}`);

const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`[indexnow] HTTP ${res.status}`);
if (text) console.log(text.slice(0, 500));

// 200 / 202 = accepted; 422 = unprocessable (key not reachable yet, etc.)
if (res.status !== 200 && res.status !== 202) {
  console.error(
    "[indexnow] Failed. Confirm the key file is live at keyLocation, then retry.",
  );
  process.exit(1);
}

console.log("[indexnow] OK — Bing/Yandex will fetch when ready.");
