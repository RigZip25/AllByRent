const STORAGE_KEY = "allbyrent_us_state";

/** minLon, minLat, maxLon, maxLat */
export const US_STATE_BBOX: Record<string, [number, number, number, number]> = {
  AL: [-88.47, 30.22, -84.89, 35.01],
  AK: [-179.15, 51.21, -129.99, 71.35],
  AZ: [-114.82, 31.33, -109.05, 37.0],
  AR: [-94.62, 33.0, -89.64, 36.5],
  CA: [-124.41, 32.53, -114.13, 42.01],
  CO: [-109.06, 36.99, -102.04, 41.0],
  CT: [-73.73, 40.98, -71.79, 42.05],
  DE: [-75.79, 38.45, -75.05, 39.84],
  DC: [-77.12, 38.79, -76.91, 38.99],
  FL: [-87.63, 24.52, -80.03, 31.0],
  GA: [-85.61, 30.36, -80.84, 35.0],
  HI: [-160.25, 18.91, -154.81, 22.24],
  IA: [-96.64, 40.38, -90.14, 43.5],
  ID: [-117.24, 42.0, -111.04, 49.0],
  IL: [-91.51, 36.97, -87.02, 42.51],
  IN: [-88.1, 37.77, -84.78, 41.76],
  KS: [-102.05, 36.99, -94.59, 40.0],
  KY: [-89.57, 36.5, -81.96, 39.15],
  LA: [-94.04, 28.93, -88.82, 33.02],
  MA: [-73.51, 41.24, -69.93, 42.89],
  MD: [-79.49, 37.91, -75.05, 39.72],
  ME: [-71.08, 43.06, -66.95, 47.46],
  MI: [-90.42, 41.7, -82.41, 48.31],
  MN: [-97.24, 43.5, -89.53, 49.38],
  MO: [-95.77, 35.99, -89.1, 40.61],
  MS: [-91.66, 30.17, -88.1, 35.0],
  MT: [-116.05, 44.36, -104.04, 49.0],
  NC: [-84.32, 33.84, -75.46, 36.59],
  ND: [-104.05, 45.94, -96.55, 49.0],
  NE: [-104.05, 40.0, -95.31, 43.0],
  NH: [-72.56, 42.7, -70.7, 45.31],
  NJ: [-75.56, 38.93, -73.89, 41.36],
  NM: [-109.05, 31.33, -103.0, 37.0],
  NV: [-120.01, 35.0, -114.04, 42.0],
  NY: [-79.76, 40.5, -71.86, 45.02],
  OH: [-84.82, 38.4, -80.52, 42.0],
  OK: [-103.0, 33.62, -94.43, 37.0],
  OR: [-124.57, 41.99, -116.46, 46.29],
  PA: [-80.52, 39.72, -74.69, 42.27],
  RI: [-71.86, 41.15, -71.12, 42.02],
  SC: [-83.35, 32.05, -78.54, 35.22],
  SD: [-104.06, 42.48, -96.44, 45.94],
  TN: [-90.31, 34.98, -81.65, 36.68],
  TX: [-106.65, 25.84, -93.51, 36.5],
  UT: [-114.05, 37.0, -109.04, 42.0],
  VA: [-83.68, 36.54, -75.24, 39.47],
  VT: [-73.44, 42.73, -71.46, 45.02],
  WA: [-124.85, 45.54, -116.92, 49.0],
  WI: [-92.89, 42.49, -86.25, 47.08],
  WV: [-82.64, 37.2, -77.72, 40.64],
  WY: [-111.06, 40.99, -104.05, 45.01],
};

