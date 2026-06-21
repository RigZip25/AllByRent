import { getGarageBidderId, markBuyNowSold } from "./garageAuctionState";
import {
  defaultAuctionOfferWindow,
  getGarageSaleOfferPrefs,
  setGarageSaleOfferPrefs,
} from "./garageSaleOfferStorage";
import { addToGarageCart, cartLineFromListing, formatShopUsd } from "./garageShopStorage";
import { pushInAppNotification } from "./inAppNotifications";
import type { ListingDraft } from "../screens/listing/types";

const OFFERS_KEY = "evorios_garage_neighbor_offers";

export type GarageOfferStatus =
  | "pending_host"
  | "pending_buyer"
  | "accepted"
  | "declined"
  | "withdrawn";

export type GarageNeighborOffer = {
  id: string;
  listingId: string;
  hostId: string;
  buyerId: string;
  amountUsd: number;
  status: GarageOfferStatus;
  listingTitle: string;
  createdAt: string;
  updatedAt: string;
};

function readOffers(): GarageNeighborOffer[] {
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GarageNeighborOffer[];
  } catch {
    return [];
  }
}

function writeOffers(offers: GarageNeighborOffer[]): void {
  try {
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    window.dispatchEvent(new Event("evorios-garage-offers-neighbor"));
  } catch {
    /* */
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `offer-${Date.now().toString(36)}`;
}

function activeOffersForListing(listingId: string): GarageNeighborOffer[] {
  return readOffers().filter(
    (offer) =>
      offer.listingId === listingId &&
      (offer.status === "pending_host" || offer.status === "pending_buyer"),
  );
}

export function getUniqueInterestedBuyers(listingId: string): string[] {
  const ids = new Set<string>();
  for (const offer of activeOffersForListing(listingId)) {
    ids.add(offer.buyerId);
  }
  return [...ids];
}

export function getInterestedCount(listingId: string): number {
  return getUniqueInterestedBuyers(listingId).length;
}

export function getNegotiationPhase(listingId: string): "none" | "one_on_one" | "multi_auction" {
  const prefs = getGarageSaleOfferPrefs(listingId);
  if (prefs?.negotiationPhase === "multi_auction") return "multi_auction";
  const count = getInterestedCount(listingId);
  if (count >= 2) return "multi_auction";
  if (count === 1) return "one_on_one";
  return prefs?.negotiationPhase ?? "none";
}

export function isEligibleAuctionBidder(listingId: string, bidderId?: string): boolean {
  const me = bidderId ?? getGarageBidderId();
  const prefs = getGarageSaleOfferPrefs(listingId);
  if (prefs?.negotiationPhase !== "multi_auction") return true;
  return prefs.eligibleBuyerIds?.includes(me) ?? false;
}

function closeOffersForListing(listingId: string, exceptBuyerId?: string): void {
  writeOffers(
    readOffers().map((offer) => {
      if (offer.listingId !== listingId) return offer;
      if (exceptBuyerId && offer.buyerId === exceptBuyerId) return offer;
      if (offer.status === "pending_host" || offer.status === "pending_buyer") {
        return { ...offer, status: "withdrawn" as const, updatedAt: new Date().toISOString() };
      }
      return offer;
    }),
  );
}

function activateMultiBuyerAuction(listingId: string, listingTitle: string): void {
  const buyers = getUniqueInterestedBuyers(listingId);
  if (buyers.length < 2) return;

  const amounts = activeOffersForListing(listingId).map((offer) => offer.amountUsd);
  const highOffer = Math.max(...amounts);
  const window = defaultAuctionOfferWindow();
  const existing = getGarageSaleOfferPrefs(listingId);

  setGarageSaleOfferPrefs(listingId, {
    kind: "auction",
    saleMode: existing?.saleMode ?? "open",
    startingBidUsd: highOffer,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    negotiationPhase: "multi_auction",
    eligibleBuyerIds: buyers,
  });

  closeOffersForListing(listingId);

  pushInAppNotification({
    type: "general",
    title: "Auction started",
    body: `${listingTitle} — ${buyers.length} neighbors interested. You don't need to counter; they bid until close.`,
  });

  for (const buyerId of buyers) {
    if (buyerId === getGarageBidderId()) {
      pushInAppNotification({
        type: "general",
        title: "Multiple offers — auction on",
        body: `${listingTitle}: bid against other interested neighbors until garage close.`,
      });
    }
  }

  window.dispatchEvent(new Event("evorios-garage-offers"));
}

function completeSale(listing: ListingDraft, priceUsd: number, buyerId: string): { ok: true } | { ok: false; reason: string } {
  markBuyNowSold(listing.id, priceUsd, listing.title || "Sale item");
  closeOffersForListing(listing.id);
  const line = cartLineFromListing(listing, priceUsd);
  if (buyerId !== getGarageBidderId()) {
    return { ok: true };
  }
  const result = addToGarageCart(line);
  if (!result.ok) return result;
  return { ok: true };
}

export function submitNeighborOffer(input: {
  listing: ListingDraft;
  amountUsd: number;
  askingUsd: number;
}): { ok: true; offer: GarageNeighborOffer } | { ok: false; reason: string } {
  const prefs = getGarageSaleOfferPrefs(input.listing.id);
  if (prefs?.saleMode === "quick") {
    return { ok: false, reason: "This item is buy-now only" };
  }
  if (getNegotiationPhase(input.listing.id) === "multi_auction") {
    return { ok: false, reason: "Auction in progress — place a bid instead" };
  }
  if (input.amountUsd <= 0) {
    return { ok: false, reason: "Enter a valid offer" };
  }
  if (input.amountUsd >= input.askingUsd) {
    return { ok: false, reason: `Offer below asking ${formatShopUsd(input.askingUsd)}` };
  }

  const buyerId = getGarageBidderId();
  const hostId = input.listing.hostId ?? "demo-user";
  const title = input.listing.title || "Sale item";

  const existing = activeOffersForListing(input.listing.id).find((offer) => offer.buyerId === buyerId);
  if (existing) {
    return { ok: false, reason: "You already have an active offer — wait for host reply" };
  }

  const offer: GarageNeighborOffer = {
    id: newId(),
    listingId: input.listing.id,
    hostId,
    buyerId,
    amountUsd: input.amountUsd,
    status: "pending_host",
    listingTitle: title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeOffers([...readOffers(), offer]);

  const prefsUpdate = getGarageSaleOfferPrefs(input.listing.id);
  if (prefsUpdate) {
    setGarageSaleOfferPrefs(input.listing.id, {
      ...prefsUpdate,
      negotiationPhase: getInterestedCount(input.listing.id) >= 2 ? "multi_auction" : "one_on_one",
      activeBuyerId: buyerId,
    });
  }

  if (getInterestedCount(input.listing.id) >= 2) {
    activateMultiBuyerAuction(input.listing.id, title);
  } else {
    pushInAppNotification({
      type: "general",
      title: "New offer on your shelf",
      body: `${title} — ${formatShopUsd(input.amountUsd)} offered. Accept or counter.`,
    });
    pushInAppNotification({
      type: "general",
      title: "Offer sent",
      body: `${title} — waiting for host on ${formatShopUsd(input.amountUsd)}.`,
    });
  }

  return { ok: true, offer };
}

export function hostAcceptOffer(
  offerId: string,
  listing: ListingDraft,
): { ok: true } | { ok: false; reason: string } {
  const offer = readOffers().find((item) => item.id === offerId);
  if (!offer || offer.status !== "pending_host") {
    return { ok: false, reason: "Offer not available" };
  }
  if (getNegotiationPhase(listing.id) === "multi_auction") {
    return { ok: false, reason: "Auction started — offers closed" };
  }

  writeOffers(
    readOffers().map((item) =>
      item.id === offerId
        ? { ...item, status: "accepted" as const, updatedAt: new Date().toISOString() }
        : item,
    ),
  );

  const result = completeSale(listing, offer.amountUsd, offer.buyerId);
  if (!result.ok) return result;

  pushInAppNotification({
    type: "general",
    title: "Offer accepted",
    body: `${offer.listingTitle} — sold for ${formatShopUsd(offer.amountUsd)} (demo).`,
  });

  return { ok: true };
}

export function hostCounterOffer(
  offerId: string,
  counterUsd: number,
): { ok: true } | { ok: false; reason: string } {
  const offer = readOffers().find((item) => item.id === offerId);
  if (!offer || offer.status !== "pending_host") {
    return { ok: false, reason: "Offer not available" };
  }
  if (getNegotiationPhase(offer.listingId) === "multi_auction") {
    return { ok: false, reason: "Auction started — can't counter" };
  }
  if (counterUsd <= offer.amountUsd) {
    return { ok: false, reason: "Counter must be above their offer" };
  }

  writeOffers(
    readOffers().map((item) =>
      item.id === offerId
        ? {
            ...item,
            amountUsd: counterUsd,
            status: "pending_buyer" as const,
            updatedAt: new Date().toISOString(),
          }
        : item,
    ),
  );

  if (offer.buyerId === getGarageBidderId()) {
    pushInAppNotification({
      type: "general",
      title: "Host countered",
      body: `${offer.listingTitle} — ${formatShopUsd(counterUsd)}. Accept or send a new offer.`,
    });
  }

  return { ok: true };
}

export function hostDeclineOffer(offerId: string): { ok: true } | { ok: false; reason: string } {
  const offer = readOffers().find((item) => item.id === offerId);
  if (!offer || offer.status !== "pending_host") {
    return { ok: false, reason: "Offer not available" };
  }

  writeOffers(
    readOffers().map((item) =>
      item.id === offerId
        ? { ...item, status: "declined" as const, updatedAt: new Date().toISOString() }
        : item,
    ),
  );

  if (offer.buyerId === getGarageBidderId()) {
    pushInAppNotification({
      type: "general",
      title: "Offer declined",
      body: `${offer.listingTitle} — host passed on your offer.`,
    });
  }

  return { ok: true };
}

export function buyerAcceptCounter(
  offerId: string,
  listing: ListingDraft,
): { ok: true } | { ok: false; reason: string } {
  const offer = readOffers().find((item) => item.id === offerId);
  if (!offer || offer.status !== "pending_buyer") {
    return { ok: false, reason: "Nothing to accept" };
  }
  if (offer.buyerId !== getGarageBidderId()) {
    return { ok: false, reason: "Not your offer" };
  }

  writeOffers(
    readOffers().map((item) =>
      item.id === offerId
        ? { ...item, status: "accepted" as const, updatedAt: new Date().toISOString() }
        : item,
    ),
  );

  const result = completeSale(listing, offer.amountUsd, offer.buyerId);
  if (!result.ok) return result;

  pushInAppNotification({
    type: "general",
    title: "Deal!",
    body: `${offer.listingTitle} — ${formatShopUsd(offer.amountUsd)} (demo).`,
  });

  return { ok: true };
}

export function buyerSendNewOffer(input: {
  offerId: string;
  listing: ListingDraft;
  amountUsd: number;
  askingUsd: number;
}): { ok: true } | { ok: false; reason: string } {
  const offer = readOffers().find((item) => item.id === input.offerId);
  if (!offer || offer.status !== "pending_buyer") {
    return { ok: false, reason: "Nothing to counter" };
  }
  if (offer.buyerId !== getGarageBidderId()) {
    return { ok: false, reason: "Not your offer" };
  }
  if (input.amountUsd <= offer.amountUsd) {
    return { ok: false, reason: `Beat the counter of ${formatShopUsd(offer.amountUsd)}` };
  }
  if (input.amountUsd >= input.askingUsd) {
    return { ok: false, reason: "At asking price, use Buy now" };
  }

  writeOffers(
    readOffers().map((item) =>
      item.id === input.offerId
        ? {
            ...item,
            amountUsd: input.amountUsd,
            status: "pending_host" as const,
            updatedAt: new Date().toISOString(),
          }
        : item,
    ),
  );

  pushInAppNotification({
    type: "general",
    title: "New counter-offer",
    body: `${offer.listingTitle} — ${formatShopUsd(input.amountUsd)}.`,
  });

  return { ok: true };
}

export function getHostPendingOffers(hostId: string): GarageNeighborOffer[] {
  return readOffers()
    .filter(
      (offer) =>
        offer.hostId === hostId &&
        offer.status === "pending_host" &&
        getNegotiationPhase(offer.listingId) !== "multi_auction",
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getMyActiveOffer(listingId: string): GarageNeighborOffer | null {
  const me = getGarageBidderId();
  return (
    activeOffersForListing(listingId).find((offer) => offer.buyerId === me) ?? null
  );
}

export function getOffersForListing(listingId: string): GarageNeighborOffer[] {
  return readOffers()
    .filter((offer) => offer.listingId === listingId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
