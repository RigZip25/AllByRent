const FAVORITES_KEY = "allbyrent_favorite_listing_ids";

export function loadFavoriteListingIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function saveFavoriteListingIds(ids: string[]): void {
  try {
    const unique = [...new Set(ids)];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(unique));
  } catch {
    /* ignore */
  }
}

export function isFavoriteListing(id: string): boolean {
  return loadFavoriteListingIds().includes(id);
}

export function toggleFavoriteListing(id: string): boolean {
  const ids = loadFavoriteListingIds();
  const index = ids.indexOf(id);
  if (index >= 0) {
    ids.splice(index, 1);
    saveFavoriteListingIds(ids);
    return false;
  }
  ids.unshift(id);
  saveFavoriteListingIds(ids);
  return true;
}
