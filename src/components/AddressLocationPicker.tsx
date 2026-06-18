import { useEffect, useMemo, useState } from "react";
import {
  minQueryLength,
  searchPlaces,
  type LocationSuggestion,
} from "../lib/geocoding";
import { getHomeLocation } from "../lib/listingStorage";
import {
  COUNTRY_OPTIONS,
  getSearchCountryCode,
  saveSearchCountry,
  type CountryCode,
} from "../lib/locationCountry";
import {
  detectUsStateFromCoords,
  detectUsStateFromZip,
  getPreferredUsState,
  getSavedUsState,
  queryHasUsCityHint,
  saveUsState,
  US_STATE_OPTIONS,
} from "../lib/usStates";

type AddressLocationPickerProps = {
  placeholder: string;
  emptyHint: string;
  onSelect: (location: LocationSuggestion) => void;
  selected: LocationSuggestion | null;
  onClear: () => void;
  near?: { lat: number; lng: number };
};

export function AddressLocationPicker({
  placeholder,
  emptyHint,
  onSelect,
  selected,
  onClear,
  near,
}: AddressLocationPickerProps) {
  const COUNTRY_GROUPS: { label: string; codes: CountryCode[] }[] = [
    { label: "North America", codes: ["US", "CA"] },
    { label: "Europe", codes: ["GB", "FR", "DE", "PL", "UA"] },
    { label: "Eurasia", codes: ["RU", "BY", "KZ"] },
    { label: "Middle East", codes: ["IL"] },
    { label: "Oceania", codes: ["AU"] },
  ];
  const homeCoords = useMemo(() => {
    const home = getHomeLocation();
    return home ? { lat: home.lat, lng: home.lng } : near;
  }, [near?.lat, near?.lng]);

  const homeCityHint = useMemo(() => {
    const home = getHomeLocation();
    return home?.displayName?.trim() || null;
  }, []);

  const [countryCode, setCountryCode] = useState<CountryCode>(() => getSearchCountryCode());
  const [limitToUsState, setLimitToUsState] = useState(() => countryCode === "US");
  const [usState, setUsState] = useState<string>(() => {
    const fromCoords = homeCoords ? detectUsStateFromCoords(homeCoords.lat, homeCoords.lng) : null;
    return getSavedUsState() ?? fromCoords ?? "";
  });
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [needsStateHint, setNeedsStateHint] = useState(false);

  const activeCountry =
    COUNTRY_OPTIONS.find((c) => c.code === countryCode) ?? COUNTRY_OPTIONS[0];

  const searchNear = homeCoords ?? near;

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length < minQueryLength(trimmed)) {
      setSuggestions([]);
      setIsLoading(false);
      setSearchError(false);
      setNeedsStateHint(false);
      return;
    }

    if (countryCode === "US" && limitToUsState && !usState && !queryHasUsCityHint(trimmed)) {
      setNeedsStateHint(true);
    } else {
      setNeedsStateHint(false);
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchError(false);
      const zipState = countryCode === "US" ? detectUsStateFromZip(trimmed) : null;
      const effectiveState =
        countryCode === "US"
          ? limitToUsState
            ? (zipState ?? (usState || getPreferredUsState(trimmed, searchNear)))
            : null
          : null;
      if (zipState && zipState !== usState) {
        setUsState(zipState);
        saveUsState(zipState);
      }

      const results = await searchPlaces(trimmed, {
        near: searchNear,
        countryCode,
        usState: effectiveState,
        cityHint: homeCityHint,
      });
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSearchError(results.length === 0);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, searchNear?.lat, searchNear?.lng, countryCode, usState, limitToUsState, homeCityHint]);

  const handleCountryChange = (code: CountryCode) => {
    setCountryCode(code);
    saveSearchCountry(code);
  };

  const handleStateChange = (code: string) => {
    setUsState(code);
    if (code) saveUsState(code);
  };

  const handlePick = (location: LocationSuggestion) => {
    if (location.countryCode === "US" && location.region) {
      saveUsState(location.region);
      setUsState(location.region);
    }
    onSelect(location);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const showAutocomplete =
    !selected && showSuggestions && suggestions.length > 0;

  if (selected) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-full rounded-xl border-2 px-4 py-3 text-center"
          style={{ borderColor: "#0D5C3A", backgroundColor: "#0D5C3A14" }}
        >
          <p className="text-sm font-semibold" style={{ color: "#0D5C3A" }}>
            📍 {selected.primaryLine}
          </p>
          {selected.secondaryLine ? (
            <p className="mt-1 text-sm text-gray-700">{selected.secondaryLine}</p>
          ) : null}
          <p className="mt-1 text-xs text-gray-500">
            Rentals sorted nearest to this spot
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold"
          style={{ color: "#0D5C3A" }}
        >
          Change address
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Country</span>
        <select
          value={countryCode}
          onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-green-700"
        >
          {COUNTRY_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.codes.map((code) => {
                const country = COUNTRY_OPTIONS.find((c) => c.code === code);
                if (!country) return null;
                return (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.label}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
      </label>

      {countryCode === "US" ? (
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-500">Narrow search to a state (recommended)</span>
            <button
              type="button"
              className="text-xs font-semibold text-gray-600"
              onClick={() => setLimitToUsState((v) => !v)}
            >
              {limitToUsState ? "Hide" : "Show"}
            </button>
          </label>
          {limitToUsState ? (
            <select
              value={usState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-base outline-none focus:border-green-700"
            >
              <option value="">Any state</option>
              {US_STATE_OPTIONS.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.label} ({state.code})
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowSuggestions(e.target.value.trim().length >= minQueryLength(e.target.value));
        }}
        onFocus={() => {
          if (inputValue.trim().length >= minQueryLength(inputValue) && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-green-700"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        name="allbyrent-address-search"
        data-1p-ignore
        data-lpignore="true"
        enterKeyHint="search"
      />

      <p className="text-center text-xs text-gray-400">
        {countryCode === "US"
          ? limitToUsState && usState
            ? `Searching in ${usState} — try “Fayetteville, ${usState}” or a street + city`
            : "Tip: city + state works best — e.g. “Fayetteville, AR”. Full home address usually shows one match."
          : `Searching in ${activeCountry.flag} ${activeCountry.label}`}
      </p>

      {!isLoading && showAutocomplete ? (
        <p className="text-center text-xs text-gray-500">
          {suggestions.length === 1
            ? "1 address found (US Census + OpenStreetMap)"
            : `${suggestions.length} addresses found (US Census + OpenStreetMap)`}
        </p>
      ) : null}

      {needsStateHint ? (
        <p className="text-center text-xs leading-relaxed text-amber-800">
          Select <strong>Arkansas</strong> (or your state) above — otherwise
          &quot;Main St&quot; matches Virginia or other states.
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-center text-xs text-gray-500">Searching US Census & OpenStreetMap…</p>
      ) : null}

      {showAutocomplete ? (
        <ul
          className="relative z-20 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-md"
          role="listbox"
          aria-label="Address suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.label}-${index}`} role="option">
              <button
                type="button"
                onPointerDown={(event) => {
                  // Select before input blur hides the list (mobile + desktop).
                  event.preventDefault();
                  handlePick(suggestion);
                }}
                className="w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
              >
                <span className="block text-sm font-medium text-gray-900">
                  {suggestion.flag} {suggestion.primaryLine}
                </span>
                {suggestion.secondaryLine ? (
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {suggestion.secondaryLine}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && searchError && inputValue.trim().length >= minQueryLength(inputValue) ? (
        <p className="text-center text-xs leading-relaxed text-gray-500">
          No exact address in the database. Try full format with ZIP, e.g.{" "}
          <strong>19 Gozar Ln, Hot Springs Village, AR 71909</strong>
          {countryCode === "US" && usState ? (
            <>
              {" "}
              — or type only your city: <strong>Fayetteville, {usState}</strong> and pick
              it from the list.
            </>
          ) : null}
        </p>
      ) : null}

      {!isLoading && !showAutocomplete && inputValue.trim().length === 0 ? (
        <p className="text-center text-xs leading-relaxed text-gray-500">{emptyHint}</p>
      ) : null}
    </div>
  );
}
