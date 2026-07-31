import { APP_NAME, APP_ORIGIN, MARKETING_URL } from "../brand";
import { formatSeoLocationLabel, type SeoLocation, SEO_CATEGORY_HUBS_INDEXABLE } from "./seoLocations";
import type { SeoCategory } from "./rentCategories";

export type RentLandingMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  robots: string;
  h1: string;
  intro: string;
};

export function rentCategoryPath(categorySlug: string): string {
  return `/rent/${categorySlug}`;
}

export function rentCategoryCityPath(categorySlug: string, citySlug: string): string {
  return `/rent/${categorySlug}/${citySlug}`;
}

export function buildRentLandingMeta(params: {
  category: SeoCategory;
  location: SeoLocation | null;
}): RentLandingMeta {
  const { category, location } = params;
  const noun = category.searchNoun;

  if (location) {
    const place = formatSeoLocationLabel(location);
    const path = rentCategoryCityPath(category.slug, location.slug);
    return {
      title: `Rent ${noun} from neighbors in ${place} | ${APP_NAME}`,
      description: `Rent ${noun} from neighbors in ${place} on ${APP_NAME}. Browse local garage storefronts — or be the first to list ${noun} on your block.`,
      canonicalPath: path,
      canonicalUrl: `${APP_ORIGIN}${path}`,
      robots: location.indexable ? "index,follow" : "noindex,follow",
      h1: `Rent ${noun} in ${place}`,
      intro: `${APP_NAME} connects neighbors so you can borrow ${noun} nearby instead of buying new. Meetups stay local — usually a short walk or drive on your block.`,
    };
  }

  const path = rentCategoryPath(category.slug);
  return {
    title: `Rent ${noun} from neighbors | ${APP_NAME}`,
    description: `Rent ${noun} from neighbors on ${APP_NAME}. Find garage storefronts near you — or open yours and be first in your category.`,
    canonicalPath: path,
    canonicalUrl: `${APP_ORIGIN}${path}`,
    robots: SEO_CATEGORY_HUBS_INDEXABLE ? "index,follow" : "noindex,follow",
    h1: `Rent ${noun} from neighbors`,
    intro: `${APP_NAME} is a neighborhood marketplace: every home is a business cell with a garage storefront. Browse ${noun} near you, or stock your garage and earn when neighbors need them.`,
  };
}

export function marketingHomeUrl(): string {
  return MARKETING_URL;
}

export function appHomeUrl(): string {
  return APP_ORIGIN;
}
