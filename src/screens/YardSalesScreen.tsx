import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, MapPin, Star } from "lucide-react";
import { BRAND_AMBER, BRAND_GREEN } from "../lib/brand";
import { clusterLabelForCity, getClusterRadiusMi } from "../lib/clusterConfig";
import {
  fetchActiveListingsForCityRemote,
  getActiveRentLocationLabel,
} from "../lib/listingStorage";
import {
  buildYardSaleEvents,
  type YardSaleEvent,
  type YardSaleOpenStatus,
} from "../lib/yardSaleDisplay";

const GREEN = BRAND_GREEN;
const AMBER = BRAND_AMBER;
const BORDER = "#E8E6E0";

const STATUS_LABEL: Record<YardSaleOpenStatus, string> = {
  now: "OPEN NOW",
  today: "TODAY",
  weekend: "WEEKEND",
};

function YardSaleCard({
  event,
  onSelect,
}: {
  event: YardSaleEvent;
  onSelect: () => void;
}) {
  const categoryLine =
    event.categories.length > 0 ? event.categories.join(" · ") : "Mixed yard sale";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-colors active:bg-amber-50/40"
      style={{ borderColor: `${AMBER}55` }}
    >
      <div
        className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl text-center"
        style={{ backgroundColor: `${AMBER}22` }}
        aria-hidden
      >
        <span className="text-[10px] font-extrabold tracking-wide" style={{ color: GREEN }}>
          {STATUS_LABEL[event.openStatus]}
        </span>
        <span className="text-xl leading-none">🏷️</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-gray-900">{event.name}</p>
        <p
          className="mt-1 text-[13px] font-semibold"
          style={{ color: event.openStatus === "now" ? "#B45309" : "#6B7280" }}
        >
          {event.openLabel}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-[13px] font-semibold text-gray-800">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {event.rating.toFixed(1)}
          </span>
          <span className="text-gray-400">·</span>
          <span>{event.distance}</span>
          <span className="text-gray-400">·</span>
          <span>{event.saleItemCount} for sale</span>
        </p>
        <p className="mt-1 line-clamp-1 text-[12px] font-medium text-gray-500">{categoryLine}</p>
      </div>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-400" aria-hidden />
    </button>
  );
}

type YardSalesScreenProps = {
  onBack: () => void;
  onEditLocation: () => void;
  onOpenGarage: (hostId: string) => void;
};

export function YardSalesScreen({ onBack, onEditLocation, onOpenGarage }: YardSalesScreenProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<YardSaleEvent[]>([]);

  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, getClusterRadiusMi());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void fetchActiveListingsForCityRemote(city)
      .then((listings) => {
        if (!mounted) return;
        setEvents(buildYardSaleEvents(listings.filter((l) => l.listingStatus === "active")));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [city]);

  const openNowCount = useMemo(
    () => events.filter((event) => event.openStatus === "now" || event.openStatus === "today").length,
    [events],
  );

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <div
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44`, backgroundColor: "#FFF9F0" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Back to garage sales"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold" style={{ color: GREEN }}>
              Yard sales & open garages
            </h1>
            <p className="text-[13px] text-gray-500">Saturday-drive mode — who's open near you</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditLocation}
          className="flex min-w-0 items-start gap-1.5 text-left"
        >
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: AMBER }} fill={AMBER} />
          <span className="min-w-0 flex-1 text-[14px] font-semibold" style={{ color: GREEN }}>
            {clusterLabel}
          </span>
        </button>

        <div
          className="mt-3 rounded-xl px-3 py-2 text-[13px] font-medium"
          style={{ backgroundColor: `${AMBER}22`, color: "#92400E" }}
        >
          {openNowCount > 0
            ? `${openNowCount} open sale${openNowCount === 1 ? "" : "s"} near you today`
            : "Weekend sales in your cluster — tap a garage to peek inside"}
        </div>
      </div>

      <div className="screen-scroll flex flex-1 flex-col gap-3 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading open sales near you…</p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border bg-white p-5 text-center" style={{ borderColor: BORDER }}>
            <p className="text-4xl" aria-hidden>
              🏷️
            </p>
            <p className="mt-3 text-base font-bold text-gray-900">No yard sales on the map yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Check back on weekends, or browse neighbor garages for buy deals.
            </p>
          </div>
        ) : (
          events.map((event) => (
            <YardSaleCard
              key={event.hostId}
              event={event}
              onSelect={() => onOpenGarage(event.hostId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
