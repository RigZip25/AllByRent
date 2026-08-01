import { useEffect, useMemo, useState } from "react";
import { APP_NAME, SEO_ORIGIN, BRAND_GREEN, BRAND_AMBER } from "../lib/brand";
import type { ListingDraft } from "./listing/types";
import { ListingFeedCard, offerTypeFromModes } from "../app/components/ListingFeedCard";
import { getRelatedSeoCategories, type SeoCategory } from "../lib/seo/rentCategories";
import {
  formatSeoLocationLabel,
  getIndexableSeoLocations,
  SEO_LOCATIONS,
  type SeoLocation,
} from "../lib/seo/seoLocations";
import {
  buildRentLandingMeta,
  rentCategoryCityPath,
  rentCategoryPath,
  rentLandingAbsoluteUrl,
} from "../lib/seo/rentLandingMeta";
import { buildRentLandingJsonLd } from "../lib/seo/rentLandingSchema";
import { fetchRentLandingListings } from "../lib/seo/fetchRentLandingListings";
import { useDocumentMeta } from "../lib/seo/useDocumentMeta";

function formatListingPrice(listing: ListingDraft): string {
  if (listing.modes.rent && listing.pricing.dailyRate.trim()) {
    const n = listing.pricing.dailyRate.replace(/[^0-9.]/g, "");
    return n ? `$${n}/day` : "Rent";
  }
  if (listing.modes.sell && listing.pricing.salePrice.trim()) {
    const n = listing.pricing.salePrice.replace(/[^0-9.]/g, "");
    return n ? `$${n}` : "Buy";
  }
  return "Ask";
}

type RentLandingScreenProps = {
  category: SeoCategory;
  location: SeoLocation | null;
  onOpenListing: (listingId: string) => void;
  onStockGarage: (prefill: { category: string; city?: string }) => void;
  onOpenApp: () => void;
  onNavigateRentPath: (path: string) => void;
};

