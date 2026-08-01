/**
 * SEO / programmatic landing locations.
 *
 * Product rule: empty city×category = founding-host CTA (“be the first cell”),
 * not a dead end. We index a wide CEE net so organic + social traffic from
 * anywhere in the launch region can land on a real page and open a garage.
 *
 * Still not “every city on Earth” in the sitemap (doorway risk at planetary
 * scale). Add a city here when you want it crawlable; pages for listed cities
 * always render with the empty-state CTA even with zero supply.
 *
 * `indexable: false` = built for campaigns/preview, kept out of sitemap.
 */

export type SeoLocation = {
  /** URL segment, e.g. "poznan" */
  slug: string;
  /** Display name used in H1 / titles */
  name: string;
  /** Optional region for display, e.g. "PL" */
  region?: string;
  /** ISO country code */
  country: string;
  /**
   * When true: include in sitemap + allow indexing.
   * When false: page exists but robots noindex.
   */
  indexable: boolean;
  /** Optional aliases matched when filtering listings by city label */
  cityAliases?: string[];
};

/**
 * Launch geography: CZ + SK + PL majors — all indexable for cold-start SEO.
 * US kept as noindex pipeline for later ads / unknown geo.
 */
export const SEO_LOCATIONS: readonly SeoLocation[] = [
  // --- Czechia ---
  {
    slug: "praha",
    name: "Praha",
    region: "CZ",
    country: "CZ",
    indexable: true,
    cityAliases: ["Prague", "Praha, Czechia", "Prague, Czechia", "Praha, CZ", "Prague, CZ"],
  },
  {
    slug: "brno",
    name: "Brno",
    region: "CZ",
    country: "CZ",
    indexable: true,
    cityAliases: ["Brno, Czechia", "Brno, CZ"],
  },
  {
    slug: "ostrava",
    name: "Ostrava",
    region: "CZ",
    country: "CZ",
    indexable: true,
    cityAliases: ["Ostrava, Czechia", "Ostrava, CZ"],
  },
  {
    slug: "plzen",
    name: "Plzeň",
    region: "CZ",
    country: "CZ",
    indexable: true,
    cityAliases: ["Plzen", "Pilsen", "Plzeň, Czechia", "Plzen, CZ"],
  },
  {
    slug: "liberec",
    name: "Liberec",
    region: "CZ",
    country: "CZ",
    indexable: true,
    cityAliases: ["Liberec, Czechia", "Liberec, CZ"],
  },
  {
    slug: "olomouc",
    name: "Olomouc",
    region: "CZ",
    country: "CZ",
    indexable: true,
    cityAliases: ["Olomouc, Czechia", "Olomouc, CZ"],
  },
  // --- Slovakia ---
  {
    slug: "bratislava",
    name: "Bratislava",
    region: "SK",
    country: "SK",
    indexable: true,
    cityAliases: ["Bratislava, Slovakia", "Bratislava, SK", "Bratislava, Slovensko"],
  },
  {
    slug: "kosice",
    name: "Košice",
    region: "SK",
    country: "SK",
    indexable: true,
    cityAliases: ["Kosice", "Košice, Slovakia", "Kosice, SK"],
  },
  {
    slug: "zilina",
    name: "Žilina",
    region: "SK",
    country: "SK",
    indexable: true,
    cityAliases: ["Zilina", "Žilina, Slovakia", "Zilina, SK"],
  },
  {
    slug: "presov",
    name: "Prešov",
    region: "SK",
    country: "SK",
    indexable: true,
    cityAliases: ["Presov", "Prešov, Slovakia", "Presov, SK"],
  },
  // --- Poland (incl. Poznań — cold-start from social / neighbors) ---
  {
    slug: "poznan",
    name: "Poznań",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Poznan", "Poznań, Poland", "Poznan, PL", "Poznań, Polska"],
  },
  {
    slug: "warszawa",
    name: "Warszawa",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Warsaw", "Warszawa, Poland", "Warsaw, PL", "Warszawa, Polska"],
  },
  {
    slug: "krakow",
    name: "Kraków",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Krakow", "Cracow", "Kraków, Poland", "Krakow, PL"],
  },
  {
    slug: "wroclaw",
    name: "Wrocław",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Wroclaw", "Wrocław, Poland", "Wroclaw, PL"],
  },
  {
    slug: "gdansk",
    name: "Gdańsk",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Gdansk", "Gdańsk, Poland", "Gdansk, PL"],
  },
  {
    slug: "lodz",
    name: "Łódź",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Lodz", "Łódź, Poland", "Lodz, PL"],
  },
  {
    slug: "katowice",
    name: "Katowice",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Katowice, Poland", "Katowice, PL"],
  },
  {
    slug: "lublin",
    name: "Lublin",
    region: "PL",
    country: "PL",
    indexable: true,
    cityAliases: ["Lublin, Poland", "Lublin, PL"],
  },
  // --- US pipeline (ads / later) — built, not in sitemap yet ---
  {
    slug: "hot-springs-village-ar",
    name: "Hot Springs Village",
    region: "AR",
    country: "US",
    indexable: false,
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
