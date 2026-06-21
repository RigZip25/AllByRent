import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  formatShopUsd,
  getCartLines,
  getCartTotals,
  removeFromGarageCart,
} from "../lib/garageShopStorage";
import { garageDisplayName } from "../lib/garageDisplay";
import { useMediaUrl } from "../lib/useMediaUrl";
import { StripePaymentForm } from "../components/payments/StripePaymentForm";
import { PaymentsReadyBadge, PaymentsRequiredBanner } from "../components/payments/PaymentModeBanner";
import {
  canProcessGaragePayments,
  completeGarageCartCheckout,
  startGarageCartCheckout,
  type GarageCartCheckoutInput,
} from "../lib/repositories/paymentsRepository";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";

function CartLineThumb({ photoId, photoThumbId }: { photoId?: string; photoThumbId?: string }) {
  const media = photoThumbId ? { id: photoThumbId, thumbId: photoThumbId } : photoId ? { id: photoId } : null;
  const { url } = useMediaUrl(media);
  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6]">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xl">📷</div>
      )}
    </div>
  );
}

type GarageCartScreenProps = {
  onBack: () => void;
  onCheckoutComplete: () => void;
};

export function GarageCartScreen({ onBack, onCheckoutComplete }: GarageCartScreenProps) {
  const [lines, setLines] = useState(() => getCartLines());
  const totals = getCartTotals();
  const hostId = lines[0]?.hostId;
  const garageName = hostId ? garageDisplayName(hostId) : "Garage";
  const paymentsReady = canProcessGaragePayments();
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const checkoutInput = useMemo<GarageCartCheckoutInput | null>(() => {
    if (lines.length === 0 || !hostId) return null;
    return {
      hostId,
      garageName,
      lines,
      subtotalUsd: totals.subtotalUsd,
      platformFeeUsd: totals.platformFeeUsd,
      totalUsd: totals.totalUsd,
    };
  }, [garageName, hostId, lines, totals.platformFeeUsd, totals.subtotalUsd, totals.totalUsd]);

  const refresh = () => setLines(getCartLines());

  useEffect(() => {
    window.addEventListener("evorios-garage-cart", refresh);
    return () => window.removeEventListener("evorios-garage-cart", refresh);
  }, []);

  const finishCheckout = () => {
    if (!checkoutInput) return;
    completeGarageCartCheckout(checkoutInput);
    setClientSecret(null);
    onCheckoutComplete();
  };

  const beginCheckout = () => {
    if (!checkoutInput || !paymentsReady) return;
    setBusy(true);
    setPaymentError(null);
    void startGarageCartCheckout(checkoutInput)
      .then((result) => {
        if (!result.ok) {
          setPaymentError(result.reason);
          return;
        }
        setClientSecret(result.clientSecret);
      })
      .finally(() => setBusy(false));
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: GREEN }}>
              Cart
            </h1>
            <p className="text-[13px] text-gray-500">{garageName}</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 space-y-2">
          <PaymentsRequiredBanner />
          <PaymentsReadyBadge />
        </div>

        {lines.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
            <p className="font-bold text-gray-900">Cart is empty</p>
            <p className="mt-2 text-sm text-gray-500">Buy now items from an open garage shelf.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.listingId}
                className="flex gap-3 rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <CartLineThumb photoId={line.photoId} photoThumbId={line.photoThumbId} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px] font-semibold text-gray-900">{line.title}</p>
                  <p className="mt-1 text-[17px] font-extrabold" style={{ color: GREEN }}>
                    {formatShopUsd(line.priceUsd)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeFromGarageCart(line.listingId);
                    refresh();
                  }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-gray-500"
                  style={{ borderColor: BORDER }}
                  aria-label="Remove from cart"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

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
              onSuccess={finishCheckout}
              onError={setPaymentError}
            />
          </div>
        ) : null}
      </div>

      {lines.length > 0 && !clientSecret ? (
        <div
          className="shrink-0 border-t bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4"
          style={{ borderColor: BORDER }}
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatShopUsd(totals.subtotalUsd)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform fee (10%)</span>
              <span className="font-semibold text-gray-900">{formatShopUsd(totals.platformFeeUsd)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: BORDER }}>
              <span>Total</span>
              <span style={{ color: GREEN }}>{formatShopUsd(totals.totalUsd)}</span>
            </div>
          </div>
          {paymentError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {paymentError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy || !paymentsReady}
            onClick={beginCheckout}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-60"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {busy ? "Preparing checkout…" : `Pay ${formatShopUsd(totals.totalUsd)}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
