import { useState } from "react";
import { AddressLocationPicker } from "../../components/AddressLocationPicker";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import type { LocationSuggestion } from "../../lib/geocoding";
import { detectCurrentLocation, formatGeolocationErrorMessage } from "../../lib/geolocation";
import { setHomeLocation } from "../../lib/listingStorage";

const GREEN = "#0D5C3A";

type WhereAreYouManualProps = {
  onBack: () => void;
  onContinue: (city: string) => void;
  onSkip: () => void;
  hint?: string;
};

export function WhereAreYouManual({ onBack, onContinue, onSkip, hint }: WhereAreYouManualProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const handleUseMyLocation = async () => {
    setLocateError(null);
    setIsLocating(true);
    try {
      const detected = await detectCurrentLocation();
      if (!detected.ok) {
        setLocateError(formatGeolocationErrorMessage(detected.reason));
        return;
      }
      const suggestion: LocationSuggestion = {
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
      };
      setSelectedLocation(suggestion);
    } finally {
      setIsLocating(false);
    }
  };

  const handleContinue = () => {
    if (!selectedLocation) return;
    setHomeLocation({
      displayName: selectedLocation.label,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
    onContinue(selectedLocation.label);
  };

  const nearLabel = selectedLocation?.primaryLine ?? selectedLocation?.city;

  return (
    <div className="screen mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="screen-scroll flex min-h-0 flex-1 flex-col px-4 pb-6 pt-2">
        <div className="shrink-0 text-center">
          <span className="text-4xl leading-none" aria-hidden>
            📍
          </span>
          <h1 className="mt-2 text-2xl font-bold" style={{ color: GREEN }}>
            Your area
          </h1>
          <p className="mt-2 text-base leading-relaxed text-gray-500">
            {hint ??
              "Enter your ZIP code or city — we show rentals near you. No need for your exact street address."}
          </p>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={() => void handleUseMyLocation()}
            disabled={isLocating}
            className="mb-4 w-full rounded-xl border-2 py-3 text-[15px] font-bold disabled:opacity-60"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            {isLocating ? "Finding your location…" : "Use my current location"}
          </button>
          {locateError ? (
            <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
              {locateError}
            </p>
          ) : null}
          <AddressLocationPicker
            variant="area"
            placeholder="ZIP code or city, state"
            emptyHint="Best: 5-digit ZIP (71909). Or city: Hot Springs Village, AR"
            selected={selectedLocation}
            onSelect={setSelectedLocation}
            onClear={() => setSelectedLocation(null)}
          />
        </div>
      </div>

      <footer className="shrink-0 border-t border-gray-100 px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedLocation}
          className="btn-primary w-full text-white disabled:opacity-50"
          style={{ backgroundColor: GREEN }}
        >
          {nearLabel ? `Browse rentals near ${nearLabel} →` : "Continue →"}
        </button>
      </footer>
    </div>
  );
}
