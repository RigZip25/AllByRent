import { getPublishedListingById } from "./listingStorage";
import { getRuntimeAppOrigin } from "./appOrigin";

export type DeepLinkTarget =
  | { kind: "garage"; hostId: string; itemId?: string }
  | { kind: "listing"; listingId: string }
  | { kind: "request"; requestId: string }
  | null;

export type ParsedDeepLink = {
  skipSplash: boolean;
  target: DeepLinkTarget;
};

function listingIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/item\/([^/]+)\/?$/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return match[1].trim() || null;
  }
}

function requestIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).trim() || null;
  } catch {
    return match[1].trim() || null;
  }
}

/** Host flows that use listingId for resume (Stripe return) — not public deep links. */
const HOST_RESUME_SCREENS = new Set([
  "listItem",
  "listingIntro",
  "snapSale",
  "profile",
  "personalInfo",
  "identity",
  "coHosts",
  "garage",
]);

export function parseDeepLink(search = "", pathname = ""): ParsedDeepLink {
  const params = new URLSearchParams(search);
  const screen = params.get("screen")?.trim() || "";

  // Stripe Connect return: /?screen=listItem&listingId=…&connect=done
  // Must NOT open ItemDetail / GarageShop or the app can white-screen on a draft.
  if (HOST_RESUME_SCREENS.has(screen)) {
    return {
      skipSplash: true,
      target: null,
    };
  }

  const pathRequestId = requestIdFromPath(pathname);
  const pathListingId = listingIdFromPath(pathname);

  const skipSplash =
    params.get("skipSplash") === "1" ||
    params.has("garage") ||
    params.has("item") ||
    params.has("listingId") ||
    params.has("request") ||
    params.has("connect") ||
    Boolean(pathListingId) ||
    Boolean(pathRequestId);

  const garage = params.get("garage")?.trim() || "";
  const item = params.get("item")?.trim() || "";
  const listingId = params.get("listingId")?.trim() || pathListingId || "";
  const requestId = params.get("request")?.trim() || pathRequestId || "";

  if (garage) {
    return {
      skipSplash,
      target: { kind: "garage", hostId: garage, itemId: item || undefined },
    };
  }

  if (listingId) {
    return { skipSplash, target: { kind: "listing", listingId } };
  }

  if (requestId) {
    return { skipSplash, target: { kind: "request", requestId } };
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
  return ["garage", "item", "listingId", "request", "skipSplash", "screen", "connect"];
}

export function shareAppOrigin(): string {
  return getRuntimeAppOrigin();
}
