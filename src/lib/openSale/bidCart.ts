import { getGarageBidderId, notifyOutbidIfNeeded } from "../garageAuctionState";
import {
  getOpenSaleEvent,
  getOpenSaleLot,
  listOpenSaleEvents,
  maybeExtendOpenSaleSoftClose,
  markOpenSaleEnded,
} from "./eventStorage";
import {
  OPEN_SALE_BAN_DAYS,
  OPEN_SALE_PAY_MINUTES,
  type OpenSaleCartLine,
  type OpenSaleCartTone,
} from "./types";
import { getHighBid, type GarageBid } from "../garageShopStorage";
import { pushInAppNotification } from "../inAppNotifications";

const CART_KEY = "evorios_open_sale_cart";
const BAN_KEY = "evorios_open_sale_bans";
const LOT_PAY_KEY = "evorios_open_sale_lot_pay";
export const OPEN_SALE_CART_EVENT = "evorios-open-sale-cart";

type BanMap = Record<string, string>; // bidderId → bannedUntil ISO
type LotPayState =
  | { status: "awaiting_checkout"; winnerBidderId: string; amountUsd: number; payByIso: string; forfeitedBidderIds: string[] }
  | { status: "sold"; winnerBidderId: string; amountUsd: number; soldAt: string }
  | { status: "returned"; reason: "no_bids" | "cascade_exhausted" };

type LotPayMap = Record<string, LotPayState>; // listingId

function readCart(): OpenSaleCartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OpenSaleCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(lines: OpenSaleCartLine[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
    window.dispatchEvent(new Event(OPEN_SALE_CART_EVENT));
  } catch {
    /* */
  }
}

