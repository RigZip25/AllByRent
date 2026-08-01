/**
 * Generates SEO sitemap artifacts for programmatic /rent pages.
 *
 * - public/robots.txt — app host: disallow /rent (apex owns indexing)
 * - public/sitemap.xml — app host stub (points crawlers to apex)
 * - Also prints apex rent URL count for AllByRent-Web sitemap merge
 *
 * Canonical /rent URLs live on https://evorios.com (marketing site proxy).
 * Keep SEO_LOCATIONS in sync with src/lib/seo/seoLocations.ts.
 *
 * Run: node scripts/generate-rent-sitemap.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const SEO_ORIGIN = "https://evorios.com";
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
 * Current launch: Praha + Bratislava (CZ/SK).
 */
const SEO_LOCATIONS = [
  { slug: "praha", indexable: true },
  { slug: "bratislava", indexable: true },
  { slug: "brno", indexable: false },
  { slug: "ostrava", indexable: false },
  { slug: "kosice", indexable: false },
  { slug: "hot-springs-village-ar", indexable: false },
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
const today = new Date().toISOString().slice(0, 10);

function urlEntry(loc, changefreq = "weekly", priority = "0.7") {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/** Full apex sitemap: marketing pages + indexable /rent pages. */
const apexUrls = [];
apexUrls.push(urlEntry(`${SEO_ORIGIN}/`, "weekly", "1.0"));
apexUrls.push(urlEntry(`${SEO_ORIGIN}/privacy.html`, "yearly", "0.3"));
apexUrls.push(urlEntry(`${SEO_ORIGIN}/terms.html`, "yearly", "0.3"));
apexUrls.push(urlEntry(`${SEO_ORIGIN}/refunds.html`, "yearly", "0.3"));

if (categoryHubsIndexable) {
  for (const slug of categorySlugs) {
    apexUrls.push(urlEntry(`${SEO_ORIGIN}/rent/${slug}`, "weekly", "0.8"));
  }
}

for (const loc of indexableLocations) {
  for (const slug of categorySlugs) {
    apexUrls.push(urlEntry(`${SEO_ORIGIN}/rent/${slug}/${loc.slug}`, "weekly", "0.7"));
  }
}

const apexSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${apexUrls.join("\n")}
</urlset>
`;

/** App host sitemap — no /rent URLs (avoid duplicate indexing). */
const appSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntry(`${APP_ORIGIN}/`, "daily", "1.0")}
</urlset>
`;

const appRobots = `# Evorios app — https://app.evorios.com
# Programmatic /rent SEO landings are indexed on the apex domain only.
User-agent: *
Allow: /
Disallow: /rent/
Disallow: /__seo/

Sitemap: ${SEO_ORIGIN}/sitemap.xml
`;

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "sitemap.xml"), appSitemap, "utf8");
writeFileSync(join(publicDir, "robots.txt"), appRobots, "utf8");

/** Artifact for AllByRent-Web (marketing) — copy into that repo's sitemap.xml */
const seoOutDir = join(root, "scripts", "seo");
mkdirSync(seoOutDir, { recursive: true });
writeFileSync(join(seoOutDir, "evorios-apex-sitemap.xml"), apexSitemap, "utf8");

console.log(
  `[seo] Apex sitemap: ${apexUrls.length} URLs → scripts/seo/evorios-apex-sitemap.xml`,
);
console.log(
  `[seo] App robots disallow /rent + /__seo; sitemap points to ${SEO_ORIGIN}/sitemap.xml`,
);
console.log(
  `[seo] Indexable cities: ${indexableLocations.length}; categories: ${categorySlugs.length}`,
);
