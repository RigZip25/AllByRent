import type { ShopOfferKind } from "./garageShopStorage";

const OFFERS_KEY = "evorios_garage_sale_offers";

export type GarageSaleOfferPrefs = {
  kind: ShopOfferKind;
  startingBidUsd: number;
  /** ISO timestamp when auction ends (demo). */
  endsAt: string;
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

export function setGarageSaleOfferPrefs(listingId: string, prefs: GarageSaleOfferPrefs): void {
  const map = readOffers();
  map[listingId] = prefs;
  writeOffers(map);
}

export function getGarageSaleOfferPrefs(listingId: string): GarageSaleOfferPrefs | null {
  return readOffers()[listingId] ?? null;
}

export function defaultAuctionEndsAt(): string {
  return new Date(Date.now() + 30 * 60_000).toISOString();
}

export function defaultStartingBid(buyNowUsd: number): number {
  return Math.max(1, Math.round(buyNowUsd * 0.55 * 100) / 100);
}
