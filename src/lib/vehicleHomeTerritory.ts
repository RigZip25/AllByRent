/**
 * Locale-aware “may the renter leave the listing’s home territory?” rule.
 *
 * Boundary model (v1):
 * - US listings → admin boundary = US state (kind: "state")
 * - All other markets → admin boundary = country (kind: "country")
 * Optional region note in copy only — enforcement uses country outside the US.
 *
 * Soft GPS check uses coarse bboxes (US_STATE_BBOX / COUNTRY_BBOX), not legal borders.
 */

import { COUNTRY_BBOX, getCountryDef, getSearchCountryCode, type CountryCode } from "./locationCountry";
import { detectUsStateFromCoords, detectUsStateFromQuery, US_STATE_OPTIONS } from "./usStates";

export type TravelOutsideHomeArea = "allowed" | "forbidden";

export type HomeTerritoryKind = "state" | "country";

export type HomeTerritoryBoundary = {
  kind: HomeTerritoryKind;
  /** ISO 3166-1 alpha-2 */
  countryCode: string;
  /** US state code when kind === "state"; optional admin region elsewhere */
  regionCode?: string;
  /** Human-readable label for UI / agreement snapshot */
  label: string;
};

type LocationLike = {
  displayName?: string;
  lat?: number;
  lng?: number;
};

export function categorySupportsTravelOutsideRule(category: string): boolean {
  const cat = category.trim();
  return cat === "Vehicles" || cat === "Boats & Water";
}

export function normalizeTravelOutsideHomeArea(
  raw: unknown,
): TravelOutsideHomeArea {
  return raw === "allowed" ? "allowed" : "forbidden";
}

export function normalizeHomeTerritory(raw: unknown): HomeTerritoryBoundary | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const kind = obj.kind === "state" || obj.kind === "country" ? obj.kind : null;
  const countryCode =
    typeof obj.countryCode === "string" ? obj.countryCode.trim().toUpperCase() : "";
  const label = typeof obj.label === "string" ? obj.label.trim() : "";
  if (!kind || !countryCode || !label) return undefined;
  const regionCode =
    typeof obj.regionCode === "string" && obj.regionCode.trim()
      ? obj.regionCode.trim().toUpperCase()
      : undefined;
  return { kind, countryCode, regionCode, label };
}

function usStateLabel(code: string): string {
  return US_STATE_OPTIONS.find((s) => s.code === code)?.label ?? code;
}

export function detectCountryFromCoords(lat: number, lng: number): string | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  let best: { code: string; area: number } | null = null;
  for (const [code, bbox] of Object.entries(COUNTRY_BBOX)) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    if (lng < minLon || lng > maxLon || lat < minLat || lat > maxLat) continue;
    const area = Math.max(0.0001, (maxLon - minLon) * (maxLat - minLat));
    // Prefer the tightest matching bbox (helps small countries nested in large ones).
    if (!best || area < best.area) best = { code, area };
  }
  return best?.code ?? null;
}

/**
 * Resolve the listing’s home admin boundary from host location + market country.
 */
export function resolveHomeTerritory(input?: {
  location?: LocationLike | null;
  countryHint?: string | null;
  displayName?: string | null;
}): HomeTerritoryBoundary {
  const hint = (input?.countryHint ?? getSearchCountryCode()).toUpperCase();
  const loc = input?.location ?? null;
  const display =
    (input?.displayName ?? loc?.displayName ?? "").trim() ||
    getCountryDef(hint)?.label ||
    hint;

  const fromCoords =
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    Number.isFinite(loc.lat) &&
    Number.isFinite(loc.lng)
      ? detectCountryFromCoords(loc.lat, loc.lng)
      : null;
  const countryCode = (fromCoords || hint || "US").toUpperCase();

  if (countryCode === "US") {
    const state =
      (loc &&
      typeof loc.lat === "number" &&
      typeof loc.lng === "number" &&
      Number.isFinite(loc.lat) &&
      Number.isFinite(loc.lng)
        ? detectUsStateFromCoords(loc.lat, loc.lng)
        : null) ??
      detectUsStateFromQuery(display) ??
      null;
    if (state) {
      return {
        kind: "state",
        countryCode: "US",
        regionCode: state,
        label: usStateLabel(state),
      };
    }
    return {
      kind: "country",
      countryCode: "US",
      label: getCountryDef("US")?.label ?? "United States",
    };
  }

  const def = getCountryDef(countryCode as CountryCode);
  return {
    kind: "country",
    countryCode,
    label: def?.label ?? display.split(",").pop()?.trim() ?? countryCode,
  };
}

export function isPointOutsideHomeTerritory(
  point: { lat: number; lng: number },
  territory: HomeTerritoryBoundary,
): boolean {
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return false;

  if (territory.kind === "state" && territory.countryCode === "US" && territory.regionCode) {
    const state = detectUsStateFromCoords(point.lat, point.lng);
    if (!state) {
      // Outside all US state bboxes → treat as outside home state.
      return true;
    }
    return state !== territory.regionCode;
  }

  const country = detectCountryFromCoords(point.lat, point.lng);
  if (!country) return true;
  return country.toUpperCase() !== territory.countryCode.toUpperCase();
}

/** Short phrase for agreement / UI: “Colorado (US state)” / “Czechia (country)”. */
export function formatHomeTerritoryPhrase(territory: HomeTerritoryBoundary): string {
  if (territory.kind === "state") {
    return `${territory.label} (US state)`;
  }
  return `${territory.label} (country)`;
}
