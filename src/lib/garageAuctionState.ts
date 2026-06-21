import { getGarageSaleOfferPrefs } from "./garageSaleOfferStorage";
import { getHighBid, type GarageBid } from "./garageShopStorage";
import { pushInAppNotification } from "./inAppNotifications";

const LOT_STATE_KEY = "evorios_garage_lot_state";
const BIDDER_ID_KEY = "evorios_garage_bidder_id";

/** Hours winner has to pay after auction ends (demo). */
const WINNER_PAY_HOURS = 24;

export type GarageLotState =
  | { status: "active" }
  | { status: "sold"; method: "buy_now" | "auction"; priceUsd: number; soldAt: string }
  | {
      status: "awaiting_checkout";
      winnerBidderId: string;
      winningBidUsd: number;
      endedAt: string;
      payByIso: string;
    }
  | { status: "expired_no_bids"; endedAt: string };

type LotStateMap = Record<string, GarageLotState>;

function readLotStates(): LotStateMap {
  try {
    const raw = localStorage.getItem(LOT_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LotStateMap;
  } catch {
    return {};
  }
}

function writeLotStates(map: LotStateMap): void {
  try {
    localStorage.setItem(LOT_STATE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("evorios-garage-lots"));
  } catch {
    /* */
  }
}

export function getGarageBidderId(): string {
  try {
    const existing = localStorage.getItem(BIDDER_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `bidder-${crypto.randomUUID().slice(0, 8)}`
        : `bidder-${Date.now().toString(36)}`;
    localStorage.setItem(BIDDER_ID_KEY, id);
    return id;
  } catch {
    return "bidder-demo";
  }
}

export function getLotState(listingId: string): GarageLotState {
  return readLotStates()[listingId] ?? { status: "active" };
}

export function isLotOnShelf(listingId: string): boolean {
  const state = getLotState(listingId);
  return state.status === "active";
}

export function isAuctionTimeActive(endsAt: string): boolean {
  return new Date(endsAt).getTime() > Date.now();
}

export function canBidOnLot(listingId: string, endsAt: string): boolean {
  if (!isLotOnShelf(listingId)) return false;
  return isAuctionTimeActive(endsAt);
}

export function canBuyNowLot(listingId: string): boolean {
  return isLotOnShelf(listingId);
}

export function markBuyNowSold(listingId: string, priceUsd: number, listingTitle?: string): void {
  const map = readLotStates();
  map[listingId] = {
    status: "sold",
    method: "buy_now",
    priceUsd,
    soldAt: new Date().toISOString(),
  };
  writeLotStates(map);
  pushInAppNotification({
    type: "general",
    title: "Sold · Buy now",
    body: listingTitle
      ? `${listingTitle} sold for $${priceUsd} — payout after pickup (demo).`
      : `Item sold for $${priceUsd} via Buy now.`,
  });
}

export function markAuctionCheckoutComplete(listingId: string, priceUsd: number, listingTitle?: string): void {
  const map = readLotStates();
  map[listingId] = {
    status: "sold",
    method: "auction",
    priceUsd,
    soldAt: new Date().toISOString(),
  };
  writeLotStates(map);
  pushInAppNotification({
    type: "general",
    title: "Auction won & paid",
    body: listingTitle
      ? `${listingTitle} — $${priceUsd} collected (demo).`
      : `Auction lot paid — $${priceUsd}.`,
  });
}

export function getMyPendingWinnerCheckouts(): Array<{
  listingId: string;
  winningBidUsd: number;
  payByIso: string;
}> {
  const me = getGarageBidderId();
  const map = readLotStates();
  return Object.entries(map)
    .filter((entry): entry is [string, Extract<GarageLotState, { status: "awaiting_checkout" }>] => {
      const state = entry[1];
      return state.status === "awaiting_checkout" && state.winnerBidderId === me;
    })
    .map(([listingId, state]) => ({
      listingId,
      winningBidUsd: state.winningBidUsd,
      payByIso: state.payByIso,
    }));
}

export function isAwaitingCheckoutForMe(listingId: string): boolean {
  const state = getLotState(listingId);
  return state.status === "awaiting_checkout" && state.winnerBidderId === getGarageBidderId();
}

export function getWinnerCheckoutDetails(listingId: string): Extract<GarageLotState, { status: "awaiting_checkout" }> | null {
  const state = getLotState(listingId);
  if (state.status !== "awaiting_checkout") return null;
  return state;
}

/**
 * Close ended auctions: assign winner checkout or mark no-bids expired.
 * Call when loading the shop and periodically while open.
 */
export function resolveEndedAuctions(listingIds: string[]): void {
  const map = readLotStates();
  const now = Date.now();
  let changed = false;

  for (const listingId of listingIds) {
    const current = map[listingId] ?? { status: "active" as const };
    if (current.status !== "active") continue;

    const prefs = getGarageSaleOfferPrefs(listingId);
    if (!prefs) continue;
    if (prefs.kind === "buy_now") continue;

    const endsMs = new Date(prefs.endsAt).getTime();
    if (endsMs > now) continue;

    const high: GarageBid | null = getHighBid(listingId);
    if (high && high.bidderId) {
      const payByIso = new Date(now + WINNER_PAY_HOURS * 3_600_000).toISOString();
      map[listingId] = {
        status: "awaiting_checkout",
        winnerBidderId: high.bidderId,
        winningBidUsd: high.amountUsd,
        endedAt: new Date().toISOString(),
        payByIso,
      };
      if (high.bidderId === getGarageBidderId()) {
        pushInAppNotification({
          type: "general",
          title: "You won the auction!",
          body: `Pay $${high.amountUsd} within ${WINNER_PAY_HOURS}h to claim your item.`,
        });
      }
    } else {
      map[listingId] = { status: "expired_no_bids", endedAt: new Date().toISOString() };
    }
    changed = true;
  }

  if (changed) writeLotStates(map);
}

export function notifyOutbidIfNeeded(listingId: string, listingTitle: string, previousLeader: GarageBid | null): void {
  const me = getGarageBidderId();
  if (!previousLeader || previousLeader.bidderId !== me) return;
  const newLeader = getHighBid(listingId);
  if (!newLeader || newLeader.bidderId === me) return;
  pushInAppNotification({
    type: "general",
    title: "You've been outbid",
    body: `${listingTitle || "Sale item"} — high bid is now $${newLeader.amountUsd}.`,
  });
}
