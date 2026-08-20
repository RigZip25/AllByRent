/** Shared FactCard knowledge types (canonical KB + locale overlays). */

export type CategoryFactQa = { q: string; a: string };

export type CategoryFactBlock = {
  title: string;
  summary: string;
  /** Preferred short FAQ: one question + 1–2 sentence answer each. */
  qa?: CategoryFactQa[];
  hostTipTitle?: string;
  hostTip?: string;
  hostTipLinkLabel?: string;
  hostTipLinkHref?: string;
  whyGeoTitle?: string;
  whyGeo?: string;
  contactlessTitle?: string;
  contactless?: string;
  flowTitle?: string;
  flow?: string;
  layersTitle?: string;
  layers?: string;
  claimsTitle?: string;
  claims?: string;
};

export type CategoryFactsBundle = {
  expand: string;
  collapse: string;
  byCategory: Partial<Record<string, CategoryFactBlock>>;
  bySubcategory?: Partial<Record<string, Partial<Record<string, CategoryFactBlock>>>>;
};

/** Locale overlay may omit shelves; missing keys fall back to canonical EN. */
export type CategoryFactsOverlay = {
  expand?: string;
  collapse?: string;
  byCategory?: Partial<Record<string, CategoryFactBlock>>;
  bySubcategory?: Partial<Record<string, Partial<Record<string, CategoryFactBlock>>>>;
};
