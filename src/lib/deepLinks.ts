import { getPublishedListingById } from "./listingStorage";

export type DeepLinkTarget =
  | { kind: "garage"; hostId: string; itemId?: string }
  | { kind: "listing"; listingId: string }
  | null;

export type ParsedDeepLink = {
  skipSplash: boolean;
  target: DeepLinkTarget;
};

import { APP_ORIGIN } from "./brand";

function listingIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/item\/([^/]+)\/?$/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return match[1].trim() || null;
  }
}

export function parseDeepLink(search = "", pathname = ""): ParsedDeepLink {
  const params = new URLSearchParams(search);
  const skipSplash =
    params.get("skipSplash") === "1" ||
    params.has("garage") ||
    params.has("item") ||
    params.has("listingId") ||
    Boolean(listingIdFromPath(pathname));

  const garage = params.get("garage")?.trim() || "";
  const item = params.get("item")?.trim() || "";
  const listingId = params.get("listingId")?.trim() || listingIdFromPath(pathname) || "";

  if (garage) {
    return {
      skipSplash,
      target: { kind: "garage", hostId: garage, itemId: item || undefined },
    };
  }

  if (listingId) {
    return { skipSplash, target: { kind: "listing", listingId } };
  }

  return { skipSplash, target: null };
}

/** Resolve a shared listing link to the best landing screen for visitors. */
export function resolveListingDeepLink(listingId: string): DeepLinkTarget {
  const listing = getPublishedListingById(listingId);
  if (!listing) {
    return { kind: "listing", listingId };
  }

  const hostId = listing.hostId ?? "";
  if (listing.modes.sell) {
    return { kind: "garage", hostId, itemId: listing.id };
  }

  return { kind: "listing", listingId };
}

export function deepLinkQueryKeys(): string[] {
  return ["garage", "item", "listingId", "skipSplash", "screen"];
}

export function shareAppOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return APP_ORIGIN;
}
