import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ClipboardList, MapPin, ChevronRight, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { GarageLensCard } from "./GarageLensCard";
import { usePwaUpdate } from "../../hooks/PwaUpdateProvider";
import { mascotSays } from "../../lib/brand";
import {
  loadHomeFeedMode,
  saveHomeFeedMode,
  loadHomeFeedCategory,
  saveHomeFeedCategory,
} from "../../lib/homeFeedStorage";
import { getAllCategoryChips } from "../../lib/homeCategoryPicks";
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
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import { MrRentano } from "./MrRentano";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

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
  const messages = useMessages();
  const { home, common } = messages;
  const [modeChip, setModeChip] = useState<ModeChip>(() => loadHomeFeedMode());
  const [category, setCategory] = useState<string | null>(() => loadHomeFeedCategory());
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

  const pricePresets = useMemo(
    () => [
      { id: "any", label: home.priceAny, min: null as number | null, max: null as number | null },
      { id: "under25", label: home.priceUnder25, min: null, max: 25 },
      { id: "25to75", label: home.price25to75, min: 25, max: 75 },
      { id: "75plus", label: home.price75plus, min: 75, max: null },
    ],
    [home.priceAny, home.priceUnder25, home.price25to75, home.price75plus],
  );
  const pricePreset = pricePresets.find((p) => p.id === pricePresetId) ?? pricePresets[0];

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
    saveHomeFeedCategory(category);
  }, [category]);

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

  const browseCategories = useMemo(() => getAllCategoryChips(), []);

  // Price + radius only — categories live on the main strip now.
  const activeFilterCount =
    (pricePresetId !== "any" ? 1 : 0) +
    (clusterRadiusMi !== CLUSTER_RADIUS_DEFAULT_MI ? 1 : 0);

  const modeChips: { id: ModeChip; label: string }[] = [
    { id: "all", label: home.modeAny },
    { id: "rent", label: home.modeRent },
    { id: "buy", label: home.modeBuy },
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

  const emptyIsFiltered = Boolean(category || pricePresetId !== "any");

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div
        className="shrink-0 bg-[#F0F4F2] px-4 pb-2"
        style={{ paddingTop: "max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))" }}
      >
        <div className="mb-2.5 flex items-start gap-2">
          {onBackToHub ? (
            <button
              type="button"
              onClick={onBackToHub}
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
              style={{ borderColor: BORDER }}
              aria-label={home.backToBrowseAria}
            >
              <ArrowLeft className="h-5 w-5" style={{ color: GREEN_DARK }} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onEditLocation}
            className="min-w-0 flex-1 py-0.5 text-left"
            aria-label={needsLocation ? home.setBlockAria : home.changeBlockAria}
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
                className="min-w-0 flex-1 text-base font-bold leading-snug [overflow-wrap:anywhere]"
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
            className="relative mt-0.5 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 active:bg-gray-50"
            style={{ borderColor: activeFilterCount ? GREEN_DARK : BORDER }}
            aria-label={home.filtersAria}
          >
            <SlidersHorizontal className="h-4 w-4" style={{ color: GREEN_DARK }} />
            <span className="text-[12px] font-bold" style={{ color: GREEN_DARK }}>
              {home.filters}
            </span>
            {activeFilterCount > 0 ? (
              <span
                className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
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
            aria-label={home.bookingsAria}
          >
            <ClipboardList className="h-5 w-5" style={{ color: GREEN_DARK }} />
          </button>
          <button
            type="button"
            onClick={handleBellPress}
            className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label={showBellBadge ? home.notificationsUpdateAria : home.notificationsAria}
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

        <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
            style={{
              backgroundColor: !category ? GREEN_DARK : "white",
              color: !category ? "white" : "#555",
              border: `1px solid ${!category ? GREEN_DARK : BORDER}`,
            }}
          >
            {home.modeAny}
          </button>
          {browseCategories.map((cat) => {
            const active = category === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setCategory(active ? null : cat.name)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold"
                style={{
                  backgroundColor: active ? GREEN_DARK : "white",
                  color: active ? "white" : "#444",
                  border: `1px solid ${active ? GREEN_DARK : BORDER}`,
                }}
              >
                <span aria-hidden>{cat.icon}</span>
                {localizeCategoryLabel(cat.name)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {home.garagesNearYou}
        </p>

        {loading && garages.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-gray-500">{home.loadingGarages}</p>
        ) : null}

        {!loading && garages.length === 0 ? (
          <div className="mx-auto mt-6 max-w-[340px] text-center">
            <MrRentano size={56} className="mx-auto" />
            <p className="mt-3 text-[18px] font-bold" style={{ color: GREEN_DARK }}>
              {emptyIsFiltered ? home.emptyFilteredTitle : home.emptyBlockTitle}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
              {mascotSays(
                category
                  ? home.emptyFilteredBody(localizeCategoryLabel(category))
                  : home.emptyBlockBody,
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
              {home.postRequest}
            </button>
            <button
              type="button"
              onClick={onStockGarage}
              className="mt-3 w-full rounded-xl border-2 py-3 text-[15px] font-bold"
              style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
            >
              {home.stockGarage}
            </button>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-[14px] font-semibold text-gray-500 underline"
              >
                {home.clearFilters}
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
            <p className="text-[14px] font-semibold text-gray-700">{home.cantFind}</p>
            <p className="mt-1 text-[13px] text-gray-500">
              {home.cantFindBody}
            </p>
            <button
              type="button"
              onClick={() => onPostRequest({ category: category ?? undefined })}
              className="mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              {home.postRequestShare}
            </button>
          </div>
        ) : null}
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
          <button
            type="button"
            className="min-h-0 flex-1"
            aria-label={home.closeFiltersAria}
            onClick={() => setFiltersOpen(false)}
          />
          <div
            className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3"
            role="dialog"
            aria-label={home.filtersTitle}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold" style={{ color: GREEN_DARK }}>
                {home.filtersTitle}
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                aria-label={common.close}
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                {home.categoryTitle}
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
                  {home.allCategories}
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
                      {localizeCategoryLabel(cat.name)}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                {home.priceTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                {pricePresets.map((preset) => {
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
                {home.distanceTitle}
              </h3>
              <p className="mb-2 text-[13px] text-gray-500">
                Closer block first — widen if the shelf is thin.
              </p>
              <div className="flex flex-wrap gap-2">
                {RADIUS_PRESETS.map((miles) => {
                  const active = clusterRadiusMi === miles;
                  const milesLabel = home.miles(miles);
                  const label =
                    miles <= CLUSTER_RADIUS_DEFAULT_MI
                      ? `Closer · ${milesLabel}`
                      : miles >= CLUSTER_RADIUS_MAX_MI
                        ? `Farther · ${milesLabel}`
                        : milesLabel;
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
                {home.clearFilters}
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex-[1.4] rounded-xl py-3 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                {home.done}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
