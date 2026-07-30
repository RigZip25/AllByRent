const QUERY_KEY = "evorios_home_query";
const MODE_KEY = "evorios_home_mode";
const LENS_KEY = "evorios_home_lens";
const CATEGORY_KEY = "evorios_home_category";

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

export function loadHomeFeedCategory(): string | null {
  try {
    const raw = sessionStorage.getItem(CATEGORY_KEY)?.trim() ?? "";
    return raw || null;
  } catch {
    return null;
  }
}

export function saveHomeFeedCategory(category: string | null): void {
  try {
    if (!category?.trim()) {
      sessionStorage.removeItem(CATEGORY_KEY);
      return;
    }
    sessionStorage.setItem(CATEGORY_KEY, category.trim());
  } catch {
    /* */
  }
}
