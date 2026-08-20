const QUERY_KEY = "evorios_home_query";
const MODE_KEY = "evorios_home_mode";
const LENS_KEY = "evorios_home_lens";
const CATEGORY_KEY = "evorios_home_category";
const INTERESTS_KEY = "evorios_home_interests_v1";

/** One browse pick: whole category, or a specific subcategory under it. */
export type BrowseInterest = {
  category: string;
  subcategory?: string;
};

export function browseInterestKey(interest: BrowseInterest): string {
  const cat = interest.category.trim();
  const sub = interest.subcategory?.trim() ?? "";
  return `${cat}::${sub}`;
}

export function normalizeBrowseInterests(raw: BrowseInterest[]): BrowseInterest[] {
  const byKey = new Map<string, BrowseInterest>();
  for (const item of raw) {
    const category = item.category?.trim() ?? "";
    if (!category) continue;
    const subcategory = item.subcategory?.trim() || undefined;
    const next: BrowseInterest = subcategory ? { category, subcategory } : { category };
    byKey.set(browseInterestKey(next), next);
  }
  return Array.from(byKey.values());
}

export function formatBrowseInterestLabel(interest: BrowseInterest): string {
  const cat = interest.category.trim();
  const sub = interest.subcategory?.trim();
  return sub ? `${cat} · ${sub}` : cat;
}

export function loadHomeFeedQuery(): string {
  try {
    return sessionStorage.getItem(QUERY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveHomeFeedQuery(query: string): void {
  try {
    sessionStorage.setItem(QUERY_KEY, query);
  } catch {
    /* private mode */
  }
}

export function loadHomeFeedMode(): "all" | "rent" | "buy" {
  try {
    const raw = sessionStorage.getItem(MODE_KEY);
    if (raw === "rent" || raw === "buy" || raw === "all") return raw;
    // Legacy "gift" chip → show everything until user picks again.
    if (raw === "gift") return "all";
  } catch {
    /* */
  }
  return "all";
}

export function saveHomeFeedMode(mode: "all" | "rent" | "buy"): void {
  try {
    sessionStorage.setItem(MODE_KEY, mode);
  } catch {
    /* */
  }
}

export function loadHomeFeedLens(): "feed" | "garages" {
  try {
    return sessionStorage.getItem(LENS_KEY) === "garages" ? "garages" : "feed";
  } catch {
    return "feed";
  }
}

export function saveHomeFeedLens(lens: "feed" | "garages"): void {
  try {
    sessionStorage.setItem(LENS_KEY, lens);
  } catch {
    /* */
  }
}

/** @deprecated Prefer loadHomeFeedInterests — kept for one-shot migration. */
export function loadHomeFeedCategory(): string | null {
  try {
    const raw = sessionStorage.getItem(CATEGORY_KEY)?.trim() ?? "";
    return raw || null;
  } catch {
    return null;
  }
}

/** Clears or seeds a single category interest (legacy callers / browse hub reset). */
export function saveHomeFeedCategory(category: string | null): void {
  if (!category?.trim()) {
    saveHomeFeedInterests([]);
    return;
  }
  saveHomeFeedInterests([{ category: category.trim() }]);
}

export function loadHomeFeedInterests(): BrowseInterest[] {
  try {
    const raw = sessionStorage.getItem(INTERESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BrowseInterest[];
      if (Array.isArray(parsed)) return normalizeBrowseInterests(parsed);
    }
    const legacy = loadHomeFeedCategory();
    if (legacy) return [{ category: legacy }];
  } catch {
    /* */
  }
  return [];
}

export function saveHomeFeedInterests(interests: BrowseInterest[]): void {
  try {
    const next = normalizeBrowseInterests(interests);
    if (next.length === 0) {
      sessionStorage.removeItem(INTERESTS_KEY);
      sessionStorage.removeItem(CATEGORY_KEY);
      return;
    }
    sessionStorage.setItem(INTERESTS_KEY, JSON.stringify(next));
    // Keep legacy key in sync with first category-wide pick (or first category).
    const wide = next.find((i) => !i.subcategory) ?? next[0];
    sessionStorage.setItem(CATEGORY_KEY, wide.category);
  } catch {
    /* */
  }
}
