import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

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

export async function syncFavoritesFromRemote(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return loadFavoriteListingIds();
  const supabase = getSupabaseClient();
  if (!supabase) return loadFavoriteListingIds();

  const { data, error } = await supabase
    .from("favorite_listings")
    .select("listing_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return loadFavoriteListingIds();

  const ids = (data as { listing_id: string }[]).map((row) => row.listing_id);
  const merged = [...new Set([...ids, ...loadFavoriteListingIds()])];
  saveFavoriteListingIds(merged);
  return merged;
}

async function persistFavoriteRemote(
  userId: string,
  listingId: string,
  favorited: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  if (favorited) {
    const { error } = await supabase.from("favorite_listings").upsert({
      user_id: userId,
      listing_id: listingId,
    });
    if (error) {
      // Table may not exist yet on older deployments.
    }
    return;
  }

  const { error } = await supabase
    .from("favorite_listings")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);
  if (error) {
    // ignore
  }
}

export async function toggleFavoriteListingForUser(
  userId: string | null | undefined,
  listingId: string,
): Promise<boolean> {
  const favorited = toggleFavoriteListing(listingId);
  if (userId) {
    await persistFavoriteRemote(userId, listingId, favorited);
  }
  return favorited;
}
