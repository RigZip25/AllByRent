import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ClipboardList, MapPin, ChevronRight, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { GarageLensCard } from "./GarageLensCard";
import { usePwaUpdate } from "../../hooks/PwaUpdateProvider";
import { mascotSays } from "../../lib/brand";
import { CATEGORIES } from "../../screens/listing/listingItemCategories";
import {
  loadHomeFeedMode,
  saveHomeFeedMode,
} from "../../lib/homeFeedStorage";
import {
  fetchActiveListingsForCityRemote,
  isListingBrowsable,
  getActiveRentLocationLabel,
  hasRentLocationSetup,
} from "../../lib/listingStorage";
import {
  groupListingsByGarage,
  listingMatchesCategory,
  listingMatchesModeChip,
  listingMatchesPriceRange,
  type ModeChip,
} from "../../lib/garageDisplay";
import {
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
  clusterLabelForCity,
  getClusterRadiusMi,
  setClusterRadiusMi,
} from "../../lib/clusterConfig";
import { fetchRemoteProfileNamesByIds } from "../../lib/supabaseProfile";
import { MrRentano } from "./MrRentano";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

const HOME_CATEGORY_PICKS = [
  "Tools & DIY",
  "Garden & Yard",
  "Photo & Video",
  "Electronics & Tech",
  "Party & Events",
  "Sports & Recreation",
  "Baby & Kids",
  "Home & Kitchen",
] as const;

const PRICE_PRESETS: { id: string; label: string; min: number | null; max: number | null }[] = [
  { id: "any", label: "Any price", min: null, max: null },
  { id: "under25", label: "Under $25", min: null, max: 25 },
  { id: "25to75", label: "$25–$75", min: 25, max: 75 },
  { id: "75plus", label: "$75+", min: 75, max: null },
];

const RADIUS_PRESETS = [
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
] as const;

type HomeFeedProps = {
  onNavigate: (screen: string) => void;
  onOpenNotifications: () => void;
  onEditLocation: () => void;
  onPostRequest: (opts?: { category?: string; query?: string }) => void;
  onStockGarage: () => void;
  onRentals: () => void;
  onBackToHub?: () => void;
};

