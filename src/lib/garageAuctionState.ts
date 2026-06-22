import { getGarageSaleOfferPrefs } from "./garageSaleOfferStorage";
import { getBestBidExcluding, getHighBid, type GarageBid } from "./garageShopStorage";
import { pushInAppNotification } from "./inAppNotifications";

const LOT_STATE_KEY = "evorios_garage_lot_state";
const BIDDER_ID_KEY = "evorios_garage_bidder_id";

/** Minutes winner has to pay after auction ends or after becoming runner-up. */
export const GARAGE_AUCTION_PAY_MINUTES = 30;

export type GarageLotState =
  | { status: "active" }
  | { status: "sold"; method: "buy_now" | "auction"; priceUsd: number; soldAt: string }
  | {
      status: "awaiting_checkout";
      winnerBidderId: string;
      winningBidUsd: number;
      endedAt: string;
      payByIso: string;
      /** Bidders who did not pay in time — skipped when passing the lot down. */
      forfeitedBidderIds: string[];
      /** 1 = auction winner, 2+ = next-highest bidder after forfeit. */
      runnerUpAttempt: number;
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

export function writeLotStates(map: LotStateMap): void {
  writeLotStatesInternal(map);
}

function writeLotStatesInternal(map: LotStateMap): void {
  try {
    localStorage.setItem(LOT_STATE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("evorios-garage-lots"));
  } catch {
    /* */
  }
}

function payByFromNow(): string {
  return new Date(Date.now() + GARAGE_AUCTION_PAY_MINUTES * 60_000).toISOString();
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
    return "bidder-anonymous";
  }
}

export function getLotState(listingId: string): GarageLotState {
  return readLotStates()[listingId] ?? { status: "active" };
}

export function isLotOnShelf(listingId: string): boolean {
  const state = getLotState(listingId);
  return state.status === "active";
}

export function isAuctionTimeActive(startsAt: string, endsAt: string): boolean {
  const now = Date.now();
  return now >= new Date(startsAt).getTime() && now < new Date(endsAt).getTime();
}

export function canBidOnLot(listingId: string, startsAt: string, endsAt: string): boolean {
  if (!isLotOnShelf(listingId)) return false;
  return isAuctionTimeActive(startsAt, endsAt);
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
  writeLotStatesInternal(map);
  pushInAppNotification({
    type: "general",
    title: "Sold · Buy now",
    body: listingTitle
      ? `${listingTitle} sold for $${priceUsd} — payout after pickup.`
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
  writeLotStatesInternal(map);
  pushInAppNotification({
    type: "general",
    title: "Auction won & paid",
    body: listingTitle
      ? `${listingTitle} — $${priceUsd} collected.`
      : `Auction lot paid — $${priceUsd}.`,
  });
}

export function getMyPendingWinnerCheckouts(): Array<{
  listingId: string;
  winningBidUsd: number;
  payByIso: string;
  runnerUpAttempt: number;
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
      runnerUpAttempt: state.runnerUpAttempt ?? 1,
    }));
}

export function isAwaitingCheckoutForMe(listingId: string): boolean {
  const state = getLotState(listingId);
  return state.status === "awaiting_checkout" && state.winnerBidderId === getGarageBidderId();
}

export function getWinnerCheckoutDetails(listingId: string): Extract<GarageLotState, { status: "awaiting_checkout" }> | null {
  const state = getLotState(listingId);
  if (state.status !== "awaiting_checkout") return null;
  return {
    ...state,
    forfeitedBidderIds: state.forfeitedBidderIds ?? [],
    runnerUpAttempt: state.runnerUpAttempt ?? 1,
  };
}

function assignAwaitingCheckout(
  map: LotStateMap,
  listingId: string,
  bid: GarageBid,
  endedAt: string,
  forfeitedBidderIds: string[],
  runnerUpAttempt: number,
): void {
  map[listingId] = {
    status: "awaiting_checkout",
    winnerBidderId: bid.bidderId,
    winningBidUsd: bid.amountUsd,
    endedAt,
    payByIso: payByFromNow(),
    forfeitedBidderIds,
    runnerUpAttempt,
  };
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
    if (prefs.kind === "buy_now" && prefs.saleMode === "quick") continue;
    if (prefs.kind !== "auction" && prefs.negotiationPhase !== "multi_auction") continue;

    const endsMs = new Date(prefs.endsAt).getTime();
    if (endsMs > now) continue;

    const high: GarageBid | null = getHighBid(listingId);
    if (high && high.bidderId) {
      assignAwaitingCheckout(map, listingId, high, new Date().toISOString(), [], 1);
      if (high.bidderId === getGarageBidderId()) {
        pushInAppNotification({
          type: "general",
          title: "You won the auction!",
          body: `Pay $${high.amountUsd} now — ${GARAGE_AUCTION_PAY_MINUTES} minutes before the lot goes to the next bidder.`,
        });
      }
    } else {
      map[listingId] = { status: "expired_no_bids", endedAt: new Date().toISOString() };
    }
    changed = true;
  }

  if (changed) writeLotStates(map);
}

/**
 * Winner did not pay in time — lot passes to the next-highest bidder (same 30-min window).
 */
export function resolveExpiredWinnerCheckouts(listingIds: string[]): void {
  const map = readLotStates();
  const now = Date.now();
  let changed = false;

  for (const listingId of listingIds) {
    const current = map[listingId];
    if (!current || current.status !== "awaiting_checkout") continue;
    if (new Date(current.payByIso).getTime() > now) continue;

    const forfeited = [...(current.forfeitedBidderIds ?? []), current.winnerBidderId];
    const next = getBestBidExcluding(listingId, forfeited);
    const me = getGarageBidderId();

    if (current.winnerBidderId === me) {
      pushInAppNotification({
        type: "general",
        title: "Payment window expired",
        body: "You didn't pay in time — this lot goes to the next-highest bidder.",
      });
    }

    if (next) {
      assignAwaitingCheckout(
        map,
        listingId,
        next,
        current.endedAt,
        forfeited,
        (current.runnerUpAttempt ?? 1) + 1,
      );
      if (next.bidderId === me) {
        pushInAppNotification({
          type: "general",
          title: "You're the next bidder",
          body: `Pay $${next.amountUsd} now — ${GARAGE_AUCTION_PAY_MINUTES} minutes to claim this lot.`,
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

/** Merge remote lot states into local cache (remote wins on conflict). */
export function mergeLotStatesFromRemote(remote: Record<string, GarageLotState>): void {
  const local = readLotStates();
  writeLotStatesInternal({ ...local, ...remote });
}
