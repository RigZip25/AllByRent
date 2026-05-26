import { useState } from "react";
import travelerImg from "../../imports/traveler.png";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { AddressLocationPicker } from "../../components/AddressLocationPicker";
import type { LocationSuggestion } from "../../lib/geocoding";
import { setTripDestination } from "../../lib/listingStorage";

const GREEN = "#0D5C3A";

const exampleDestinations: LocationSuggestion[] = [
  {
    label: "Vienna, Austria",
    primaryLine: "Vienna",
    secondaryLine: "Austria",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    region: "",
    flag: "🇦🇹",
    lat: 48.2082,
    lng: 16.3738,
    precision: "city",
  },
  {
    label: "Tokyo, Japan",
    primaryLine: "Tokyo",
    secondaryLine: "Japan",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    region: "",
    flag: "🇯🇵",
    lat: 35.6762,
    lng: 139.6503,
    precision: "city",
  },
  {
    label: "Paris, France",
    primaryLine: "Paris",
    secondaryLine: "France",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    region: "",
    flag: "🇫🇷",
    lat: 48.8566,
    lng: 2.3522,
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
            Where are you heading?
          </h1>
          <p className="mt-1 text-base text-gray-500">
            City, neighborhood, or area where you&apos;ll pick up rentals
          </p>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3">
          <AddressLocationPicker
            placeholder="City, neighborhood, or area"
            emptyHint="Pick a popular destination or type where you'll need gear"
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
            src={travelerImg}
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
            ? `Find rentals near ${selectedLocation.city} →`
            : "Continue →"}
        </button>
      </footer>
    </div>
  );
}
