import type { ReactNode } from "react";
import { useMessages } from "../../lib/i18n/react";
import { Gavel, Pencil, Share2, ShoppingBag, Tag } from "lucide-react";
import type { ListingDraft } from "../../screens/listing/types";
import { getLotState, isAuctionTimeActive } from "../../lib/garageAuctionState";
import { getMyActiveOffer } from "../../lib/garageOfferStorage";
import { isAuctionNotStarted } from "../../lib/garageAuctionWindow";
import { deriveGarageShelfStatus, type GarageShelfStatusKind } from "../../lib/garageShelfStatus";
import {
  formatAuctionEnds,
  formatShopUsd,
  getHighBid,
  getMyBid,
  getShopOffer,
  type ShopOffer,
} from "../../lib/garageShopStorage";
import { isFreeGiveaway } from "../../lib/listingGift";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMediaUrl } from "../../lib/useMediaUrl";
import { isListingOnOpenSale } from "../../lib/openSale";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BLUE = "#2563EB";
const BORDER = "#E8E6E0";

const STATUS_COLORS: Record<GarageShelfStatusKind, string> = {
  available: GREEN,
  reserved: "#B45309",
  rented: "#1D4ED8",
  sold: "#4B5563",
  paused: "#6B7280",
  pending_payment: "#C2410C",
};

type GarageShopItemCardProps = {
  listing: ListingDraft;
  preview?: boolean;
  hostManage?: boolean;
  onOpenListing?: (listing: ListingDraft) => void;
  onBuyNow: (listing: ListingDraft, offer: ShopOffer) => void;
  onBid: (listing: ListingDraft, offer: ShopOffer) => void;
  onMakeOffer: (listing: ListingDraft, offer: ShopOffer) => void;
  onViewMyOffer: (listing: ListingDraft, offer: ShopOffer) => void;
  onEdit?: (listing: ListingDraft) => void;
  onShare?: (listing: ListingDraft) => void;
};

function CoverThumb({
  url,
  unavailable,
  statusLabel,
  statusColor,
  badges,
}: {
  url: string | null;
  unavailable: boolean;
  statusLabel: string;
  statusColor: string;
  badges?: ReactNode;
}) {
  return (
    <div className="relative h-[5.75rem] w-[5.75rem] shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6] sm:h-[6.5rem] sm:w-[6.5rem]">
      {url ? (
        <img
          src={url}
          alt=""
          className={`h-full w-full object-contain ${unavailable ? "grayscale" : ""}`}
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl text-gray-300">📷</div>
      )}
      <span
        className="absolute left-1 top-1 max-w-[calc(100%-0.5rem)] truncate rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
        style={{ backgroundColor: statusColor }}
      >
        {statusLabel}
      </span>
      {badges}
    </div>
  );
}

