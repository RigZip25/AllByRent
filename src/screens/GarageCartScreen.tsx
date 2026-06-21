import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  clearGarageCart,
  formatShopUsd,
  getCartLines,
  getCartTotals,
  removeFromGarageCart,
} from "../lib/garageShopStorage";
import { garageDisplayName } from "../lib/garageDisplay";
import { useMediaUrl } from "../lib/useMediaUrl";
import { pushInAppNotification } from "../lib/inAppNotifications";

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

  const refresh = () => setLines(getCartLines());

  useEffect(() => {
    window.addEventListener("evorios-garage-cart", refresh);
    return () => window.removeEventListener("evorios-garage-cart", refresh);
  }, []);

  const checkout = () => {
    pushInAppNotification({
      type: "general",
      title: "Order placed (demo)",
      body: `${totals.lineCount} item(s) from ${garageName} — Stripe checkout ships next.`,
    });
    clearGarageCart();
    onCheckoutComplete();
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
      </div>

      {lines.length > 0 ? (
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
          <button
            type="button"
            onClick={checkout}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            Checkout · demo
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-500">
            One cart per garage · winning auction lots checkout separately later
          </p>
        </div>
      ) : null}
    </div>
  );
}
