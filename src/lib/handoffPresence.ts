import {
  detectPreciseLocation,
  formatGeolocationErrorMessage,
  type GeolocationFailureReason,
} from "./geolocation";

export type HandoffCoords = { lat: number; lng: number };

/** Default neighborhood radius for porch / lockbox handoffs (~city block). */
export const HANDOFF_RADIUS_M_DEFAULT = 150;

/** Tighter radius for vehicles — pin unlock near the car, not across town. */
export const HANDOFF_RADIUS_M_VEHICLE = 100;

export type PresenceProof = "geo" | "qr_scan";

export type PresenceCheckResult =
  | {
      ok: true;
      proof: "geo";
      distanceM: number;
      radiusM: number;
      coords: HandoffCoords;
    }
  | {
      ok: false;
      reason:
        | "no_target"
        | "too_far"
        | "geo_denied"
        | "geo_unavailable"
        | "geo_timeout"
        | "geo_unsupported"
        | "geo_unknown";
      distanceM?: number;
      radiusM?: number;
      geoReason?: GeolocationFailureReason;
    };

export function haversineMeters(
  a: HandoffCoords,
  b: HandoffCoords,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function handoffRadiusMeters(opts?: {
  isVehicle?: boolean;
  customRadiusM?: number;
}): number {
  if (typeof opts?.customRadiusM === "number" && opts.customRadiusM > 0) {
    return opts.customRadiusM;
  }
  return opts?.isVehicle ? HANDOFF_RADIUS_M_VEHICLE : HANDOFF_RADIUS_M_DEFAULT;
}

export function isValidHandoffCoords(
  coords: HandoffCoords | null | undefined,
): coords is HandoffCoords {
  return Boolean(
    coords &&
      Number.isFinite(coords.lat) &&
      Number.isFinite(coords.lng) &&
      !(coords.lat === 0 && coords.lng === 0) &&
      Math.abs(coords.lat) <= 90 &&
      Math.abs(coords.lng) <= 180,
  );
}

/**
 * Renter must be at the handoff point (GPS) before PIN / lockbox codes unlock.
 * Hosts are not geo-gated (preview / staging from home is allowed).
 */
export async function assertRenterNearHandoff(input: {
  target: HandoffCoords | null | undefined;
  isVehicle?: boolean;
  customRadiusM?: number;
}): Promise<PresenceCheckResult> {
  if (!isValidHandoffCoords(input.target)) {
    return { ok: false, reason: "no_target" };
  }
  const radiusM = handoffRadiusMeters({
    isVehicle: input.isVehicle,
    customRadiusM: input.customRadiusM,
  });
  const detected = await detectPreciseLocation();
  if (!detected.ok) {
    const map: Record<
      GeolocationFailureReason,
      Extract<PresenceCheckResult, { ok: false }>["reason"]
    > = {
      denied: "geo_denied",
      unavailable: "geo_unavailable",
      timeout: "geo_timeout",
      unsupported: "geo_unsupported",
      unknown: "geo_unknown",
    };
    return {
      ok: false,
      reason: map[detected.reason] ?? "geo_unknown",
      radiusM,
      geoReason: detected.reason,
    };
  }
  const distanceM = haversineMeters(
    { lat: detected.location.lat, lng: detected.location.lng },
    input.target,
  );
  if (distanceM > radiusM) {
    return { ok: false, reason: "too_far", distanceM, radiusM };
  }
  return {
    ok: true,
    proof: "geo",
    distanceM,
    radiusM,
    coords: { lat: detected.location.lat, lng: detected.location.lng },
  };
}

export function formatPresenceFailure(
  result: Extract<PresenceCheckResult, { ok: false }>,
  copy: {
    noTarget: string;
    tooFar: (distanceM: number, radiusM: number) => string;
    geoDenied: string;
    geoUnavailable: string;
  },
): string {
  switch (result.reason) {
    case "no_target":
      return copy.noTarget;
    case "too_far":
      return copy.tooFar(
        Math.round(result.distanceM ?? 0),
        Math.round(result.radiusM ?? HANDOFF_RADIUS_M_DEFAULT),
      );
    case "geo_denied":
      return copy.geoDenied;
    case "geo_unsupported":
    case "geo_timeout":
    case "geo_unavailable":
    case "geo_unknown":
      return result.geoReason
        ? formatGeolocationErrorMessage(result.geoReason)
        : copy.geoUnavailable;
    default:
      return copy.geoUnavailable;
  }
}
