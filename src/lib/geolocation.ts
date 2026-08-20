import { reverseGeocode } from "./geocoding";
import { getMessages } from "./i18n";
import { resolveAreaLabelAtCoordinates } from "./usReverseGeocode";
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

export type GeolocationPermissionState = "granted" | "denied" | "prompt" | "unsupported";

export async function checkGeolocationPermission(): Promise<GeolocationPermissionState> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "unsupported";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state === "granted" || status.state === "denied" || status.state === "prompt") {
      return status.state;
    }
  } catch {
    // Safari < 16 and some PWAs do not expose the Permissions API for geolocation.
  }
  return "prompt";
}

function getCurrentPositionWithOptions(
  options: PositionOptions,
): Promise<
  { ok: true; position: GeolocationPosition } | { ok: false; reason: GeolocationFailureReason }
> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ ok: true, position }),
      (error) => resolve({ ok: false, reason: mapGeolocationError(error.code) }),
      options,
    );
  });
}

async function getCurrentPosition(): Promise<
  { ok: true; position: GeolocationPosition } | { ok: false; reason: GeolocationFailureReason }
> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { ok: false, reason: "unsupported" };
  }

  if (typeof window !== "undefined" && !window.isSecureContext) {
    return { ok: false, reason: "unsupported" };
  }

  // Fast path: cached / network location (same strategy that worked reliably on AllByRent).
  const quick = await getCurrentPositionWithOptions({
    enableHighAccuracy: false,
    timeout: 12_000,
    maximumAge: 300_000,
  });
  if (quick.ok) return quick;
  if (quick.reason === "denied" || quick.reason === "unsupported") return quick;

  return getCurrentPositionWithOptions({
    enableHighAccuracy: true,
    timeout: 25_000,
    maximumAge: 30_000,
  });
}

export function formatGeolocationErrorMessage(reason: GeolocationFailureReason): string {
  const { errors } = getMessages().geo;
  switch (reason) {
    case "denied":
      return errors.denied;
    case "timeout":
      return errors.timeout;
    case "unsupported":
      return errors.unsupported;
    case "unavailable":
      return errors.unavailable;
    default:
      return errors.unknown;
  }
}

export type DetectedLocationResult =
  | { ok: true; location: ResolvedLocation }
  | { ok: false; reason: GeolocationFailureReason };

async function resolveDisplayName(lat: number, lng: number): Promise<string> {
  const full = await reverseGeocode(lat, lng);
  if (full?.trim()) return full;

  const area = await resolveAreaLabelAtCoordinates(lat, lng);
  if (area?.trim()) return area;

  return getMessages().geo.yourArea;
}

/** Geolocation + reverse geocode, without persisting to storage. */
export async function detectCurrentLocation(): Promise<DetectedLocationResult> {
  const positionResult = await getCurrentPosition();
  if (!positionResult.ok) {
    return { ok: false, reason: positionResult.reason };
  }

  const { latitude, longitude } = positionResult.position.coords;
  const displayName = await resolveDisplayName(latitude, longitude);

  return {
    ok: true,
    location: {
      displayName,
      lat: latitude,
      lng: longitude,
    },
  };
}

/**
 * High-accuracy fix for handoff presence (PIN / lockbox unlock).
 * Skips stale network caches so a couch across town cannot reuse an old reading.
 */
export async function detectPreciseLocation(): Promise<DetectedLocationResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { ok: false, reason: "unsupported" };
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return { ok: false, reason: "unsupported" };
  }

  const precise = await getCurrentPositionWithOptions({
    enableHighAccuracy: true,
    timeout: 20_000,
    maximumAge: 15_000,
  });
  if (!precise.ok) {
    return { ok: false, reason: precise.reason };
  }

  const { latitude, longitude } = precise.position.coords;
  return {
    ok: true,
    location: {
      displayName: getMessages().geo.yourArea,
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
