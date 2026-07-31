/**
 * Generates public/sitemap.xml and public/robots.txt for programmatic /rent pages.
 * Only indexable locations are listed. Category hubs follow SEO_CATEGORY_HUBS_INDEXABLE.
 *
 * Run: node scripts/generate-rent-sitemap.mjs
 * (also hooked into npm run build)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const APP_ORIGIN = "https://app.evorios.com";

/** Keep in sync with src/screens/listing/listingItemCategories.ts CATEGORY_DISPLAY_ORDER */
const CATEGORY_NAMES = [
  "Tools & DIY",
  "Garden & Yard",
  "Home & Kitchen",
  "Baby & Kids",
  "Party & Events",
  "Sports & Recreation",
  "Outdoor & Camping",
  "Electronics & Tech",
  "Photo & Video",
  "Bikes & Scooters",
  "Gym & Fitness",
  "Music & Audio",
  "Vehicles",
  "Costume & Cosplay",
  "Office & Business",
  "Construction",
  "Heavy Equipment",
  "Boats & Water",
  "Real Estate",
  "Unique & Other",
];

/**
 * Keep in sync with src/lib/seo/seoLocations.ts
 * Flip indexable when a region launches.
 */
const SEO_LOCATIONS = [
  { slug: "hot-springs-village-ar", indexable: true },
  { slug: "austin-tx", indexable: false },
  { slug: "dallas-tx", indexable: false },
  { slug: "little-rock-ar", indexable: false },
];

function slugifyCategoryName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const categorySlugs = CATEGORY_NAMES.map(slugifyCategoryName);
const indexableLocations = SEO_LOCATIONS.filter((l) => l.indexable);
const categoryHubsIndexable = indexableLocations.length > 0;

function urlEntry(loc, changefreq = "weekly", priority = "0.7") {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const urls = [];

urls.push(urlEntry(`${APP_ORIGIN}/`, "daily", "1.0"));

if (categoryHubsIndexable) {
  for (const slug of categorySlugs) {
    urls.push(urlEntry(`${APP_ORIGIN}/rent/${slug}`, "weekly", "0.8"));
  }
}

for (const loc of indexableLocations) {
  for (const slug of categorySlugs) {
    urls.push(urlEntry(`${APP_ORIGIN}/rent/${slug}/${loc.slug}`, "weekly", "0.7"));
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const robots = `# Evorios — https://app.evorios.com
User-agent: *
Allow: /
Allow: /rent/

Sitemap: ${APP_ORIGIN}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf8");
writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");

console.log(
  `[seo] Wrote sitemap.xml (${urls.length} URLs) and robots.txt — ${indexableLocations.length} indexable cities, ${categorySlugs.length} categories`,
);
