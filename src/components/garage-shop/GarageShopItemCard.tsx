import { Gavel, ShoppingBag } from "lucide-react";
import type { ListingDraft } from "../../screens/listing/types";
import { getLotState, isAuctionTimeActive } from "../../lib/garageAuctionState";
import { isAuctionNotStarted } from "../../lib/garageAuctionWindow";
import {
  formatAuctionEnds,
  formatShopUsd,
  getHighBid,
  getMyBid,
  getShopOffer,
  type ShopOffer,
} from "../../lib/garageShopStorage";
import { useMediaUrl } from "../../lib/useMediaUrl";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BLUE = "#2563EB";
const BORDER = "#E8E6E0";

type GarageShopItemCardProps = {
  listing: ListingDraft;
  preview?: boolean;
  onBuyNow: (listing: ListingDraft, offer: ShopOffer) => void;
  onBid: (listing: ListingDraft, offer: ShopOffer) => void;
};

export function GarageShopItemCard({
  listing,
  preview = false,
  onBuyNow,
  onBid,
}: GarageShopItemCardProps) {
  const offer = getShopOffer(listing);
  const lotState = getLotState(listing.id);
  const cover = listing.photos[0] ?? null;
  const thumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const { url } = useMediaUrl(thumb);
  const highBid = offer ? getHighBid(listing.id) : null;
  const myBid = offer ? getMyBid(listing.id) : null;
  const currentBidUsd = highBid?.amountUsd ?? offer?.startingBidUsd ?? 0;
  const showAuction = offer?.kind === "auction" || offer?.kind === "both";
  const auctionLive = offer ? isAuctionTimeActive(offer.startsAt, offer.endsAt) : false;
  const auctionPending = offer ? isAuctionNotStarted({ startsAt: offer.startsAt, endsAt: offer.endsAt }) : false;
  const auctionEnded = offer ? !auctionLive && !auctionPending : false;
  const isLeading =
    Boolean(myBid && highBid && myBid.bidderId === highBid.bidderId && myBid.amountUsd === highBid.amountUsd);
  const sold = lotState.status === "sold";

  if (!offer && lotState.status !== "sold") return null;
  if (!offer && sold) {
    return (
      <article className="garage-shop-card flex flex-col overflow-hidden rounded-2xl border bg-gray-50 opacity-60" style={{ borderColor: BORDER }}>
        <div className="relative aspect-square w-full bg-[#F3F4F6]">
          {url ? <img src={url} alt="" className="h-full w-full object-cover grayscale" /> : null}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold uppercase text-white">
            Sold
          </span>
        </div>
        <div className="p-2.5">
          <p className="line-clamp-2 text-[13px] font-semibold text-gray-500">{listing.title || "Sale item"}</p>
        </div>
      </article>
    );
  }
  if (!offer) return null;

  return (
    <article
      className="garage-shop-card flex flex-col overflow-hidden rounded-2xl border bg-white"
      style={{ borderColor: BORDER }}
    >
      <div className="relative aspect-square w-full bg-[#F3F4F6]">
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">📷</div>
        )}
        {showAuction && auctionPending ? (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: "#6B7280" }}
          >
            Soon
          </span>
        ) : showAuction && auctionLive ? (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: BLUE }}
          >
            Bid
          </span>
        ) : showAuction && auctionEnded ? (
          <span className="absolute left-2 top-2 rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Ended
          </span>
        ) : null}
        {isLeading && auctionLive ? (
          <span
            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Leading
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-gray-900">
          {listing.title || "Sale item"}
        </p>

        <div className="mt-1.5">
          {showAuction ? (
            <div className="text-[12px] text-gray-500">
              <span className="font-semibold text-gray-800">{formatShopUsd(currentBidUsd)}</span>
              <span className="mx-1">·</span>
              <span>{formatAuctionEnds(offer.startsAt, offer.endsAt)}</span>
            </div>
          ) : null}
          <p className="text-[17px] font-extrabold leading-tight" style={{ color: GREEN }}>
            {showAuction ? (
              <span className="text-[12px] font-semibold text-gray-500">
                Buy now {formatShopUsd(offer.buyNowUsd)}
              </span>
            ) : (
              formatShopUsd(offer.buyNowUsd)
            )}
          </p>
        </div>

        <div className="mt-auto flex gap-1.5 pt-2.5">
          {showAuction && auctionLive ? (
            <button
              type="button"
              disabled={preview}
              onClick={() => onBid(listing, offer)}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border py-2 text-[12px] font-bold disabled:opacity-50"
              style={{ borderColor: BLUE, color: BLUE }}
            >
              <Gavel className="h-3.5 w-3.5" aria-hidden />
              Bid
            </button>
          ) : showAuction && auctionPending ? (
            <span
              className="flex flex-1 items-center justify-center rounded-xl border py-2 text-[11px] font-bold text-gray-500"
              style={{ borderColor: BORDER }}
            >
              Opens soon
            </span>
          ) : null}
          <button
            type="button"
            disabled={preview || (showAuction && auctionEnded && offer.kind === "auction")}
            onClick={() => onBuyNow(listing, offer)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[12px] font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: showAuction ? GREEN : AMBER, color: showAuction ? "#fff" : GREEN }}
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}
