import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ClipboardList, MapPin, ChevronRight, ArrowLeft } from "lucide-react";
import { HomeFeedCard } from "./HomeFeedCard";
import { GarageLensCard } from "./GarageLensCard";
import { usePwaUpdate } from "../../hooks/PwaUpdateProvider";
import { mascotSays } from "../../lib/brand";
import { CATEGORIES } from "../../screens/listing/listingItemCategories";
import {
  loadHomeFeedLens,
  loadHomeFeedMode,
  loadHomeFeedQuery,
  saveHomeFeedLens,
  saveHomeFeedMode,
  saveHomeFeedQuery,
} from "../../lib/homeFeedStorage";
import {
  fetchActiveListingsForCityRemote,
  getActiveRentLocationLabel,
  hasRentLocationSetup,
  searchActiveListingsRemote,
} from "../../lib/listingStorage";
import {
  groupListingsByGarage,
  listingMatchesModeChip,
  type ModeChip,
} from "../../lib/garageDisplay";
import {
  CLUSTER_RADIUS_EXPANDED_MI,
  clusterLabelForCity,
  expandClusterRadius,
  getClusterRadiusMi,
} from "../../lib/clusterConfig";
import { AutoGrowTextarea } from "../../components/AutoGrowTextarea";
import { MrRentano } from "./MrRentano";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";
const SPARSE_CLUSTER_MAX = 10;

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

type HomeLens = "feed" | "garages";

type HomeFeedProps = {
  onNavigate: (screen: string) => void;
  onOpenNotifications: () => void;
  onEditLocation: () => void;
  onPostRequest: (query?: string) => void;
  onStockGarage: () => void;
  onBrowseCategory: (categoryLabel: string) => void;
  onRentals: () => void;
  onBackToHub?: () => void;
};