function readBans(): BanMap {
  try {
    const raw = localStorage.getItem(BAN_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BanMap;
  } catch {
    return {};
  }
}

function writeBans(map: BanMap): void {
  try {
    localStorage.setItem(BAN_KEY, JSON.stringify(map));
  } catch {
    /* */
  }
}

function readLotPay(): LotPayMap {
  try {
    const raw = localStorage.getItem(LOT_PAY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LotPayMap;
  } catch {
    return {};
  }
}

function writeLotPay(map: LotPayMap): void {
  try {
    localStorage.setItem(LOT_PAY_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("evorios-open-sale-lot-pay"));
  } catch {
    /* */
  }
}

export function isOpenSaleBidderBanned(bidderId = getGarageBidderId(), now = Date.now()): boolean {
  const until = readBans()[bidderId];
  if (!until) return false;
  return new Date(until).getTime() > now;
}

export function banOpenSaleBidder(bidderId: string, now = Date.now()): void {
  const map = readBans();
  map[bidderId] = new Date(now + OPEN_SALE_BAN_DAYS * 86_400_000).toISOString();
  writeBans(map);
}

export function getOpenSaleCartLines(_bidderId = getGarageBidderId()): OpenSaleCartLine[] {
  return readCart();
}

/** @deprecated use getDeviceOpenSaleCart — cart is device-local. */
export function getMyOpenSaleCartLines(_bidderId = getGarageBidderId()): OpenSaleCartLine[] {
  return readCart();
}

/** All cart lines on this device (one shopper). */
export function getDeviceOpenSaleCart(): OpenSaleCartLine[] {
  return readCart();
}

function getMyBidAmount(listingId: string, bidderId: string): number | null {
  const line = readCart().find((l) => l.listingId === listingId);
  if (!line) return null;
  // Prefer garage bid ledger for authoritative amount.
  try {
    const raw = localStorage.getItem("evorios_garage_bids");
    if (!raw) return line.amountUsd;
    const bids = JSON.parse(raw) as GarageBid[];
    const mine = bids
      .filter((b) => b.listingId === listingId && b.bidderId === bidderId)
      .sort((a, b) => b.amountUsd - a.amountUsd)[0];
    return mine?.amountUsd ?? line.amountUsd;
  } catch {
    return line.amountUsd;
  }
}

export function cartToneForListing(
  listingId: string,
  bidderId = getGarageBidderId(),
): OpenSaleCartTone {
  const pay = readLotPay()[listingId];
  if (pay?.status === "sold") {
    return pay.winnerBidderId === bidderId ? "won" : "lost";
  }
  if (pay?.status === "awaiting_checkout") {
    if (pay.winnerBidderId === bidderId) return "pending_pay";
    return "lost";
  }
  if (pay?.status === "returned") return "lost";

  const high = getHighBid(listingId);
  const mine = getMyBidAmount(listingId, bidderId);
  if (mine == null) return "outbid";
  if (high && high.bidderId === bidderId && high.amountUsd >= mine) return "leading";
  if (high && high.amountUsd > mine) return "outbid";
  if (!high) return "leading";
  return high.bidderId === bidderId ? "leading" : "outbid";
}

export function placeOpenSaleCartBid(input: {
  eventId: string;
  listingId: string;
  hostId: string;
  title: string;
  amountUsd: number;
  photoThumbId?: string;
  photoId?: string;
  photoThumbStoragePath?: string;
  photoStoragePath?: string;
}): { ok: true; line: OpenSaleCartLine } | { ok: false; reason: string } {
  const bidderId = getGarageBidderId();
  if (isOpenSaleBidderBanned(bidderId)) {
    return { ok: false, reason: "You're paused from Open Sales for 30 days after a missed payment" };
  }

  const event = getOpenSaleEvent(input.eventId);
  if (!event || event.status === "ended" || event.status === "cancelled") {
    return { ok: false, reason: "Open Sale is closed" };
  }
  const lot = getOpenSaleLot(event, input.listingId);
  if (!lot) return { ok: false, reason: "Item is not on this Open Sale" };

  const now = Date.now();
  const hardMs = new Date(event.hardEndsAt).getTime();
  const endsMs = new Date(event.endsAt).getTime();
  if (now >= hardMs || (event.status === "live" && now >= endsMs)) {
    return { ok: false, reason: "Open Sale ended" };
  }

  if (input.amountUsd < lot.minBidUsd) {
    return { ok: false, reason: `Bid must be at least $${lot.minBidUsd}` };
  }

  const high = getHighBid(input.listingId);
  const mine = getMyBidAmount(input.listingId, bidderId);
  if (mine != null && input.amountUsd < mine + lot.bidStepUsd && input.amountUsd !== mine) {
    // Allow first set; raises must be at least step above own previous OR beat high by step.
  }
  if (high) {
    const need = high.bidderId === bidderId ? high.amountUsd : high.amountUsd + lot.bidStepUsd;
    if (input.amountUsd < need && !(high.bidderId === bidderId && input.amountUsd === high.amountUsd)) {
      if (high.bidderId !== bidderId && input.amountUsd < high.amountUsd + lot.bidStepUsd) {
        return { ok: false, reason: `Raise to at least $${high.amountUsd + lot.bidStepUsd}` };
      }
    }
  } else if (input.amountUsd < lot.minBidUsd) {
    return { ok: false, reason: `Min bid $${lot.minBidUsd}` };
  }

  // Write into shared garage bid ledger so high-bid helpers stay consistent.
  try {
    const raw = localStorage.getItem("evorios_garage_bids");
    const bids: GarageBid[] = raw ? (JSON.parse(raw) as GarageBid[]) : [];
    const bid: GarageBid = {
      listingId: input.listingId,
      hostId: input.hostId,
      amountUsd: input.amountUsd,
      placedAt: new Date().toISOString(),
      bidderId,
    };
    if (high && input.amountUsd <= high.amountUsd && high.bidderId !== bidderId) {
      return { ok: false, reason: `Beat $${high.amountUsd}` };
    }
    localStorage.setItem("evorios_garage_bids", JSON.stringify([...bids, bid]));
    window.dispatchEvent(new Event("evorios-garage-bids"));
    notifyOutbidIfNeeded(input.listingId, input.title, high ?? null);
  } catch {
    /* */
  }

  if (event.status === "live") {
    maybeExtendOpenSaleSoftClose(event.id, now);
  }

  const line: OpenSaleCartLine = {
    eventId: input.eventId,
    listingId: input.listingId,
    hostId: input.hostId,
    title: input.title,
    amountUsd: input.amountUsd,
    photoThumbId: input.photoThumbId,
    photoId: input.photoId,
    photoThumbStoragePath: input.photoThumbStoragePath,
    photoStoragePath: input.photoStoragePath,
    updatedAt: new Date().toISOString(),
  };
  const others = readCart().filter((l) => l.listingId !== input.listingId);
  writeCart([...others, line]);
  return { ok: true, line };
}

export function removeOpenSaleCartLine(listingId: string): void {
  writeCart(readCart().filter((l) => l.listingId !== listingId));
}

/** Green lines eligible for checkout after end; drop grays. */
export function getCheckoutGreenLines(bidderId = getGarageBidderId()): OpenSaleCartLine[] {
  resolveEndedOpenSales();
  return readCart().filter((line) => {
    const tone = cartToneForListing(line.listingId, bidderId);
    return tone === "pending_pay" || tone === "won" || tone === "leading";
  }).filter((line) => {
    const pay = readLotPay()[line.listingId];
    return pay?.status === "awaiting_checkout" && pay.winnerBidderId === bidderId;
  });
}

/** Drop gray (lost) lines at checkout time. */
export function dropGrayLinesFromCart(bidderId = getGarageBidderId()): void {
  const kept = readCart().filter((line) => {
    const tone = cartToneForListing(line.listingId, bidderId);
    return tone === "leading" || tone === "pending_pay" || tone === "won";
  });
  writeCart(kept);
}

function payByFromNow(): string {
  return new Date(Date.now() + OPEN_SALE_PAY_MINUTES * 60_000).toISOString();
}

/**
 * When soft/hard end hits: assign each lot to high bidder → awaiting_checkout.
 * Cascade unpaid separately.
 */
export function resolveEndedOpenSales(now = Date.now()): void {
  const events = listOpenSaleEvents();
  const pay = readLotPay();
  let changed = false;

  for (const event of events) {
    if (event.status === "cancelled") continue;
    const endsMs = new Date(event.endsAt).getTime();
    const hardMs = new Date(event.hardEndsAt).getTime();
    const closed = now >= Math.min(endsMs, hardMs) || now >= hardMs || event.status === "ended";
    if (!closed) continue;

    if (event.status !== "ended") {
      markOpenSaleEnded(event.id);
    }

    for (const lot of event.lots) {
      if (pay[lot.listingId]) continue;
      const high = getHighBid(lot.listingId);
      if (high && high.bidderId) {
        pay[lot.listingId] = {
          status: "awaiting_checkout",
          winnerBidderId: high.bidderId,
          amountUsd: high.amountUsd,
          payByIso: payByFromNow(),
          forfeitedBidderIds: [],
        };
        changed = true;
        if (high.bidderId === getGarageBidderId()) {
          pushInAppNotification({
            type: "general",
            title: "You won — pay now",
            body: `Pay $${high.amountUsd} within ${OPEN_SALE_PAY_MINUTES} min or the lot goes to the next bid.`,
          });
        }
      } else {
        pay[lot.listingId] = { status: "returned", reason: "no_bids" };
        changed = true;
      }
    }
  }

  if (changed) writeLotPay(pay);
}

/** Unpaid winner → ban + next-highest bid gets the lot. */
export function cascadeUnpaidOpenSaleLots(now = Date.now()): void {
  const pay = readLotPay();
  let changed = false;

  for (const [listingId, state] of Object.entries(pay)) {
    if (state.status !== "awaiting_checkout") continue;
    if (new Date(state.payByIso).getTime() > now) continue;

    banOpenSaleBidder(state.winnerBidderId, now);
    const forfeited = [...state.forfeitedBidderIds, state.winnerBidderId];

    let next: GarageBid | null = null;
    try {
      const raw = localStorage.getItem("evorios_garage_bids");
      const bids = raw ? (JSON.parse(raw) as GarageBid[]) : [];
      const excluded = new Set(forfeited);
      for (const bid of bids) {
        if (bid.listingId !== listingId || excluded.has(bid.bidderId)) continue;
        if (!next || bid.amountUsd > next.amountUsd) next = bid;
      }
    } catch {
      next = null;
    }

    if (next) {
      pay[listingId] = {
        status: "awaiting_checkout",
        winnerBidderId: next.bidderId,
        amountUsd: next.amountUsd,
        payByIso: payByFromNow(),
        forfeitedBidderIds: forfeited,
      };
      if (next.bidderId === getGarageBidderId()) {
        pushInAppNotification({
          type: "general",
          title: "You're next — pay now",
          body: `Previous winner missed payment. Pay $${next.amountUsd} within ${OPEN_SALE_PAY_MINUTES} min.`,
        });
      }
    } else {
      pay[listingId] = { status: "returned", reason: "cascade_exhausted" };
    }
    changed = true;
  }

  if (changed) writeLotPay(pay);
}

export function markOpenSaleLotPaid(listingId: string, bidderId = getGarageBidderId()): void {
  const pay = readLotPay();
  const state = pay[listingId];
  if (!state || state.status !== "awaiting_checkout") return;
  if (state.winnerBidderId !== bidderId) return;
  pay[listingId] = {
    status: "sold",
    winnerBidderId: bidderId,
    amountUsd: state.amountUsd,
    soldAt: new Date().toISOString(),
  };
  writeLotPay(pay);
}

export function clearOpenSaleCartLines(listingIds: string[]): void {
  const drop = new Set(listingIds);
  writeCart(readCart().filter((line) => !drop.has(line.listingId)));
}

export function getOpenSaleLotPayState(listingId: string): LotPayState | null {
  return readLotPay()[listingId] ?? null;
}

export function formatCountdown(targetIso: string, now = Date.now()): string {
  const ms = new Date(targetIso).getTime() - now;
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86_400);
  const hours = Math.floor((totalSec % 86_400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  if (hours > 0) return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