export function RentLandingScreen({
  category,
  location,
  onOpenListing,
  onStockGarage,
  onOpenApp,
  onNavigateRentPath,
}: RentLandingScreenProps) {
  const [listings, setListings] = useState<ListingDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = useMemo(
    () => buildRentLandingMeta({ category, location }),
    [category, location],
  );

  const jsonLd = useMemo(
    () =>
      buildRentLandingJsonLd({
        meta,
        category,
        location,
        listings,
      }),
    [meta, category, location, listings],
  );

  useDocumentMeta({
    title: meta.title,
    description: meta.description,
    canonicalUrl: meta.canonicalUrl,
    robots: meta.robots,
    jsonLd,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchRentLandingListings({ category, location }).then((rows) => {
      if (cancelled) return;
      setListings(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, location]);

  const placeLabel = location ? formatSeoLocationLabel(location) : null;
  const related = getRelatedSeoCategories(category.slug, 6);
  const indexableCities = getIndexableSeoLocations();
  const cityLinks = location
    ? SEO_LOCATIONS.filter((c) => c.slug !== location.slug)
    : SEO_LOCATIONS;

  const stockCity = placeLabel ?? undefined;
  const empty = !loading && listings.length === 0;

  return (
    <div className="rent-landing screen screen-adaptive mx-auto flex w-full max-w-3xl flex-col bg-white text-foreground">
      <header
        className="shrink-0 border-b px-5 py-4"
        style={{ borderColor: "#E8E6E0", background: "linear-gradient(180deg, #F3F8F5 0%, #fff 100%)" }}
      >
        <a
          href={SEO_ORIGIN}
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: BRAND_GREEN }}
        >
          {APP_NAME}
        </a>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Neighborly marketplace · garage storefronts
        </p>
      </header>

      <main className="flex-1 space-y-8 px-5 py-6">
        <section className="space-y-3">
          <p className="text-2xl" aria-hidden="true">
            {category.icon}
          </p>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight" style={{ color: BRAND_GREEN }}>
            {meta.h1}
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">{meta.intro}</p>
        </section>

        {loading ? (
          <p className="text-sm text-muted-foreground">Checking nearby garages…</p>
        ) : null}

        {!loading && listings.length > 0 ? (
          <section className="space-y-4" aria-label="Available listings">
            <h2 className="text-lg font-semibold" style={{ color: BRAND_GREEN }}>
              Available near {placeLabel ?? "you"}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listings.map((listing) => (
                <ListingFeedCard
                  key={listing.id}
                  title={listing.title || category.name}
                  price={formatListingPrice(listing)}
                  rating={0}
                  reviews={0}
                  distance={placeLabel ?? ""}
                  cover={listing.photos[0] ?? null}
                  offerType={offerTypeFromModes(listing.modes, listing.pricing.salePrice)}
                  itemHeavy={listing.handoff.itemHeavy}
                  onSelect={() => onOpenListing(listing.id)}
                  showFavoriteAction={false}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenApp}
              className="text-sm font-semibold underline"
              style={{ color: BRAND_GREEN }}
            >
              Open the full app to book →
            </button>
          </section>
        ) : null}

        {empty ? (
          <section
            className="space-y-4 rounded-2xl border px-5 py-6"
            style={{
              borderColor: `${BRAND_GREEN}33`,
              background:
                "linear-gradient(160deg, rgba(13,92,58,0.08) 0%, rgba(26,158,110,0.1) 40%, #fff 100%)",
            }}
            aria-label="Be the first host"
          >
            <p
              className="inline-block rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              Open territory
            </p>
            <h2 className="text-[22px] font-bold leading-snug" style={{ color: BRAND_GREEN }}>
              {placeLabel
                ? `Be the first to open a garage for ${category.searchNoun} in ${placeLabel}`
                : `Be the first to list ${category.searchNoun} on your block`}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nobody has stocked {category.searchNoun}
              {placeLabel ? ` in ${placeLabel}` : ""} on {APP_NAME} yet. That is demand waiting —
              list what you already own, set a fair daily rate, and neighbors can request pickup
              from your garage storefront.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>· Photos + category — takes a few minutes</li>
              <li>· You control price, availability, and handoff</li>
              <li>· Payments stay in-app — no cash meetups for tracked rentals</li>
            </ul>
            <button
              type="button"
              onClick={() =>
                onStockGarage({
                  category: category.name,
                  city: stockCity,
                })
              }
              className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm sm:w-auto sm:px-8"
              style={{ backgroundColor: BRAND_AMBER, color: "#1a1a1a" }}
            >
              Stock your garage →
            </button>
            <p className="text-[12px] text-muted-foreground">
              Looking to rent instead?{" "}
              <button
                type="button"
                onClick={onOpenApp}
                className="font-semibold underline"
                style={{ color: BRAND_GREEN }}
              >
                Open {APP_NAME} and browse nearby
              </button>
              , or check back as hosts list.
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-base font-semibold" style={{ color: BRAND_GREEN }}>
            How neighbor rental works
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Browse a category near your block (or open your own garage).</li>
            <li>Request dates, pay in-app, and agree on a local meetup.</li>
            <li>Scan the item QR at pickup and return so both sides stay protected.</li>
          </ol>
        </section>

        {location ? (
          <section className="space-y-2">
            <h2 className="text-base font-semibold" style={{ color: BRAND_GREEN }}>
              {category.name} in other areas
            </h2>
            <ul className="flex flex-wrap gap-2">
              <li>
                <a
                  href={rentLandingAbsoluteUrl(rentCategoryPath(category.slug))}
                  className="inline-block rounded-lg border px-3 py-1.5 text-sm"
                  style={{ borderColor: "#E8E6E0" }}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateRentPath(rentCategoryPath(category.slug));
                  }}
                >
                  All areas
                </a>
              </li>
              {cityLinks.map((city) => {
                const path = rentCategoryCityPath(category.slug, city.slug);
                return (
                  <li key={city.slug}>
                    <a
                      href={rentLandingAbsoluteUrl(path)}
                      className="inline-block rounded-lg border px-3 py-1.5 text-sm"
                      style={{ borderColor: "#E8E6E0" }}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigateRentPath(path);
                      }}
                    >
                      {formatSeoLocationLabel(city)}
                      {!city.indexable ? " · soon" : ""}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section className="space-y-2">
            <h2 className="text-base font-semibold" style={{ color: BRAND_GREEN }}>
              Cities we are launching
            </h2>
            <ul className="flex flex-wrap gap-2">
              {SEO_LOCATIONS.map((city) => {
                const path = rentCategoryCityPath(category.slug, city.slug);
                return (
                  <li key={city.slug}>
                    <a
                      href={rentLandingAbsoluteUrl(path)}
                      className="inline-block rounded-lg border px-3 py-1.5 text-sm"
                      style={{ borderColor: "#E8E6E0" }}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigateRentPath(path);
                      }}
                    >
                      {formatSeoLocationLabel(city)}
                      {city.indexable ? "" : " · soon"}
                    </a>
                  </li>
                );
              })}
            </ul>
            {indexableCities.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Regional pages are live for campaigns; indexing turns on when a city launches.
              </p>
            ) : null}
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-base font-semibold" style={{ color: BRAND_GREEN }}>
            Related categories
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((cat) => {
              const path = location
                ? rentCategoryCityPath(cat.slug, location.slug)
                : rentCategoryPath(cat.slug);
              return (
                <li key={cat.slug}>
                  <a
                    href={rentLandingAbsoluteUrl(path)}
                    className="inline-block rounded-lg border px-3 py-1.5 text-sm"
                    style={{ borderColor: "#E8E6E0" }}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateRentPath(path);
                    }}
                  >
                    {cat.icon} {cat.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <nav className="border-t pt-4 text-sm" style={{ borderColor: "#E8E6E0" }} aria-label="Site">
          <ul className="flex flex-wrap gap-4 text-muted-foreground">
            <li>
              <a href={SEO_ORIGIN} className="underline hover:text-foreground">
                evorios.com
              </a>
            </li>
            <li>
              <button type="button" onClick={onOpenApp} className="underline hover:text-foreground">
                Open app
              </button>
            </li>
            <li>
              <a href={`${SEO_ORIGIN}/terms.html`} className="underline hover:text-foreground">
                Terms
              </a>
            </li>
            <li>
              <a href={`${SEO_ORIGIN}/privacy.html`} className="underline hover:text-foreground">
                Privacy
              </a>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
