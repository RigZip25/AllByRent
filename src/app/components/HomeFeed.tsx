import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ClipboardList, MapPin, ChevronRight, ChevronDown, ChevronLeft, Share2, SlidersHorizontal, X } from "lucide-react";
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
import {
  groupListingsByGarage,
  listingMatchesBrowseInterests,
  listingMatchesModeChip,
  listingMatchesPriceRange,
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

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

/** Bottom sheets: one scroll, soft end padding so last controls aren’t clipped / rubber-banded away. */
const SHEET_PANEL =
  "max-h-[min(88dvh,720px)] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] rounded-t-3xl bg-white px-4 pt-3 pb-[max(3.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))]";
const SHEET_SCROLL_END = "h-10 w-full shrink-0";

const RADIUS_PRESETS = [
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
] as const;

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
  const { home, common, whereAreYouManual, catalog } = messages;
  const [modeChip, setModeChip] = useState<ModeChip>(() => loadHomeFeedMode());
  const [interests, setInterests] = useState<BrowseInterest[]>(() => loadHomeFeedInterests());
  const [subSheetCategory, setSubSheetCategory] = useState<string | null>(null);
  const [pricePresetId, setPricePresetId] = useState("any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Awaited<ReturnType<typeof fetchActiveListingsForCityRemote>>>([]);
  const [hostMeta, setHostMeta] = useState<Record<string, HostGarageMeta>>({});
  const [clusterRadiusMi, setClusterRadiusState] = useState(() => getClusterRadiusMi());
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationSheetMode, setLocationSheetMode] = useState<"radius" | "pick">("radius");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [locationEpoch, setLocationEpoch] = useState(0);
  const { updateAvailable, updateJustCompleted, simulateUpdateNotification } = usePwaUpdate();
  const showBellBadge = updateAvailable || updateJustCompleted;
  const bellTapRef = useRef({ count: 0, openTimer: 0 });
  const autoOpenedLocationSheet = useRef(false);

  const city = getActiveRentLocationLabel().trim();
  const needsLocation = !hasRentLocationSetup();
  const countryCode = getSearchCountryCode();

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
    saveHomeFeedInterests(interests);
  }, [interests]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Default radius stays city-scoped; wider radii pull a broader shelf until geo filter lands.
    const fetchCity = clusterRadiusMi > CLUSTER_RADIUS_DEFAULT_MI ? "" : city;
    void fetchActiveListingsForCityRemote(fetchCity)
      .then(async (list) => {
        if (!mounted) return;
        const browsable = list.filter(isListingBrowsable);
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
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [city, clusterRadiusMi, locationEpoch]);

  const filteredListings = useMemo(
    () =>
      listings.filter(
        (l) =>
          listingMatchesModeChip(l, modeChip) &&
          listingMatchesBrowseInterests(l, interests) &&
          listingMatchesPriceRange(l, pricePreset.min, pricePreset.max),
      ),
    [listings, modeChip, interests, pricePreset],
  );

  const garages = useMemo(
    () => groupListingsByGarage(filteredListings, hostMeta).filter((g) => g.itemCount > 0),
    [filteredListings, hostMeta],
  );

  const newGarages = useMemo(
    () => garages.filter((g) => g.isNew).slice(0, 8),
    [garages],
  );

  const browseCategories = useMemo(() => getAllCategoryChips(), []);
  const categoryCatalog = useMemo(() => getCategoryCatalog(), []);

  const activeFilterCount =
    (pricePresetId !== "any" ? 1 : 0) +
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

  const primaryInterest = interests[0] ?? null;

  const categoryHasInterest = (categoryName: string) =>
    interests.some((i) => i.category === categoryName);

  const isCategoryWideSelected = (categoryName: string) =>
    interests.some((i) => i.category === categoryName && !i.subcategory);

  const isSubcategorySelected = (categoryName: string, subcategory: string) =>
    interests.some(
      (i) => i.category === categoryName && i.subcategory === subcategory,
    );

  const removeInterest = (interest: BrowseInterest) => {
    const key = browseInterestKey(interest);
    setInterests((prev) => prev.filter((i) => browseInterestKey(i) !== key));
  };

  const toggleCategoryWide = (categoryName: string) => {
    setInterests((prev) => {
      const hasWide = prev.some((i) => i.category === categoryName && !i.subcategory);
      const withoutCat = prev.filter((i) => i.category !== categoryName);
      if (hasWide) return withoutCat;
      return [...withoutCat, { category: categoryName }];
    });
  };

  const toggleSubcategory = (categoryName: string, subcategory: string) => {
    setInterests((prev) => {
      const key = browseInterestKey({ category: categoryName, subcategory });
      const exists = prev.some((i) => browseInterestKey(i) === key);
      const withoutWide = prev.filter(
        (i) => !(i.category === categoryName && !i.subcategory),
      );
      if (exists) {
        return withoutWide.filter((i) => browseInterestKey(i) !== key);
      }
      return [...withoutWide, { category: categoryName, subcategory }];
    });
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
    setInterests([]);
    setSubSheetCategory(null);
    setPricePresetId("any");
    setClusterRadiusMi(CLUSTER_RADIUS_DEFAULT_MI);
    setClusterRadiusState(CLUSTER_RADIUS_DEFAULT_MI);
  };

  const postRequestFromFilters = () => {
    onPostRequest({
      category: primaryInterest?.category,
      subcategory: primaryInterest?.subcategory,
    });
  };

  const shareLookingFor = async () => {
    const labels =
      interestsSummary ||
      localizeCategoryLabel(primaryInterest?.category ?? "") ||
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

  const emptyIsFiltered = Boolean(interests.length > 0 || pricePresetId !== "any");

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
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
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
          {interests.map((interest) => {
            const icon =
              browseCategories.find((c) => c.name === interest.category)?.icon ?? "📦";
            return (
              <button
                key={browseInterestKey(interest)}
                type="button"
                onClick={() => removeInterest(interest)}
                className="inline-flex max-w-[220px] shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                <span aria-hidden>{icon}</span>
                <span className="truncate">{interestLabel(interest)}</span>
                <X className="h-3.5 w-3.5 shrink-0" />
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
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

        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
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
                interests.length > 0
                  ? home.emptyFilteredBody(interestsSummary)
                  : home.emptyBlockBody,
              )}
            </p>
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
          <div className={SHEET_PANEL} role="dialog" aria-label={home.filtersTitle}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold" style={{ color: GREEN_DARK }}>
                {home.filtersTitle}
              </h2>
              <button
                type="button"
                onClick={closeFilters}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                aria-label={common.close}
              >
                <X className="h-5 w-5 text-red-600" />
              </button>
            </div>

            <section className="mb-5">
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
                {home.categoryTitle}
              </h3>
              {interests.length > 0 ? (
                <div className="mb-3">
                  <p className="mb-1.5 text-[12px] font-semibold text-gray-500">{home.yourPicks}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((interest) => (
                      <button
                        key={browseInterestKey(interest)}
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-bold text-white"
                        style={{ backgroundColor: GREEN }}
                      >
                        <span className="truncate">{interestLabel(interest)}</span>
                        <X className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setInterests([]);
                  setSubSheetCategory(null);
                }}
                className="mb-2 w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-bold"
                style={{
                  backgroundColor: interests.length === 0 ? GREEN_DARK : "white",
                  color: interests.length === 0 ? "white" : "#444",
                  borderColor: interests.length === 0 ? GREEN_DARK : BORDER,
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
                        <span className="shrink-0 text-[15px]" aria-hidden>
                          {cat.icon}
                        </span>
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
                        className="relative flex w-9 shrink-0 items-center justify-center border-l"
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
              <p className="mb-2 text-[13px] text-gray-500">{home.distanceHint}</p>
              {radiusButtons}
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
                onClick={closeFilters}
                className="flex-[1.4] rounded-xl py-3 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN_DARK }}
              >
                {home.done}
              </button>
            </div>
            <div className={SHEET_SCROLL_END} aria-hidden />
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
                aria-label={`${localizeCategoryLabel(subSheetCategory)} · ${home.subcategoryTitle}`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeSubSheet}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white"
                    style={{ borderColor: BORDER, color: GREEN_DARK }}
                    aria-label={common.back}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[17px] font-extrabold" style={{ color: GREEN_DARK }}>
                      <span className="mr-1.5" aria-hidden>
                        {browseCategories.find((c) => c.name === subSheetCategory)?.icon ?? "📦"}
                      </span>
                      {localizeCategoryLabel(subSheetCategory)}
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
                            onClick={() => toggleSubcategory(subSheetCategory, sub.label)}
                            className="flex min-w-0 items-start gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[12px] font-semibold leading-snug"
                            style={{
                              backgroundColor: subActive ? GREEN_DARK : "white",
                              color: subActive ? "white" : "#444",
                              borderColor: subActive ? GREEN_DARK : BORDER,
                            }}
                          >
                            <span className="shrink-0" aria-hidden>
                              <ShelfIcon source={sub} size={20} inverted={subActive} />
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
                        onClick={() => toggleCategoryWide(subSheetCategory)}
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
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {catalog.household}
                          </p>
                          {renderSubGrid(entry.personal, "personal")}
                        </div>
                      ) : null}
                      {entry.professional.length > 0 ? (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100"
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

                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-400">
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