export function GarageShopItemCard({
  listing,
  preview = false,
  hostManage = false,
  onOpenListing,
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
  const shelf = deriveGarageShelfStatus(listing);
  const myOffer = getMyActiveOffer(listing.id);
  const cover = listing.photos[0] ?? null;
  const thumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const { url } = useMediaUrl(thumb);
  const highBid = offer ? getHighBid(listing.id) : null;
  const myBid = offer ? getMyBid(listing.id) : null;
  const currentBidUsd = highBid?.amountUsd ?? offer?.startingBidUsd ?? 0;
  const multiAuction = offer?.negotiationPhase === "multi_auction";
  const onOpenSale = isListingOnOpenSale(listing.id);
  const showAuction = multiAuction;
  const auctionLive = offer && showAuction ? isAuctionTimeActive(offer.startsAt, offer.endsAt) : false;
  const auctionPending = offer && showAuction ? isAuctionNotStarted({ startsAt: offer.startsAt, endsAt: offer.endsAt }) : false;
  const auctionEnded = offer && showAuction ? !auctionLive && !auctionPending : false;
  /** Open Sale: bid in presale + live. Classic multi_auction: live only. */
  const canPlaceBid = Boolean(
    showAuction && !auctionEnded && (auctionLive || (onOpenSale && auctionPending) || (onOpenSale && auctionLive)),
  );
  const isLeading =
    Boolean(myBid && highBid && myBid.bidderId === highBid.bidderId && myBid.amountUsd === highBid.amountUsd);
  const title = listing.title || shopCopy.saleItemFallback;
  const categoryLabel = listing.category.trim()
    ? localizeCategoryLabel(listing.category)
    : null;
  const statusLabel =
    shelf.kind === "sold"
      ? shopCopy.soldBadge
      : shelf.kind === "rented"
        ? shopCopy.statusRented
        : shelf.kind === "reserved"
          ? shopCopy.statusReserved
          : shelf.kind === "paused"
            ? shopCopy.statusPaused
            : shelf.kind === "pending_payment"
              ? shopCopy.statusPendingPayment
              : shopCopy.statusAvailable;
  const unavailable = !shelf.actionable;
  const freeGiveaway = isFreeGiveaway(listing);
  const rentOnly = Boolean(listing.modes.rent && !listing.modes.sell && !offer);

  if (!offer && lotState.status !== "sold" && !listing.modes.rent && !listing.modes.sell && !listing.modes.gift) {
    return null;
  }

  const shellClass = `garage-shop-card flex overflow-hidden rounded-2xl border ${
    unavailable || (!offer && shelf.kind === "sold") ? "bg-gray-50" : "bg-white"
  }`;

  if (!offer && shelf.kind === "sold") {
    return (
      <article className={`${shellClass} opacity-70`} style={{ borderColor: BORDER }}>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 pr-2">
          <p className="line-clamp-2 text-[15px] font-semibold text-gray-500">{title}</p>
          <p className="text-[12px] font-bold uppercase text-gray-500">{shopCopy.soldBadge}</p>
        </div>
        <div className="p-2 pl-0">
          <CoverThumb
            url={url}
            unavailable
            statusLabel={shopCopy.soldBadge}
            statusColor={STATUS_COLORS.sold}
          />
        </div>
      </article>
    );
  }

  if (!offer && (rentOnly || listing.modes.rent || listing.modes.sell || listing.modes.gift)) {
    return (
      <article className={shellClass} style={{ borderColor: BORDER }}>
        <div className="flex min-w-0 flex-1 flex-col p-3 pr-2">
          <button type="button" onClick={() => onOpenListing?.(listing)} className="min-w-0 text-left">
            <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">{title}</p>
            {categoryLabel ? (
              <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">{categoryLabel}</p>
            ) : null}
            <p className="mt-1 text-[13px] font-semibold" style={{ color: STATUS_COLORS[shelf.kind] }}>
              {statusLabel}
              {listing.modes.rent ? ` · ${shopCopy.modeRent}` : ""}
              {freeGiveaway
                ? ` · ${shopCopy.modeFree}`
                : listing.modes.sell
                  ? ` · ${shopCopy.modeSell}`
                  : ""}
            </p>
          </button>
          <div className="mt-auto pt-2">
            {hostManage && onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(listing)}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                <Pencil className="h-3.5 w-3.5" />
                {shopCopy.editCta}
              </button>
            ) : onOpenListing ? (
              <button
                type="button"
                onClick={() => onOpenListing(listing)}
                className="inline-flex rounded-xl border px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {preview ? shopCopy.previewOpenCta : shopCopy.viewCta}
              </button>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenListing?.(listing)}
          className="shrink-0 p-2 pl-0"
          aria-label={title}
        >
          <CoverThumb
            url={url}
            unavailable={unavailable}
            statusLabel={statusLabel}
            statusColor={STATUS_COLORS[shelf.kind]}
          />
        </button>
      </article>
    );
  }

  if (!offer) return null;

  return (
    <article className={shellClass} style={{ borderColor: BORDER }}>
      <div className="flex min-w-0 flex-1 flex-col p-3 pr-2">
        <button type="button" onClick={() => onOpenListing?.(listing)} className="min-w-0 text-left">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900">{title}</p>
          {categoryLabel ? (
            <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">{categoryLabel}</p>
          ) : null}
        </button>

        <div className="mt-1.5">
          {showAuction ? (
            <div className="text-[12px] text-gray-600">
              <span className="font-semibold text-gray-800">{formatShopUsd(currentBidUsd)}</span>
              <span className="mx-1">·</span>
              <span>{formatAuctionEnds(offer.startsAt, offer.endsAt)}</span>
            </div>
          ) : offer.interestedCount > 0 ? (
            <p className="text-[12px] font-medium text-amber-800">
              {offer.interestedCount} {offerCopy.interestedLabel}
              {offer.interestedCount >= 2 ? ` · ${offerCopy.auctionAuto}` : ""}
            </p>
          ) : null}
          <p className="text-[18px] font-extrabold leading-tight" style={{ color: GREEN }}>
            {formatShopUsd(offer.buyNowUsd)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {preview && onOpenListing ? (
            <button
              type="button"
              onClick={() => onOpenListing(listing)}
              className="inline-flex rounded-xl border px-3 py-2 text-[13px] font-bold"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {shopCopy.previewOpenCta}
            </button>
          ) : null}
          {!hostManage && !preview && canPlaceBid ? (
            <button
              type="button"
              disabled={unavailable}
              onClick={() => onBid(listing, offer)}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-[13px] font-bold disabled:opacity-50"
              style={{ borderColor: BLUE, color: BLUE }}
            >
              <Gavel className="h-3.5 w-3.5" aria-hidden />
              {auctionPending && onOpenSale ? "Cart bid" : shopCopy.bidCta}
            </button>
          ) : null}

          {!hostManage && !showAuction && offer.allowsOffers && !preview && shelf.actionable ? (
            myOffer ? (
              <button
                type="button"
                onClick={() => onViewMyOffer(listing, offer)}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: AMBER, color: "#92400E", backgroundColor: `${AMBER}15` }}
              >
                <Tag className="h-3.5 w-3.5" />
                {shopCopy.yourOfferLine(formatShopUsd(myOffer.amountUsd))}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onMakeOffer(listing, offer)}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                <Tag className="h-3.5 w-3.5" />
                {offerCopy.makeOffer}
              </button>
            )
          ) : null}

          {!hostManage && !preview && !onOpenSale ? (
            <button
              type="button"
              disabled={unavailable || (multiAuction && auctionEnded) || (multiAuction && auctionLive)}
              onClick={() => onBuyNow(listing, offer)}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[13px] font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: AMBER, color: GREEN }}
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
              {unavailable ? statusLabel : shopCopy.buyCta}
            </button>
          ) : null}

          {hostManage && !preview ? (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(listing)}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                <Pencil className="h-3.5 w-3.5" />
                {shopCopy.editCta}
              </button>
              {onShare ? (
                <button
                  type="button"
                  onClick={() => onShare(listing)}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-[13px] font-bold"
                  style={{ borderColor: AMBER, color: "#92400E", backgroundColor: `${AMBER}12` }}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {shopCopy.shareCta}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenListing?.(listing)}
        className="shrink-0 p-2 pl-0"
        aria-label={title}
      >
        <CoverThumb
          url={url}
          unavailable={unavailable}
          statusLabel={statusLabel}
          statusColor={STATUS_COLORS[shelf.kind]}
          badges={
            <>
              {shelf.kind === "available" && multiAuction && auctionPending ? (
                <span className="absolute bottom-1 left-1 rounded-md bg-gray-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  {shopCopy.badgeSoon}
                </span>
              ) : null}
              {shelf.kind === "available" && multiAuction && auctionLive ? (
                <span
                  className="absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
                  style={{ backgroundColor: BLUE }}
                >
                  {shopCopy.badgeBid}
                </span>
              ) : null}
              {shelf.kind === "available" && offer.interestedCount === 1 && !multiAuction ? (
                <span
                  className="absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase"
                  style={{ backgroundColor: AMBER, color: GREEN }}
                >
                  {shopCopy.badgeOffer}
                </span>
              ) : null}
              {isLeading && auctionLive && shelf.kind === "available" ? (
                <span
                  className="absolute right-1 top-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {shopCopy.badgeLeading}
                </span>
              ) : null}
            </>
          }
        />
      </button>
    </article>
  );
}
