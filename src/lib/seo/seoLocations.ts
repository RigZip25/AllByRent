/**
 * SEO / programmatic landing locations.
 *
 * `indexable` is a manual launch flag — never auto-enable for every city.
 * Only indexable locations appear in sitemap.xml and get robots index,follow.
 * Non-indexable pages are still routable (campaign / preview) but stay noindex.
 */

export type SeoLocation = {
  /** URL segment, e.g. "hot-springs-village-ar" */
  slug: string;
  /** Display name used in H1 / titles, e.g. "Hot Springs Village" */
  name: string;
  /** Optional region/state for display, e.g. "AR" */
  region?: string;
  /** ISO country code */
  country: string;
  /**
   * When true: include in sitemap + allow indexing.
   * When false: page exists but robots noindex (cold pipeline / future launch).
   */
  indexable: boolean;
  /** Optional aliases matched when filtering listings by city label */
  cityAliases?: string[];
};

/**
 * Cities / clusters we operate in or are preparing.
 * Flip `indexable` when a region goes live with supply or an active campaign.
 */
export const SEO_LOCATIONS: readonly SeoLocation[] = [
  {
    slug: "hot-springs-village-ar",
    name: "Hot Springs Village",
    region: "AR",
    country: "US",
    indexable: true,
    cityAliases: ["Hot Springs Village, AR", "Hot Springs Village AR", "71909"],
  },
  {
    slug: "austin-tx",
    name: "Austin",
    region: "TX",
    country: "US",
    indexable: false,
    cityAliases: ["Austin, TX", "Austin TX"],
  },
  {
    slug: "dallas-tx",
    name: "Dallas",
    region: "TX",
    country: "US",
    indexable: false,
    cityAliases: ["Dallas, TX"],
  },
  {
    slug: "little-rock-ar",
    name: "Little Rock",
    region: "AR",
    country: "US",
    indexable: false,
    cityAliases: ["Little Rock, AR"],
  },
] as const;

/** Category hub pages (/rent/{category}) — index when we have at least one live region. */
export const SEO_CATEGORY_HUBS_INDEXABLE = SEO_LOCATIONS.some((loc) => loc.indexable);

export function getSeoLocationBySlug(slug: string): SeoLocation | null {
  const key = slug.trim().toLowerCase();
  if (!key) return null;
  return SEO_LOCATIONS.find((loc) => loc.slug === key) ?? null;
}

export function getIndexableSeoLocations(): SeoLocation[] {
  return SEO_LOCATIONS.filter((loc) => loc.indexable);
}

export function formatSeoLocationLabel(loc: SeoLocation): string {
  return loc.region ? `${loc.name}, ${loc.region}` : loc.name;
}

/** City strings used when querying listings for a location page. */
export function cityQueryTermsForLocation(loc: SeoLocation): string[] {
  const terms = new Set<string>([loc.name, formatSeoLocationLabel(loc), ...(loc.cityAliases ?? [])]);
  return [...terms].map((t) => t.trim()).filter(Boolean);
}
