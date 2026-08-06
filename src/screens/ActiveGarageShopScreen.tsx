import { useMessages } from "../lib/i18n/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Inbox, ShoppingCart, Share2, Store, Trophy, X } from "lucide-react";
import { GarageBidSheet } from "../components/garage-shop/GarageBidSheet";
import { GarageMakeOfferSheet } from "../components/garage-shop/GarageMakeOfferSheet";
import { GarageMyOfferSheet } from "../components/garage-shop/GarageMyOfferSheet";
import { GarageShelfEditSheet } from "../components/garage-shop/GarageShelfEditSheet";
import { GarageShopItemCard } from "../components/garage-shop/GarageShopItemCard";
import { GarageSharePanel } from "../components/share/GarageSharePanel";
import { getHostPendingOffers, ensureAcceptedOffersInCart } from "../lib/garageOfferStorage";
import { garageDisplayName, garageNameFromDisplayName } from "../lib/garageDisplay";
import { fetchRemoteProfile } from "../lib/supabaseProfile";
import { loadUserProfile } from "../lib/userProfileStorage";
import { resolveGarageAccent } from "../lib/garageIdentity";
import {
  getMyPendingWinnerCheckouts,
  getLotState,
  resolveEndedAuctions,
  resolveExpiredWinnerCheckouts,
} from "../lib/garageAuctionState";
import { hostGarageItemSharePayload, hostGarageSharePayload } from "../lib/garageMarketingShare";
import { garageSaleOpenLabel, getGarageSaleSchedule } from "../lib/garageSaleStorage";
import {
  buyNowGarageItem,
  getCartCount,
  getShopOffer,
  type ShopOffer,
} from "../lib/garageShopStorage";
import { syncGarageFromRemote } from "../lib/repositories/garageRepository";
import {
  fetchActiveListingsForCityRemote,
  fetchListingsByOwnerIdsRemote,
  getActiveRentLocationLabel,
  loadPublishedListings,
} from "../lib/listingStorage";
import { mergeManageableListings } from "../lib/hostAccess";
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
  focusListingId?: string | null;
  onFocusListingHandled?: () => void;
  onBack: () => void;
  onOpenCart: () => void;
  onOpenWinnerCheckout: (listingId: string) => void;
  onOpenHostOffers?: () => void;
  /** Own empty shelf → snap sale flow */
  onStockShelf?: () => void;
};

