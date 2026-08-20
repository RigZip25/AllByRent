/** ISO 3779 VIN helpers — format + check digit (position 9). */

const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
};

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export type VinFormatResult =
  | { ok: true; vin: string }
  | { ok: false; reason: "empty" | "length" | "chars" | "checkDigit" };

/** Strip spaces/dashes and uppercase. */
export function normalizeVinInput(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

export function validateVinFormat(raw: string): VinFormatResult {
  const vin = normalizeVinInput(raw);
  if (!vin) return { ok: false, reason: "empty" };
  if (vin.length !== 17) return { ok: false, reason: "length" };
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return { ok: false, reason: "chars" };

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const value = VIN_TRANSLITERATION[vin[i]!];
    if (value === undefined) return { ok: false, reason: "chars" };
    sum += value * VIN_WEIGHTS[i]!;
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);
  if (vin[8] !== expected) return { ok: false, reason: "checkDigit" };

  return { ok: true, vin };
}

export function isValidVin(raw: string): boolean {
  return validateVinFormat(raw).ok;
}

export type NhtsaVinDecode = {
  ok: boolean;
  vin: string;
  make?: string;
  model?: string;
  modelYear?: string;
  vehicleType?: string;
  errorText?: string;
};

/** Decode via our API proxy → NHTSA vPIC (US). Falls back gracefully offline. */
export async function decodeVinRemote(raw: string): Promise<NhtsaVinDecode> {
  const format = validateVinFormat(raw);
  if (!format.ok) {
    return { ok: false, vin: normalizeVinInput(raw), errorText: format.reason };
  }

  try {
    const url = new URL("/api/vin/decode", window.location.origin);
    url.searchParams.set("vin", format.vin);
    const res = await fetch(url.toString());
    if (!res.ok) {
      return { ok: false, vin: format.vin, errorText: "lookup_failed" };
    }
    const data = (await res.json()) as NhtsaVinDecode;
    return { ...data, vin: format.vin };
  } catch {
    // Format already validated — allow continue without remote decode.
    return { ok: true, vin: format.vin };
  }
}

export type PlateToVinResult = {
  ok: boolean;
  plate: string;
  state: string;
  vin?: string;
  make?: string;
  model?: string;
  modelYear?: string;
  trim?: string;
  errorText?: string;
};

export function normalizePlateInput(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

export function normalizeUsStateInput(raw: string): string {
  return raw.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

/**
 * US plate → VIN via /api/vin/plate (PlateToVIN when PLATE_TO_VIN_API_KEY is set).
 * Without a key the API returns 503 — caller should keep manual VIN entry.
 */
export async function lookupPlateRemote(params: {
  plate: string;
  state: string;
}): Promise<PlateToVinResult> {
  const plate = normalizePlateInput(params.plate);
  const state = normalizeUsStateInput(params.state);
  if (!plate || state.length !== 2) {
    return { ok: false, plate, state, errorText: "invalid_plate" };
  }

  try {
    const url = new URL("/api/vin/plate", window.location.origin);
    url.searchParams.set("plate", plate);
    url.searchParams.set("state", state);
    const res = await fetch(url.toString());
    const data = (await res.json()) as PlateToVinResult;
    if (res.status === 503) {
      return { ok: false, plate, state, errorText: "plate_lookup_unconfigured" };
    }
    return { ...data, plate, state };
  } catch {
    return { ok: false, plate, state, errorText: "lookup_failed" };
  }
}
