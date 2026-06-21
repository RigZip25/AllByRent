import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart, Store, Trophy } from "lucide-react";
import { GarageBidSheet } from "../components/garage-shop/GarageBidSheet";
import { GarageShopItemCard } from "../components/garage-shop/GarageShopItemCard";
import { garageDisplayName } from "../lib/garageDisplay";
import {
  getMyPendingWinnerCheckouts,
  resolveEndedAuctions,
  resolveExpiredWinnerCheckouts,
} from "../lib/garageAuctionState";
import { garageSaleOpenLabel, getGarageSaleSchedule } from "../lib/garageSaleStorage";
import {
  buyNowGarageItem,
  getCartCount,
  getShopOffer,
  type ShopOffer,
} from "../lib/garageShopStorage";
import { fetchActiveListingsForCityRemote, getActiveRentLocationLabel } from "../lib/listingStorage";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { useAuth } from "../hooks/AuthProvider";
import type { ListingDraft } from "./listing/types";
import { pushInAppNotification } from "../lib/inAppNotifications";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";

type ActiveGarageShopScreenProps = {
  hostId: string;
  preview?: boolean;
  onBack: () => void;
  onOpenCart: () => void;
  onOpenWinnerCheckout: (listingId: string) => void;
};

export function ActiveGarageShopScreen({
  hostId,
  preview = false,
  onBack,
  onOpenCart,
  onOpenWinnerCheckout,
}: ActiveGarageShopScreenProps) {
  const ownHostId = resolveHostAccountId(useAuth().userId);
  const isOwnGarage = hostId === ownHostId;
  const [listings, setListings] = useState<ListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [bidTarget, setBidTarget] = useState<{ listing: ListingDraft; offer: ShopOffer } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingWins, setPendingWins] = useState(() => getMyPendingWinnerCheckouts());
  const city = getActiveRentLocationLabel().trim();
  const garageName = useMemo(() => garageDisplayName(hostId), [hostId]);
  const [openLabel, setOpenLabel] = useState(() => garageSaleOpenLabel(getGarageSaleSchedule()));

  const refreshCartCount = useCallback(() => setCartCount(getCartCount()), []);
  const refreshPendingWins = useCallback(() => setPendingWins(getMyPendingWinnerCheckouts()), []);

  const loadShelf = useCallback(() => {
    void fetchActiveListingsForCityRemote(city).then((all) => {
      const candidates = all.filter(
        (listing) =>
          listing.listingStatus === "active" &&
          (listing.hostId ?? "demo-user") === hostId &&
          listing.modes.sell,
      );
      const listingIds = candidates.map((listing) => listing.id);
      resolveEndedAuctions(listingIds);
      resolveExpiredWinnerCheckouts(listingIds);
      const shelf = candidates.filter((listing) => getShopOffer(listing));
      setListings(shelf);
      refreshPendingWins();
    });
  }, [city, hostId, refreshPendingWins]);

  useEffect(() => {
    const syncSchedule = () => setOpenLabel(garageSaleOpenLabel(getGarageSaleSchedule()));
    window.addEventListener("evorios-garage-schedule", syncSchedule);
    return () => window.removeEventListener("evorios-garage-schedule", syncSchedule);
  }, []);

  useEffect(() => {
    const onChange = () => {
      refreshCartCount();
      loadShelf();
    };
    window.addEventListener("evorios-garage-cart", onChange);
    window.addEventListener("evorios-garage-bids", onChange);
    window.addEventListener("evorios-garage-lots", onChange);
    return () => {
      window.removeEventListener("evorios-garage-cart", onChange);
      window.removeEventListener("evorios-garage-bids", onChange);
      window.removeEventListener("evorios-garage-lots", onChange);
    };
  }, [loadShelf, refreshCartCount]);

  useEffect(() => {
    let mounted = true;
    void fetchActiveListingsForCityRemote(city)
      .then((all) => {
        if (!mounted) return;
        const candidates = all.filter(
          (listing) =>
            listing.listingStatus === "active" &&
            (listing.hostId ?? "demo-user") === hostId &&
            listing.modes.sell,
        );
        const listingIds = candidates.map((listing) => listing.id);
        resolveEndedAuctions(listingIds);
        resolveExpiredWinnerCheckouts(listingIds);
        setListings(candidates.filter((listing) => getShopOffer(listing)));
        refreshPendingWins();
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [city, hostId, refreshPendingWins]);

  useEffect(() => {
    if (preview) return undefined;
    const timer = window.setInterval(() => loadShelf(), 30_000);
    return () => window.clearInterval(timer);
  }, [loadShelf, preview]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleBuyNow = (listing: ListingDraft, offer: ShopOffer) => {
    if (preview) return;
    const result = buyNowGarageItem({ listing, offer });
    if (!result.ok) {
      showToast(result.reason);
      return;
    }
    refreshCartCount();
    loadShelf();
    showToast("Reserved — in your cart");
  };

  const handleBidPlaced = () => {
    loadShelf();
    pushInAppNotification({
      type: "general",
      title: "Bid placed",
      body: "We'll notify you if you're outbid or when the auction ends.",
    });
    showToast("Bid placed — good luck!");
  };

  return (
    <div className="screen garage-shop-screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <header
        className="shrink-0 border-b px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
        style={{ borderColor: `${AMBER}44`, backgroundColor: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold" style={{ color: GREEN }}>
                {isOwnGarage ? "My active garage" : garageName}
              </h1>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: AMBER, color: GREEN }}
              >
                Open
              </span>
            </div>
            <p className="text-[13px] text-gray-600">{openLabel}</p>
          </div>
          {!preview ? (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-white"
              style={{ borderColor: BORDER }}
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" style={{ color: GREEN }} />
              {cartCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {cartCount}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>

        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium"
          style={{ backgroundColor: `${GREEN}10`, color: GREEN }}
        >
          <Store className="h-4 w-4 shrink-0" aria-hidden />
          {preview
            ? "Shop preview — neighbors see photo + price, Buy now or Bid, and a shared cart."
            : "Buy now removes the lot · Auction ends → winner pays separately"}
        </div>

        {!preview && pendingWins.length > 0 ? (
          <div className="mt-2 space-y-2">
            {pendingWins.map((win) => (
              <button
                key={win.listingId}
                type="button"
                onClick={() => onOpenWinnerCheckout(win.listingId)}
                className="flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left"
                style={{ borderColor: `${AMBER}88`, backgroundColor: `${AMBER}15` }}
              >
                <Trophy className="h-5 w-5 shrink-0" style={{ color: AMBER }} />
                <span className="min-w-0 flex-1 text-[13px] font-semibold text-gray-900">
                  You won — pay ${win.winningBidUsd} to claim
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        {loading ? (
          <p className="py-16 text-center text-gray-500">Loading shelf…</p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center" style={{ borderColor: BORDER }}>
            <p className="text-base font-bold text-gray-900">Shelf is empty</p>
            <p className="mt-2 text-sm text-gray-500">
              {isOwnGarage
                ? "Snap sale items from Open my garage — one photo and a price each."
                : "No sale items listed right now."}
            </p>
          </div>
        ) : (
          <div className="garage-shop-grid grid grid-cols-2 gap-2.5">
            {listings.map((listing) => (
              <GarageShopItemCard
                key={listing.id}
                listing={listing}
                preview={preview}
                onBuyNow={handleBuyNow}
                onBid={(item, offer) => setBidTarget({ listing: item, offer })}
              />
            ))}
          </div>
        )}
      </div>

      {toast ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {bidTarget && !preview ? (
        <GarageBidSheet
          listing={bidTarget.listing}
          offer={bidTarget.offer}
          onClose={() => setBidTarget(null)}
          onBidPlaced={handleBidPlaced}
        />
      ) : null}
    </div>
  );
}
