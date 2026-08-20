import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Star,
  QrCode,
  Shield,
  Truck,
  Headphones,
  ScanLine,
  MessageCircle,
  CheckCircle2,
  Share2,
  Calendar,
  Camera,
  Heart,
  Package,
  X,
} from "lucide-react";
import {
  isFavoriteListing,
  toggleFavoriteListingForUser,
} from "../../lib/favoritesStorage";
import { useAuth } from "../../hooks/AuthProvider";
import { SignInPrompt } from "../../components/SignInPrompt";
import {
  fetchListingByIdRemote,
  getActiveRentLocationLabel,
  getPublishedListingById,
} from "../../lib/listingStorage";
import { isBorrowedByViewer } from "../../lib/borrowedItemGuard";
import { getListingDisplayTitle, listingRequiresQrSticker } from "../../lib/listingQr";
import {
  deliverySummaryForListing,
  listingOffersDelivery,
  parseListingDailyRate,
} from "../../lib/rentalPricing";
import { canBuyNowLot, getLotState, isAuctionTimeActive } from "../../lib/garageAuctionState";
import { isAuctionNotStarted } from "../../lib/garageAuctionWindow";
import { isListingOnOpenSale } from "../../lib/openSale";
import { formatListingPriceLine } from "../../lib/garageDisplay";
import { isFreeGiveaway as isListingFreeGiveaway } from "../../lib/listingGift";
import {
  buyNowGarageItem,
  formatShopUsd,
  getShopOffer,
  type ShopOffer,
} from "../../lib/garageShopStorage";
import { ListingPhotoGallery } from "../../components/listings/ListingPhotoGallery";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";
import { APP_NAME, MASCOT_NAME } from "../../lib/brand";
import { parseUsdToCents } from "../../lib/insurance";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { buildListingSharePayload, listingShareUrl } from "../../lib/socialShare";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import { CategoryFactCard } from "../../components/CategoryFactCard";
import {
  listingIsCommercialTransport,
  listingProRentersOnly,
  listingRequiresCdl,
  listingRequiresPhysicalDamage,
} from "../../lib/listingRentRules";
import {
  listingIsCarSeat,
  listingIsDrone,
  listingRequiresBoaterLicense,
  listingRequiresGuestStartId,
  listingRequiresOperatorCredential,
  listingRequiresDroneCert,
  listingRequiresDriverRecordAttestation,
} from "../../lib/categoryTrustRules";
import { listingRequiresCoiHostConfirm } from "../../lib/listingInsurance";
import type { ListingDraft } from "../../screens/listing/types";
import { AvailabilityCalendar } from "../../components/availability/AvailabilityCalendar";
import {
  fetchListingBusyIntervals,
  type BusyInterval,
} from "../../lib/availabilityBusy";
import {
  categorySupportsTravelOutsideRule,
  formatHomeTerritoryPhrase,
  normalizeTravelOutsideHomeArea,
  resolveHomeTerritory,
} from "../../lib/vehicleHomeTerritory";
import { getSearchCountryCode } from "../../lib/locationCountry";

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
  onBook: () => void;
  onOpenGarageCart?: () => void;
  onOpenGarageShop?: (hostId: string, listingId: string) => void;
  onOpenAttachment: (url: string, title?: string) => void;
  onViewHostProfile?: (hostId: string) => void;
  /** Open in-app chat with the listing host (sell / gift). */
  onOpenListingChat?: (listingId: string, hostId: string) => void;
}

