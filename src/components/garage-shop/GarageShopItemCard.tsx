import { useMessages } from "../../lib/i18n/react";
import { Gavel, Pencil, Share2, ShoppingBag, Tag } from "lucide-react";
import type { ListingDraft } from "../../screens/listing/types";
import { getLotState, isAuctionTimeActive } from "../../lib/garageAuctionState";
import { getMyActiveOffer } from "../../lib/garageOfferStorage";
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
  hostManage?: boolean;
  onBuyNow: (listing: ListingDraft, offer: ShopOffer) => void;
  onBid: (listing: ListingDraft, offer: ShopOffer) => void;
  onMakeOffer: (listing: ListingDraft, offer: ShopOffer) => void;
  onViewMyOffer: (listing: ListingDraft, offer: ShopOffer) => void;
  onEdit?: (listing: ListingDraft) => void;
  onShare?: (listing: ListingDraft) => void;
};

export function GarageShopItemCard({
  listing,
  preview = false,
  hostManage = false,
  onBuyNow,
  onBid,
  onMakeOffer,
  onViewMyOffer,
  onEdit,
  onShare,
}: GarageShopItemCardProps) {
  const { garageOffers: offerCopy, garageShop: shopCopy } = useMessages().garageSale;
  const offer = getShopOffer(listing);
  const lotState = getLotState(listing.id);
  const myOffer = getMyActiveOffer(listing.id);
  const cover = listing.photos[0] ?? null;
  const thumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const { url } = useMediaUrl(thumb);
  const highBid = offer ? getHighBid(listing.id) : null;
  const myBid = offer ? getMyBid(listing.id) : null;
  const currentBidUsd = highBid?.amountUsd ?? offer?.startingBidUsd ?? 0;
  const multiAuction = offer?.negotiationPhase === "multi_auction";
  const showAuction = multiAuction;
  const auctionLive = offer && showAuction ? isAuctionTimeActive(offer.startsAt, offer.endsAt) : false;
  const auctionPending = offer && showAuction ? isAuctionNotStarted({ startsAt: offer.startsAt, endsAt: offer.endsAt }) : false;
  const auctionEnded = offer && showAuction ? !auctionLive && !auctionPending : false;
  const isLeading =
    Boolean(myBid && highBid && myBid.bidderId === highBid.bidderId && myBid.amountUsd === highBid.amountUsd);
  const sold = lotState.status === "sold";
  const title = listing.title || shopCopy.saleItemFallback;

  if (!offer && lotState.status !== "sold") return null;
  if (!offer && sold) {
    return (
      <article className="garage-shop-card flex flex-col overflow-hidden rounded-2xl border bg-gray-50 opacity-60" style={{ borderColor: BORDER }}>
        <div className="relative aspect-square w-full bg-[#F3F4F6]">
          {url ? <img src={url} alt="" className="h-full w-full object-cover grayscale" /> : null}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold uppercase text-white">
            {shopCopy.soldBadge}
          </span>
        </div>
        <div className="p-2.5">
          <p className="line-clamp-2 text-[15px] font-semibold text-gray-500">{title}</p>
        </div>
      </article>
    );
  }
  if (!offer) return null;

  return (
    <article className="garage-shop-card flex flex-col overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
      <div className="relative aspect-square w-full bg-[#F3F4F6]">
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">📷</div>
        )}
        {multiAuction && auctionPending ? (
          <span className="absolute left-2 top-2 rounded-full bg-gray-600 px-2 py-1 text-[11px] font-bold uppercase text-white">
            {shopCopy.badgeSoon}
          </span>
        ) : multiAuction && auctionLive ? (
          <span className="absolute left-2 top-2 rounded-full px-2 py-1 text-[11px] font-bold uppercase text-white" style={{ backgroundColor: BLUE }}>
            {shopCopy.badgeBid}
          </span>
        ) : offer.interestedCount === 1 ? (
          <span className="absolute left-2 top-2 rounded-full px-2 py-1 text-[11px] font-bold uppercase text-white" style={{ backgroundColor: AMBER, color: GREEN }}>
            {shopCopy.badgeOffer}
          </span>
        ) : null}
        {offer.interestedCount >= 2 && !multiAuction ? (
          <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2 py-1 text-[11px] font-bold uppercase text-white">
            {offer.interestedCount} {offerCopy.interestedLabel}
          </span>
        ) : null}
        {isLeading && auctionLive ? (
          <span className="absolute right-2 top-2 rounded-full px-2 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: GREEN }}>
            {shopCopy.badgeLeading}
          </span>
        ) : null}
        {hostManage && onEdit ? (
          <button
            type="button"
            onClick={() => onEdit(listing)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow"
            aria-label={shopCopy.editShelfAria}
          >
            <Pencil className="h-3.5 w-3.5" style={{ color: GREEN }} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <p className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-gray-900">
          {title}
        </p>

        <div className="mt-1.5">
          {showAuction ? (
            <div className="text-[13px] text-gray-600">
              <span className="font-semibold text-gray-800">{formatShopUsd(currentBidUsd)}</span>
              <span className="mx-1">·</span>
              <span>{formatAuctionEnds(offer.startsAt, offer.endsAt)}</span>
            </div>
          ) : offer.interestedCount > 0 ? (
            <p className="text-[13px] font-medium text-amber-800">
              {offer.interestedCount} {offerCopy.interestedLabel}
              {offer.interestedCount >= 2 ? ` · ${offerCopy.auctionAuto}` : ""}
            </p>
          ) : null}
          <p className="text-[18px] font-extrabold leading-tight" style={{ color: GREEN }}>
            {formatShopUsd(offer.buyNowUsd)}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 pt-2.5">
          {!hostManage && showAuction && auctionLive ? (
            <button
              type="button"
              disabled={preview}
              onClick={() => onBid(listing, offer)}
              className="flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-[14px] font-bold disabled:opacity-50"
              style={{ borderColor: BLUE, color: BLUE }}
            >
              <Gavel className="h-4 w-4" aria-hidden />
              {shopCopy.bidCta}
            </button>
          ) : null}

          {!hostManage && !showAuction && offer.allowsOffers && !preview ? (
            myOffer ? (
              <button
                type="button"
                onClick={() => onViewMyOffer(listing, offer)}
                className="flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-[14px] font-bold"
                style={{ borderColor: AMBER, color: "#92400E", backgroundColor: `${AMBER}15` }}
              >
                <Tag className="h-4 w-4" />
                {shopCopy.yourOfferLine(formatShopUsd(myOffer.amountUsd))}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMakeOffer(listing, offer)}
                className="flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-[14px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                <Tag className="h-4 w-4" />
                {offerCopy.makeOffer}
              </button>
            )
          ) : null}

          {!hostManage ? (
            <button
              type="button"
              disabled={preview || (multiAuction && auctionEnded) || (multiAuction && auctionLive)}
              onClick={() => onBuyNow(listing, offer)}
              className="flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-[14px] font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: AMBER, color: GREEN }}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden />
              {shopCopy.buyCta}
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onEdit?.(listing)}
                className="flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-[14px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                <Pencil className="h-4 w-4" />
                {shopCopy.editCta}
              </button>
              {onShare ? (
                <button
                  type="button"
                  onClick={() => onShare(listing)}
                  className="flex w-full items-center justify-center gap-1 rounded-xl border py-2.5 text-[14px] font-bold"
                  style={{ borderColor: AMBER, color: "#92400E", backgroundColor: `${AMBER}12` }}
                >
                  <Share2 className="h-4 w-4" />
                  {shopCopy.shareCta}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
