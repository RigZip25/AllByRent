import { ArrowLeft } from "lucide-react";
import { MrRentano } from "./MrRentano";
import { FoundingHostPromo } from "./FoundingHostPromo";
import type { AppMode } from "../../lib/appMode";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const GOLD = "#F59E0B";

interface EmptySubcategoryShelfProps {
  category: string;
  subcategoryLabel: string;
  appMode: AppMode;
  postTour?: boolean;
  onBack: () => void;
  onPostRequest: () => void;
  onStartListing: () => void;
  onShare: (platform: string) => void;
}

export function EmptySubcategoryShelf({
  category,
  subcategoryLabel,
  appMode,
  postTour = false,
  onBack,
  onPostRequest,
  onStartListing,
  onShare,
}: EmptySubcategoryShelfProps) {
  const isEarn = appMode === "earn";

  const headline = isEarn
    ? "Empty shelf = your chance"
    : `Be the first in ${subcategoryLabel}`;

  const subcopy = isEarn
    ? `No competition yet in ${category} · ${subcategoryLabel}. List first, earn from neighbors, and own this corner of the market.`
    : `This shelf in ${category} is wide open. Post what you need — early requests help hosts know where to list.`;

  const rentanoLine = postTour
    ? isEarn
      ? "You know the app bar — now claim this shelf before anyone else."
      : "You know the app bar — post first and help this category come alive."
    : isEarn
      ? "Fresh shelf, zero rivals. Perfect time to list and earn."
      : "Nobody's listed here yet — be the spark that gets neighbors sharing.";

  const handlePrimary = () => {
    if (isEarn) onStartListing();
    else onPostRequest();
  };

  const handleShareLight = () => onShare("copy");

  return (
    <div className="space-y-5 p-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to subcategories
      </button>

      <div
        className="relative overflow-hidden rounded-3xl border px-5 pb-6 pt-8 text-center"
        style={{
          borderColor: `${GREEN}33`,
          background:
            "linear-gradient(180deg, rgba(26,158,110,0.12) 0%, rgba(240,244,242,0.6) 55%, #fff 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-4xl opacity-90"
          aria-hidden="true"
        >
          {isEarn ? "🏆" : "✨"}
        </div>

        <div className="relative mt-6 flex justify-center">
          <MrRentano size={isEarn ? 88 : 80} />
        </div>

        <div
          className="relative mx-auto mt-4 max-w-[280px] rounded-2xl border bg-white p-4 shadow-sm"
          style={{ borderColor: "#E8E6E0" }}
        >
          <div
            className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t bg-white"
            style={{ borderColor: "#E8E6E0" }}
            aria-hidden="true"
          />
          <p className="text-sm font-medium leading-relaxed" style={{ color: GREEN_DARK }}>
            {rentanoLine}
          </p>
        </div>

        <h2 className="mt-6 text-[20px] font-bold leading-snug" style={{ color: GREEN_DARK }}>
          {headline}
        </h2>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
          {subcopy}
        </p>

        {isEarn ? (
          <p
            className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${GOLD}22`, color: GREEN_DARK }}
          >
            <span aria-hidden="true">💰</span>
            Early market · earn from day one
          </p>
        ) : (
          <p
            className="mx-auto mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${GREEN}18`, color: GREEN_DARK }}
          >
            <span aria-hidden="true">📣</span>
            Low supply — your request leads the way
          </p>
        )}
      </div>

      <FoundingHostPromo
        appMode={appMode}
        subcategoryLabel={subcategoryLabel}
        onPrimary={handlePrimary}
        onShare={handleShareLight}
      />

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        {isEarn
          ? "First hosts in a category get seen first — neighbors search here every week."
          : "Sharing spreads the word — the more neighbors join, the faster shelves fill."}
      </p>
    </div>
  );
}