function AvailabilityPanel({
  listing,
  onClose,
}: {
  listing: ListingDraft;
  onClose: () => void;
}) {
  const t = useMessages();
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [busyLoading, setBusyLoading] = useState(true);
  const dragStartY = useRef<number | null>(null);
  const weekday =
    listing.handoff.inPersonTimeStart && listing.handoff.inPersonTimeEnd
      ? `${listing.handoff.inPersonTimeStart}–${listing.handoff.inPersonTimeEnd}`
      : null;
  const weekend =
    listing.handoff.inPersonWeekendTimeStart && listing.handoff.inPersonWeekendTimeEnd
      ? `${listing.handoff.inPersonWeekendTimeStart}–${listing.handoff.inPersonWeekendTimeEnd}`
      : null;

  useEffect(() => {
    let mounted = true;
    setBusyLoading(true);
    void fetchListingBusyIntervals(listing.id, listing.blockedDates).then((result) => {
      if (!mounted) return;
      setBusy(result.intervals);
      setBusyLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [listing.id, listing.blockedDates]);

  // Escape + lock background scroll so iOS overscroll doesn't trap the user.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const onDragHandleTouchStart = (event: TouchEvent) => {
    dragStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onDragHandleTouchEnd = (event: TouchEvent) => {
    const startY = dragStartY.current;
    dragStartY.current = null;
    if (startY == null) return;
    const endY = event.changedTouches[0]?.clientY;
    if (endY == null) return;
    // Swipe down on the sheet chrome closes; body scroll stays independent.
    if (endY - startY > 72) onClose();
  };

  const panel = (
    <div
      className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/45"
      role="presentation"
    >
      <button
        type="button"
        className="min-h-0 flex-1 w-full cursor-default"
        aria-label={t.item.closeAvailabilityAria}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.item.availability}
        className="relative mx-auto flex max-h-[min(92dvh,720px)] w-full max-w-[430px] flex-col rounded-t-3xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="shrink-0 border-b border-border bg-card px-4 pb-3 pt-2"
          onTouchStart={onDragHandleTouchStart}
          onTouchEnd={onDragHandleTouchEnd}
        >
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-muted-foreground/35" aria-hidden />
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t.item.availability}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted"
              aria-label={t.item.closeAvailabilityAria}
            >
              <X className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-3">
          {listing.paused ? (
            <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t.item.pausedAvailabilityBanner}
            </p>
          ) : (
            <p className="mb-3 text-sm text-muted-foreground">{t.item.pickupWindowsHint}</p>
          )}

          <AvailabilityCalendar busyIntervals={busy} readOnly loading={busyLoading} />

          <dl className="mt-4 space-y-2 text-sm">
            {weekday ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.item.weekdays}</dt>
                <dd className="font-medium">{weekday}</dd>
              </div>
            ) : null}
            {weekend ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t.item.weekends}</dt>
                <dd className="font-medium">{weekend}</dd>
              </div>
            ) : null}
          </dl>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary mt-4 w-full rounded-xl py-3 font-semibold text-white"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}

