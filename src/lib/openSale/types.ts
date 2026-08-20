/** Fast garage Open Sale — not a standing eBay listing. */

export type OpenSaleLotOrigin = "garage_mirror" | "snap_only";

export type OpenSaleLot = {
  listingId: string;
  /** Floor bid set by host. */
  minBidUsd: number;
  /** Raise-by step set by host. */
  bidStepUsd: number;
  origin: OpenSaleLotOrigin;
};

export type OpenSaleStatus = "presale" | "live" | "ended" | "cancelled";

export type OpenSaleEvent = {
  id: string;
  hostId: string;
  /** Neighbors may browse + place floor bids; no winner yet. */
  startsAt: string;
  /** Soft close — may extend on late bids, never past hardEndsAt. */
  endsAt: string;
  /** Absolute cutoff — auction always stops here. */
  hardEndsAt: string;
  status: OpenSaleStatus;
  lots: OpenSaleLot[];
  createdAt: string;
};

/** Live window host may pick (minutes). Keep short so interest holds. */
export const OPEN_SALE_LIVE_MINUTES = [30, 60] as const;
export type OpenSaleLiveMinutes = (typeof OPEN_SALE_LIVE_MINUTES)[number];

/** Soft-close: bid in last N ms extends endsAt by N ms (capped by hardEndsAt). */
export const OPEN_SALE_SOFT_CLOSE_MS = 45_000;

/** Hard cutoff sits this far after the scheduled soft end. */
export const OPEN_SALE_HARD_AFTER_END_MS = 15 * 60_000;

/** Winner must pay within this window or lot cascades. */
export const OPEN_SALE_PAY_MINUTES = 30;

/** No-pay ban length. */
export const OPEN_SALE_BAN_DAYS = 30;

export type OpenSaleCartLine = {
  eventId: string;
  listingId: string;
  hostId: string;
  title: string;
  amountUsd: number;
  photoThumbId?: string;
  photoId?: string;
  photoThumbStoragePath?: string;
  photoStoragePath?: string;
  updatedAt: string;
};

export type OpenSaleCartTone = "leading" | "outbid" | "won" | "lost" | "pending_pay";
