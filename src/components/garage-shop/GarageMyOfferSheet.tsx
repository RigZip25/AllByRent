import { useMemo, useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import {
  buyerAcceptCounter,
  buyerSendNewOffer,
  getMyActiveOffer,
} from "../../lib/garageOfferStorage";
import { formatShopUsd, type ShopOffer } from "../../lib/garageShopStorage";
import type { ListingDraft } from "../../screens/listing/types";
import { ONBOARDING } from "../../lib/brand";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";
const copy = ONBOARDING.garageOffers;

type GarageMyOfferSheetProps = {
  listing: ListingDraft;
  offer: ShopOffer;
  onClose: () => void;
  onUpdated: () => void;
};

export function GarageMyOfferSheet({ listing, offer, onClose, onUpdated }: GarageMyOfferSheetProps) {
  const active = useMemo(() => getMyActiveOffer(listing.id), [listing.id]);
  const [counterAmount, setCounterAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!active) return null;

  const accept = () => {
    if (active.status !== "pending_buyer") return;
    const result = buyerAcceptCounter(active.id, listing);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onUpdated();
    onClose();
  };

  const sendCounter = () => {
    const value = Number.parseFloat(counterAmount);
    if (!Number.isFinite(value)) {
      setError("Enter a valid amount");
      return;
    }
    const result = buyerSendNewOffer({
      offerId: active.id,
      listing,
      amountUsd: value,
      askingUsd: offer.buyNowUsd,
    });
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onUpdated();
    onClose();
  };

  return (
    <div className="garage-my-offer-sheet fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div
        className="relative w-full max-w-[390px] rounded-t-3xl border bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4"
        style={{ borderColor: BORDER }}
      >
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">{copy.myOfferTitle}</p>
            <h2 className="text-lg font-bold text-gray-900">{listing.title || "Sale item"}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {active.status === "pending_host"
                ? `${copy.waitingHost} ${formatShopUsd(active.amountUsd)}`
                : `${copy.hostWants} ${formatShopUsd(active.amountUsd)}`}
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: BORDER }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {active.status === "pending_buyer" ? (
          <>
            <button
              type="button"
              onClick={accept}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Check className="h-4 w-4" />
              {copy.acceptCounter} {formatShopUsd(active.amountUsd)}
            </button>
            <label className="mt-3 block text-sm font-semibold text-gray-700">
              {copy.newOfferLabel}
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(event) => {
                    setCounterAmount(event.target.value);
                    setError(null);
                  }}
                  className="w-full rounded-xl border py-3 pl-7 pr-3"
                  style={{ borderColor: BORDER }}
                />
              </div>
            </label>
            <button
              type="button"
              onClick={sendCounter}
              className="mt-3 w-full rounded-xl border py-3 font-bold"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {copy.sendNewOffer}
            </button>
          </>
        ) : (
          <p className="rounded-xl px-3 py-3 text-sm text-gray-600" style={{ backgroundColor: `${AMBER}15` }}>
            {copy.pendingHostBody}
          </p>
        )}

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