export function ItemDetail({
  itemId,
  onBack,
  onBook,
  onOpenGarageCart,
  onOpenGarageShop,
  onOpenAttachment,
  onViewHostProfile,
  onOpenListingChat,
}: ItemDetailProps) {
  const auth = useAuth();
  const t = useMessages();
  const [favorited, setFavorited] = useState(() => isFavoriteListing(itemId));
  const [shareOpen, setShareOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [messageHint, setMessageHint] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [listing, setListing] = useState<ListingDraft | null>(() => getPublishedListingById(itemId));
  const [loading, setLoading] = useState(() => !getPublishedListingById(itemId));

  useEffect(() => {
    let mounted = true;
    void fetchListingByIdRemote(itemId).then((next) => {
      if (!mounted) return;
      setListing(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [itemId]);

  const cover = listing?.photos?.[0] ?? null;
  const coverUrl = useCoverMediaUrl(cover).url;
  const photoCount = listing?.photos?.length ?? 0;

  const title = listing
    ? getListingDisplayTitle(listing.title) || listing.title || t.item.listingFallback
    : t.item.listingFallback;
  const dailyRate = listing ? parseListingDailyRate(listing.pricing.dailyRate) || 0 : 0;
  const priceLine = listing ? formatListingPriceLine(listing) : "";
  const deliverySummary = listing ? deliverySummaryForListing(listing) : null;
  const hasDelivery = listing ? listingOffersDelivery(listing) : false;
  const isHeavy = listing?.handoff.itemHeavy ?? false;
  const canTransact = Boolean(listing && listing.listingStatus === "active" && !listing.paused);
  const lotState = listing ? getLotState(listing.id) : null;
  const isSold = lotState?.status === "sold";

  const shopOffer: ShopOffer | null = useMemo(() => {
    if (!listing?.modes.sell || !canBuyNowLot(listing.id)) return null;
    return getShopOffer(listing);
  }, [listing]);

  const multiAuction = shopOffer?.negotiationPhase === "multi_auction";
  const auctionLive = Boolean(
    shopOffer && multiAuction && isAuctionTimeActive(shopOffer.startsAt, shopOffer.endsAt),
  );
  const auctionPending = Boolean(
    shopOffer && multiAuction && isAuctionNotStarted({ startsAt: shopOffer.startsAt, endsAt: shopOffer.endsAt }),
  );
  const auctionEnded = Boolean(shopOffer && multiAuction && !auctionLive && !auctionPending);
  const buyBlockedByAuction = Boolean(multiAuction && (auctionLive || auctionEnded));

  const canRent = Boolean(canTransact && listing && (listing.modes.rent || listing.modes.rentToOwn));
  const isFreeGiveaway = Boolean(
    canTransact &&
      listing &&
      isListingFreeGiveaway(listing) &&
      !isSold &&
      !buyBlockedByAuction,
  );
  const onOpenSale = Boolean(listing && isListingOnOpenSale(listing.id));
  const canBuy = Boolean(
    canTransact &&
      listing?.modes.sell &&
      shopOffer &&
      shopOffer.buyNowUsd > 0 &&
      !buyBlockedByAuction &&
      !isSold &&
      !onOpenSale,
  );
  const showGarageForAuction = Boolean(
    listing?.modes.sell &&
      ((shopOffer && buyBlockedByAuction) || onOpenSale) &&
      !isSold &&
      listing.hostId,
  );

  const sharePayload = useMemo(() => {
    const city = getActiveRentLocationLabel().trim();
    return buildListingSharePayload({
      title,
      dailyRate: String(dailyRate || "—"),
      url: listingShareUrl(itemId),
      city: city || undefined,
    });
  }, [dailyRate, itemId, title]);

  const handleToggleFavorite = () => {
    void toggleFavoriteListingForUser(auth.userId, itemId).then(setFavorited);
  };

  const needsQr = listing ? listingRequiresQrSticker(listing.modes) : false;
  const isSellOnly = Boolean(
    listing?.modes.sell && !listing.modes.rent && !listing.modes.rentToOwn,
  );

  const handleMessageHost = () => {
    if (canRent) {
      setMessageHint(true);
      onBook();
      return;
    }
    if (listing?.modes.sell || listing?.modes.gift) {
      if (!listing.hostId) {
        setBuyError(t.item.sellerMissing);
        return;
      }
      if (!auth.userId) {
        setMessageHint(true);
        setBuyError(t.item.signInToMessage);
        return;
      }
      if (listing.hostId === auth.userId) {
        setBuyError(t.item.yourListing);
        return;
      }
      onOpenListingChat?.(listing.id, listing.hostId);
    }
  };

  const handleBuy = () => {
    if (!listing || !shopOffer) return;
    if (buyBlockedByAuction) {
      onOpenGarageShop?.(listing.hostId ?? "", listing.id);
      return;
    }
    const result = buyNowGarageItem({ listing, offer: shopOffer });
    if (!result.ok) {
      setBuyError(result.reason);
      if (/already in cart/i.test(result.reason)) {
        onOpenGarageCart?.();
        return;
      }
      if (/auction/i.test(result.reason)) {
        onOpenGarageShop?.(listing.hostId ?? "", listing.id);
      }
      return;
    }
    setBuyError(null);
    onOpenGarageCart?.();
  };

  if (loading) {
    return (
      <div className="screen flex flex-col bg-background">
        <div className="shrink-0 border-b border-border px-4 py-3">
          <button type="button" onClick={onBack} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          {t.item.loading}
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="screen flex flex-col bg-background">
        <div className="shrink-0 border-b border-border px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 hover:bg-muted rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold flex-1">{t.item.notFound}</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            {t.item.removedBody}
          </p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white"
          >
            {t.item.goBack}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1 truncate">{title}</h1>
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label={favorited ? t.item.removeFavoriteAria : t.item.addFavoriteAria}
        >
          <Heart
            className={`w-5 h-5 ${favorited ? "fill-[#E11D48] text-[#E11D48]" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <div className="screen-scroll flex-1 min-h-0 pb-24">
        <div className="relative aspect-square bg-[#F0F4F2] flex flex-col items-center justify-center gap-3 overflow-hidden">
          {coverUrl ? (
            <button
              type="button"
              onClick={() => setGalleryIndex(0)}
              className="absolute inset-0"
              aria-label={
                photoCount > 1
                  ? t.item.openPhotoGalleryAria(photoCount)
                  : t.item.openPhotoAria
              }
            >
              <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </button>
          ) : (
            <>
              <Camera className="w-16 h-16 text-primary" />
              <span className="text-sm text-muted-foreground">{t.item.photoByOwner}</span>
            </>
          )}

          {photoCount > 1 ? (
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
              {t.item.photoCountBadge(photoCount)}
            </div>
          ) : null}

          {(listing.modes.rent || listing.modes.rentToOwn) &&
          parseUsdToCents(listing.pricing.securityDeposit ?? "") >= 50 ? (
            <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>{t.item.depositProtection}</span>
            </div>
          ) : null}

          {isHeavy ? (
            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-amber-500/95 px-2.5 py-1.5 text-xs font-semibold text-white">
              <Package className="h-3.5 w-3.5" aria-hidden />
              {t.item.heavyItem}
            </div>
          ) : null}
        </div>

        {galleryIndex !== null && listing.photos.length > 0 ? (
          <ListingPhotoGallery
            photos={listing.photos}
            index={galleryIndex}
            onClose={() => setGalleryIndex(null)}
            onIndexChange={setGalleryIndex}
          />
        ) : null}

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {[listing.category, listing.subcategory]
                    .filter(Boolean)
                    .map((label) => localizeCategoryLabel(label!))
                    .join(" · ")}
                </p>
              </div>
              <div className="text-right shrink-0">
                {priceLine && priceLine !== "—" ? (
                  <p className="text-2xl font-bold text-primary">{priceLine}</p>
                ) : dailyRate > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-primary">${dailyRate}</p>
                    <p className="text-xs text-muted-foreground">{t.item.perDay}</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">{t.item.askOwner}</p>
                )}
              </div>
            </div>
            {listing.category.trim() === "Vehicles" && listing.modes.rent ? (
              <CategoryFactCard
                category="Vehicles"
                subcategory={listing.subcategory}
                commercialTransport={listingIsCommercialTransport(listing)}
                className="mt-3"
              />
            ) : null}
            {(listing.category.trim() === "Heavy Equipment" ||
              listing.category.trim() === "Construction") &&
            listing.modes.rent ? (
              <CategoryFactCard
                category={listing.category.trim()}
                subcategory={
                  listing.category.trim() === "Construction"
                    ? listing.subcategory
                    : undefined
                }
                className="mt-3"
              />
            ) : null}
            {listing.category.trim() === "Boats & Water" && listing.modes.rent ? (
              <CategoryFactCard category="Boats & Water" className="mt-3" />
            ) : null}
            {listing.category.trim() === "Real Estate" && listing.modes.rent ? (
              <CategoryFactCard category="Real Estate" className="mt-3" />
            ) : null}
            {listingIsDrone(listing) && listing.modes.rent ? (
              <CategoryFactCard category="Photo & Video" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Baby & Kids" ? (
              <CategoryFactCard
                category="Baby & Kids"
                className="mt-3"
              />
            ) : null}
            {listing.modes.rent &&
            (listing.category.trim() === "Photo & Video" ||
              listing.category.trim() === "Electronics & Tech") &&
            !listingIsDrone(listing) ? (
              <CategoryFactCard
                category={
                  listing.category.trim() === "Electronics & Tech"
                    ? "Electronics & Tech"
                    : "Photo & Video"
                }
                className="mt-3"
              />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Gym & Fitness" ? (
              <CategoryFactCard category="Gym & Fitness" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Sports & Recreation" ? (
              <CategoryFactCard category="Sports & Recreation" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Outdoor & Camping" ? (
              <CategoryFactCard category="Outdoor & Camping" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Bikes & Scooters" ? (
              <CategoryFactCard category="Bikes & Scooters" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Party & Events" ? (
              <CategoryFactCard category="Party & Events" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Office & Business" ? (
              <CategoryFactCard category="Office & Business" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Music & Audio" ? (
              <CategoryFactCard category="Music & Audio" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Tools & DIY" ? (
              <CategoryFactCard category="Tools & DIY" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Garden & Yard" ? (
              <CategoryFactCard category="Garden & Yard" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Home & Kitchen" ? (
              <CategoryFactCard category="Home & Kitchen" className="mt-3" />
            ) : null}
            {listing.modes.rent && listing.category.trim() === "Costume & Cosplay" ? (
              <CategoryFactCard
                category="Costume & Cosplay"
                subcategory={listing.subcategory}
                className="mt-3"
              />
            ) : null}
            {listing.modes.rent &&
            (listingProRentersOnly(listing) ||
              listingRequiresPhysicalDamage(listing) ||
              listingRequiresCdl(listing) ||
              listingRequiresOperatorCredential(listing) ||
              listingRequiresBoaterLicense(listing) ||
              listingRequiresDroneCert(listing) ||
              listingIsCarSeat(listing) ||
              listingRequiresGuestStartId(listing) ||
              listingIsCommercialTransport(listing) ||
              listingRequiresDriverRecordAttestation(listing) ||
              listingRequiresCoiHostConfirm(listing)) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {listingProRentersOnly(listing) ? (
                  <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-950">
                    {t.booking.proBadge}
                  </span>
                ) : null}
                {listingRequiresPhysicalDamage(listing) ? (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-950">
                    {t.booking.physicalDamageBadge}
                  </span>
                ) : null}
                {listingRequiresCdl(listing) ? (
                  <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-950">
                    {t.booking.cdlBadge}
                  </span>
                ) : null}
                {listingRequiresOperatorCredential(listing) ? (
                  <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-950">
                    {t.booking.operatorCertBadge}
                  </span>
                ) : null}
                {listingRequiresBoaterLicense(listing) ? (
                  <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-950">
                    {t.booking.boaterLicenseBadge}
                  </span>
                ) : null}
                {listingRequiresDroneCert(listing) ? (
                  <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-950">
                    {t.booking.droneCertBadge}
                  </span>
                ) : null}
                {listingIsCarSeat(listing) ? (
                  <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-950">
                    {t.booking.carSeatSafetyBadge}
                  </span>
                ) : null}
                {listingRequiresGuestStartId(listing) ? (
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-950">
                    {t.booking.guestIdBadge}
                  </span>
                ) : null}
                {listingIsCommercialTransport(listing) ? (
                  <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-950">
                    {t.booking.commercialTransportBadge}
                  </span>
                ) : null}
                {listingRequiresDriverRecordAttestation(listing) ? (
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-950">
                    {t.booking.driverRecordBadge}
                  </span>
                ) : null}
                {listingRequiresCoiHostConfirm(listing) ? (
                  <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-950">
                    {t.booking.coiStructuredBadge}
                  </span>
                ) : null}
              </div>
            ) : null}
            {listing.modes.rent && categorySupportsTravelOutsideRule(listing.category) ? (
              <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-gray-800">
                <p className="font-semibold">{t.rentalDetail.travelOutsideListingTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {normalizeTravelOutsideHomeArea(listing.handoff.travelOutsideHomeArea) ===
                  "forbidden"
                    ? t.rentalDetail.travelOutsideListingForbidden(
                        formatHomeTerritoryPhrase(
                          listing.handoff.homeTerritory ??
                            resolveHomeTerritory({
                              countryHint: getSearchCountryCode(),
                            }),
                        ),
                      )
                    : t.rentalDetail.travelOutsideListingAllowed(
                        formatHomeTerritoryPhrase(
                          listing.handoff.homeTerritory ??
                            resolveHomeTerritory({
                              countryHint: getSearchCountryCode(),
                            }),
                        ),
                      )}
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2 mt-3">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-muted-foreground">{t.item.newOnTheBlock}</span>
            </div>
          </div>

          {listing.paused ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t.item.pausedShort}
            </p>
          ) : null}

          {isSold ? (
            <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {t.item.soldBanner}
            </p>
          ) : null}

          {onOpenSale && !isSold ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              On Open Sale — buy from the sale cart while the auction window is open. Not for sale in
              the main garage right now.
            </p>
          ) : null}

          {isBorrowedByViewer({ listingId: listing.id, viewerId: auth.userId }) ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t.rentalDetail.cannotRelistBorrowed}
            </p>
          ) : null}

          {messageHint && !auth.userId && (isSellOnly || listing.modes.sell) ? (
            <SignInPrompt message={t.item.signInToMessage} intent="message" />
          ) : messageHint ? (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-[15px] text-primary">
              {isFreeGiveaway
                ? t.item.messageGiftHint
                : isSellOnly || listing.modes.sell
                  ? t.item.messageSellHint
                  : t.item.messageRentHint}
            </p>
          ) : null}

          {buyError ? (
            buyError === t.item.signInToMessage ? (
              <SignInPrompt message={buyError} intent="message" />
            ) : (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[15px] text-red-800">
                {buyError}
              </p>
            )
          ) : null}

          {needsQr ? (
            <div className="bg-card rounded-xl border border-primary/20 p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t.item.uniqueQrTitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.item.uniqueQrBody}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!listing.hostId || !onViewHostProfile}
                onClick={() => {
                  if (listing.hostId && onViewHostProfile) onViewHostProfile(listing.hostId);
                }}
                className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">
                  {listing.hostId?.slice(0, 2).toUpperCase() || "H"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold">{t.item.garageHost}</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {onViewHostProfile
                      ? t.item.viewPublicProfile
                      : t.item.verifiedHost(APP_NAME)}
                  </p>
                </div>
              </button>
              {canRent || listing.modes.sell ? (
                <button
                  type="button"
                  onClick={handleMessageHost}
                  className="flex-shrink-0 p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label={canRent ? t.item.startBookingAria : t.item.messageSellerAria}
                  title={canRent ? t.item.messagingOpensWithBooking : t.item.messageSellerTitle}
                >
                  <MessageCircle className="w-5 h-5 text-primary" />
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t.item.about}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {listing.description?.trim() ||
                (listing.modes.sell && !listing.modes.rent
                  ? t.item.questionsBeforeBuy
                  : t.item.questionsBeforeBook)}
            </p>
          </div>

          {listing.instructionsUrl?.trim() ? (
            <button
              type="button"
              onClick={() => onOpenAttachment(listing.instructionsUrl, t.item.instructions)}
              className="w-full bg-card border border-border py-3 rounded-xl flex items-center justify-between px-4 hover:border-primary/50 transition-colors"
            >
              <span className="font-medium">{t.item.instructions}</span>
              <span className="text-sm text-primary">{t.item.view}</span>
            </button>
          ) : null}

          {(listing.modes.rent || listing.modes.rentToOwn) ? (
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-semibold mb-3">{t.item.rentalIncludes}</h3>
            <div className="space-y-3">
              {hasDelivery ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">
                    {deliverySummary ?? t.item.deliveryAvailable}
                  </span>
                </div>
              ) : null}
              {parseUsdToCents(listing.pricing.securityDeposit ?? "") >= 50 ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">
                    {t.item.depositProtectionOnRentals(t.item.depositProtection)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{t.item.inAppSupport(MASCOT_NAME)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ScanLine className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{t.item.qrCheckIn}</span>
              </div>
            </div>
          </div>
          ) : null}

          {listing.modes.rent || listing.modes.rentToOwn ? (
            <button
              type="button"
              onClick={() => setAvailabilityOpen(true)}
              className="w-full bg-card border border-border py-3 rounded-xl flex items-center justify-between px-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t.item.checkAvailability}</span>
              </div>
              <span className="text-sm text-primary">{t.item.viewCalendar}</span>
            </button>
          ) : null}
        </div>
      </div>

      {availabilityOpen ? (
        <AvailabilityPanel listing={listing} onClose={() => setAvailabilityOpen(false)} />
      ) : null}

      {shareOpen ? (
        <div className="shrink-0 border-t border-border bg-card p-4">
          <p className="mb-2 text-sm font-semibold">{t.item.shareListing}</p>
          <SocialShareButtons
            payload={sharePayload}
            shareKind="listing"
            targetId={itemId}
            compact
          />
        </div>
      ) : null}

      <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4 flex gap-3">
        <button
          type="button"
          onClick={() => setShareOpen((v) => !v)}
          className="flex-shrink-0 border border-border py-3 px-5 rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">{t.item.share}</span>
        </button>

        {canRent ? (
          <button
            type="button"
            onClick={onBook}
            disabled={!canRent}
            className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-3 px-4 rounded-xl transition-colors font-medium"
          >
            {dailyRate > 0 ? t.item.bookWithRate(dailyRate) : t.item.bookNow}
          </button>
        ) : null}

        {canBuy && shopOffer ? (
          <button
            type="button"
            onClick={handleBuy}
            className="flex-1 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0D5C3A] py-3 px-4 rounded-xl transition-colors font-bold"
          >
            {t.item.buyWithPrice(formatShopUsd(shopOffer.buyNowUsd))}
          </button>
        ) : null}

        {isFreeGiveaway ? (
          <button
            type="button"
            onClick={() => {
              setMessageHint(true);
              if (listing?.hostId && auth.userId && onOpenListingChat) {
                onOpenListingChat(listing.id, listing.hostId);
              } else {
                setShareOpen(true);
              }
            }}
            className="flex-1 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0D5C3A] py-3 px-4 rounded-xl transition-colors font-bold"
          >
            {t.item.freeArrangePickup}
          </button>
        ) : null}

        {showGarageForAuction ? (
          <button
            type="button"
            onClick={() => onOpenGarageShop?.(listing.hostId ?? "", listing.id)}
            className="flex-1 border border-[#2563EB] bg-white py-3 px-4 rounded-xl font-bold text-[#2563EB] transition-colors hover:bg-blue-50"
          >
            {auctionLive ? t.item.bidInGarage : t.item.viewInGarage}
          </button>
        ) : null}

        {!canRent && !canBuy && !isFreeGiveaway && !showGarageForAuction ? (
          <div className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3 text-center text-sm font-medium text-muted-foreground">
            {listing.paused
              ? t.item.paused
              : isSold
                ? t.item.sold
                : listing.modes.gift && !listing.modes.rent && !listing.modes.sell
                  ? t.item.giftHint
                  : t.item.notAvailable}
          </div>
        ) : null}
      </div>
    </div>
  );
}
