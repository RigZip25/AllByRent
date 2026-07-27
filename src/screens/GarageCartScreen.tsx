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
import { useAuth } from "../hooks/AuthProvider";
import { StripePaymentForm } from "../components/payments/StripePaymentForm";
import { PaymentLegalNotice } from "../components/payments/PaymentLegalNotice";
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
const SAFE_TOP = "max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function CartLineThumb({
  photoId,
  photoThumbId,
  photoThumbStoragePath,
  photoStoragePath,
}: {
  photoId?: string;
  photoThumbId?: string;
  photoThumbStoragePath?: string;
  photoStoragePath?: string;
}) {
  const media =
    photoThumbStoragePath || photoStoragePath || photoThumbId || photoId
      ? {
          id: photoId ?? photoThumbId ?? "",
          mimeType: "image/jpeg",
          thumbId: photoThumbId,
          storagePath: photoStoragePath,
          thumbStoragePath: photoThumbStoragePath,
        }
      : null;
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
  onRequireAuth?: () => void;
};

export function GarageCartScreen({ onBack, onCheckoutComplete, onRequireAuth }: GarageCartScreenProps) {
  const auth = useAuth();
  const signedIn = Boolean(auth.session);
  const [lines, setLines] = useState(() => getCartLines());
  const totals = getCartTotals();
  const hostId = lines[0]?.hostId;
  const garageName = hostId ? garageDisplayName(hostId) : "Garage";
  const paymentsReady = canProcessGaragePayments();
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");

  const checkoutInput = useMemo<GarageCartCheckoutInput | null>(() => {
    if (lines.length === 0 || !hostId) return null;
    return {
      hostId,
      garageName,
      lines,
      subtotalUsd: totals.subtotalUsd,
      platformFeeUsd: totals.platformFeeUsd,
      totalUsd: totals.totalUsd,
      guestEmail: signedIn ? undefined : guestEmail.trim().toLowerCase(),
    };
  }, [garageName, guestEmail, hostId, lines, signedIn, totals.platformFeeUsd, totals.subtotalUsd, totals.totalUsd]);

  const refresh = () => setLines(getCartLines());

  useEffect(() => {
    window.addEventListener("evorios-garage-cart", refresh);
    return () => window.removeEventListener("evorios-garage-cart", refresh);
  }, []);

  useEffect(() => {
    if (signedIn) {
      setGuestMode(false);
      setPaymentError(null);
    }
  }, [signedIn]);

  const finishCheckout = () => {
    if (!checkoutInput) return;
    void completeGarageCartCheckout(checkoutInput).then(() => {
      setClientSecret(null);
      onCheckoutComplete();
    });
  };

  const beginCheckout = () => {
    if (!checkoutInput || !paymentsReady) return;
    if (!signedIn) {
      if (!guestMode) {
        setPaymentError("Sign in, or continue as guest with your email.");
        return;
      }
      if (!isValidEmail(guestEmail)) {
        setPaymentError("Enter a valid email for your receipt.");
        return;
      }
    }
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

  const canPay =
    paymentsReady &&
    (signedIn || (guestMode && isValidEmail(guestEmail)));

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <header
        className="shrink-0 border-b bg-white px-4 pb-3"
        style={{ paddingTop: SAFE_TOP }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: GREEN }}>
              Cart
            </h1>
            <p className="text-[15px] text-gray-600">{garageName}</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-3 space-y-2">
          <PaymentsRequiredBanner variant="garage" />
          <PaymentsReadyBadge />
        </div>

        {lines.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
            <p className="text-lg font-bold text-gray-900">Cart is empty</p>
            <p className="mt-2 text-[15px] text-gray-600">Buy now items from an open garage shelf.</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 w-full rounded-xl py-3.5 text-base font-bold"
              style={{ backgroundColor: AMBER, color: GREEN }}
            >
              Back to garage
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.listingId}
                className="flex gap-3 rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <CartLineThumb
                  photoId={line.photoId}
                  photoThumbId={line.photoThumbId}
                  photoThumbStoragePath={line.photoThumbStoragePath}
                  photoStoragePath={line.photoStoragePath}
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-semibold text-gray-900">{line.title}</p>
                  <p className="mt-1 text-lg font-extrabold" style={{ color: GREEN }}>
                    {formatShopUsd(line.priceUsd)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeFromGarageCart(line.listingId);
                    refresh();
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-gray-500"
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
            <p className="mb-3 text-base font-semibold text-gray-900">Card payment</p>
            {paymentError ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {paymentError}
              </p>
            ) : null}
            <StripePaymentForm
              clientSecret={clientSecret}
              totalLabel={formatShopUsd(totals.totalUsd)}
              onSuccess={finishCheckout}
              onError={setPaymentError}
            />
            <PaymentLegalNotice className="mt-3" />
          </div>
        ) : null}
      </div>

      {lines.length > 0 && !clientSecret ? (
        <div
          className="shrink-0 border-t bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4"
          style={{ borderColor: BORDER }}
        >
          <div className="space-y-2 text-[15px]">
            <div className="flex justify-between border-b pb-2 text-lg font-bold" style={{ borderColor: BORDER }}>
              <span>Total</span>
              <span style={{ color: GREEN }}>{formatShopUsd(totals.totalUsd)}</span>
            </div>
            <p className="text-[13px] leading-snug text-gray-500">
              You pay the listed price. The seller covers the platform fee. Local tax may apply at pickup.
            </p>
          </div>

          {!signedIn ? (
            <div className="mt-3 space-y-2">
              {onRequireAuth ? (
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="w-full rounded-xl border py-3.5 text-base font-bold"
                  style={{ borderColor: GREEN, color: GREEN }}
                >
                  Sign in / Create account
                </button>
              ) : null}
              {!guestMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setGuestMode(true);
                    setPaymentError(null);
                  }}
                  className="w-full rounded-xl py-3 text-[15px] font-semibold text-gray-700 underline-offset-2"
                >
                  Continue as guest
                </button>
              ) : (
                <div className="rounded-xl border bg-[#FFF9F0] p-3" style={{ borderColor: `${AMBER}66` }}>
                  <label htmlFor="guest-email" className="block text-[15px] font-semibold text-gray-800">
                    Email for receipt
                  </label>
                  <input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border bg-white px-3 py-3 text-base"
                    style={{ borderColor: BORDER }}
                  />
                  <p className="mt-2 text-[13px] text-gray-600">
                    One-time purchase — no account required.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {paymentError ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {paymentError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={busy || !canPay}
            onClick={beginCheckout}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-60"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {busy
              ? "Preparing checkout…"
              : !signedIn && !guestMode
                ? "Choose how to pay"
                : `Pay ${formatShopUsd(totals.totalUsd)}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
