import { reverseGeocode } from "./geocoding";
import { setHomeLocation } from "./listingStorage";

export type ResolvedLocation = {
  displayName: string;
  lat: number;
  lng: number;
};

export type GeolocationFailureReason =
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unknown";

export type HomeLocationResult =
  | { ok: true; location: ResolvedLocation }
  | { ok: false; reason: GeolocationFailureReason };

function mapGeolocationError(code: number): GeolocationFailureReason {
  switch (code) {
    case 1:
      return "denied";
    case 2:
      return "unavailable";
    case 3:
      return "timeout";
    default:
      return "unknown";
  }
}

function getCurrentPosition(): Promise<
  { ok: true; position: GeolocationPosition } | { ok: false; reason: GeolocationFailureReason }
> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }

  if (typeof window !== "undefined" && !window.isSecureContext) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ ok: true, position }),
      (error) => resolve({ ok: false, reason: mapGeolocationError(error.code) }),
      {
        enableHighAccuracy: true,
        timeout: 25_000,
        maximumAge: 30_000,
      },
    );
  });
}

export type DetectedLocationResult =
  | { ok: true; location: ResolvedLocation }
  | { ok: false; reason: GeolocationFailureReason };

/** Geolocation + reverse geocode, without persisting to storage. */
export async function detectCurrentLocation(): Promise<DetectedLocationResult> {
  const positionResult = await getCurrentPosition();
  if (!positionResult.ok) {
    return { ok: false, reason: positionResult.reason };
  }

  const { latitude, longitude } = positionResult.position.coords;
  const displayName =
    (await reverseGeocode(latitude, longitude)) ??
    `Near you (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

  return {
    ok: true,
    location: {
      displayName,
      lat: latitude,
      lng: longitude,
    },
  };
}

/** Browser geolocation + reverse geocode for "at home" onboarding. */
export async function resolveHomeLocation(): Promise<HomeLocationResult> {
  const detected = await detectCurrentLocation();
  if (!detected.ok) return { ok: false, reason: detected.reason };
  const location = detected.location;

  setHomeLocation(location);
  return { ok: true, location };
}
