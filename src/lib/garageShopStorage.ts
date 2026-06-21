import type { ListingDraft } from "../screens/listing/types";
import {
  canBidOnLot,
  canBuyNowLot,
  getGarageBidderId,
  isLotOnShelf,
  markBuyNowSold,
  notifyOutbidIfNeeded,
} from "./garageAuctionState";
import {
  getGarageSaleOfferPrefs,
} from "./garageSaleOfferStorage";
import { getInterestedCount, getNegotiationPhase, isEligibleAuctionBidder } from "./garageOfferStorage";
import { defaultAuctionWindow, formatAuctionTiming, inferAuctionStartsAt } from "./garageAuctionWindow";
import { getGarageSaleSchedule } from "./garageSaleStorage";

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
  bidderId: string;
};

export type ShopOfferKind = "buy_now" | "open" | "auction" | "both";

export type ShopOffer = {
  kind: ShopOfferKind;
  saleMode: "quick" | "open";
  buyNowUsd: number;
  startingBidUsd: number;
  minIncrementUsd: number;
  startsAt: string;
  endsAt: string;
  negotiationPhase: "none" | "one_on_one" | "multi_auction";
  interestedCount: number;
  allowsOffers: boolean;
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
  if (!isLotOnShelf(listing.id)) return null;
  const buyNowUsd = parseSalePrice(listing);
  if (buyNowUsd <= 0) return null;

  const stored = getGarageSaleOfferPrefs(listing.id);
  const startingBidUsd = stored?.startingBidUsd ?? Math.max(1, Math.round(buyNowUsd * 0.55 * 100) / 100);
  const fallbackWindow = defaultAuctionWindow(getGarageSaleSchedule());
  const endsAt = stored?.endsAt ?? fallbackWindow.endsAt;
  const startsAt =
    stored?.startsAt ?? inferAuctionStartsAt(endsAt, getGarageSaleSchedule());
  const negotiationPhase = getNegotiationPhase(listing.id);
  const saleMode = stored?.saleMode ?? "open";
  const kind: ShopOfferKind =
    negotiationPhase === "multi_auction"
      ? "auction"
      : saleMode === "quick"
        ? "buy_now"
        : stored?.kind === "auction"
          ? "auction"
          : "open";

  return {
    kind,
    saleMode,
    buyNowUsd,
    startingBidUsd,
    minIncrementUsd: buyNowUsd >= 50 ? 5 : 1,
    startsAt,
    endsAt,
    negotiationPhase,
    interestedCount: getInterestedCount(listing.id),
    allowsOffers: saleMode === "open" && negotiationPhase !== "multi_auction",
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
  return readJson<GarageBid[]>(BIDS_KEY, []).map((bid) => ({
    ...bid,
    bidderId: bid.bidderId ?? "legacy-bidder",
  }));
}

export function getBidsForListing(listingId: string): GarageBid[] {
  return readBids()
    .filter((bid) => bid.listingId === listingId)
    .sort((a, b) => b.amountUsd - a.amountUsd);
}

export function clearBidsForListing(listingId: string): void {
  writeJson(
    BIDS_KEY,
    readBids().filter((bid) => bid.listingId !== listingId),
  );
  window.dispatchEvent(new Event("evorios-garage-bids"));
}

export function getHighBid(listingId: string): GarageBid | null {
  const bids = getBidsForListing(listingId);
  return bids[0] ?? null;
}

/** Highest bid from a bidder not in `excludedBidderIds` (for runner-up after forfeit). */
export function getBestBidExcluding(listingId: string, excludedBidderIds: string[]): GarageBid | null {
  if (excludedBidderIds.length === 0) return getHighBid(listingId);
  const excluded = new Set(excludedBidderIds);
  let best: GarageBid | null = null;
  for (const bid of getBidsForListing(listingId)) {
    if (excluded.has(bid.bidderId)) continue;
    if (!best || bid.amountUsd > best.amountUsd) best = bid;
  }
  return best;
}

export function getMyBid(listingId: string): GarageBid | null {
  const me = getGarageBidderId();
  const bids = getBidsForListing(listingId).filter((bid) => bid.bidderId === me);
  return bids[0] ?? null;
}

export function placeGarageBid(input: {
  listingId: string;
  hostId: string;
  amountUsd: number;
  minBidUsd: number;
  endsAt: string;
  startsAt: string;
  listingTitle?: string;
}): { ok: true; bid: GarageBid } | { ok: false; reason: string } {
  if (!canBidOnLot(input.listingId, input.startsAt, input.endsAt)) {
    const now = Date.now();
    if (now < new Date(input.startsAt).getTime()) {
      return { ok: false, reason: "Auction hasn't started yet" };
    }
    return { ok: false, reason: "Auction ended or item sold" };
  }
  if (!isEligibleAuctionBidder(input.listingId)) {
    return { ok: false, reason: "Only neighbors who made offers can bid in this auction" };
  }
  if (input.amountUsd < input.minBidUsd) {
    return { ok: false, reason: `Bid must be at least ${formatShopUsd(input.minBidUsd)}` };
  }
  const previousLeader = getHighBid(input.listingId);
  if (previousLeader && input.amountUsd <= previousLeader.amountUsd) {
    return { ok: false, reason: `Beat the high bid of ${formatShopUsd(previousLeader.amountUsd)}` };
  }
  const bid: GarageBid = {
    listingId: input.listingId,
    hostId: input.hostId,
    amountUsd: input.amountUsd,
    placedAt: new Date().toISOString(),
    bidderId: getGarageBidderId(),
  };
  writeJson(BIDS_KEY, [...readBids(), bid]);
  window.dispatchEvent(new Event("evorios-garage-bids"));
  notifyOutbidIfNeeded(input.listingId, input.listingTitle ?? "Sale item", previousLeader);
  return { ok: true, bid };
}

export function buyNowGarageItem(input: {
  listing: ListingDraft;
  offer: ShopOffer;
}): { ok: true } | { ok: false; reason: string } {
  if (!canBuyNowLot(input.listing.id)) {
    return { ok: false, reason: "This item is no longer available" };
  }
  if (input.offer.negotiationPhase === "multi_auction") {
    return { ok: false, reason: "Buy now paused — auction among interested neighbors" };
  }
  markBuyNowSold(
    input.listing.id,
    input.offer.buyNowUsd,
    input.listing.title || "Sale item",
  );
  const result = addToGarageCart(cartLineFromListing(input.listing, input.offer.buyNowUsd));
  if (!result.ok) return result;
  return { ok: true };
}

export function formatAuctionEnds(startsAt: string, endsAt: string): string {
  return formatAuctionTiming({ startsAt, endsAt });
}

export function cartLineFromListing(listing: ListingDraft, priceUsd: number): GarageCartLine {
  const cover = listing.photos[0];
  return {
    listingId: listing.id,
    hostId: listing.hostId ?? "",
    title: listing.title || "Sale item",
    priceUsd,
    photoId: cover?.id,
    photoThumbId: cover?.thumbId,
  };
}

/** Merge remote bids into local cache (keeps highest per listing). */
export function mergeBidsFromRemote(remote: GarageBid[]): void {
  const local = readBids();
  const byListing = new Map<string, GarageBid[]>();
  for (const bid of [...local, ...remote]) {
    const list = byListing.get(bid.listingId) ?? [];
    list.push(bid);
    byListing.set(bid.listingId, list);
  }
  const merged: GarageBid[] = [];
  for (const bids of byListing.values()) {
    bids.sort((a, b) => b.amountUsd - a.amountUsd || b.placedAt.localeCompare(a.placedAt));
    merged.push(...bids);
  }
  writeJson(BIDS_KEY, merged);
  window.dispatchEvent(new Event("evorios-garage-bids"));
}
