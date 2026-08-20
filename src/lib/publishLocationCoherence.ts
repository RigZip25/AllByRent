/**
 * Soft location coherence check at publish time.
 */

import { getHomeLocation, getProfileCity } from "./listingStorage";

export type LocationCoherenceResult =
  | { ok: true; city: string; softNotice?: string }
  | { ok: false; reason: string };

/**
 * Require a neighborhood/city label before going public.
 * Lat/lng is soft — nudge when missing but do not hard-block.
 */
export function checkPublishLocationCoherence(): LocationCoherenceResult {
  const city = getProfileCity().trim();
  const home = getHomeLocation();
  const display = (home?.displayName ?? "").trim() || city;

  if (!display) {
    return {
      ok: false,
      reason:
        "Set your neighborhood in Profile before publishing — neighbors need a coherent area.",
    };
  }

  if (!home || !Number.isFinite(home.lat) || !Number.isFinite(home.lng)) {
    return {
      ok: true,
      city: display,
      softNotice:
        "Tip: add a precise home pin in Profile so neighbors see accurate distance.",
    };
  }

  return { ok: true, city: display };
}