export function HomeFeed({
  onNavigate,
  onOpenNotifications,
  onEditLocation,
  onPostRequest,
  onStockGarage,
  onRentals,
  onBackToHub,
}: HomeFeedProps) {
  const [modeChip, setModeChip] = useState<ModeChip>(() => loadHomeFeedMode());
  const [category, setCategory] = useState<string | null>(null);
  const [pricePresetId, setPricePresetId] = useState("any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Awaited<ReturnType<typeof fetchActiveListingsForCityRemote>>>([]);
  const [hostMeta, setHostMeta] = useState<Record<string, { displayName: string; rating: number }>>({});
  const [clusterRadiusMi, setClusterRadiusState] = useState(() => getClusterRadiusMi());
  const { updateAvailable, updateJustCompleted, simulateUpdateNotification } = usePwaUpdate();
  const showBellBadge = updateAvailable || updateJustCompleted;
  const bellTapRef = useRef({ count: 0, openTimer: 0 });

  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, clusterRadiusMi);
  const needsLocation = !hasRentLocationSetup();
  const pricePreset = PRICE_PRESETS.find((p) => p.id === pricePresetId) ?? PRICE_PRESETS[0];

  const handleBellPress = () => {
    const taps = bellTapRef.current;
    taps.count += 1;
    window.clearTimeout(taps.openTimer);
    if (taps.count >= 5) {
      taps.count = 0;
      simulateUpdateNotification();
      onOpenNotifications();
      return;
    }
    taps.openTimer = window.setTimeout(() => {
      taps.count = 0;
      onOpenNotifications();
    }, 450);
  };

  useEffect(() => {
    saveHomeFeedMode(modeChip);
  }, [modeChip]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void fetchActiveListingsForCityRemote(city)
      .then(async (list) => {
        if (!mounted) return;
        const browsable = list.filter(isListingBrowsable);
        setListings(browsable);
        const hostIds = browsable.map((l) => l.hostId).filter(Boolean) as string[];
        const names = await fetchRemoteProfileNamesByIds(hostIds);
        if (mounted) setHostMeta(names);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [city]);

  const filteredListings = useMemo(
    () =>
      listings.filter(
        (l) =>
          listingMatchesModeChip(l, modeChip) &&
          listingMatchesCategory(l, category) &&
          listingMatchesPriceRange(l, pricePreset.min, pricePreset.max),
      ),
    [listings, modeChip, category, pricePreset],
  );

  const garages = useMemo(
    () => groupListingsByGarage(filteredListings, hostMeta).filter((g) => g.itemCount > 0),
    [filteredListings, hostMeta],
  );

  const browseCategories = useMemo(
    () =>
      HOME_CATEGORY_PICKS.filter((name) => name in CATEGORIES).map((name) => ({
        name,
        icon: CATEGORIES[name]?.icon ?? "📦",
      })),
    [],
  );

  const activeFilterCount =
    (category ? 1 : 0) +
    (pricePresetId !== "any" ? 1 : 0) +
    (clusterRadiusMi !== CLUSTER_RADIUS_DEFAULT_MI ? 1 : 0);

  const modeChips: { id: ModeChip; label: string }[] = [
    { id: "all", label: "All" },
    { id: "rent", label: "Rent" },
    { id: "buy", label: "Buy" },
  ];

  const clearFilters = () => {
    setCategory(null);
    setPricePresetId("any");
    setClusterRadiusMi(CLUSTER_RADIUS_DEFAULT_MI);
    setClusterRadiusState(CLUSTER_RADIUS_DEFAULT_MI);
  };

  const applyRadius = (miles: number) => {
    setClusterRadiusMi(miles);
    setClusterRadiusState(miles);
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div
        className="shrink-0 bg-[#F0F4F2] px-4 pb-2"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
      >
        <div className="mb-2.5 flex items-start gap-2">
          {onBackToHub ? (
            <button
              type="button"
              onClick={onBackToHub}
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
              style={{ borderColor: BORDER }}
              aria-label="Back to browse choices"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: GREEN_DARK }} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onEditLocation}
            className="min-w-0 flex-1 py-0.5 text-left"
            aria-label={needsLocation ? "Set your block" : "Change block cluster"}
          >
            <span className="flex items-start gap-1.5">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: needsLocation ? "#F59E0B" : GREEN }}
                fill={needsLocation ? "#F59E0B" : GREEN}
                stroke={GREEN_DARK}
                strokeWidth={1.5}
              />
              <span
                className="min-w-0 flex-1 text-[15px] font-bold leading-snug [overflow-wrap:anywhere]"
                style={{ color: needsLocation ? "#B45309" : GREEN_DARK }}
              >
                {clusterLabel}
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0" style={{ color: GREEN }} />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: activeFilterCount ? GREEN_DARK : BORDER }}
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5" style={{ color: GREEN_DARK }} />
            {activeFilterCount > 0 ? (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onRentals}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Bookings"
          >
            <ClipboardList className="h-5 w-5" style={{ color: GREEN_DARK }} />
          </button>
          <button
            type="button"
            onClick={handleBellPress}
            className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label={showBellBadge ? "Notifications — update available" : "Notifications"}
          >
            <Bell className="h-5 w-5" style={{ color: GREEN_DARK }} />
            {showBellBadge ? (
              <span
                className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#F0B429]"
                aria-hidden
              />
            ) : null}
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {modeChips.map((chip) => {
            const active = modeChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setModeChip(chip.id)}
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors"
                style={{
                  backgroundColor: active ? GREEN_DARK : "white",
                  color: active ? "white" : "#666",
                  border: `1px solid ${active ? GREEN_DARK : BORDER}`,
                }}
              >
                {chip.label}
              </button>
            );
          })}
          {category ? (
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {category}
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {pricePresetId !== "any" ? (
            <button
              type="button"
              onClick={() => setPricePresetId("any")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {pricePreset.label}
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          Garages near you
        </p>

        {loading && garages.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-gray-500">Loading garages…</p>
        ) : null}

        {!loading && garages.length === 0 ? (
          <div className="mx-auto mt-6 max-w-[340px] text-center">
            <MrRentano size={56} className="mx-auto" />
            <p className="mt-3 text-[18px] font-bold" style={{ color: GREEN_DARK }}>
              {category || pricePresetId !== "any"
                ? "No matching garages"
                : "No garages on this block yet"}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
              {mascotSays(
                category
                  ? `Nobody listed ${category} nearby yet. Post a request and share it — neighbors can respond.`
                  : "Be first to stock a garage, or post a request for what you need and share it.",
              )}
            </p>
            <button
              type="button"
              onClick={() =>
                onPostRequest({
                  category: category ?? undefined,
                  query: category ? undefined : undefined,
                })
              }
              className="mt-5 w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              Post a request →
            </button>
            <button
              type="button"
              onClick={onStockGarage}
              className="mt-3 w-full rounded-xl border-2 py-3 text-[15px] font-bold"
              style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
            >
              Stock your garage →
            </button>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-[14px] font-semibold text-gray-500 underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {garages.length > 0 ? (
          <ul className="space-y-3 pb-2">
            {garages.map((garage) => (
              <li key={garage.hostId || garage.name}>
                <GarageLensCard
                  garage={garage}
                  onSelect={() => onNavigate(`neighborGarage:${garage.hostId}`)}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {!loading && garages.length > 0 ? (
          <div className="mt-4 rounded-2xl border bg-white px-4 py-3.5 text-center" style={{ borderColor: BORDER }}>
            <p className="text-[14px] font-semibold text-gray-700">Can&apos;t find what you need?</p>
            <p className="mt-1 text-[13px] text-gray-500">
              Post a request, sign in if asked, then share it like a listing.
            </p>
            <button
              type="button"
              onClick={() => onPostRequest({ category: category ?? undefined })}
              className="mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              Post a request & share →
            </button>
          </div>
        ) : null}
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
          <button
            type="button"
            className="min-h-0 flex-1"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div
            className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
            role="dialog"
            aria-label="Filters"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold" style={{ color: GREEN_DARK }}>
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Category
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className="rounded-full px-3 py-2 text-[13px] font-bold"
                  style={{
                    backgroundColor: !category ? GREEN_DARK : "white",
                    color: !category ? "white" : "#444",
                    border: `1px solid ${!category ? GREEN_DARK : BORDER}`,
                  }}
                >
                  All categories
                </button>
                {browseCategories.map((cat) => {
                  const active = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(active ? null : cat.name)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold"
                      style={{
                        backgroundColor: active ? GREEN_DARK : "white",
                        color: active ? "white" : "#444",
                        border: `1px solid ${active ? GREEN_DARK : BORDER}`,
                      }}
                    >
                      <span aria-hidden>{cat.icon}</span>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Price
              </h3>
              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((preset) => {
                  const active = pricePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPricePresetId(preset.id)}
                      className="rounded-full px-3 py-2 text-[13px] font-bold"
                      style={{
                        backgroundColor: active ? GREEN_DARK : "white",
                        color: active ? "white" : "#444",
                        border: `1px solid ${active ? GREEN_DARK : BORDER}`,
                      }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                Distance
              </h3>
              <p className="mb-2 text-[13px] text-gray-500">
                Closer block first — widen if the shelf is thin.
              </p>
              <div className="flex flex-wrap gap-2">
                {RADIUS_PRESETS.map((miles) => {
                  const active = clusterRadiusMi === miles;
                  const label =
                    miles <= CLUSTER_RADIUS_DEFAULT_MI
                      ? `Closer · ${miles} mi`
                      : miles >= CLUSTER_RADIUS_MAX_MI
                        ? `Farther · ${miles} mi`
                        : `${miles} mi`;
                  return (
                    <button
                      key={miles}
                      type="button"
                      onClick={() => applyRadius(miles)}
                      className="rounded-full px-3 py-2 text-[13px] font-bold"
                      style={{
                        backgroundColor: active ? GREEN_DARK : "white",
                        color: active ? "white" : "#444",
                        border: `1px solid ${active ? GREEN_DARK : BORDER}`,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-xl border-2 py-3 text-[15px] font-bold"
                style={{ borderColor: BORDER, color: "#555" }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-[1.4] rounded-xl py-3 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                Show garages
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
