import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { ListingDraft } from "../../screens/listing/types";
import { ONBOARDING } from "../../lib/brand";
import { placeBidWithSync } from "../../lib/repositories/garageRepository";
import {
  formatShopUsd,
  getHighBid,
  type ShopOffer,
} from "../../lib/garageShopStorage";
import { formatAuctionWindowLabel } from "../../lib/garageAuctionWindow";

const GREEN = "#0D5C3A";
const BLUE = "#2563EB";
const BORDER = "#E8E6E0";
const auctionCopy = ONBOARDING.garageAuction;

type GarageBidSheetProps = {
  listing: ListingDraft;
  offer: ShopOffer;
  onClose: () => void;
  onBidPlaced: () => void;
};

export function GarageBidSheet({ listing, offer, onClose, onBidPlaced }: GarageBidSheetProps) {
  const highBid = getHighBid(listing.id);
  const minBidUsd = useMemo(() => {
    const base = highBid?.amountUsd ?? offer.startingBidUsd - offer.minIncrementUsd;
    return Math.round((base + offer.minIncrementUsd) * 100) / 100;
  }, [highBid, offer]);

  const quickBids = useMemo(
    () => [
      minBidUsd,
      Math.round((minBidUsd + offer.minIncrementUsd) * 100) / 100,
      Math.round((minBidUsd + offer.minIncrementUsd * 3) * 100) / 100,
    ],
    [minBidUsd, offer.minIncrementUsd],
  );

  const [amount, setAmount] = useState(String(minBidUsd));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value)) {
      setError("Enter a valid amount");
      return;
    }
    void placeBidWithSync({
      listingId: listing.id,
      hostId: listing.hostId ?? "",
      amountUsd: value,
      minBidUsd,
      endsAt: offer.endsAt,
      startsAt: offer.startsAt,
      listingTitle: listing.title || "Sale item",
    }).then((result) => {
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      onBidPlaced();
      onClose();
    });
  };

  return (
    <div className="garage-bid-sheet fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div
        className="relative w-full max-w-[390px] rounded-t-3xl border bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4"
        style={{ borderColor: BORDER }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: BLUE }}>
              Place bid
            </p>
            <h2 className="text-lg font-bold text-gray-900">{listing.title || "Sale item"}</h2>
            <p className="mt-1 text-sm text-gray-500">
              High bid {highBid ? formatShopUsd(highBid.amountUsd) : formatShopUsd(offer.startingBidUsd)}
              {" · "}
              Buy now {formatShopUsd(offer.buyNowUsd)}
            </p>
            <p className="mt-1 text-[12px] font-medium text-gray-600">
              {formatAuctionWindowLabel({ startsAt: offer.startsAt, endsAt: offer.endsAt })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label="Close bid sheet"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          {quickBids.map((bid) => (
            <button
              key={bid}
              type="button"
              onClick={() => {
                setAmount(String(bid));
                setError(null);
              }}
              className="flex-1 rounded-xl border py-2 text-sm font-bold"
              style={{
                borderColor: Number(amount) === bid ? BLUE : BORDER,
                color: Number(amount) === bid ? BLUE : "#374151",
                backgroundColor: Number(amount) === bid ? `${BLUE}10` : "#fff",
              }}
            >
              {formatShopUsd(bid)}
            </button>
          ))}
        </div>

        <label className="block text-sm font-semibold text-gray-700">
          Your bid
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={minBidUsd}
              step={offer.minIncrementUsd}
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError(null);
              }}
              className="w-full rounded-xl border py-3 pl-7 pr-3 text-base font-semibold"
              style={{ borderColor: BORDER }}
            />
          </div>
        </label>
        <p className="mt-1 text-xs text-gray-500">Minimum next bid {formatShopUsd(minBidUsd)}</p>

        {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}

        <p className="mt-3 text-xs leading-relaxed text-gray-500">{auctionCopy.bidTerms}</p>

        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Confirm bid
        </button>
      </div>
    </div>
  );
}
