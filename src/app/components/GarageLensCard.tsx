import { ChevronRight, Star } from "lucide-react";
import type { GarageSummary } from "../../lib/garageDisplay";

const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

export function GarageLensCard({
  garage,
  onSelect,
}: {
  garage: GarageSummary;
  onSelect: () => void;
}) {
  const categoryLine =
    garage.categories.length > 0 ? garage.categories.join(" · ") : "Mixed shelf";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-colors active:bg-gray-50"
      style={{ borderColor: BORDER }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{ backgroundColor: `${GREEN_DARK}14` }}
        aria-hidden
      >
        🏠
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-gray-900">{garage.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-[13px] font-semibold text-gray-800">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {garage.rating.toFixed(1)}
          </span>
          <span className="text-gray-400">·</span>
          <span>{garage.distance}</span>
          <span className="text-gray-400">·</span>
          <span>
            {garage.itemCount} on shelf
          </span>
        </p>
        <p className="mt-1 line-clamp-1 text-[12px] font-medium text-gray-500">{categoryLine}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
    </button>
  );
}