export const US_STATE_OPTIONS = Object.entries(US_STATE_BBOX)
  .map(([code]) => ({
    code,
    label:
      code === "DC"
        ? "District of Columbia"
        : ({
            AL: "Alabama",
            AK: "Alaska",
            AZ: "Arizona",
            AR: "Arkansas",
            CA: "California",
            CO: "Colorado",
            CT: "Connecticut",
            DE: "Delaware",
            FL: "Florida",
            GA: "Georgia",
            HI: "Hawaii",
            IA: "Iowa",
            ID: "Idaho",
            IL: "Illinois",
            IN: "Indiana",
            KS: "Kansas",
            KY: "Kentucky",
            LA: "Louisiana",
            MA: "Massachusetts",
            MD: "Maryland",
            ME: "Maine",
            MI: "Michigan",
            MN: "Minnesota",
            MO: "Missouri",
            MS: "Mississippi",
            MT: "Montana",
            NC: "North Carolina",
            ND: "North Dakota",
            NE: "Nebraska",
            NH: "New Hampshire",
            NJ: "New Jersey",
            NM: "New Mexico",
            NV: "Nevada",
            NY: "New York",
            OH: "Ohio",
            OK: "Oklahoma",
            OR: "Oregon",
            PA: "Pennsylvania",
            RI: "Rhode Island",
            SC: "South Carolina",
            SD: "South Dakota",
            TN: "Tennessee",
            TX: "Texas",
            UT: "Utah",
            VA: "Virginia",
            VT: "Vermont",
            WA: "Washington",
            WI: "Wisconsin",
            WV: "West Virginia",
            WY: "Wyoming",
          }[code] ?? code),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const STATE_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  US_STATE_OPTIONS.map((s) => [s.label.toLowerCase(), s.code]),
);

for (const [code, bbox] of Object.entries(US_STATE_BBOX)) {
  STATE_NAME_TO_CODE[code.toLowerCase()] = code;
}

export function getSavedUsState(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)?.toUpperCase();
    if (raw && US_STATE_BBOX[raw]) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveUsState(code: string): void {
  const upper = code.toUpperCase();
  if (!US_STATE_BBOX[upper]) return;
  try {
    localStorage.setItem(STORAGE_KEY, upper);
  } catch {
    /* ignore */
  }
}

export function detectUsStateFromQuery(query: string): string | null {
  const q = query.trim();
  const trailing = q.match(/,\s*([A-Za-z]{2})(?:\s+\d{5})?\s*$/);
  if (trailing) {
    const code = trailing[1].toUpperCase();
    if (US_STATE_BBOX[code]) return code;
  }

  for (const option of US_STATE_OPTIONS) {
    const name = option.label.toLowerCase();
    if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(q)) {
      return option.code;
    }
  }

  const wordMatch = q.match(/\b([A-Za-z]{2})\b/g);
  if (wordMatch) {
    for (let i = wordMatch.length - 1; i >= 0; i -= 1) {
      const code = wordMatch[i].toUpperCase();
      if (US_STATE_BBOX[code]) return code;
    }
  }

  return null;
}

export function detectUsStateFromCoords(lat: number, lng: number): string | null {
  for (const [code, bbox] of Object.entries(US_STATE_BBOX)) {
    const [minLon, minLat, maxLon, maxLat] = bbox;
    if (lng >= minLon && lng <= maxLon && lat >= minLat && lat <= maxLat) {
      return code;
    }
  }
  return null;
}

/** ZIP → state when user omits "AR" (e.g. Hot Springs Village, 71909). */
export function detectUsStateFromZip(query: string): string | null {
  const match = query.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (!match) return null;
  const prefix = Number.parseInt(match[1].slice(0, 3), 10);
  if (Number.isNaN(prefix)) return null;
  // Arkansas USPS ZIP prefixes (716–729, 755–757)
  if ((prefix >= 716 && prefix <= 729) || (prefix >= 755 && prefix <= 757)) return "AR";
  return null;
}

/** Prefer in-state rows; if the dropdown is wrong, still show geocoder matches. */
export function filterMatchesByUsState<T extends { region: string }>(
  matches: T[],
  preferredState?: string | null,
): T[] {
  if (!preferredState) return matches;
  const inState = matches.filter((m) => m.region === preferredState);
  return inState.length > 0 ? inState : matches;
}

export function getPreferredUsState(query: string, near?: { lat: number; lng: number }): string | null {
  return (
    detectUsStateFromQuery(query) ??
    detectUsStateFromZip(query) ??
    (near ? detectUsStateFromCoords(near.lat, near.lng) : null) ??
    getSavedUsState()
  );
}

export function appendUsStateToQuery(query: string, stateCode: string): string {
  const trimmed = query.trim();
  if (!trimmed || detectUsStateFromQuery(trimmed)) return trimmed;
  const option = US_STATE_OPTIONS.find((s) => s.code === stateCode);
  if (!option) return trimmed;
  return `${trimmed}, ${option.code}`;
}

export function queryHasUsCityHint(query: string): boolean {
  const parts = query.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2;
}
