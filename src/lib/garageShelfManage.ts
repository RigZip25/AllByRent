import { getLotState } from "./garageAuctionState";
import { getNegotiationPhase, getOffersForListing } from "./garageOfferStorage";
import {
  getGarageSaleOfferPrefs,
  setGarageSaleOfferPrefs,
  type GarageListingSaleMode,
} from "./garageSaleOfferStorage";
import { getBidsForListing } from "./garageShopStorage";
import { updatePublishedListing } from "./listingStorage";
import type { ListingDraft } from "../screens/listing/types";
import type { MediaRef } from "./mediaStore";

const NEIGHBOR_OFFERS_KEY = "evorios_garage_neighbor_offers";
const BIDS_KEY = "evorios_garage_bids";
const LOT_STATE_KEY = "evorios_garage_lot_state";

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

export function getGarageShelfEditBlockReason(listingId: string): string | null {
  const lot = getLotState(listingId);
  if (lot.status === "sold") return "Sold — can't edit";
  if (lot.status === "awaiting_checkout") return "Winner must pay — can't edit";
  if (getNegotiationPhase(listingId) === "multi_auction") {
    return "Auction live — pull from shelf only";
  }
  return null;
}

export function canRemoveGarageShelfItem(listingId: string): { ok: true } | { ok: false; reason: string } {
  const lot = getLotState(listingId);
  if (lot.status === "sold") return { ok: false, reason: "Already sold" };
  if (lot.status === "awaiting_checkout") {
    return { ok: false, reason: "Winner checkout in progress" };
  }
  return { ok: true };
}

function clearGarageItemSideData(listingId: string): void {
  writeJson(
    NEIGHBOR_OFFERS_KEY,
    readJson<Array<{ listingId: string }>>(NEIGHBOR_OFFERS_KEY, []).filter(
      (offer) => offer.listingId !== listingId,
    ),
  );
  writeJson(
    BIDS_KEY,
    readJson<Array<{ listingId: string }>>(BIDS_KEY, []).filter((bid) => bid.listingId !== listingId),
  );
  const lotMap = readJson<Record<string, unknown>>(LOT_STATE_KEY, {});
  delete lotMap[listingId];
  writeJson(LOT_STATE_KEY, lotMap);

  const offerMap = readJson<Record<string, unknown>>("evorios_garage_sale_offers", {});
  delete offerMap[listingId];
  writeJson("evorios_garage_sale_offers", offerMap);

  window.dispatchEvent(new Event("evorios-garage-offers-neighbor"));
  window.dispatchEvent(new Event("evorios-garage-bids"));
  window.dispatchEvent(new Event("evorios-garage-lots"));
  window.dispatchEvent(new Event("evorios-garage-offers"));
}

export function removeGarageShelfItem(listingId: string): { ok: true } | { ok: false; reason: string } {
  const check = canRemoveGarageShelfItem(listingId);
  if (!check.ok) return check;

  updatePublishedListing(listingId, { listingStatus: "draft" });
  clearGarageItemSideData(listingId);
  window.dispatchEvent(new Event("evorios-listings"));
  return { ok: true };
}

export function updateGarageShelfItem(input: {
  listing: ListingDraft;
  title: string;
  description: string;
  photo: MediaRef;
  priceUsd: number;
  saleMode: GarageListingSaleMode;
}): { ok: true } | { ok: false; reason: string } {
  const block = getGarageShelfEditBlockReason(input.listing.id);
  if (block && block !== "Auction live — pull from shelf only") {
    return { ok: false, reason: block };
  }
  if (getNegotiationPhase(input.listing.id) === "multi_auction") {
    return { ok: false, reason: "Auction live — pull from shelf to cancel" };
  }
  if (input.priceUsd <= 0) return { ok: false, reason: "Enter a valid price" };

  const activeOffers = getOffersForListing(input.listing.id).filter(
    (offer) => offer.status === "pending_host" || offer.status === "pending_buyer",
  );
  if (activeOffers.length > 0) {
    return { ok: false, reason: "Active offer — resolve in inbox or remove item" };
  }

  updatePublishedListing(input.listing.id, {
    title: input.title.trim() || "Sale item",
    description: input.description.trim(),
    photos: [input.photo],
    pricing: { salePrice: String(input.priceUsd) },
  });

  const existing = getGarageSaleOfferPrefs(input.listing.id);
  if (existing) {
    setGarageSaleOfferPrefs(input.listing.id, {
      ...existing,
      saleMode: input.saleMode,
      kind: input.saleMode === "quick" ? "buy_now" : "open",
      startingBidUsd: input.priceUsd,
    });
  }

  window.dispatchEvent(new Event("evorios-listings"));
  window.dispatchEvent(new Event("evorios-garage-offers"));
  return { ok: true };
}

export function garageShelfHasActivity(listingId: string): boolean {
  return (
    getOffersForListing(listingId).some(
      (offer) => offer.status === "pending_host" || offer.status === "pending_buyer",
    ) || getBidsForListing(listingId).length > 0
  );
}
