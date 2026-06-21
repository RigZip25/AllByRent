import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { garageDisplayName } from "../lib/garageDisplay";
import {
  GARAGE_AUCTION_PAY_MINUTES,
  getWinnerCheckoutDetails,
  isAwaitingCheckoutForMe,
} from "../lib/garageAuctionState";
import { formatShopUsd } from "../lib/garageShopStorage";
import { getPublishedListingById } from "../lib/listingStorage";
import { useMediaUrl } from "../lib/useMediaUrl";
import { StripePaymentForm } from "../components/payments/StripePaymentForm";
import { PaymentModeBanner } from "../components/payments/PaymentModeBanner";
import {
  completeAuctionCheckoutDemo,
  completeAuctionCheckoutLive,
  getGarageCheckoutMode,
  startAuctionCheckout,
  type AuctionCheckoutInput,
} from "../lib/repositories/paymentsRepository";
import { ONBOARDING } from "../lib/brand";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";
const PLATFORM_FEE_RATE = 0.1;
const auctionCopy = ONBOARDING.garageAuction;

type GarageWinnerCheckoutScreenProps = {
  listingId: string;
  onBack: () => void;
  onComplete: () => void;
};

function formatPayCountdown(payByIso: string): string {
  const ms = new Date(payByIso).getTime() - Date.now();
  if (ms <= 0) return "Time expired";
  const minutes = Math.ceil(ms / 60_000);
  return `${minutes} min left`;
}

export function GarageWinnerCheckoutScreen({
  listingId,
  onBack,
  onComplete,
}: GarageWinnerCheckoutScreenProps) {
  const listing = getPublishedListingById(listingId);
  const checkout = getWinnerCheckoutDetails(listingId);
  const cover = listing?.photos[0] ?? null;
  const thumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const { url } = useMediaUrl(thumb);
  const [countdown, setCountdown] = useState(() =>
    checkout ? formatPayCountdown(checkout.payByIso) : "",
  );
  const checkoutMode = getGarageCheckoutMode();
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const totals = useMemo(() => {
    const winningBidUsd = checkout?.winningBidUsd ?? 0;
    const platformFeeUsd = Math.round(winningBidUsd * PLATFORM_FEE_RATE * 100) / 100;
    const totalUsd = Math.round((winningBidUsd + platformFeeUsd) * 100) / 100;
    return { winningBidUsd, platformFeeUsd, totalUsd };
  }, [checkout]);

  const checkoutInput = useMemo<AuctionCheckoutInput | null>(() => {
    if (!listing || !checkout) return null;
    return {
      listingId,
      hostId: listing.hostId ?? "demo-user",
      hostName: garageDisplayName(listing.hostId ?? "demo-user"),
      itemTitle: listing.title || "Sale item",
      winningBidUsd: checkout.winningBidUsd,
      platformFeeUsd: totals.platformFeeUsd,
      totalUsd: totals.totalUsd,
      runnerUpAttempt: checkout.runnerUpAttempt,
    };
  }, [checkout, listing, listingId, totals.platformFeeUsd, totals.totalUsd]);

  useEffect(() => {
    if (!checkout) return undefined;
    const tick = () => setCountdown(formatPayCountdown(checkout.payByIso));
    tick();
    const timer = window.setInterval(tick, 10_000);
    return () => window.clearInterval(timer);
  }, [checkout]);

  if (!listing || !checkout || !isAwaitingCheckoutForMe(listingId)) {
    return (
      <div className="screen flex flex-col items-center justify-center bg-[#F9FAFB] px-6 text-center">
        <p className="font-bold text-gray-900">Nothing to pay</p>
        <p className="mt-2 text-sm text-gray-500">This payment window expired or was already paid.</p>
        <button type="button" onClick={onBack} className="mt-4 font-semibold" style={{ color: GREEN }}>
          Go back
        </button>
      </div>
    );
  }

  const hostName = garageDisplayName(listing.hostId ?? "demo-user");
  const isRunnerUp = checkout.runnerUpAttempt > 1;

  const finishCheckout = (mode: "demo" | "stripe") => {
    if (!checkoutInput) return;
    if (mode === "stripe") {
      completeAuctionCheckoutLive(checkoutInput);
    } else {
      completeAuctionCheckoutDemo(checkoutInput);
    }
    setClientSecret(null);
    onComplete();
  };

  const beginCheckout = () => {
    if (!checkoutInput) return;
    setBusy(true);
    setPaymentError(null);
    void startAuctionCheckout(checkoutInput)
      .then((result) => {
        if (!result.ok) {
          setPaymentError(result.reason);
          return;
        }
        if (result.mode === "demo") {
          finishCheckout("demo");
          return;
        }
        setClientSecret(result.clientSecret);
      })
      .finally(() => setBusy(false));
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
              {isRunnerUp ? auctionCopy.runnerUpTitle : "You won!"}
            </h1>
            <p className="text-[13px] text-gray-500">{hostName}</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3">
          <PaymentModeBanner context="garage" />
        </div>

        <div
          className="mb-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold"
          style={{ backgroundColor: `${AMBER}22`, color: "#92400E" }}
        >
          {countdown} · Pay now or the lot goes to the next bidder
        </div>

        <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
          <div className="flex gap-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {url ? (
                <img src={url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">📷</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
                {isRunnerUp ? "Next bidder" : "Auction won"}
              </p>
              <h2 className="text-base font-bold text-gray-900">{listing.title || "Sale item"}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {isRunnerUp ? auctionCopy.runnerUpSubtitle : `Pay within ${GARAGE_AUCTION_PAY_MINUTES} minutes`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border bg-white p-4 text-sm" style={{ borderColor: BORDER }}>
          <div className="flex justify-between text-gray-600">
            <span>{isRunnerUp ? "Your bid" : "Winning bid"}</span>
            <span className="font-semibold text-gray-900">{formatShopUsd(totals.winningBidUsd)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform fee (10%)</span>
            <span className="font-semibold text-gray-900">{formatShopUsd(totals.platformFeeUsd)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: BORDER }}>
            <span>Total due now</span>
            <span style={{ color: GREEN }}>{formatShopUsd(totals.totalUsd)}</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border bg-white p-4 text-xs leading-relaxed text-gray-600" style={{ borderColor: BORDER }}>
          <p className="font-bold text-gray-800">Auction terms</p>
          <p className="mt-1.5">{auctionCopy.checkoutTerms}</p>
        </div>

        {clientSecret ? (
          <div className="mt-4 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <p className="mb-3 text-sm font-semibold text-gray-900">Card payment</p>
            {paymentError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {paymentError}
              </p>
            ) : null}
            <StripePaymentForm
              clientSecret={clientSecret}
              totalLabel={formatShopUsd(totals.totalUsd)}
              onSuccess={() => finishCheckout("stripe")}
              onError={setPaymentError}
            />
          </div>
        ) : null}
      </div>

      {!clientSecret ? (
        <div className="shrink-0 border-t bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4" style={{ borderColor: BORDER }}>
          {paymentError ? (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {paymentError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={beginCheckout}
            className="w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-60"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {busy
              ? "Preparing payment…"
              : checkoutMode === "stripe"
                ? `Pay ${formatShopUsd(totals.totalUsd)} now`
                : `Pay ${formatShopUsd(totals.totalUsd)} now · demo`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
