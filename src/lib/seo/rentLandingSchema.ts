import { APP_NAME, APP_ORIGIN } from "../brand";
import type { ListingDraft } from "../../screens/listing/types";
import type { SeoCategory } from "./rentCategories";
import type { SeoLocation } from "./seoLocations";
import { formatSeoLocationLabel } from "./seoLocations";
import type { RentLandingMeta } from "./rentLandingMeta";

function parseMoney(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function listingOfferPrice(listing: ListingDraft): { price: number; priceCurrency: string; unitText?: string } | null {
  if (listing.modes.rent) {
    const daily = parseMoney(listing.pricing.dailyRate);
    if (daily != null) {
      return { price: daily, priceCurrency: "USD", unitText: "DAY" };
    }
  }
  if (listing.modes.sell || listing.modes.gift) {
    const sale = parseMoney(listing.pricing.salePrice);
    if (sale != null) {
      return { price: sale, priceCurrency: "USD" };
    }
  }
  return null;
}

/**
 * Honest JSON-LD for rent landings.
 * - With listings: ItemList of Product (+ Offer when priced).
 * - Empty: WebPage only — never invent Product/Offer items.
 */
export function buildRentLandingJsonLd(params: {
  meta: RentLandingMeta;
  category: SeoCategory;
  location: SeoLocation | null;
  listings: ListingDraft[];
}): Record<string, unknown> {
  const { meta, category, location, listings } = params;
  const place = location ? formatSeoLocationLabel(location) : null;

  const webPage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${meta.canonicalUrl}#webpage`,
    url: meta.canonicalUrl,
    name: meta.title,
    description: meta.description,
    isPartOf: {
      "@type": "WebSite",
      name: APP_NAME,
      url: APP_ORIGIN,
    },
    about: {
      "@type": "Thing",
      name: category.name,
    },
  };

  if (place) {
    webPage.spatialCoverage = {
      "@type": "Place",
      name: place,
    };
  }

  if (listings.length === 0) {
    return {
      "@context": "https://schema.org",
      ...webPage,
    };
  }

  const itemListElement = listings.slice(0, 30).map((listing, index) => {
    const product: Record<string, unknown> = {
      "@type": "Product",
      name: listing.title || category.name,
      category: listing.category || category.name,
      description: (listing.description || "").slice(0, 300) || undefined,
      url: `${APP_ORIGIN}/item/${encodeURIComponent(listing.id)}`,
    };

    const offerPrice = listingOfferPrice(listing);
    if (offerPrice) {
      const offer: Record<string, unknown> = {
        "@type": "Offer",
        price: offerPrice.price,
        priceCurrency: offerPrice.priceCurrency,
        availability: "https://schema.org/InStock",
        url: product.url,
      };
      if (offerPrice.unitText) {
        offer.priceSpecification = {
          "@type": "UnitPriceSpecification",
          price: offerPrice.price,
          priceCurrency: offerPrice.priceCurrency,
          unitText: offerPrice.unitText,
        };
      }
      product.offers = offer;
    }

    return {
      "@type": "ListItem",
      position: index + 1,
      item: product,
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      webPage,
      {
        "@type": "ItemList",
        "@id": `${meta.canonicalUrl}#itemlist`,
        name: meta.h1,
        numberOfItems: listings.length,
        itemListElement,
      },
    ],
  };
}
