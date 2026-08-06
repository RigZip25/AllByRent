import { Star } from "lucide-react";
import type { GarageSummary } from "../../lib/garageDisplay";
import { formatListingPriceLine } from "../../lib/garageDisplay";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";
import { useMessages } from "../../lib/i18n/react";

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
  compact,
}: {
  garage: GarageSummary;
  onSelect: () => void;
  compact?: boolean;
}) {
  const { home } = useMessages();
  const accent = garage.accentColor ?? GREEN_DARK;
  const soft = garage.accentSoft ?? `${GREEN_DARK}14`;
  const categoryLine =
    garage.categories.length > 0
      ? garage.categories.map((c) => localizeCategoryLabel(c)).join(" · ")
      : "Mixed shelf";
  const preview = garage.listings.slice(0, 2);

  if (compact) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex w-[148px] shrink-0 flex-col gap-2 rounded-2xl border bg-white p-3 text-left shadow-sm active:bg-gray-50"
        style={{ borderColor: garage.isNew ? accent : BORDER }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ backgroundColor: soft }}
            aria-hidden
          >
            {garage.shopKind === "pro" ? "🏢" : "🏠"}
          </div>
          <div className="min-w-0 flex-1">
            {garage.isNew ? (
              <span
                className="mb-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: accent }}
              >
                {home.newGarageBadge}
              </span>
            ) : null}
            <p className="line-clamp-2 text-[13px] font-bold leading-snug text-gray-900">{garage.name}</p>
          </div>
        </div>
        <p className="text-[11px] font-semibold text-gray-500">
          {garage.itemCount} · {garage.distance}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-colors active:bg-gray-50"
      style={{ borderColor: garage.isNew ? accent : BORDER }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{ backgroundColor: soft }}
          aria-hidden
        >
          {garage.shopKind === "pro" ? "🏢" : "🏠"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[16px] font-bold text-gray-900">{garage.name}</p>
            {garage.isNew ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: accent }}
              >
                {home.newGarageBadge}
              </span>
            ) : null}
            {garage.shopKind === "pro" ? (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: soft, color: accent }}
              >
                {home.proGarageBadge}
              </span>
            ) : null}
          </div>
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
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1.5"
              style={{ backgroundColor: soft }}
            >
              <ShelfThumb listing={listing} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[12px] font-semibold text-gray-800">
                  {listing.title || "Item"}
                </p>
                <p className="text-[12px] font-bold" style={{ color: accent }}>
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
