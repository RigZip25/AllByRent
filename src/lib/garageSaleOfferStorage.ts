import { pushOfferPrefsRemote } from "./garage/garageSupabaseSync";
import { defaultAuctionWindow, type AuctionWindow } from "./garageAuctionWindow";
import { getGarageSaleSchedule } from "./garageSaleStorage";
import type { ShopOfferKind } from "./garageShopStorage";

const OFFERS_KEY = "evorios_garage_sale_offers";

export type GarageListingSaleMode = "quick" | "open";

export type GarageNegotiationPhase = "none" | "one_on_one" | "multi_auction";

export type GarageSaleOfferPrefs = {
  /** quick = buy now only · open = buy now + neighbor offers */
  saleMode: GarageListingSaleMode;
  kind: ShopOfferKind;
  startingBidUsd: number;
  startsAt: string;
  endsAt: string;
  negotiationPhase?: GarageNegotiationPhase;
  eligibleBuyerIds?: string[];
  activeBuyerId?: string;
};

type OfferMap = Record<string, GarageSaleOfferPrefs>;

function readOffers(): OfferMap {
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OfferMap;
  } catch {
    return {};
  }
}

function writeOffers(map: OfferMap): void {
  try {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("evorios-garage-offers"));
  } catch {
    /* */
  }
}

function normalizeLegacy(raw: Partial<GarageSaleOfferPrefs> & { kind?: ShopOfferKind }): GarageSaleOfferPrefs {
  const window = defaultAuctionWindow(getGarageSaleSchedule());
  const kind = raw.kind ?? "open";
  const saleMode: GarageListingSaleMode =
    raw.saleMode ??
    (kind === "buy_now" ? "quick" : "open");
  return {
    saleMode,
    kind: raw.negotiationPhase === "multi_auction" ? "auction" : saleMode === "quick" ? "buy_now" : kind === "auction" ? "auction" : "open",
    startingBidUsd: raw.startingBidUsd ?? 1,
    startsAt: raw.startsAt ?? window.startsAt,
    endsAt: raw.endsAt ?? window.endsAt,
    negotiationPhase: raw.negotiationPhase ?? "none",
    eligibleBuyerIds: raw.eligibleBuyerIds,
    activeBuyerId: raw.activeBuyerId,
  };
}

export function setGarageSaleOfferPrefs(
  listingId: string,
  prefs: GarageSaleOfferPrefs,
  hostId?: string,
): void {
  const map = readOffers();
  map[listingId] = prefs;
  writeOffers(map);
  if (hostId) {
    void pushOfferPrefsRemote(listingId, hostId, prefs);
  }
}

export function getGarageSaleOfferPrefs(listingId: string): GarageSaleOfferPrefs | null {
  const raw = readOffers()[listingId];
  if (!raw) return null;
  return normalizeLegacy(raw);
}

export function defaultAuctionOfferWindow(): AuctionWindow {
  return defaultAuctionWindow(getGarageSaleSchedule());
}

export function defaultStartingBid(buyNowUsd: number): number {
  return Math.max(1, Math.round(buyNowUsd * 0.55 * 100) / 100);
}

export function buildInitialOfferPrefs(input: {
  saleMode: GarageListingSaleMode;
  buyNowUsd: number;
}): GarageSaleOfferPrefs {
  const window = defaultAuctionOfferWindow();
  return {
    saleMode: input.saleMode,
    kind: input.saleMode === "quick" ? "buy_now" : "open",
    startingBidUsd: defaultStartingBid(input.buyNowUsd),
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    negotiationPhase: "none",
  };
}

export function mergeOfferPrefsFromRemote(remote: Record<string, GarageSaleOfferPrefs>): void {
  const map = readOffers();
  writeOffers({ ...map, ...remote });
}
