# Programmatic /rent SEO landings
#
# Public URLs (apex — indexed):
#   https://evorios.com/rent/{category}
#   https://evorios.com/rent/{category}/{city}
#
# Serving architecture:
#   - Generator + live data: this app (AllByRent / app.evorios.com)
#   - Browser URL / Google: apex domain via marketing-site Vercel rewrite
#     (AllByRent-Web) → proxies to app `__seo/rent/*` (200, not a redirect)
#   - app.evorios.com/rent/* → 301 to https://evorios.com/rent/*
#   - app `__seo/rent/*` is noindex (X-Robots-Tag) — proxy-only path
#
# Source of truth:
#   - Categories: listingItemCategories CATEGORY_DISPLAY_ORDER (20)
#   - Cities + indexable flags: src/lib/seo/seoLocations.ts
#   - Sitemap generator: scripts/generate-rent-sitemap.mjs
#     → writes scripts/seo/evorios-apex-sitemap.xml (copy into AllByRent-Web)
#     → app robots.txt Disallow: /rent/ and /__seo/
#
# Indexing discipline:
#   - Empty city page = founding CTA (business cell / open garage), not a dead end.
#   - Index a wide CEE net (CZ/SK/PL majors) so organic + social can cold-start anywhere
#     in the launch region — including Poznań, Brno, Košice, etc.
#   - Do NOT sitemap every city on Earth (doorway risk). Add a city to seoLocations when
#     you want it crawlable; listed pages always render with real empty-state content.
#   - `indexable: false` = built but out of sitemap (US pipeline / preview).
#   - ONE sitemap on the apex: https://evorios.com/sitemap.xml
#
# Empty state rule:
#   Never show an empty listing grid. If supply is zero, show the founding-host CTA
#   (“Be the first to open a garage…”) that routes into stock-your-garage on the app.
#
# Structured data:
#   Listings present → ItemList of Product/Offer (honest prices only).
#   Empty → WebPage only (never invent products).
#   Canonical always https://evorios.com/rent/...
