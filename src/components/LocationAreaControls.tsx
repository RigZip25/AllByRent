import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { AddressLocationPicker } from "./AddressLocationPicker";
import type { LocationSuggestion } from "../lib/geocoding";
import { detectCurrentLocation, formatGeolocationErrorMessage } from "../lib/geolocation";
import {
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
  getClusterRadiusMi,
  setClusterRadiusMi,
} from "../lib/clusterConfig";
import {
  getActiveRentLocationLabel,
  hasRentLocationSetup,
  setHomeLocation,
} from "../lib/listingStorage";
import { getCountryEmptyHint, getSearchCountryCode } from "../lib/locationCountry";
import { completeOnboarding, isOnboardingComplete } from "../lib/onboardingStorage";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

const SHEET_PANEL =
  "max-h-[min(88dvh,720px)] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] rounded-t-3xl bg-white px-4 pt-3 pb-[max(3.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))]";
const SHEET_SCROLL_END = "h-10 w-full shrink-0";

const RADIUS_PRESETS = [
  CLUSTER_RADIUS_DEFAULT_MI,
  CLUSTER_RADIUS_EXPANDED_MI,
  CLUSTER_RADIUS_MAX_MI,
] as const;

type LocationAreaControlsProps = {
  className?: string;
  /** Open pick sheet once if location is missing. */
  autoOpenIfMissing?: boolean;
  /** Called after location or radius changes. */
  onChanged?: () => void;
  /**
   * `compact` — single tappable row (city · distance). Better next to back buttons / hub headers.
   */
  variant?: "default" | "compact";
};

/**
 * Stable city line + distance edit + in-place sheets (no screen navigation).
 */
export function LocationAreaControls({
  className = "",
  autoOpenIfMissing = false,
  onChanged,
  variant = "default",
}: LocationAreaControlsProps) {
  const { home, common, whereAreYouManual } = useMessages();
  const [clusterRadiusMi, setClusterRadiusState] = useState(() => getClusterRadiusMi());
  const [locationEpoch, setLocationEpoch] = useState(0);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationSheetMode, setLocationSheetMode] = useState<"radius" | "pick">("radius");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const autoOpened = useRef(false);

  void locationEpoch;
  const city = getActiveRentLocationLabel().trim();
  const needsLocation = !hasRentLocationSetup();
  const countryCode = getSearchCountryCode();

  const bump = () => {
    setLocationEpoch((n) => n + 1);
    onChanged?.();
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
    if (!autoOpenIfMissing || !needsLocation || autoOpened.current) return;
    autoOpened.current = true;
    openLocationSheet("pick");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenIfMissing, needsLocation]);

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
    bump();
    closeLocationSheet();
  };

  const handleChangePickedLocation = () => {
    setSelectedLocation(null);
    setLocateError(null);
  };

  const applyRadius = (miles: number) => {
    setClusterRadiusMi(miles);
    setClusterRadiusState(miles);
    bump();
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

  return (
    <>
      <div className={className}>
        {needsLocation ? (
          <button
            type="button"
            onClick={() => openLocationSheet("pick")}
            className={
              variant === "compact"
                ? "flex w-full items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 text-left active:bg-gray-50"
                : "w-full py-0.5 text-left"
            }
            style={variant === "compact" ? { borderColor: BORDER } : undefined}
            aria-label={home.setBlockAria}
          >
            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              <MapPin
                className="h-4 w-4 shrink-0"
                style={{ color: "#F59E0B" }}
                fill="#F59E0B"
                stroke={GREEN_DARK}
                strokeWidth={1.5}
              />
              <span className="min-w-0 flex-1 text-[14px] font-bold leading-snug text-[#B45309] sm:text-base">
                {home.setBlock}
              </span>
            </span>
            {variant === "compact" ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-amber-700/70" aria-hidden />
            ) : null}
          </button>
        ) : variant === "compact" ? (
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
        ) : (
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: GREEN }}
              fill={GREEN}
              stroke={GREEN_DARK}
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-[14px] font-bold leading-snug break-words sm:text-base"
                style={{ color: GREEN_DARK }}
              >
                {city}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-[13px] font-medium text-gray-600">
                  {home.withinMiles(clusterRadiusMi)}
                </span>
                <button
                  type="button"
                  onClick={() => openLocationSheet("radius")}
                  className="text-[13px] font-semibold underline underline-offset-2"
                  style={{ color: GREEN_DARK }}
                >
                  {home.changeDistanceCta}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLocationSheet("pick")}
              className="shrink-0 pt-0.5 text-[12px] font-semibold underline underline-offset-2"
              style={{ color: GREEN_DARK }}
              aria-label={home.changeBlockAria}
            >
              {home.changeAreaCta}
            </button>
          </div>
        )}
      </div>

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
    </>
  );
}
