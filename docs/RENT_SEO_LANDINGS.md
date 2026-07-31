# Programmatic /rent SEO landings
#
# Routes (SPA):
#   /rent/{category}              — category hub
#   /rent/{category}/{city}       — category × city
#
# Source of truth:
#   - Categories: listingItemCategories CATEGORY_DISPLAY_ORDER (20)
#   - Cities + indexable flags: src/lib/seo/seoLocations.ts
#   - Sitemap generator: scripts/generate-rent-sitemap.mjs (keep in sync)
#
# Indexing discipline:
#   - Flip `indexable: true` only for regions with real supply or an active campaign.
#   - Non-indexable city pages still render (campaign / preview) with robots noindex.
#   - Sitemap lists only indexable city×category URLs (+ category hubs when any city is live).
#
# Empty state rule:
#   Never show an empty listing grid. If supply is zero, show the founding-host CTA
#   (“Be the first to open a garage…”) that routes into stock-your-garage.
#
# Structured data:
#   Listings present → ItemList of Product/Offer (honest prices only).
#   Empty → WebPage only (never invent products).
