import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, MessageSquare, X } from "lucide-react";
import {
  getHostPendingOffers,
  hostAcceptOffer,
  hostCounterOffer,
  hostDeclineOffer,
  type GarageNeighborOffer,
} from "../lib/garageOfferStorage";
import { formatShopUsd } from "../lib/garageShopStorage";
import { getPublishedListingById } from "../lib/listingStorage";
import { ONBOARDING } from "../lib/brand";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";
const copy = ONBOARDING.garageOffers;

type GarageHostOffersScreenProps = {
  hostId: string;
  onBack: () => void;
};

export function GarageHostOffersScreen({ hostId, onBack }: GarageHostOffersScreenProps) {
  const [offers, setOffers] = useState<GarageNeighborOffer[]>(() => getHostPendingOffers(hostId));
  const [counterDraft, setCounterDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setOffers(getHostPendingOffers(hostId));
  }, [hostId]);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener("evorios-garage-offers-neighbor", onChange);
    window.addEventListener("evorios-garage-lots", onChange);
    return () => {
      window.removeEventListener("evorios-garage-offers-neighbor", onChange);
      window.removeEventListener("evorios-garage-lots", onChange);
    };
  }, [refresh]);

  const accept = (offer: GarageNeighborOffer) => {
    const listing = getPublishedListingById(offer.listingId);
    if (!listing) {
      setError("Listing not found");
      return;
    }
    const result = hostAcceptOffer(offer.id, listing);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    refresh();
  };

  const counter = (offer: GarageNeighborOffer) => {
    const value = Number.parseFloat(counterDraft[offer.id] ?? "");
    if (!Number.isFinite(value)) {
      setError("Enter a counter amount");
      return;
    }
    const result = hostCounterOffer(offer.id, value);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    refresh();
  };

  const decline = (offer: GarageNeighborOffer) => {
    const result = hostDeclineOffer(offer.id);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    refresh();
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: GREEN }}>
              {copy.inboxTitle}
            </h1>
            <p className="text-[13px] text-gray-500">{copy.inboxSubtitle}</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {offers.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center" style={{ borderColor: BORDER }}>
            <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-3 font-bold text-gray-900">{copy.inboxEmptyTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{copy.inboxEmptyBody}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <article key={offer.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">{copy.oneOnOneBadge}</p>
                <h2 className="mt-1 text-base font-bold text-gray-900">{offer.listingTitle}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {copy.offerFrom} {formatShopUsd(offer.amountUsd)}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => accept(offer)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-bold text-white"
                    style={{ backgroundColor: GREEN }}
                  >
                    <Check className="h-4 w-4" />
                    {copy.accept}
                  </button>
                  <button
                    type="button"
                    onClick={() => decline(offer)}
                    className="rounded-xl border px-3 py-2.5 text-sm font-bold text-gray-600"
                    style={{ borderColor: BORDER }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <label className="mt-3 block text-xs font-semibold text-gray-600">
                  {copy.counterLabel}
                  <div className="mt-1 flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={counterDraft[offer.id] ?? ""}
                        onChange={(event) =>
                          setCounterDraft((draft) => ({ ...draft, [offer.id]: event.target.value }))
                        }
                        className="w-full rounded-xl border py-2.5 pl-7 pr-2 text-sm font-semibold"
                        style={{ borderColor: BORDER }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => counter(offer)}
                      className="rounded-xl px-4 py-2.5 text-sm font-bold"
                      style={{ backgroundColor: AMBER, color: GREEN }}
                    >
                      {copy.counter}
                    </button>
                  </div>
                </label>
              </article>
            ))}
          </div>
        )}

        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

        <p className="mt-4 text-xs leading-relaxed text-gray-500">{copy.inboxFootnote}</p>
      </div>
    </div>
  );
}
