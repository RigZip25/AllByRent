import type { ListingDraft } from "../screens/listing/types";
import {
  getGarageSaleOfferPrefs,
} from "./garageSaleOfferStorage";

const CART_KEY = "evorios_garage_cart";
const BIDS_KEY = "evorios_garage_bids";

export type GarageCartLine = {
  listingId: string;
  hostId: string;
  title: string;
  priceUsd: number;
  photoThumbId?: string;
  photoId?: string;
};

export type GarageBid = {
  listingId: string;
  hostId: string;
  amountUsd: number;
  placedAt: string;
};

export type ShopOfferKind = "buy_now" | "auction" | "both";

export type ShopOffer = {
  kind: ShopOfferKind;
  buyNowUsd: number;
  startingBidUsd: number;
  minIncrementUsd: number;
  endsAt: string;
};

const PLATFORM_FEE_RATE = 0.1;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* */
  }
}

function parseSalePrice(listing: ListingDraft): number {
  const raw = listing.pricing.salePrice.trim();
  const value = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function hashListingId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getShopOffer(listing: ListingDraft): ShopOffer | null {
  if (!listing.modes.sell) return null;
  const buyNowUsd = parseSalePrice(listing);
  if (buyNowUsd <= 0) return null;

  const stored = getGarageSaleOfferPrefs(listing.id);
  const startingBidUsd = stored?.startingBidUsd ?? Math.max(1, Math.round(buyNowUsd * 0.55 * 100) / 100);
  const endsAt =
    stored?.endsAt ??
    new Date(Date.now() + (2 + (hashListingId(listing.id) % 5)) * 3_600_000).toISOString();
  const kind: ShopOfferKind =
    stored?.kind ?? (hashListingId(listing.id) % 3 !== 0 ? "both" : "buy_now");

  return {
    kind,
    buyNowUsd,
    startingBidUsd,
    minIncrementUsd: buyNowUsd >= 50 ? 5 : 1,
    endsAt,
  };
}

export function formatShopUsd(amount: number): string {
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export function getCartLines(): GarageCartLine[] {
  return readJson<GarageCartLine[]>(CART_KEY, []);
}

export function getCartCount(): number {
  return getCartLines().length;
}

export function getCartHostId(): string | null {
  const lines = getCartLines();
  return lines[0]?.hostId ?? null;
}

export function addToGarageCart(line: GarageCartLine): { ok: true } | { ok: false; reason: string } {
  const existing = getCartLines();
  if (existing.some((item) => item.listingId === line.listingId)) {
    return { ok: false, reason: "Already in cart" };
  }
  if (existing.length > 0 && existing[0]?.hostId !== line.hostId) {
    return { ok: false, reason: "Cart is for one garage at a time — checkout or clear first." };
  }
  writeJson(CART_KEY, [...existing, line]);
  window.dispatchEvent(new Event("evorios-garage-cart"));
  return { ok: true };
}

export function removeFromGarageCart(listingId: string): void {
  writeJson(
    CART_KEY,
    getCartLines().filter((item) => item.listingId !== listingId),
  );
  window.dispatchEvent(new Event("evorios-garage-cart"));
}

export function clearGarageCart(): void {
  writeJson(CART_KEY, []);
  window.dispatchEvent(new Event("evorios-garage-cart"));
}

export function getCartTotals() {
  const lines = getCartLines();
  const subtotalUsd = lines.reduce((sum, line) => sum + line.priceUsd, 0);
  const platformFeeUsd = Math.round(subtotalUsd * PLATFORM_FEE_RATE * 100) / 100;
  const totalUsd = Math.round((subtotalUsd + platformFeeUsd) * 100) / 100;
  return { subtotalUsd, platformFeeUsd, totalUsd, lineCount: lines.length };
}

function readBids(): GarageBid[] {
  return readJson<GarageBid[]>(BIDS_KEY, []);
}

export function getBidsForListing(listingId: string): GarageBid[] {
  return readBids()
    .filter((bid) => bid.listingId === listingId)
    .sort((a, b) => b.amountUsd - a.amountUsd);
}

export function getHighBid(listingId: string): GarageBid | null {
  const bids = getBidsForListing(listingId);
  return bids[0] ?? null;
}

export function getMyBid(listingId: string): GarageBid | null {
  return getHighBid(listingId);
}

export function placeGarageBid(input: {
  listingId: string;
  hostId: string;
  amountUsd: number;
  minBidUsd: number;
}): { ok: true; bid: GarageBid } | { ok: false; reason: string } {
  if (input.amountUsd < input.minBidUsd) {
    return { ok: false, reason: `Bid must be at least ${formatShopUsd(input.minBidUsd)}` };
  }
  const high = getHighBid(input.listingId);
  if (high && input.amountUsd <= high.amountUsd) {
    return { ok: false, reason: `Beat the high bid of ${formatShopUsd(high.amountUsd)}` };
  }
  const bid: GarageBid = {
    listingId: input.listingId,
    hostId: input.hostId,
    amountUsd: input.amountUsd,
    placedAt: new Date().toISOString(),
  };
  writeJson(BIDS_KEY, [...readBids(), bid]);
  window.dispatchEvent(new Event("evorios-garage-bids"));
  return { ok: true, bid };
}

export function formatAuctionEnds(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function cartLineFromListing(listing: ListingDraft, priceUsd: number): GarageCartLine {
  const cover = listing.photos[0];
  return {
    listingId: listing.id,
    hostId: listing.hostId ?? "demo-user",
    title: listing.title || "Sale item",
    priceUsd,
    photoId: cover?.id,
    photoThumbId: cover?.thumbId,
  };
}
