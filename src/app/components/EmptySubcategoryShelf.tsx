import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { MrRentanoAnimated } from "./MrRentanoAnimated";
import type { AppMode } from "../../lib/appMode";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const GOLD = "#F59E0B";
const BORDER = "#E8E6E0";

interface EmptySubcategoryShelfProps {
  categoryName: string;
  subcategoryName: string;
  cityName: string;
  appMode: AppMode;
  requests?: { id: string; description: string; createdAt: string }[];
  onBack: () => void;
  onPostRequest: () => void;
  onStartListing: () => void;
  onShare: () => void;
}

export function EmptySubcategoryShelf({
  categoryName,
  subcategoryName,
  cityName,
  appMode,
  requests,
  onBack,
  onPostRequest,
  onStartListing,
  onShare,
}: EmptySubcategoryShelfProps) {
  const isEarn = appMode === "earn";
  const cityDisplay = cityName.trim() || "your area";

  const rentanoLine = isEarn
    ? `Zero competition in ${categoryName} in ${cityDisplay}. First host takes all the demand.`
    : "Someone nearby might have exactly what you need";

  const badge = isEarn ? "🏆 Pioneer spot available" : "📣 High demand signal";

  const subtext = isEarn
    ? "Early hosts earn 3× more — no competition, all the renters"
    : "Hosts list where renters ask. Be first to ask.";

  const primaryLabel = isEarn ? "List your first item →" : "Post a Request →";

  const handlePrimary = () => {
    if (isEarn) onStartListing();
    else onPostRequest();
  };

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
        <motion.div
          className="relative mt-2 flex justify-center"
          initial={{ scale: 0.9, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 20 }}
        >
          <MrRentanoAnimated size={isEarn ? 88 : 80} animate />
        </motion.div>

        <div
          className="relative mx-auto mt-4 max-w-[300px] rounded-2xl border bg-white p-4 shadow-sm"
          style={{ borderColor: BORDER }}
        >
          <div
            className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t bg-white"
            style={{ borderColor: BORDER }}
            aria-hidden="true"
          />
          <p className="text-sm font-medium leading-relaxed" style={{ color: GREEN_DARK }}>
            {rentanoLine}
          </p>
        </div>

        <p
          className="mx-auto mt-5 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{
            backgroundColor: isEarn ? `${GOLD}22` : `${GREEN}18`,
            color: GREEN_DARK,
          }}
        >
          {badge}
        </p>

        <p className="mx-auto mt-3 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
          {subtext}
        </p>

        {!isEarn && subcategoryName ? (
          <p className="mx-auto mt-2 text-xs text-muted-foreground">
            {subcategoryName} · {categoryName}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handlePrimary}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          style={{ backgroundColor: GREEN_DARK }}
        >
          {primaryLabel}
        </button>

        <button
          type="button"
          onClick={onShare}
          className="w-full rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-white/60"
          style={{ borderColor: BORDER, color: GREEN_DARK }}
        >
          Share with neighbors
        </button>

        {!isEarn ? (
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Sharing spreads demand — the more neighbors join, faster shelves fill
          </p>
        ) : null}
      </div>

      {!isEarn && requests && requests.length > 0 ? (
        <div
          className="rounded-3xl border bg-white p-4"
          style={{ borderColor: BORDER }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            Recent requests near {cityDisplay}
          </p>
          <ul className="mt-3 space-y-2">
            {requests.slice(0, 3).map((r) => (
              <li key={r.id} className="rounded-2xl border p-3" style={{ borderColor: BORDER }}>
                <p className="text-sm font-semibold" style={{ color: GREEN_DARK }}>
                  Wanted
                </p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{r.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
