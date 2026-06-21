import { defaultAuctionWindow, inferAuctionStartsAt, type AuctionWindow } from "./garageAuctionWindow";
import { getGarageSaleSchedule } from "./garageSaleStorage";
import type { ShopOfferKind } from "./garageShopStorage";

const OFFERS_KEY = "evorios_garage_sale_offers";

export type GarageSaleOfferPrefs = {
  kind: ShopOfferKind;
  startingBidUsd: number;
  /** ISO — bidding opens (garage hours). */
  startsAt: string;
  /** ISO — auction closes (end of garage hours that day). */
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

function normalizeOfferPrefs(raw: GarageSaleOfferPrefs): GarageSaleOfferPrefs {
  const startsAt =
    raw.startsAt ?? inferAuctionStartsAt(raw.endsAt, getGarageSaleSchedule());
  return { ...raw, startsAt };
}

export function setGarageSaleOfferPrefs(listingId: string, prefs: GarageSaleOfferPrefs): void {
  const map = readOffers();
  map[listingId] = prefs;
  writeOffers(map);
}

export function getGarageSaleOfferPrefs(listingId: string): GarageSaleOfferPrefs | null {
  const raw = readOffers()[listingId];
  if (!raw) return null;
  return normalizeOfferPrefs(raw);
}

export function defaultAuctionOfferWindow(): AuctionWindow {
  return defaultAuctionWindow(getGarageSaleSchedule());
}

export function defaultStartingBid(buyNowUsd: number): number {
  return Math.max(1, Math.round(buyNowUsd * 0.55 * 100) / 100);
}
