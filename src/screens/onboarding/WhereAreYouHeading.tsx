import { useState } from "react";
import { ONBOARDING } from "../../lib/brand";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { AddressLocationPicker } from "../../components/AddressLocationPicker";
import type { LocationSuggestion } from "../../lib/geocoding";
import { setTripDestination } from "../../lib/listingStorage";

const GREEN = "#0D5C3A";

const { tripDestination: copy } = ONBOARDING;

const exampleDestinations: LocationSuggestion[] = [
  {
    label: "Austin, TX",
    primaryLine: "Austin",
    secondaryLine: "Texas, USA",
    city: "Austin",
    country: "United States",
    countryCode: "US",
    region: "TX",
    flag: "🇺🇸",
    lat: 30.2672,
    lng: -97.7431,
    precision: "city",
  },
  {
    label: "Denver, CO",
    primaryLine: "Denver",
    secondaryLine: "Colorado, USA",
    city: "Denver",
    country: "United States",
    countryCode: "US",
    region: "CO",
    flag: "🇺🇸",
    lat: 39.7392,
    lng: -104.9903,
    precision: "city",
  },
  {
    label: "Portland, OR",
    primaryLine: "Portland",
    secondaryLine: "Oregon, USA",
    city: "Portland",
    country: "United States",
    countryCode: "US",
    region: "OR",
    flag: "🇺🇸",
    lat: 45.5152,
    lng: -122.6784,
    precision: "city",
  },
];

type WhereAreYouHeadingProps = {
  onBack: () => void;
  onContinue: (destination: string) => void;
  onSkip: () => void;
};

export function WhereAreYouHeading({ onBack, onContinue, onSkip }: WhereAreYouHeadingProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);

  const handleContinue = () => {
    if (!selectedLocation) return;
    setTripDestination(selectedLocation.label);
    onContinue(selectedLocation.label);
  };

  return (
    <div className="screen mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <OnboardingTopBar onBack={onBack} onSkip={onSkip} />
      <div className="screen-scroll flex min-h-0 flex-1 flex-col px-4 pb-6 pt-2">
        <div className="shrink-0 text-center">
          <span className="text-4xl leading-none" aria-hidden>
            📍
          </span>
          <h1 className="mt-2 text-2xl font-bold" style={{ color: GREEN }}>
            {copy.title}
          </h1>
          <p className="mt-1 text-base text-gray-500">{copy.subtitle}</p>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3">
          <AddressLocationPicker
            placeholder="City, neighborhood, or area"
            emptyHint="Pick a US city or type where you'll browse garages"
            selected={selectedLocation}
            onSelect={setSelectedLocation}
            onClear={() => setSelectedLocation(null)}
          />

          {!selectedLocation ? (
            <div className="flex flex-wrap justify-center gap-2">
              {exampleDestinations.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setSelectedLocation(example)}
                  className="rounded-full border border-gray-200 bg-[#F9FAFB] px-3 py-2 text-sm hover:border-green-700/40"
                >
                  {example.flag} {example.label}
                </button>
              ))}
            </div>
          ) : null}

          <img
            src={onboardingAssets.traveler}
            alt=""
            className="mx-auto mt-auto max-h-[160px] w-full object-contain"
            draggable={false}
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
          {selectedLocation
            ? copy.ctaWithCity(selectedLocation.city)
            : copy.ctaDefault}
        </button>
      </footer>
    </div>
  );
}