export function HomeFeed({
  onNavigate,
  onOpenNotifications,
  onEditLocation,
  onPostRequest,
  onStockGarage,
  onBrowseCategory,
  onRentals,
  onBackToHub,
}: HomeFeedProps) {
  const [query, setQuery] = useState(() => loadHomeFeedQuery());
  const [modeChip, setModeChip] = useState<ModeChip>(() => loadHomeFeedMode());
  const [lens, setLens] = useState<HomeLens>(() => loadHomeFeedLens());
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Awaited<ReturnType<typeof fetchActiveListingsForCityRemote>>>([]);
  const [clusterRadiusMi, setClusterRadiusMi] = useState(() => getClusterRadiusMi());
  const { updateAvailable, updateJustCompleted, simulateUpdateNotification } = usePwaUpdate();
  const showBellBadge = updateAvailable || updateJustCompleted;
  const bellTapRef = useRef({ count: 0, openTimer: 0 });

  const city = getActiveRentLocationLabel().trim();
  const clusterLabel = clusterLabelForCity(city, clusterRadiusMi);
  const needsLocation = !hasRentLocationSetup();
  const canWidenCluster = clusterRadiusMi < CLUSTER_RADIUS_EXPANDED_MI;

  const handleWidenCluster = () => {
    setClusterRadiusMi(expandClusterRadius());
  };

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
    saveHomeFeedQuery(query);
  }, [query]);

  useEffect(() => {
    saveHomeFeedMode(modeChip);
  }, [modeChip]);

  useEffect(() => {
    saveHomeFeedLens(lens);
  }, [lens]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const q = query.trim();
    const loader = q
      ? searchActiveListingsRemote({ query: q, city })
      : fetchActiveListingsForCityRemote(city);

    void loader
      .then((list) => {
        if (!mounted) return;
        setListings(list.filter((l) => l.listingStatus === "active"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [city, query]);

  const filtered = useMemo(
    () => listings.filter((l) => listingMatchesModeChip(l, modeChip)),
    [listings, modeChip],
  );

  const garages = useMemo(() => groupListingsByGarage(filtered), [filtered]);
  const isSparse = filtered.length < SPARSE_CLUSTER_MAX;
  const isSearchActive = query.trim().length > 0;

  const browseCategories = useMemo(
    () =>
      HOME_CATEGORY_PICKS.filter((name) => name in CATEGORIES).map((name) => ({
        name,
        icon: CATEGORIES[name]?.icon ?? "📦",
      })),
    [],
  );

  const modeChips: { id: ModeChip; label: string }[] = [
    { id: "all", label: "All" },
    { id: "rent", label: "Rent" },
    { id: "buy", label: "Buy" },
    { id: "gift", label: "Gift" },
  ];

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="shrink-0 bg-[#F0F4F2] px-4 pb-3 pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          {onBackToHub ? (
            <button
              type="button"
              onClick={onBackToHub}
              className="flex h-11 w-11 items-center justify-center rounded-full border bg-white active:bg-gray-50"
              style={{ borderColor: BORDER }}
              aria-label="Back to browse choices"
            >
              <ArrowLeft className="h-5 w-5" style={{ color: GREEN_DARK }} />
            </button>
          ) : (
            <span className="w-11" aria-hidden />
          )}
          <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRentals}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Bookings"
          >
            <ClipboardList className="h-5 w-5" style={{ color: GREEN_DARK }} />
          </button>
          <button
            type="button"
            onClick={handleBellPress}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-white active:bg-gray-50"
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
        </div>

        <button
          type="button"
          onClick={onEditLocation}
          className="mb-3 flex min-w-0 items-start gap-1.5 text-left"
          aria-label={needsLocation ? "Set your block" : "Change block cluster"}
        >
          <MapPin
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: needsLocation ? "#F59E0B" : GREEN }}
            fill={needsLocation ? "#F59E0B" : GREEN}
            stroke={GREEN_DARK}
            strokeWidth={1.5}
          />
          <span
            className="min-w-0 flex-1 break-words text-[17px] font-bold leading-snug [overflow-wrap:anywhere]"
            style={{ color: needsLocation ? "#B45309" : GREEN_DARK }}
          >
            {clusterLabel}
          </span>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0" style={{ color: GREEN }} />
        </button>

        <div
          className="rounded-2xl border-2 bg-white px-4 py-3.5 shadow-sm"
          style={{ borderColor: needsLocation ? "#F59E0B55" : `${GREEN_DARK}33` }}
        >
          <label className="sr-only" htmlFor="home-search">
            What do you need?
          </label>
          <div className="flex items-start gap-2">
            <span className="pt-0.5 text-xl" aria-hidden>
              🔍
            </span>
            <AutoGrowTextarea
              id="home-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you need?"
              className="min-w-0 flex-1 bg-transparent py-0 text-[17px] font-medium outline-none placeholder:text-gray-400"
              maxRows={3}
            />
            {loading && isSearchActive ? (
              <span className="text-[12px] text-gray-400">…</span>
            ) : null}
          </div>
          {!isSearchActive ? (
            <p className="mt-1.5 pl-8 text-[13px] text-gray-500">
              Search above, or switch <strong className="font-semibold text-gray-600">Feed</strong> /{" "}
              <strong className="font-semibold text-gray-600">Garages</strong> below
            </p>
          ) : null}
        </div>

        {!isSearchActive && browseCategories.length > 0 ? (
          <div className="mt-3">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              Browse by category
            </p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {browseCategories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => onBrowseCategory(cat.name)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-2 text-[13px] font-semibold text-gray-800 active:bg-gray-50"
                  style={{ borderColor: BORDER }}
                >
                  <span aria-hidden>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {modeChips.map((chip) => {
            const active = modeChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setModeChip(chip.id)}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors"
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
        </div>

        {!isSearchActive ? (
          <div
            className="mt-3 flex rounded-full border bg-white p-0.5"
            style={{ borderColor: BORDER }}
            role="tablist"
            aria-label="Browse lenses"
          >
            {(
              [
                { id: "feed" as const, label: "Feed" },
                { id: "garages" as const, label: "Garages" },
              ] as const
            ).map((tab) => {
              const active = lens === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setLens(tab.id)}
                  className="flex-1 rounded-full py-2 text-[13px] font-bold transition-colors"
                  style={{
                    backgroundColor: active ? GREEN_DARK : "transparent",
                    color: active ? "white" : "#888",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        {isSparse && !isSearchActive ? (
          <div
            className="mb-3 flex gap-3 rounded-2xl border bg-white p-3"
            style={{ borderColor: BORDER }}
          >
            <MrRentano size={40} className="shrink-0" />
            <div className="min-w-0 text-[13px] leading-snug text-gray-700">
              <p className="font-bold" style={{ color: GREEN_DARK }}>
                {mascotSays("Your block is just getting started.")}
              </p>
              <p className="mt-1">
                Here&apos;s what&apos;s nearby — or{" "}
                <button
                  type="button"
                  className="font-bold underline"
                  style={{ color: GREEN_DARK }}
                  onClick={onStockGarage}
                >
                  stock your garage
                </button>{" "}
                and be first on the block.
              </p>
              {canWidenCluster ? (
                <button
                  type="button"
                  className="mt-2 font-bold underline"
                  style={{ color: GREEN_DARK }}
                  onClick={handleWidenCluster}
                >
                  Search wider ({CLUSTER_RADIUS_EXPANDED_MI} mi) →
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {loading && filtered.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-gray-500">Loading nearby…</p>
        ) : null}

        {!loading && isSearchActive && filtered.length === 0 ? (
          <div className="mx-auto mt-8 max-w-[320px] text-center">
            <p className="text-[17px] font-bold" style={{ color: GREEN_DARK }}>
              Nothing for &ldquo;{query.trim()}&rdquo; yet
            </p>
            <p className="mt-2 text-[14px] text-gray-600">
              {mascotSays("Post a request — neighbors with the right gear can respond.")}
            </p>
            <button
              type="button"
              onClick={() => onPostRequest(query.trim())}
              className="btn-primary mt-5 w-full rounded-xl py-3 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              Post a request →
            </button>
          </div>
        ) : null}

        {!loading && !isSearchActive && lens === "feed" && filtered.length === 0 ? (
          <div className="mx-auto mt-10 max-w-[340px] text-center">
            <p className="text-[18px] font-bold" style={{ color: GREEN_DARK }}>
              No listings on this block yet
            </p>
            <p className="mt-2 text-[14px] text-gray-600">
              {mascotSays("Be the first garage here — neighbors will follow.")}
            </p>
            <button
              type="button"
              onClick={onStockGarage}
              className="mt-5 w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              Stock your garage →
            </button>
          </div>
        ) : null}

        {!loading && filtered.length > 0 && (isSearchActive || lens === "feed") ? (
          <ul className="space-y-2.5 pb-2">
            {filtered.map((listing) => (
              <li key={listing.id}>
                <HomeFeedCard
                  listing={listing}
                  onSelect={() => onNavigate(`itemDetail:${listing.id}`)}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {!loading && !isSearchActive && lens === "garages" ? (
          <ul className="space-y-2.5 pb-2">
            {garages.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-[15px] font-bold text-gray-800">No garages on shelf yet</p>
                <button
                  type="button"
                  onClick={onStockGarage}
                  className="mt-4 text-[14px] font-bold underline"
                  style={{ color: GREEN_DARK }}
                >
                  Stock your garage first →
                </button>
              </div>
            ) : (
              garages.map((garage) => (
                <li key={garage.hostId}>
                  <GarageLensCard
                    garage={garage}
                    onSelect={() => onNavigate(`neighborGarage:${garage.hostId}`)}
                  />
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
