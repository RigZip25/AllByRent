const QUERY_KEY = "evorios_home_query";
const MODE_KEY = "evorios_home_mode";
const LENS_KEY = "evorios_home_lens";

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

export function loadHomeFeedMode(): "all" | "rent" | "buy" | "gift" {
  try {
    const raw = sessionStorage.getItem(MODE_KEY);
    if (raw === "rent" || raw === "buy" || raw === "gift" || raw === "all") return raw;
  } catch {
    /* */
  }
  return "all";
}

export function saveHomeFeedMode(mode: "all" | "rent" | "buy" | "gift"): void {
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
