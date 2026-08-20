import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  formatShopUsd,
  getCartLines,
  getCartTotals,
  removeFromGarageCart,
} from "../lib/garageShopStorage";
import {
  cartToneForListing,
  cascadeUnpaidOpenSaleLots,
  dropGrayLinesFromCart,
  getCheckoutGreenLines,
  getDeviceOpenSaleCart,
  OPEN_SALE_CART_EVENT,
  resolveEndedOpenSales,
} from "../lib/openSale";
import { garageDisplayName } from "../lib/garageDisplay";
import { useMediaUrl } from "../lib/useMediaUrl";
import { useAuth } from "../hooks/AuthProvider";
import { StripePaymentForm } from "../components/payments/StripePaymentForm";
import { PaymentLegalNotice } from "../components/payments/PaymentLegalNotice";
import { PaymentsReadyBadge, PaymentsRequiredBanner } from "../components/payments/PaymentModeBanner";
import {
  canProcessGaragePayments,
  buildOpenSaleWinsCheckoutInput,
  completeGarageCartCheckout,
  completeOpenSaleWinsCheckout,
  startGarageCartCheckout,
  type GarageCartCheckoutInput,
} from "../lib/repositories/paymentsRepository";
import { useMessages } from "../lib/i18n/react";

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
  const { garageCart: copy } = useMessages();
  const auth = useAuth();
  const signedIn = Boolean(auth.session);
  const [lines, setLines] = useState(() => getCartLines());
  const [bidLines, setBidLines] = useState(() => getDeviceOpenSaleCart());
  const [greenLines, setGreenLines] = useState(() => getCheckoutGreenLines());
  const totals = getCartTotals();
  const hostId = lines[0]?.hostId ?? bidLines[0]?.hostId ?? greenLines[0]?.hostId;
  const garageName = hostId ? garageDisplayName(hostId) : copy.garageFallback;
  const paymentsReady = canProcessGaragePayments();
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [paidSuccess, setPaidSuccess] = useState<{ garageName: string; totalLabel: string } | null>(null);
  const [checkoutKind, setCheckoutKind] = useState<"buynow" | "opensale">("buynow");

  const greenCheckoutInput = useMemo(
    () =>
      buildOpenSaleWinsCheckoutInput({
        hostId: greenLines[0]?.hostId ?? hostId ?? "",
        garageName,
        lines: greenLines,
        guestEmail: signedIn ? undefined : guestEmail.trim().toLowerCase(),
      }),
    [garageName, guestEmail, greenLines, hostId, signedIn],
  );

  const checkoutInput = useMemo<GarageCartCheckoutInput | null>(() => {
    if (checkoutKind === "opensale") return greenCheckoutInput;
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
  }, [
    checkoutKind,
    garageName,
    guestEmail,
    greenCheckoutInput,
    hostId,
    lines,
    signedIn,
    totals.platformFeeUsd,
    totals.subtotalUsd,
    totals.totalUsd,
  ]);

  const refresh = () => {
    resolveEndedOpenSales();
    cascadeUnpaidOpenSaleLots();
    setLines(getCartLines());
    setBidLines(getDeviceOpenSaleCart());
    setGreenLines(getCheckoutGreenLines());
  };

  useEffect(() => {
    refresh();
    window.addEventListener("evorios-garage-cart", refresh);
    window.addEventListener(OPEN_SALE_CART_EVENT, refresh);
    window.addEventListener("evorios-garage-bids", refresh);
    return () => {
      window.removeEventListener("evorios-garage-cart", refresh);
      window.removeEventListener(OPEN_SALE_CART_EVENT, refresh);
      window.removeEventListener("evorios-garage-bids", refresh);
    };
  }, []);

  useEffect(() => {
    if (signedIn) {
      setGuestMode(false);
      setPaymentError(null);
    }
  }, [signedIn]);

  const finishCheckout = () => {
    if (!checkoutInput) return;
    const summary = {
      garageName: checkoutInput.garageName,
      totalLabel: formatShopUsd(checkoutInput.totalUsd),
    };
    const complete =
      checkoutKind === "opensale" ? completeOpenSaleWinsCheckout : completeGarageCartCheckout;
    void complete(checkoutInput).then(() => {
      setClientSecret(null);
      setPaidSuccess(summary);
      setCheckoutKind("buynow");
      refresh();
    });
  };

  const beginCheckout = (kind: "buynow" | "opensale" = "buynow") => {
    setCheckoutKind(kind);
    const input =
      kind === "opensale"
        ? greenCheckoutInput
        : lines.length && hostId
          ? {
              hostId,
              garageName,
              lines,
              subtotalUsd: totals.subtotalUsd,
              platformFeeUsd: totals.platformFeeUsd,
              totalUsd: totals.totalUsd,
              guestEmail: signedIn ? undefined : guestEmail.trim().toLowerCase(),
            }
          : null;
    if (!input || !paymentsReady) return;
    if (!signedIn) {
      if (!guestMode) {
        setPaymentError(copy.signInOrGuest);
        return;
      }
      if (!isValidEmail(guestEmail)) {
        setPaymentError(copy.validEmail);
        return;
      }
    }
    setBusy(true);
    setPaymentError(null);
    void startGarageCartCheckout(input)
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
            onClick={paidSuccess ? onCheckoutComplete : onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label={copy.backAria}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: GREEN }}>
              {paidSuccess ? copy.paidTitle : copy.title}
            </h1>
            <p className="text-[15px] text-gray-600">{paidSuccess?.garageName ?? garageName}</p>
          </div>
        </div>
      </header>

      {paidSuccess ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <div className="rounded-2xl border bg-white p-6 text-center" style={{ borderColor: BORDER }}>
            <p className="text-lg font-bold text-gray-900">{copy.paymentComplete(paidSuccess.totalLabel)}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700">
              {copy.paymentCompleteBody}
            </p>
            <p className="mt-2 text-[14px] text-gray-500">{copy.sellerNotified}</p>
            <button
              type="button"
              onClick={onCheckoutComplete}
              className="mt-6 w-full rounded-xl py-3.5 text-base font-bold"
              style={{ backgroundColor: AMBER, color: GREEN }}
            >
              {copy.backToGarage}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-3 space-y-2">
              <PaymentsRequiredBanner variant="garage" />
              <PaymentsReadyBadge />
            </div>

            {bidLines.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  Open Sale bids · green leading · gray outbid
                </p>
                <ul className="space-y-2">
                  {bidLines.map((line) => {
                    const tone = cartToneForListing(line.listingId);
                    const leading = tone === "leading" || tone === "pending_pay" || tone === "won";
                    return (
                      <li
                        key={`bid-${line.listingId}`}
                        className="flex gap-3 rounded-2xl border p-3"
                        style={{
                          borderColor: leading ? "#86EFAC" : BORDER,
                          backgroundColor: leading ? "#ECFDF5" : "#F3F4F6",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900">{line.title}</p>
                          <p className="mt-1 text-base font-extrabold" style={{ color: GREEN }}>
                            {formatShopUsd(line.amountUsd)}
                          </p>
                          <p className="mt-0.5 text-[12px] font-semibold text-gray-600">
                            {tone === "leading"
                              ? "You're leading"
                              : tone === "pending_pay"
                                ? "Won — pay now"
                                : tone === "outbid"
                                  ? "Outbid — raise by step"
                                  : tone}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    dropGrayLinesFromCart();
                    refresh();
                  }}
                  className="mt-2 w-full rounded-xl border py-2.5 text-sm font-bold"
                  style={{ borderColor: BORDER, color: GREEN }}
                >
                  Drop gray (lost) from cart
                </button>
                {greenLines.length > 0 ? (
                  <button
                    type="button"
                    disabled={busy || !canPay}
                    onClick={() => beginCheckout("opensale")}
                    className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                    style={{ backgroundColor: GREEN }}
                  >
                    {busy
                      ? copy.preparing
                      : `Pay ${greenLines.length} win${greenLines.length === 1 ? "" : "s"} · ${formatShopUsd(greenCheckoutInput?.totalUsd ?? 0)}`}
                  </button>
                ) : (
                  <p className="mt-2 text-center text-[12px] text-gray-500">
                    After the sale ends, green wins unlock one checkout here.
                  </p>
                )}
              </div>
            ) : null}

            {lines.length === 0 && bidLines.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: BORDER }}>
                <p className="text-lg font-bold text-gray-900">{copy.emptyTitle}</p>
                <p className="mt-2 text-[15px] text-gray-600">{copy.emptyBody}</p>
                <button
                  type="button"
                  onClick={onBack}
                  className="mt-4 w-full rounded-xl py-3.5 text-base font-bold"
                  style={{ backgroundColor: AMBER, color: GREEN }}
                >
                  {copy.backToGarage}
                </button>
              </div>
            ) : lines.length > 0 ? (
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
                      aria-label={copy.removeAria}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-sm text-gray-500">Buy-now shelf empty — bids above.</p>
            )}

            {clientSecret ? (
              <div className="mt-4 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <p className="mb-3 text-base font-semibold text-gray-900">{copy.cardPayment}</p>
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
                  <span>{copy.total}</span>
                  <span style={{ color: GREEN }}>{formatShopUsd(totals.totalUsd)}</span>
                </div>
                <p className="text-[13px] leading-snug text-gray-500">
                  {copy.buyNowHint}
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
                      {copy.signInCta}
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
                      {copy.continueGuest}
                    </button>
                  ) : (
                    <div className="rounded-xl border bg-[#FFF9F0] p-3" style={{ borderColor: `${AMBER}66` }}>
                      <label htmlFor="guest-email" className="block text-[15px] font-semibold text-gray-800">
                        {copy.emailLabel}
                      </label>
                      <input
                        id="guest-email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder={copy.emailPlaceholder}
                        className="mt-2 w-full rounded-xl border bg-white px-3 py-3 text-base"
                        style={{ borderColor: BORDER }}
                      />
                      <p className="mt-2 text-[13px] text-gray-600">
                        {copy.guestHint}
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
                onClick={() => beginCheckout("buynow")}
                className="mt-4 w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-60"
                style={{ backgroundColor: AMBER, color: GREEN }}
              >
                {busy
                  ? copy.preparing
                  : !signedIn && !guestMode
                    ? copy.chooseHowToPay
                    : copy.payAmount(formatShopUsd(totals.totalUsd))}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
