import {
  detectCurrentLocation,
  formatGeolocationErrorMessage,
  type GeolocationFailureReason,
} from "./geolocation";
import {
  loadRentalBookings,
  updateBooking,
  type RentalBooking,
  type VehicleMacropoint,
} from "./rentalsStorage";
import { assessTollCorridors, type TollCorridorHit } from "./vehicleTollCorridors";
import { softSpeedSignalsFromTrail, type SoftSpeedSignal } from "./vehicleSpeedSignals";
import { isPointOutsideHomeTerritory } from "./vehicleHomeTerritory";

/** Default interval between coarse macropoints while the rental is active (~20 min). */
export const MACROPOINT_INTERVAL_MS = 20 * 60 * 1000;

/** Cap stored breadcrumbs per booking (keep UI light). */
export const MACROPOINT_MAX_POINTS = 48;

export type RecordMacropointResult =
  | { ok: true; point: VehicleMacropoint; booking: RentalBooking }
  | {
      ok: false;
      reason: GeolocationFailureReason | "no_consent" | "inactive" | "unsupported";
    };

function isActiveVehicleStatus(status: RentalBooking["status"]): boolean {
  return status === "active" || status === "overdue";
}

export function lastMacropoint(booking: RentalBooking): VehicleMacropoint | null {
  const list = booking.macropoints ?? [];
  if (!list.length) return null;
  return list[list.length - 1] ?? null;
}

export function shouldRecordIntervalMacropoint(
  booking: RentalBooking,
  nowMs = Date.now(),
): boolean {
  if (!booking.macropointConsentAt) return false;
  if (!isActiveVehicleStatus(booking.status)) return false;
  const last = lastMacropoint(booking);
  if (!last) return true;
  const lastMs = new Date(last.at).getTime();
  if (!Number.isFinite(lastMs)) return true;
  return nowMs - lastMs >= MACROPOINT_INTERVAL_MS;
}

function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.7613;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Record a coarse phone location checkpoint on the booking.
 * Fails gracefully when permission is denied or geolocation is unavailable.
 */
export async function recordVehicleMacropoint(params: {
  bookingId: string;
  source: VehicleMacropoint["source"];
  requireConsent?: boolean;
}): Promise<RecordMacropointResult> {
  const bookings = loadRentalBookings();
  const booking = bookings.find((b) => b.id === params.bookingId);
  if (!booking) return { ok: false, reason: "unsupported" };

  const requireConsent = params.requireConsent !== false;
  if (requireConsent && !booking.macropointConsentAt) {
    return { ok: false, reason: "no_consent" };
  }

  if (params.source === "interval" && !isActiveVehicleStatus(booking.status)) {
    return { ok: false, reason: "inactive" };
  }

  const detected = await detectCurrentLocation();
  if (!detected.ok) {
    return { ok: false, reason: detected.reason };
  }

  const nowIso = new Date().toISOString();
  const prev = lastMacropoint(booking);
  let speedMph: number | undefined;
  if (prev) {
    const dtH =
      (new Date(nowIso).getTime() - new Date(prev.at).getTime()) / (1000 * 60 * 60);
    if (dtH > 0.02 && dtH < 6) {
      const miles = haversineMiles(prev, detected.location);
      const est = miles / dtH;
      if (Number.isFinite(est) && est > 0 && est < 160) {
        speedMph = Math.round(est);
      }
    }
  }

  const point: VehicleMacropoint = {
    lat: detected.location.lat,
    lng: detected.location.lng,
    at: nowIso,
    source: params.source,
    speedMph,
  };

  const nextPoints = [...(booking.macropoints ?? []), point].slice(-MACROPOINT_MAX_POINTS);
  const toll = assessTollCorridors(nextPoints);
  const territory = booking.homeTerritory;
  const breach =
    booking.travelOutsideHomeArea === "forbidden" &&
    territory &&
    isPointOutsideHomeTerritory(point, territory);
  const nextList = updateBooking(params.bookingId, {
    macropoints: nextPoints,
    tollSuspect: toll.suspect,
    tollCorridorIds: toll.corridorIds,
    tollSuspectAt: toll.suspect ? nowIso : booking.tollSuspectAt,
    homeTerritoryBreachSuspect: breach
      ? true
      : booking.homeTerritoryBreachSuspect,
    homeTerritoryBreachAt: breach ? nowIso : booking.homeTerritoryBreachAt,
  });
  const updated = nextList.find((b) => b.id === params.bookingId) ?? {
    ...booking,
    macropoints: nextPoints,
  };
  return { ok: true, point, booking: updated };
}

export function macropointFailureMessage(
  reason: Extract<RecordMacropointResult, { ok: false }>["reason"],
): string {
  if (reason === "no_consent") {
    return "Location consent required for checkpoints during the rental.";
  }
  if (reason === "inactive") {
    return "Checkpoints only run while the rental is active.";
  }
  if (reason === "unsupported") {
    return "Could not record location on this device.";
  }
  return formatGeolocationErrorMessage(reason);
}

export type VehicleTrailInsights = {
  toll: TollCorridorHit;
  speedSignals: SoftSpeedSignal[];
  lastPoint: VehicleMacropoint | null;
  pointCount: number;
  homeTerritoryBreach: boolean;
};

export function analyzeVehicleTrail(booking: RentalBooking): VehicleTrailInsights {
  const points = booking.macropoints ?? [];
  return {
    toll: assessTollCorridors(points),
    speedSignals: softSpeedSignalsFromTrail(points),
    lastPoint: lastMacropoint(booking),
    pointCount: points.length,
    homeTerritoryBreach: Boolean(booking.homeTerritoryBreachSuspect),
  };
}

export function buildMacropointConsentPatch(): Partial<RentalBooking> {
  return { macropointConsentAt: new Date().toISOString() };
}
