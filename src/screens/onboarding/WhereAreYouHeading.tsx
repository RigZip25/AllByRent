import { useMemo, useState } from "react";
import { onboardingAssets } from "../../lib/onboardingAssets";
import { OnboardingTopBar } from "../../components/OnboardingTopBar";
import { AddressLocationPicker } from "../../components/AddressLocationPicker";
import type { LocationSuggestion } from "../../lib/geocoding";
import { setTripDestination } from "../../lib/listingStorage";
import { useOnboardingCopy } from "../../lib/i18n/react";
import {
  getCountryEmptyHint,
  getSearchCountryCode,
  type CountryCode,
} from "../../lib/locationCountry";

const GREEN = "#0D5C3A";

const EXAMPLE_POOL: LocationSuggestion[] = [
  {
    label: "Berlin, Germany",
    primaryLine: "Berlin",
    secondaryLine: "Germany",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    region: "Berlin",
    flag: "🇩🇪",
    lat: 52.52,
    lng: 13.405,
    precision: "city",
  },
  {
    label: "Praha, Czechia",
    primaryLine: "Praha",
    secondaryLine: "Czechia",
    city: "Praha",
    country: "Czechia",
    countryCode: "CZ",
    region: "",
    flag: "🇨🇿",
    lat: 50.0755,
    lng: 14.4378,
    precision: "city",
  },
  {
    label: "Toronto, ON",
    primaryLine: "Toronto",
    secondaryLine: "Ontario, Canada",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    region: "ON",
    flag: "🇨🇦",
    lat: 43.6532,
    lng: -79.3832,
    precision: "city",
  },
  {
    label: "Ciudad de México",
    primaryLine: "Ciudad de México",
    secondaryLine: "Mexico",
    city: "Ciudad de México",
    country: "Mexico",
    countryCode: "MX",
    region: "CDMX",
    flag: "🇲🇽",
    lat: 19.4326,
    lng: -99.1332,
    precision: "city",
  },
  {
    label: "São Paulo, Brazil",
    primaryLine: "São Paulo",
    secondaryLine: "Brazil",
    city: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    region: "SP",
    flag: "🇧🇷",
    lat: -23.5505,
    lng: -46.6333,
    precision: "city",
  },
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
  {
    label: "Madrid, Spain",
    primaryLine: "Madrid",
    secondaryLine: "Spain",
    city: "Madrid",
    country: "Spain",
    countryCode: "ES",
    region: "",
    flag: "🇪🇸",
    lat: 40.4168,
    lng: -3.7038,
    precision: "city",
  },
];

function examplesForCountry(code: CountryCode): LocationSuggestion[] {
  const same = EXAMPLE_POOL.filter((e) => e.countryCode === code);
  if (same.length >= 3) return same.slice(0, 3);
  const rest = EXAMPLE_POOL.filter((e) => e.countryCode !== code);
  return [...same, ...rest].slice(0, 3);
}

type WhereAreYouHeadingProps = {
  onBack: () => void;
  onContinue: (destination: string) => void;
  onSkip: () => void;
};

export function WhereAreYouHeading({ onBack, onContinue, onSkip }: WhereAreYouHeadingProps) {
  const { tripDestination: copy } = useOnboardingCopy();
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const countryCode = getSearchCountryCode();
  const exampleDestinations = useMemo(() => examplesForCountry(countryCode), [countryCode]);

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
            variant="area"
            placeholder="Postal code or city, neighborhood"
            emptyHint={getCountryEmptyHint(countryCode, "area")}
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
