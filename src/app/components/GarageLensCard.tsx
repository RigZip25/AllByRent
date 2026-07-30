import { Star } from "lucide-react";
import type { GarageSummary } from "../../lib/garageDisplay";
import { formatListingPriceLine } from "../../lib/garageDisplay";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";

const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

function ShelfThumb({ listing }: { listing: GarageSummary["listings"][number] }) {
  const cover = listing.photos[0] ?? null;
  const { url } = useCoverMediaUrl(cover);
  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F0F4F2]" aria-hidden>
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm">📷</div>
      )}
    </div>
  );
}

export function GarageLensCard({
  garage,
  onSelect,
}: {
  garage: GarageSummary;
  onSelect: () => void;
}) {
  const categoryLine =
    garage.categories.length > 0
      ? garage.categories.map((c) => localizeCategoryLabel(c)).join(" · ")
      : "Mixed shelf";
  const preview = garage.listings.slice(0, 2);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-colors active:bg-gray-50"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{ backgroundColor: `${GREEN_DARK}14` }}
          aria-hidden
        >
          🏠
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold text-gray-900">{garage.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[13px] font-semibold text-gray-700">
            {garage.rating > 0 ? (
              <>
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                  {garage.rating.toFixed(1)}
                </span>
                <span className="text-gray-400">·</span>
              </>
            ) : null}
            <span>{garage.distance}</span>
            <span className="text-gray-400">·</span>
            <span>
              {garage.itemCount} on shelf
            </span>
          </p>
          <p className="mt-0.5 line-clamp-1 text-[12px] font-medium text-gray-500">{categoryLine}</p>
        </div>
      </div>

      {preview.length > 0 ? (
        <div className="flex gap-2">
          {preview.map((listing) => (
            <div
              key={listing.id}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#F7FBF8] px-2 py-1.5"
            >
              <ShelfThumb listing={listing} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[12px] font-semibold text-gray-800">
                  {listing.title || "Item"}
                </p>
                <p className="text-[12px] font-bold" style={{ color: GREEN_DARK }}>
                  {formatListingPriceLine(listing)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
}