export function ActiveGarageShopScreen({
  hostId,
  preview = false,
  focusListingId = null,
  onFocusListingHandled,
  onBack,
  onOpenCart,
  onOpenWinnerCheckout,
  onOpenHostOffers,
  onStockShelf,
}: ActiveGarageShopScreenProps) {
  const { common, garageSale } = useMessages();
  const { garageAuction: auctionCopy, garageShare: shareCopy, garageShop: shopCopy } = garageSale;
  const auth = useAuth();
  const ownHostId = resolveHostAccountId(auth.userId);
  const isOwnGarage = hostId === ownHostId;
  const [listings, setListings] = useState<ListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const [bidTarget, setBidTarget] = useState<{ listing: ListingDraft; offer: ShopOffer } | null>(null);
  const [offerTarget, setOfferTarget] = useState<{ listing: ListingDraft; offer: ShopOffer } | null>(null);
  const [myOfferTarget, setMyOfferTarget] = useState<{ listing: ListingDraft; offer: ShopOffer } | null>(null);
  const [editTarget, setEditTarget] = useState<ListingDraft | null>(null);
  const [shareItemTarget, setShareItemTarget] = useState<ListingDraft | null>(null);
  const [shareGarageOpen, setShareGarageOpen] = useState(false);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [pendingOfferCount, setPendingOfferCount] = useState(() => getHostPendingOffers(hostId).length);
  const [toast, setToast] = useState<string | null>(null);
  const [pendingWins, setPendingWins] = useState(() => getMyPendingWinnerCheckouts());
  const seenPendingWinIdsRef = useRef<Set<string>>(new Set());
  const city = getActiveRentLocationLabel().trim();
  const [garageName, setGarageName] = useState(() => garageDisplayName(hostId));
  const shopAccent = useMemo(() => {
    if (!isOwnGarage) return { color: GREEN, soft: `${GREEN}14` };
    return {
      color: resolveGarageAccent(loadUserProfile().garageIdentity).color,
      soft: resolveGarageAccent(loadUserProfile().garageIdentity).soft,
    };
  }, [isOwnGarage, garageName]);
  const [openLabel, setOpenLabel] = useState(() => garageSaleOpenLabel(getGarageSaleSchedule()));

  useEffect(() => {
    let mounted = true;
    try {
      const self = loadUserProfile();
      if (self.id === hostId && self.displayName?.trim()) {
        setGarageName(garageNameFromDisplayName(self.displayName));
        return;
      }
    } catch {
      /* ignore */
    }
    void fetchRemoteProfile(hostId).then((remote) => {
      if (!mounted) return;
      if (remote?.display_name?.trim()) {
        setGarageName(garageNameFromDisplayName(remote.display_name));
      }
    });
    return () => {
      mounted = false;
    };
  }, [hostId]);

  const garageSharePayload = useMemo(
    () =>
      hostGarageSharePayload({
        hostId,
        listingCount: listings.length,
        openUntilLabel: openLabel,
      }),
    [hostId, listings.length, openLabel],
  );

  const itemSharePayload = useMemo(
    () => (shareItemTarget ? hostGarageItemSharePayload({ hostId, listing: shareItemTarget }) : null),
    [hostId, shareItemTarget],
  );

  const refreshCartCount = useCallback(() => setCartCount(getCartCount()), []);
  const refreshPendingWins = useCallback(() => setPendingWins(getMyPendingWinnerCheckouts()), []);
  const refreshOfferCount = useCallback(
    () => setPendingOfferCount(getHostPendingOffers(hostId).length),
    [hostId],
  );

  const loadOwnShelfCandidates = useCallback(async () => {
    const localOwned = loadPublishedListings().filter(
      (listing) =>
        listing.listingStatus === "active" &&
        (listing.hostId ?? "") === hostId &&
        (listing.modes.sell || listing.modes.rent),
    );
    let remoteOwned: ListingDraft[] = [];
    try {
      remoteOwned = (await fetchListingsByOwnerIdsRemote([hostId])).filter(
        (listing) =>
          listing.listingStatus === "active" && (listing.modes.sell || listing.modes.rent),
      );
    } catch {
      remoteOwned = [];
    }
    return mergeManageableListings(localOwned, remoteOwned);
  }, [hostId]);

  const loadShelf = useCallback(() => {
    const applyCandidates = async (candidates: ListingDraft[]) => {
      const listingIds = candidates.map((listing) => listing.id);
      await syncGarageFromRemote({ hostId, userId: auth.userId, listingIds });
      resolveEndedAuctions(listingIds);
      resolveExpiredWinnerCheckouts(listingIds);
      // Keep sold lots + rent items (no shop offer) + sell items with offers.
      const shelf = candidates.filter((listing) => {
        if (getShopOffer(listing)) return true;
        if (listing.modes.rent) return true;
        if (getLotState(listing.id).status === "sold") return true;
        return false;
      });
      if (!preview) {
        const sellShelf = shelf.filter((listing) => getShopOffer(listing));
        const added = ensureAcceptedOffersInCart(sellShelf);
        if (added) refreshCartCount();
      }
      setListings(shelf);
      refreshPendingWins();
      refreshOfferCount();
      setLoading(false);
    };

    if (isOwnGarage) {
      void loadOwnShelfCandidates().then(applyCandidates);
      return;
    }

    void fetchActiveListingsForCityRemote(city).then(async (all) => {
      const candidates = all.filter(
        (listing) =>
          listing.listingStatus === "active" &&
          (listing.hostId ?? "") === hostId &&
          (listing.modes.sell || listing.modes.rent),
      );
      await applyCandidates(candidates);
    });
  }, [
    auth.userId,
    city,
    hostId,
    isOwnGarage,
    loadOwnShelfCandidates,
    preview,
    refreshCartCount,
    refreshPendingWins,
    refreshOfferCount,
  ]);

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
    window.addEventListener("evorios-garage-offers-neighbor", onChange);
    return () => {
      window.removeEventListener("evorios-garage-cart", onChange);
      window.removeEventListener("evorios-garage-bids", onChange);
      window.removeEventListener("evorios-garage-lots", onChange);
      window.removeEventListener("evorios-garage-offers-neighbor", onChange);
    };
  }, [loadShelf, refreshCartCount]);

  useEffect(() => {
    setLoading(true);
    loadShelf();
  }, [loadShelf]);

  useEffect(() => {
    if (preview) return undefined;
    const timer = window.setInterval(() => loadShelf(), 30_000);
    return () => window.clearInterval(timer);
  }, [loadShelf, preview]);

  useEffect(() => {
    if (!focusListingId || loading) return;
    const node = itemRefs.current.get(focusListingId);
    if (!node) return;
    window.requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      onFocusListingHandled?.();
    });
  }, [focusListingId, loading, listings, onFocusListingHandled]);

  useEffect(() => {
    if (preview || pendingWins.length === 0) return;
    const fresh = pendingWins.find(
      (win) => !seenPendingWinIdsRef.current.has(`${win.listingId}:${win.runnerUpAttempt}`),
    );
    if (!fresh) return;
    seenPendingWinIdsRef.current.add(`${fresh.listingId}:${fresh.runnerUpAttempt}`);
    onOpenWinnerCheckout(fresh.listingId);
  }, [pendingWins, preview, onOpenWinnerCheckout]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const localizeBuyNowReason = (reason: string) => {
    if (/already in cart/i.test(reason)) return shopCopy.alreadyInCart;
    if (/no longer available/i.test(reason)) return shopCopy.itemUnavailable;
    if (/buy now paused/i.test(reason)) return shopCopy.buyNowPaused;
    if (/deal pending payment/i.test(reason)) return shopCopy.dealPendingPayment;
    if (/one garage at a time/i.test(reason)) return shopCopy.cartOneGarage;
    return reason;
  };

  const handleBuyNow = (listing: ListingDraft, offer: ShopOffer) => {
    if (preview) return;
    const result = buyNowGarageItem({ listing, offer });
    if (!result.ok) {
      if (/already in cart/i.test(result.reason)) {
        showToast(shopCopy.alreadyInCart);
        onOpenCart();
        return;
      }
      showToast(localizeBuyNowReason(result.reason));
      return;
    }
    refreshCartCount();
    loadShelf();
    showToast(shopCopy.addedToCart);
    onOpenCart();
  };

  const handleBidPlaced = () => {
    loadShelf();
    pushInAppNotification({
      type: "general",
      title: shopCopy.bidPlacedTitle,
      body: shopCopy.bidPlacedBody,
    });
    showToast(shopCopy.bidPlacedToast);
  };

  const handleOfferSubmitted = () => {
    loadShelf();
    showToast(shopCopy.offerSentToast);
  };

  return (
    <div className="screen garage-shop-screen flex flex-col overflow-hidden bg-[#FFF9F0]">
      <header
        className="shrink-0 border-b px-4 pb-3 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]"
        style={{ borderColor: `${AMBER}44`, backgroundColor: "#fff" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-white active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label={common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold sm:text-2xl" style={{ color: shopAccent.color }}>
                {isOwnGarage && !preview ? shopCopy.myActiveGarage : garageName}
              </h1>
              <span
                className="rounded-full px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: AMBER, color: GREEN }}
              >
                {shopCopy.openBadge}
              </span>
            </div>
            <p className="text-[15px] text-gray-700">{openLabel}</p>
          </div>
          {!preview ? (
            <div className="flex items-center gap-1.5">
              {isOwnGarage ? (
                <button
                  type="button"
                  onClick={() => setShareGarageOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-white"
                  style={{ borderColor: BORDER }}
                  aria-label={shopCopy.shareGarageAria}
                >
                  <Share2 className="h-5 w-5" style={{ color: GREEN }} />
                </button>
              ) : null}
              {isOwnGarage && onOpenHostOffers ? (
                <button
                  type="button"
                  onClick={onOpenHostOffers}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-white"
                  style={{ borderColor: BORDER }}
                  aria-label={shopCopy.offersAria(pendingOfferCount)}
                >
                  <Inbox className="h-5 w-5" style={{ color: GREEN }} />
                  {pendingOfferCount > 0 ? (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                      style={{ backgroundColor: AMBER, color: GREEN }}
                    >
                      {pendingOfferCount}
                    </span>
                  ) : null}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onOpenCart}
                className="relative flex h-11 items-center justify-center gap-1.5 rounded-full border bg-white px-3"
                style={{
                  borderColor: cartCount > 0 ? GREEN : BORDER,
                  backgroundColor: cartCount > 0 ? `${GREEN}12` : "#fff",
                }}
                aria-label={shopCopy.cartAria(cartCount)}
              >
                <ShoppingCart className="h-5 w-5 shrink-0" style={{ color: GREEN }} />
                <span className="text-sm font-bold" style={{ color: GREEN }}>
                  {shopCopy.cartLabel}
                </span>
                {cartCount > 0 ? (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                    style={{ backgroundColor: GREEN }}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium leading-snug"
          style={{ backgroundColor: `${GREEN}10`, color: GREEN }}
        >
          <Store className="h-4 w-4 shrink-0" aria-hidden />
          {preview
            ? shopCopy.neighborViewBanner
            : isOwnGarage
              ? shareCopy.shopBannerHost
              : auctionCopy.shopBanner}
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
                  {shopCopy.winPayLine(
                    win.runnerUpAttempt > 1 ? shopCopy.nextBidderPrefix : shopCopy.youWonPrefix,
                    win.winningBidUsd,
                    auctionCopy.winBannerSuffix,
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
        {loading ? (
          <p className="py-16 text-center text-gray-500">{shopCopy.loadingShelf}</p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center" style={{ borderColor: BORDER }}>
            <p className="text-lg font-bold text-gray-900">{shopCopy.emptyTitle}</p>
            <p className="mt-2 text-[15px] text-gray-600">
              {isOwnGarage ? shopCopy.emptyOwnBody : shopCopy.emptyNeighborBody}
            </p>
            {isOwnGarage && onStockShelf && !preview ? (
              <button
                type="button"
                onClick={onStockShelf}
                className="mt-4 w-full rounded-xl py-3.5 text-base font-bold"
                style={{ backgroundColor: AMBER, color: GREEN }}
              >
                {shopCopy.snapOntoShelf}
              </button>
            ) : !isOwnGarage ? (
              <button
                type="button"
                onClick={onBack}
                className="mt-4 w-full rounded-xl border py-3.5 text-base font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {shopCopy.backToYardSales}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="garage-shop-grid grid grid-cols-2 gap-2.5">
            {listings.map((listing) => (
              <div
                key={listing.id}
                ref={(node) => {
                  if (node) itemRefs.current.set(listing.id, node);
                  else itemRefs.current.delete(listing.id);
                }}
                className={
                  focusListingId === listing.id
                    ? "rounded-2xl ring-2 ring-offset-2"
                    : undefined
                }
                style={
                  focusListingId === listing.id
                    ? ({ "--tw-ring-color": AMBER } as React.CSSProperties)
                    : undefined
                }
              >
                <GarageShopItemCard
                  listing={listing}
                  preview={preview}
                  hostManage={isOwnGarage && !preview}
                  onBuyNow={handleBuyNow}
                  onBid={(item, offer) => setBidTarget({ listing: item, offer })}
                  onMakeOffer={(item, offer) => setOfferTarget({ listing: item, offer })}
                  onViewMyOffer={(item, offer) => setMyOfferTarget({ listing: item, offer })}
                  onEdit={(item) => setEditTarget(item)}
                  onShare={isOwnGarage && !preview ? (item) => setShareItemTarget(item) : undefined}
                />
              </div>
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

      {offerTarget && !preview ? (
        <GarageMakeOfferSheet
          listing={offerTarget.listing}
          offer={offerTarget.offer}
          onClose={() => setOfferTarget(null)}
          onSubmitted={handleOfferSubmitted}
        />
      ) : null}

      {myOfferTarget && !preview ? (
        <GarageMyOfferSheet
          listing={myOfferTarget.listing}
          offer={myOfferTarget.offer}
          onClose={() => setMyOfferTarget(null)}
          onUpdated={() => loadShelf()}
          onOpenCart={onOpenCart}
        />
      ) : null}

      {editTarget && isOwnGarage && !preview ? (
        <GarageShelfEditSheet
          listing={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            loadShelf();
            showToast(shopCopy.shelfUpdated);
          }}
          onRemoved={() => {
            loadShelf();
            showToast(shopCopy.removedFromShelf);
          }}
        />
      ) : null}

      {shareGarageOpen && isOwnGarage ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <div className="max-h-[85dvh] w-full overflow-y-auto rounded-2xl bg-[#FFF9F0] p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">{shareCopy.openGarageTitle}</h2>
              <button type="button" onClick={() => setShareGarageOpen(false)} aria-label={common.close}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <GarageSharePanel
              title={shareCopy.openGarageTitle}
              payload={garageSharePayload}
              shareKind="garage"
              targetId={hostId}
              defaultOpen
            />
          </div>
        </div>
      ) : null}

      {shareItemTarget && itemSharePayload ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <div className="max-h-[85dvh] w-full overflow-y-auto rounded-2xl bg-[#FFF9F0] p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">{shareCopy.itemTitle}</h2>
              <button type="button" onClick={() => setShareItemTarget(null)} aria-label={common.close}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <GarageSharePanel
              title={shareCopy.itemTitle}
              payload={itemSharePayload}
              shareKind="shelf"
              targetId={shareItemTarget.id}
              defaultOpen
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
