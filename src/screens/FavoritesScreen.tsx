import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import {
  loadFavoriteListingIds,
  toggleFavoriteListing,
} from "../lib/favoritesStorage";
import { loadPublishedListings } from "../lib/listingStorage";
import { getListingDisplayTitle } from "../lib/listingQr";
import type { ListingDraft } from "./listing/types";
import { useMediaUrl } from "../lib/useMediaUrl";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";

function FavoriteCard({
  listing,
  onRemove,
  onOpen,
}: {
  listing: ListingDraft;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const title = getListingDisplayTitle(listing.title);
  const rate = listing.pricing.dailyRate?.trim();
  const cover = listing.photos?.[0] ?? null;
  const coverThumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const coverUrl = useMediaUrl(coverThumb).url;
  return (
    <li
      className="flex items-center gap-3 rounded-2xl border bg-white p-3"
      style={{ borderColor: BORDER }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-80"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F0F4F2]">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl" aria-hidden>
              📦
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">
            {listing.category || "Listing"}
            {rate ? ` · $${rate}/day` : ""}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: BORDER }}
        aria-label={`Remove ${title} from favorites`}
      >
        <Heart className="h-5 w-5 fill-[#E11D48] text-[#E11D48]" />
      </button>
    </li>
  );
}

export function FavoritesScreen({
  onHome,
  onOpenListing,
}: {
  onHome: () => void;
  onOpenListing: (listingId: string) => void;
}) {
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteListingIds());

  const favorites = useMemo(() => {
    const listings = loadPublishedListings();
    const byId = new Map(listings.map((l) => [l.id, l]));
    return favoriteIds
      .map((id) => byId.get(id))
      .filter((l): l is ListingDraft => l !== undefined);
  }, [favoriteIds]);

  const handleRemove = (id: string) => {
    toggleFavoriteListing(id);
    setFavoriteIds(loadFavoriteListingIds());
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="shrink-0 px-4 pb-3 pt-4">
        <h1 className="text-[22px] font-extrabold" style={{ color: GREEN }}>
          Favorites
        </h1>
        <p className="mt-1 text-[14px] text-gray-500">Saved listings you want to rent later</p>
      </div>

      <div className="screen-scroll flex-1 px-4 pb-4">
        {favorites.length === 0 ? (
          <div
            className="mx-auto mt-8 max-w-[300px] rounded-2xl border bg-white px-5 py-10 text-center"
            style={{ borderColor: BORDER }}
          >
            <Heart className="mx-auto mb-4 h-10 w-10" style={{ color: GREEN_LIGHT }} />
            <h2 className="text-[18px] font-bold" style={{ color: GREEN }}>
              No favorites yet
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
              Tap the heart on a listing to save it here.
            </p>
            <button
              type="button"
              onClick={onHome}
              className="mt-5 w-full rounded-xl py-3 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN_LIGHT }}
            >
              Browse on Home
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {favorites.map((listing) => (
              <FavoriteCard
                key={listing.id}
                listing={listing}
                onRemove={() => handleRemove(listing.id)}
                onOpen={() => onOpenListing(listing.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
