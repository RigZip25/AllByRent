import { useMessages } from "../../lib/i18n/react";
import { useMemo, useState } from "react";
import { Tag, X } from "lucide-react";
import { submitNeighborOffer } from "../../lib/garageOfferStorage";
import { formatShopUsd } from "../../lib/garageShopStorage";
import { useAuth } from "../../hooks/AuthProvider";
import { SignInPrompt } from "../SignInPrompt";
import type { ListingDraft } from "../../screens/listing/types";
import type { ShopOffer } from "../../lib/garageShopStorage";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";

type GarageMakeOfferSheetProps = {
  listing: ListingDraft;
  offer: ShopOffer;
  onClose: () => void;
  onSubmitted: () => void;
};

export function GarageMakeOfferSheet({
  listing,
  offer,
  onClose,
  onSubmitted,
}: GarageMakeOfferSheetProps) {
  const { common, garageSale } = useMessages();
  const copy = garageSale.garageOffers;
  const shopCopy = garageSale.garageShop;
  const auth = useAuth();
  const suggested = useMemo(
    () => Math.max(1, Math.round(offer.buyNowUsd * 0.75 * 100) / 100),
    [offer.buyNowUsd],
  );
  const [amount, setAmount] = useState(String(suggested));
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!auth.userId) {
      setError(copy.signInForOffer);
      return;
    }
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value)) {
      setError(copy.validAmount);
      return;
    }
    const result = submitNeighborOffer({
      listing,
      amountUsd: value,
      askingUsd: offer.buyNowUsd,
    });
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onSubmitted();
    onClose();
  };

  return (
    <div className="garage-offer-sheet fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <button type="button" className="absolute inset-0" aria-label={common.close} onClick={onClose} />
      <div
        className="relative w-full max-w-[390px] rounded-t-3xl border bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4"
        style={{ borderColor: BORDER }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>
              {copy.sheetEyebrow}
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {listing.title || shopCopy.saleItemFallback}
            </h2>
            <p className="mt-1 text-[15px] text-gray-600">
              {copy.askingLine(formatShopUsd(offer.buyNowUsd))} · {copy.sheetHint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label={common.close}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {!auth.userId ? (
          <SignInPrompt message={copy.signInForOfferPrompt} intent="book" />
        ) : (
          <>
            <label className="block text-[15px] font-semibold text-gray-700">
              {copy.yourOfferLabel}
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  max={offer.buyNowUsd - 0.01}
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

            {error ? <p className="mt-2 text-[15px] font-medium text-red-600">{error}</p> : null}

            <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{copy.sheetTerms}</p>

            <button
              type="button"
              onClick={submit}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold"
              style={{ backgroundColor: GREEN, color: "#fff" }}
            >
              <Tag className="h-4 w-4" aria-hidden />
              {copy.sheetSubmit}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
