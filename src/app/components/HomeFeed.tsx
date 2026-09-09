import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Bell, ClipboardList, MapPin, ChevronRight, ChevronDown, ChevronLeft, Share2, SlidersHorizontal, X } from "lucide-react";
import { GarageLensCard } from "./GarageLensCard";
import { RoleModeSwitcher } from "../../components/RoleModeSwitcher";
import { AddressLocationPicker } from "../../components/AddressLocationPicker";
import { usePwaUpdate } from "../../hooks/PwaUpdateProvider";
import type { AppMode } from "../../lib/appMode";
import { APP_NAME, APP_ORIGIN, mascotSays } from "../../lib/brand";
import type { LocationSuggestion } from "../../lib/geocoding";
import { detectCurrentLocation, formatGeolocationErrorMessage } from "../../lib/geolocation";
import {
  loadHomeFeedMode,
  saveHomeFeedMode,
  loadHomeFeedInterests,
  saveHomeFeedInterests,
  browseInterestKey,
  type BrowseInterest,
} from "../../lib/homeFeedStorage";
import { getAllCategoryChips, getCategoryCatalog } from "../../lib/homeCategoryPicks";
import { CategoryIcon } from "../../components/CategoryIcon";
import { ShelfIcon } from "../../components/ShelfIcon";
import type { SubcategoryItem } from "../../screens/listing/listingItemCategories";
import {
  fetchActiveListingsForCityRemote,
  isListingBrowsable,
  getActiveRentLocationLabel,
  hasRentLocationSetup,
  setHomeLocation,
} from "../../lib/listingStorage";
import { getCountryEmptyHint, getSearchCountryCode } from "../../lib/locationCountry";
import {
  completeOnboarding,
  isOnboardingComplete,
} from "../../lib/onboardingStorage";
import { useAccessibleOverlay } from "../../lib/a11yOverlay";
import {
  garageMinPrice,
  garageProximityRank,
  groupListingsByGarage,
  listingMatchesBrowseInterests,
  listingMatchesModeChip,
  type HostGarageMeta,
  type ModeChip,
} from "../../lib/garageDisplay";
import {
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
  getClusterRadiusMi,
  setClusterRadiusMi,
} from "../../lib/clusterConfig";
import { fetchRemoteProfileNamesByIds } from "../../lib/supabaseProfile";
import { fetchGarageStorefrontsByHostIds } from "../../lib/garageStorefrontSync";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import { MrRentano } from "./MrRentano";

const GREEN = "#0D5C3A";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

/** Bottom sheets: one scroll, soft end padding so last controls aren’t clipped / rubber-banded away. */
const SHEET_PANEL =
  "max-h-[min(88dvh,720px)] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] rounded-t-3xl bg-white px-4 pt-3 pb-[max(3.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))]";
const SHEET_SCROLL_END = "h-10 w-full shrink-0";
/** Filters sheet: only the middle scrolls, so Clear and Done never drift off screen. */
const FILTERS_PANEL =
  "flex max-h-[min(88dvh,720px)] flex-col rounded-t-3xl bg-white pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]";
const FILTERS_BODY =
  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] px-4";

const RADIUS_PRESETS = [
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
] as const;

/** Feed order: the shelf's own ranking, or by price / proximity in either direction. */
type SortKey = "suggested" | "price" | "distance";

type HomeFeedProps = {
  onNavigate: (screen: string) => void;
  onOpenNotifications: () => void;
  onEditLocation: () => void;
  onPostRequest: (opts?: { category?: string; subcategory?: string; query?: string }) => void;
  onStockGarage: () => void;
  onRentals: () => void;
  onYardSales: () => void;
  onRoleModeChange: (mode: AppMode) => void;
};

