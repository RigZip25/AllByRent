import { Star } from "lucide-react";
import type { ListingDraft } from "../../screens/listing/types";
import {
  activeModeLabels,
  formatListingPriceLine,
  garageTrustLine,
} from "../../lib/garageDisplay";
import { useMediaUrl } from "../../lib/useMediaUrl";

const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

export function HomeFeedCard({
  listing,
  onSelect,
}: {
  listing: ListingDraft;
  onSelect: () => void;
}) {
  const trust = garageTrustLine(listing.hostId);
  const price = formatListingPriceLine(listing);
  const modes = activeModeLabels(listing);
  const cover = listing.photos[0] ?? null;
  const thumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const { url } = useMediaUrl(thumb);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full gap-3 rounded-2xl border bg-white p-3 text-left transition-colors active:bg-gray-50"
      style={{ borderColor: BORDER }}
    >
      <div
        className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-[#F0F4F2]"
        aria-hidden
      >
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-lg">📷</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900">
            {listing.title || "Untitled item"}
          </h3>
          <span className="shrink-0 text-[15px] font-extrabold" style={{ color: GREEN_DARK }}>
            {price}
          </span>
        </div>

        <p className="mt-1.5 flex flex-wrap items-center gap-1 text-[13px] font-semibold leading-snug text-gray-800">
          <span>{trust.name}</span>
          <span className="text-gray-400">·</span>
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {trust.rating.toFixed(1)}
          </span>
          <span className="text-gray-400">·</span>
          <span>{trust.distance}</span>
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {modes.map((mode) => (
            <span
              key={mode}
              className="rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
              style={{
                backgroundColor:
                  mode === "Buy" ? "#3B82F6" : mode === "Gift" ? "#F59E0B" : GREEN_DARK,
              }}
            >
              {mode}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
