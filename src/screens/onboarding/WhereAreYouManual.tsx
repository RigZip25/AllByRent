import { useState } from "react";
import { AddressLocationPicker } from "../../components/AddressLocationPicker";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import type { LocationSuggestion } from "../../lib/geocoding";
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
            Your pickup area
          </h1>
          <p className="mt-2 text-base leading-relaxed text-gray-500">
            {hint ??
              "Pick the address or neighborhood where you want to pick up rentals — we show listings closest to this spot."}
          </p>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <AddressLocationPicker
            placeholder="Street address, city, state"
            emptyHint="Example: 123 Main St, Fayetteville, AR 72701 — or city only: Fayetteville, AR"
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