export function HomeFeed({
  onNavigate,
  onOpenNotifications,
  onEditLocation: _onEditLocation,
  onPostRequest,
  onStockGarage,
  onRentals,
  onYardSales,
  onRoleModeChange,
}: HomeFeedProps) {
  const messages = useMessages();
  const { home, common, whereAreYouManual, catalog, systemUi } = messages;
  const [modeChip, setModeChip] = useState<ModeChip>(() => loadHomeFeedMode());
  // One shelf at a time: picking another category replaces the pick instead of piling up.
  const [focus, setFocus] = useState<BrowseInterest | null>(
    () => loadHomeFeedInterests()[0] ?? null,
  );
  const [subSheetCategory, setSubSheetCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("suggested");
  const [sortAscending, setSortAscending] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [listings, setListings] = useState<Awaited<ReturnType<typeof fetchActiveListingsForCityRemote>>>([]);
  const [hostMeta, setHostMeta] = useState<Record<string, HostGarageMeta>>({});
  const [clusterRadiusMi, setClusterRadiusState] = useState(() => getClusterRadiusMi());
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationSheetMode, setLocationSheetMode] = useState<"radius" | "pick">("radius");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [locationEpoch, setLocationEpoch] = useState(0);
  const { updateAvailable, updateJustCompleted } = usePwaUpdate();
  const showBellBadge = updateAvailable || updateJustCompleted;
  const autoOpenedLocationSheet = useRef(false);

  const city = getActiveRentLocationLabel().trim();
  const needsLocation = !hasRentLocationSetup();
  const countryCode = getSearchCountryCode();

  const interests = useMemo(() => (focus ? [focus] : []), [focus]);

  const handleBellPress = () => {
    onOpenNotifications();
  };

  useEffect(() => {
    saveHomeFeedMode(modeChip);
  }, [modeChip]);

  useEffect(() => {
    saveHomeFeedInterests(focus ? [focus] : []);
  }, [focus]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError(false);
    void fetchActiveListingsForCityRemote(city, {
      radiusMi: clusterRadiusMi,
    })
      .then(async (list) => {
        if (!mounted) return;
        const browsable = list.filter((l) => isListingBrowsable(l));
        setListings(browsable);
        const hostIds = browsable.map((l) => l.hostId).filter(Boolean) as string[];
        const [names, storefronts] = await Promise.all([
          fetchRemoteProfileNamesByIds(hostIds),
          fetchGarageStorefrontsByHostIds(hostIds),
        ]);
        if (!mounted) return;
        const merged: Record<string, HostGarageMeta> = {};
        for (const [id, meta] of Object.entries(names)) {
          const look = storefronts[id];
          merged[id] = {
            ...meta,
            shopKind: look?.shopKind,
            accentId: look?.accentId,
            shopName: look?.shopName,
          };
        }
        for (const [id, look] of Object.entries(storefronts)) {
          if (merged[id]) continue;
          merged[id] = {
            displayName: "Neighbor",
            rating: 0,
            createdAt: null,
            shopKind: look.shopKind,
            accentId: look.accentId,
            shopName: look.shopName,
          };
        }
        setHostMeta(merged);
      })
      .catch(() => {
        if (!mounted) return;
        setLoadError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [city, clusterRadiusMi, locationEpoch, reloadToken]);

  const filteredListings = useMemo(
    () =>
      listings.filter(
        (l) =>
          listingMatchesModeChip(l, modeChip) &&
          listingMatchesBrowseInterests(l, interests),
      ),
    [listings, modeChip, interests],
  );

  const garages = useMemo(
    () => groupListingsByGarage(filteredListings, hostMeta).filter((g) => g.itemCount > 0),
    [filteredListings, hostMeta],
  );

  const sortedGarages = useMemo(() => {
    if (sortKey === "suggested") return garages;
    const direction = sortAscending ? 1 : -1;
    return [...garages].sort((a, b) => {
      if (sortKey === "distance") {
        return (garageProximityRank(a) - garageProximityRank(b)) * direction;
      }
      const priceA = garageMinPrice(a);
      const priceB = garageMinPrice(b);
      // Shelves with no price stay at the bottom whichever way the sort points.
      if (priceA == null || priceB == null) {
        if (priceA == null && priceB == null) return 0;
        return priceA == null ? 1 : -1;
      }
      return (priceA - priceB) * direction;
    });
  }, [garages, sortKey, sortAscending]);

  const newGarages = useMemo(
    () => garages.filter((g) => g.isNew).slice(0, 8),
    [garages],
  );

  const focusItemCount = useMemo(
    () => garages.reduce((sum, g) => sum + g.itemCount, 0),
    [garages],
  );

  const browseCategories = useMemo(() => getAllCategoryChips(), []);
  const categoryCatalog = useMemo(() => getCategoryCatalog(), []);

  // The Rent/Buy chip narrows the feed like any filter, so it counts and it clears.
  const activeFilterCount =
    (modeChip !== "all" ? 1 : 0) +
    (clusterRadiusMi !== CLUSTER_RADIUS_DEFAULT_MI ? 1 : 0) +
    interests.length;

  const modeChips: { id: ModeChip; label: string }[] = [
    { id: "all", label: home.modeAny },
    { id: "rent", label: home.modeRent },
    { id: "buy", label: home.modeBuy },
  ];

  const interestLabel = (interest: BrowseInterest) => {
    const cat = localizeCategoryLabel(interest.category);
    if (!interest.subcategory) return cat;
    return `${cat} · ${localizeCategoryLabel(interest.subcategory)}`;
  };

  const interestsSummary = interests.map(interestLabel).join(", ");

  const focusShelf = useMemo(() => {
    if (!focus?.subcategory) return null;
    const entry = categoryCatalog.find((c) => c.name === focus.category);
    if (!entry) return null;
    return (
      [...entry.personal, ...entry.professional].find(
        (sub) => sub.label === focus.subcategory,
      ) ?? null
    );
  }, [categoryCatalog, focus]);

  const sortOptions: { id: SortKey; label: string }[] = [
    { id: "suggested", label: home.sortSuggested },
    { id: "price", label: home.sortPrice },
    { id: "distance", label: home.sortDistance },
  ];

  const sortDirectionLabel =
    sortKey === "price"
      ? sortAscending
        ? home.sortPriceAsc
        : home.sortPriceDesc
      : sortAscending
        ? home.sortDistanceAsc
        : home.sortDistanceDesc;

  const categoryHasInterest = (categoryName: string) => focus?.category === categoryName;

  const isCategoryWideSelected = (categoryName: string) =>
    focus?.category === categoryName && !focus.subcategory;

  const isSubcategorySelected = (categoryName: string, subcategory: string) =>
    focus?.category === categoryName && focus.subcategory === subcategory;

  const clearFocus = () => setFocus(null);

  const toggleCategoryWide = (categoryName: string) => {
    setFocus((prev) =>
      prev && prev.category === categoryName && !prev.subcategory
        ? null
        : { category: categoryName },
    );
  };

  /** Picking a shelf is the final choice — hand the screen back to the results. */
  const pickSubcategory = (categoryName: string, subcategory: string) => {
    const same =
      focus?.category === categoryName && focus?.subcategory === subcategory;
    setFocus(same ? null : { category: categoryName, subcategory });
    setSubSheetCategory(null);
    setFiltersOpen(false);
  };

  const pickWholeCategory = (categoryName: string) => {
    toggleCategoryWide(categoryName);
    setSubSheetCategory(null);
    setFiltersOpen(false);
  };

  const openSubSheet = (categoryName: string) => {
    setSubSheetCategory(categoryName);
  };

  const closeSubSheet = () => setSubSheetCategory(null);

  const closeFilters = () => {
    setSubSheetCategory(null);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFocus(null);
    setSubSheetCategory(null);
    setModeChip("all");
    setSortKey("suggested");
    setSortAscending(true);
    setClusterRadiusMi(CLUSTER_RADIUS_DEFAULT_MI);
    setClusterRadiusState(CLUSTER_RADIUS_DEFAULT_MI);
  };

  /** From the sheet: close it too, so the cleared feed is the confirmation. */
  const clearFiltersAndClose = () => {
    clearFilters();
    setFiltersOpen(false);
  };

  const postRequestFromFilters = () => {
    onPostRequest({
      category: focus?.category,
      subcategory: focus?.subcategory,
    });
  };

  const shareLookingFor = async () => {
    const labels =
      interestsSummary ||
      localizeCategoryLabel(focus?.category ?? "") ||
      "gear";
    const area = city || "nearby";
    const text = home.shareLookingFor(labels, area, APP_NAME);
    const url = `${APP_ORIGIN}/?skipSplash=1`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: APP_NAME, text, url });
        setShareStatus(home.shareStatusShared);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareStatus(home.shareStatusCopied);
      }
    } catch {
      /* cancelled */
    }
    window.setTimeout(() => setShareStatus(null), 4000);
  };

  const openLocationSheet = (mode: "radius" | "pick" = needsLocation ? "pick" : "radius") => {
    setLocationSheetMode(mode);
    if (mode === "pick") {
      setSelectedLocation(null);
      setLocateError(null);
    }
    setLocationSheetOpen(true);
  };

  const closeLocationSheet = () => {
    setLocationSheetOpen(false);
    setSelectedLocation(null);
    setLocateError(null);
  };

  useAccessibleOverlay(filtersOpen, closeFilters, "home-filters-sheet");
  useAccessibleOverlay(locationSheetOpen, closeLocationSheet, "home-location-sheet");

  useEffect(() => {
    if (!needsLocation || autoOpenedLocationSheet.current) return;
    autoOpenedLocationSheet.current = true;
    openLocationSheet("pick");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when Home mounts without a block
  }, [needsLocation]);

  const handleUseMyLocation = async () => {
    setLocateError(null);
    setIsLocating(true);
    try {
      const detected = await detectCurrentLocation();
      if (!detected.ok) {
        setLocateError(formatGeolocationErrorMessage(detected.reason));
        return;
      }
      setSelectedLocation({
        label: detected.location.displayName,
        primaryLine: detected.location.displayName,
        secondaryLine: "",
        city: detected.location.displayName,
        country: "",
        region: "",
        countryCode: "",
        flag: "📍",
        lat: detected.location.lat,
        lng: detected.location.lng,
        precision: "gps",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleSaveLocation = () => {
    if (!selectedLocation) return;
    setHomeLocation({
      displayName: selectedLocation.label,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
    if (!isOnboardingComplete()) completeOnboarding();
    setLocationEpoch((n) => n + 1);
    closeLocationSheet();
  };

  const handleChangePickedLocation = () => {
    setSelectedLocation(null);
    setLocateError(null);
  };

  const applyRadius = (miles: number) => {
    setClusterRadiusMi(miles);
    setClusterRadiusState(miles);
  };

  const radiusButtons = (
    <div className="flex flex-wrap gap-2">
      {RADIUS_PRESETS.map((miles) => {
        const active = clusterRadiusMi === miles;
        const milesLabel = home.miles(miles);
        const label =
          miles <= CLUSTER_RADIUS_DEFAULT_MI
            ? home.closerMiles(milesLabel)
            : miles >= CLUSTER_RADIUS_MAX_MI
              ? home.fartherMiles(milesLabel)
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
  );

  const emptyIsFiltered = Boolean(focus) || modeChip !== "all";
  const showInitialSkeleton = loading && garages.length === 0 && !loadError;
  const showLoadError = !loading && loadError && garages.length === 0;
  const showEmptyState = !loading && !loadError && garages.length === 0;

  const emptyTitle = needsLocation
    ? home.emptyNoLocationTitle
    : emptyIsFiltered
      ? home.emptyFilteredTitle
      : home.emptyBlockTitle;
  const emptyBody = needsLocation
    ? home.emptyNoLocationBody
    : emptyIsFiltered && interests.length > 0
      ? home.emptyFilteredBody(interestsSummary)
      : home.emptyBlockBody;

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div
        className="shrink-0 bg-[#F0F4F2] px-4 pb-2"
        style={{ paddingTop: "max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))" }}
      >
        <div className="mb-3">
          {needsLocation ? (
            <button
              type="button"
              onClick={() => openLocationSheet("pick")}
              className="flex w-full items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 text-left active:bg-amber-50"
              style={{ borderColor: "#F5D0A0" }}
              aria-label={home.setBlockAria}
            >
              <MapPin
                className="h-4 w-4 shrink-0"
                style={{ color: "#F59E0B" }}
                fill="#F59E0B"
                stroke={GREEN_DARK}
                strokeWidth={1.5}
              />
              <span className="min-w-0 flex-1 text-[14px] font-bold leading-snug text-[#B45309]">
                {home.setBlock}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-amber-700/70" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openLocationSheet("radius")}
              className="flex w-full items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 text-left active:bg-gray-50"
              style={{ borderColor: BORDER }}
              aria-label={`${city}. ${home.withinMiles(clusterRadiusMi)}. ${home.changeDistanceCta}`}
            >
              <MapPin
                className="h-4 w-4 shrink-0"
                style={{ color: GREEN }}
                fill={GREEN}
                stroke={GREEN_DARK}
                strokeWidth={1.5}
                aria-hidden
              />
              <span
                className="min-w-0 flex-1 truncate text-[14px] font-bold leading-snug"
                style={{ color: GREEN_DARK }}
              >
                {city}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-gray-500">
                {home.withinMiles(clusterRadiusMi)}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            </button>
          )}
        </div>

        <RoleModeSwitcher active="rent" onChange={onRoleModeChange} className="mb-3" />

        <div className="mb-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 active:bg-gray-50"
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
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onRentals}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
              style={{ borderColor: BORDER }}
              aria-label={home.bookingsAria}
            >
              <ClipboardList className="h-5 w-5" style={{ color: GREEN_DARK }} />
            </button>
            <button
              type="button"
              onClick={handleBellPress}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white active:bg-gray-50"
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
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        {focus ? (
          <section
            className="mb-3 rounded-2xl border-2 bg-white px-4 py-4"
            style={{ borderColor: GREEN_DARK }}
            aria-label={interestLabel(focus)}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${GREEN}14` }}
                aria-hidden
              >
                {focusShelf ? (
                  <ShelfIcon source={focusShelf} size={56} />
                ) : (
                  <CategoryIcon
                    category={focus.category}
                    emoji={
                      browseCategories.find((c) => c.name === focus.category)?.icon ?? "📦"
                    }
                    size={56}
                  />
                )}
              </span>
              <div className="min-w-0 flex-1">
                {focus.subcategory ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {localizeCategoryLabel(focus.category)}
                  </p>
                ) : null}
                <h2
                  className="text-[20px] font-extrabold leading-tight [overflow-wrap:anywhere]"
                  style={{ color: GREEN_DARK }}
                >
                  {localizeCategoryLabel(focus.subcategory ?? focus.category)}
                </h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  {home.focusCount(focusItemCount, garages.length)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearFocus}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100"
                aria-label={home.focusClearAria}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="mt-3 w-full rounded-xl border-2 py-2.5 text-[14px] font-bold"
              style={{ borderColor: BORDER, color: GREEN_DARK }}
            >
              {home.focusChange}
            </button>
          </section>
        ) : (
          <button
            type="button"
            onClick={onYardSales}
            className="mb-3 flex w-full items-center justify-between gap-2 rounded-2xl border bg-white px-3.5 py-3 text-left active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label={home.yardSalesEntryAria}
          >
            <span>
              <span className="block text-[14px] font-bold" style={{ color: GREEN_DARK }}>
                {home.yardSalesEntry}
              </span>
              <span className="mt-0.5 block text-[12px] text-gray-500">{home.yardSalesEntryHint}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
          </button>
        )}

        {garages.length > 1 ? (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {home.sortTitle}
            </span>
            {sortOptions.map((option) => {
              const active = sortKey === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSortKey(option.id);
                    setSortAscending(true);
                  }}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
                  style={{
                    backgroundColor: active ? GREEN_DARK : "white",
                    color: active ? "white" : "#666",
                    border: `1px solid ${active ? GREEN_DARK : BORDER}`,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
            {sortKey !== "suggested" ? (
              <button
                type="button"
                onClick={() => setSortAscending((prev) => !prev)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-[12px] font-bold"
                style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                aria-label={home.sortFlipAria}
              >
                <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
                {sortDirectionLabel}
              </button>
            ) : null}
          </div>
        ) : null}

        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
          {home.garagesNearYou}
        </p>

        {newGarages.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-[13px] font-bold" style={{ color: GREEN_DARK }}>
              {home.newGaragesTitle}
            </p>
            <p className="mb-2.5 text-[12px] text-gray-500">{home.newGaragesHint}</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {newGarages.map((garage) => (
                <GarageLensCard
                  key={`new-${garage.hostId || garage.name}`}
                  garage={garage}
                  compact
                  onSelect={() => onNavigate(`neighborGarage:${garage.hostId}`)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {showInitialSkeleton ? (
          <ul className="space-y-3 pb-2" aria-busy="true" aria-label={home.loadingGarages}>
            {[0, 1, 2].map((i) => (
              <li
                key={`skel-${i}`}
                className="animate-pulse rounded-2xl border bg-white p-4"
                style={{ borderColor: BORDER }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gray-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="h-14 w-14 rounded-xl bg-gray-100" />
                  <div className="h-14 w-14 rounded-xl bg-gray-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {loading && garages.length > 0 ? (
          <p className="mb-2 text-center text-[12px] text-gray-500">{home.loadingGarages}</p>
        ) : null}

        {showLoadError ? (
          <div className="mx-auto mt-6 max-w-[340px] text-center">
            <MrRentano size={56} className="mx-auto" />
            <p className="mt-3 text-[18px] font-bold" style={{ color: GREEN_DARK }}>
              {home.loadErrorTitle}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{home.loadErrorBody}</p>
            <button
              type="button"
              onClick={() => setReloadToken((n) => n + 1)}
              className="mt-5 w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              {systemUi.tryAgain}
            </button>
          </div>
        ) : null}

        {showEmptyState ? (
          <div className="mx-auto mt-6 max-w-[340px] text-center">
            <MrRentano size={56} className="mx-auto" />
            <p className="mt-3 text-[18px] font-bold" style={{ color: GREEN_DARK }}>
              {emptyTitle}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
              {mascotSays(emptyBody)}
            </p>
            {needsLocation ? (
              <button
                type="button"
                onClick={() => openLocationSheet("pick")}
                className="mt-5 w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                {home.setBlock}
              </button>
            ) : (
              <>
                {interests.length > 0 ? (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {interests.map((interest) => (
                      <span
                        key={browseInterestKey(interest)}
                        className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700"
                        style={{ borderColor: BORDER }}
                      >
                        {interestLabel(interest)}
                      </span>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={postRequestFromFilters}
                  className="mt-5 w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
                  style={{ backgroundColor: GREEN_DARK }}
                >
                  {home.postRequest}
                </button>
                <button
                  type="button"
                  onClick={() => void shareLookingFor()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-[15px] font-bold"
                  style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                >
                  <Share2 className="h-4 w-4" />
                  {home.shareNeighbors}
                </button>
                {shareStatus ? (
                  <p className="mt-2 text-[12px] font-medium text-gray-500">{shareStatus}</p>
                ) : null}
                <button
                  type="button"
                  onClick={onStockGarage}
                  className="mt-3 w-full rounded-xl border-2 py-3 text-[15px] font-bold"
                  style={{ borderColor: BORDER, color: "#555" }}
                >
                  {home.stockGarage}
                </button>
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 min-h-[44px] touch-manipulation px-4 text-[14px] font-semibold text-gray-500 underline"
                  >
                    {home.clearFilters}
                  </button>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {garages.length > 0 ? (
          <ul className="space-y-3 pb-2">
            {sortedGarages.map((garage) => (
              <li key={garage.hostId || garage.name}>
                <GarageLensCard
                  garage={garage}
                  onSelect={() => onNavigate(`neighborGarage:${garage.hostId}`)}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {!loading && !loadError && garages.length > 0 ? (
          <div className="mt-4 rounded-2xl border bg-white px-4 py-3.5 text-center" style={{ borderColor: BORDER }}>
            <p className="text-[14px] font-semibold text-gray-700">{home.cantFind}</p>
            <p className="mt-1 text-[13px] text-gray-500">
              {home.cantFindBody}
            </p>
            <button
              type="button"
              onClick={() => {
                postRequestFromFilters();
              }}
              className="mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: GREEN_DARK }}
            >
              {home.postRequestShare}
            </button>
            <button
              type="button"
              onClick={() => void shareLookingFor()}
              className="mt-2 flex w-full items-center justify-center gap-2 text-[13px] font-semibold"
              style={{ color: GREEN }}
            >
              <Share2 className="h-4 w-4" />
              {home.shareNeighbors}
            </button>
            {shareStatus ? (
              <p className="mt-1 text-[12px] text-gray-500">{shareStatus}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/40">
          <button
            type="button"
            className="min-h-0 flex-1"
            aria-label={home.closeFiltersAria}
            onClick={closeFilters}
          />
          <div
            className={FILTERS_PANEL}
            role="dialog"
            aria-modal="true"
            aria-label={home.filtersTitle}
          >
            <div className="mb-3 flex shrink-0 items-center justify-between px-4">
              <h2 className="text-[18px] font-extrabold" style={{ color: GREEN_DARK }}>
                {home.filtersTitle}
              </h2>
              <button
                type="button"
                onClick={closeFilters}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gray-100"
                aria-label={common.close}
              >
                <X className="h-5 w-5 text-red-600" />
              </button>
            </div>

            <div className={FILTERS_BODY}>
              <section className="mb-5">
                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">
                  {home.categoryTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    clearFocus();
                    setSubSheetCategory(null);
                  }}
                  className="mb-2 w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold"
                  style={{
                    backgroundColor: focus ? "white" : GREEN_DARK,
                    color: focus ? "#444" : "white",
                    borderColor: focus ? BORDER : GREEN_DARK,
                  }}
                >
                  {home.allCategories}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {browseCategories.map((cat) => {
                    const active = categoryHasInterest(cat.name);
                    const subCount = interests.filter(
                      (i) => i.category === cat.name && i.subcategory,
                    ).length;
                    return (
                      <div
                        key={cat.name}
                        className="flex min-w-0 overflow-hidden rounded-xl border"
                        style={{
                          borderColor: active ? GREEN_DARK : BORDER,
                          backgroundColor: active ? `${GREEN}14` : "white",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCategoryWide(cat.name)}
                          className="flex min-w-0 flex-1 items-center gap-1.5 px-2.5 py-2.5 text-left"
                        >
                          <CategoryIcon category={cat.name} emoji={cat.icon} size={24} />
                          <span
                            className="min-w-0 flex-1 text-[12px] font-bold leading-snug [overflow-wrap:anywhere]"
                            style={{ color: active ? GREEN_DARK : "#374151" }}
                          >
                            {localizeCategoryLabel(cat.name)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openSubSheet(cat.name)}
                          className="relative flex min-w-[44px] shrink-0 items-center justify-center border-l"
                          style={{ borderColor: active ? `${GREEN_DARK}33` : BORDER }}
                          aria-label={home.subcategoryTitle}
                          aria-haspopup="dialog"
                        >
                          <ChevronDown className="h-4 w-4" style={{ color: GREEN_DARK }} />
                          {subCount > 0 ? (
                            <span
                              className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
                              style={{ backgroundColor: GREEN_DARK }}
                            >
                              {subCount}
                            </span>
                          ) : null}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] leading-snug text-gray-500">
                  {home.subcategoryHint}
                </p>
              </section>

              <section className="mb-5">
                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">
                  {home.distanceTitle}
                </h3>
                <p className="mb-2 text-[13px] text-gray-500">{home.distanceHint}</p>
                {radiusButtons}
              </section>
              <div className={SHEET_SCROLL_END} aria-hidden />
            </div>

            <div
              className="mt-3 flex shrink-0 gap-2 border-t px-4 pt-3"
              style={{ borderColor: BORDER }}
            >
              <button
                type="button"
                onClick={clearFiltersAndClose}
                disabled={activeFilterCount === 0}
                className="min-h-[52px] flex-1 touch-manipulation rounded-xl border-2 py-3 text-[15px] font-bold"
                style={{
                  borderColor: BORDER,
                  color: "#555",
                  opacity: activeFilterCount === 0 ? 0.45 : 1,
                }}
              >
                {home.clearFilters}
              </button>
              <button
                type="button"
                onClick={closeFilters}
                className="min-h-[52px] flex-[1.4] touch-manipulation rounded-xl py-3 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                {home.done}
              </button>
            </div>
          </div>

          {subSheetCategory ? (
            <div className="absolute inset-0 z-[1] flex flex-col justify-end bg-black/25">
              <button
                type="button"
                className="min-h-0 flex-1"
                aria-label={common.back}
                onClick={closeSubSheet}
              />
              <div
                className={SHEET_PANEL}
                role="dialog"
                aria-modal="true"
                aria-label={`${localizeCategoryLabel(subSheetCategory)} · ${home.subcategoryTitle}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeSubSheet}
                    className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border bg-white"
                    style={{ borderColor: BORDER, color: GREEN_DARK }}
                    aria-label={common.back}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h2
                      className="flex items-center gap-1.5 text-[17px] font-extrabold"
                      style={{ color: GREEN_DARK }}
                    >
                      <CategoryIcon
                        category={subSheetCategory}
                        emoji={
                          browseCategories.find((c) => c.name === subSheetCategory)?.icon ?? "📦"
                        }
                        size={24}
                      />
                      <span className="truncate">{localizeCategoryLabel(subSheetCategory)}</span>
                    </h2>
                    <p className="text-[12px] text-gray-500">{home.subcategoryTitle}</p>
                  </div>
                </div>

                {(() => {
                  const entry = categoryCatalog.find((c) => c.name === subSheetCategory);
                  if (!entry) return null;
                  const wideActive = isCategoryWideSelected(subSheetCategory);
                  const renderSubGrid = (
                    items: SubcategoryItem[],
                    sectionKey: string,
                  ) => (
                    <div className="grid grid-cols-2 gap-1.5">
                      {items.map((sub) => {
                        const subActive = isSubcategorySelected(subSheetCategory, sub.label);
                        return (
                          <button
                            key={`${sectionKey}:${sub.label}`}
                            type="button"
                            onClick={() => pickSubcategory(subSheetCategory, sub.label)}
                            className="flex min-w-0 items-start gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[12px] font-semibold leading-snug"
                            style={{
                              backgroundColor: subActive ? GREEN_DARK : "white",
                              color: subActive ? "white" : "#444",
                              borderColor: subActive ? GREEN_DARK : BORDER,
                            }}
                          >
                            <span className="shrink-0" aria-hidden>
                              <ShelfIcon source={sub} size={26} inverted={subActive} />
                            </span>
                            <span className="min-w-0 [overflow-wrap:anywhere]">
                              {localizeCategoryLabel(sub.label)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                  return (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => pickWholeCategory(subSheetCategory)}
                        className="w-full rounded-xl border px-3 py-3 text-left text-[13px] font-bold"
                        style={{
                          backgroundColor: wideActive ? GREEN_DARK : "white",
                          color: wideActive ? "white" : "#374151",
                          borderColor: wideActive ? GREEN_DARK : BORDER,
                        }}
                      >
                        {home.wholeCategory}
                      </button>
                      {entry.personal.length > 0 ? (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {catalog.household}
                          </p>
                          {renderSubGrid(entry.personal, "personal")}
                        </div>
                      ) : null}
                      {entry.professional.length > 0 ? (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {catalog.pro}
                          </p>
                          {renderSubGrid(entry.professional, "professional")}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={closeSubSheet}
                        className="w-full rounded-xl py-3 text-[15px] font-bold text-white"
                        style={{ backgroundColor: GREEN_DARK }}
                      >
                        {home.done}
                      </button>
                    </div>
                  );
                })()}
                <div className={SHEET_SCROLL_END} aria-hidden />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {locationSheetOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
          <button
            type="button"
            className="min-h-0 flex-1"
            aria-label={common.close}
            onClick={closeLocationSheet}
          />
          <div
            className={SHEET_PANEL}
            role="dialog"
            aria-modal="true"
            aria-label={
              locationSheetMode === "pick" ? home.setBlockSheetTitle : home.locationSheetTitle
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold" style={{ color: GREEN_DARK }}>
                {locationSheetMode === "pick" ? home.setBlockSheetTitle : home.locationSheetTitle}
              </h2>
              <button
                type="button"
                onClick={closeLocationSheet}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gray-100"
                aria-label={common.close}
              >
                <X className="h-5 w-5 text-red-600" />
              </button>
            </div>

            {locationSheetMode === "pick" ? (
              <>
                {selectedLocation ? (
                  <>
                    <p className="mb-2 text-[13px] font-semibold text-gray-600">
                      {home.detectedLocationTitle}
                    </p>
                    <AddressLocationPicker
                      variant="area"
                      placeholder={whereAreYouManual.placeholder}
                      emptyHint={getCountryEmptyHint(countryCode, "area")}
                      selected={selectedLocation}
                      onSelect={setSelectedLocation}
                      onClear={handleChangePickedLocation}
                    />
                    <button
                      type="button"
                      onClick={handleSaveLocation}
                      className="mt-4 w-full rounded-xl py-3.5 text-[15px] font-bold text-white"
                      style={{ backgroundColor: GREEN_DARK }}
                    >
                      {home.confirmLocation}
                    </button>
                    <button
                      type="button"
                      onClick={handleChangePickedLocation}
                      className="mt-2 w-full rounded-xl border-2 py-3 text-[15px] font-bold"
                      style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                    >
                      {home.changePickedLocation}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-[13px] leading-relaxed text-gray-500">
                      {home.setBlockSheetHint}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleUseMyLocation()}
                      disabled={isLocating}
                      className="mb-1 inline-flex items-center gap-1.5 self-start text-[15px] font-semibold underline underline-offset-2 disabled:opacity-60"
                      style={{ color: GREEN_DARK }}
                    >
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                      {isLocating ? home.locating : home.useMyLocation}
                    </button>
                    <p className="mb-3 text-[12px] leading-snug text-gray-500">
                      {home.useMyLocationHint}
                    </p>
                    {locateError ? (
                      <p
                        className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                        role="status"
                      >
                        {locateError}
                      </p>
                    ) : null}
                    <p className="mb-2 text-[13px] font-semibold text-gray-600">
                      {home.pickLocationHint}
                    </p>
                    <AddressLocationPicker
                      variant="area"
                      placeholder={whereAreYouManual.placeholder}
                      emptyHint={getCountryEmptyHint(countryCode, "area")}
                      selected={selectedLocation}
                      onSelect={setSelectedLocation}
                      onClear={handleChangePickedLocation}
                    />
                    {!needsLocation ? (
                      <button
                        type="button"
                        onClick={() => setLocationSheetMode("radius")}
                        className="mt-3 w-full py-2 text-[14px] font-semibold text-gray-500"
                      >
                        {home.backToRadius}
                      </button>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <>
                <p className="mb-1 text-[13px] font-semibold text-gray-800">{city}</p>
                <p className="mb-4 text-[13px] leading-relaxed text-gray-500">
                  {home.locationSheetHint}
                </p>

                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">
                  {home.distanceTitle}
                </h3>
                {radiusButtons}

                <button
                  type="button"
                  onClick={() => openLocationSheet("pick")}
                  className="mt-5 w-full rounded-xl border-2 py-3 text-[15px] font-bold"
                  style={{ borderColor: GREEN_DARK, color: GREEN_DARK }}
                >
                  {home.changeLocationCta}
                </button>

                <button
                  type="button"
                  onClick={closeLocationSheet}
                  className="mt-2 w-full rounded-xl py-3 text-[15px] font-bold text-white"
                  style={{ backgroundColor: GREEN_DARK }}
                >
                  {home.done}
                </button>
              </>
            )}
            <div className={SHEET_SCROLL_END} aria-hidden />
          </div>
        </div>
      ) : null}
    </div>
  );
}
