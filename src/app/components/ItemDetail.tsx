import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  isFavoriteListing,
  toggleFavoriteListing,
} from "../../lib/favoritesStorage";
import { getPublishedListingById, getActiveRentLocationLabel } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import {
  deliverySummaryForListing,
  listingOffersDelivery,
  parseListingDailyRate,
} from "../../lib/rentalPricing";
import { useMediaUrl } from "../../lib/useMediaUrl";
import { DEPOSIT_PROTECTION_LABEL } from "../../lib/brand";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { buildListingSharePayload, listingShareUrl } from "../../lib/socialShare";

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
  onBook: () => void;
  onOpenAttachment: (url: string, title?: string) => void;
}

export function ItemDetail({ itemId, onBack, onBook, onOpenAttachment }: ItemDetailProps) {
  const [favorited, setFavorited] = useState(() => isFavoriteListing(itemId));
  const [shareOpen, setShareOpen] = useState(false);
  const listing = useMemo(() => getPublishedListingById(itemId), [itemId]);
  const cover = listing?.photos?.[0] ?? null;
  const coverThumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const coverUrl = useMediaUrl(coverThumb).url;

  const title = listing
    ? getListingDisplayTitle(listing.title) || listing.title || "Listing"
    : "DSLR Camera";
  const dailyRate = listing
    ? parseListingDailyRate(listing.pricing.dailyRate) || 35
    : 35;
  const deliverySummary = listing ? deliverySummaryForListing(listing) : null;
  const hasDelivery = listing ? listingOffersDelivery(listing) : true;
  const isHeavy = listing?.handoff.itemHeavy ?? false;

  const sharePayload = useMemo(() => {
    const city = getActiveRentLocationLabel().trim();
    return buildListingSharePayload({
      title,
      dailyRate: String(dailyRate),
      url: listingShareUrl(itemId),
      city: city || undefined,
    });
  }, [dailyRate, itemId, title]);

  const handleToggleFavorite = () => {
    setFavorited(toggleFavoriteListing(itemId));
  };

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">Item Details</h1>
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-5 h-5 ${favorited ? "fill-[#E11D48] text-[#E11D48]" : "text-muted-foreground"}`}
          />
        </button>
      </div>

      <div className="screen-scroll flex-1 min-h-0 pb-24">
        <div className="relative aspect-square bg-[#F0F4F2] flex flex-col items-center justify-center gap-3 overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <Camera className="w-16 h-16 text-primary" />
              <span className="text-sm text-muted-foreground">Photo by owner</span>
            </>
          )}

          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>{DEPOSIT_PROTECTION_LABEL}</span>
          </div>

          {isHeavy ? (
            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg bg-amber-500/95 px-2.5 py-1.5 text-xs font-semibold text-white">
              <Package className="h-3.5 w-3.5" aria-hidden />
              Heavy item
            </div>
          ) : null}
        </div>

        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold flex-1">{title}</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${dailyRate}</div>
                <div className="text-sm text-muted-foreground">/day</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-semibold">5.0</span>
              </div>
              <span className="text-muted-foreground">(12 reviews)</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">0.5 mi away</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {listing?.modes.rent !== false ? (
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <span>🔄</span>
                  <span>Rent</span>
                </span>
              ) : null}
              {listing?.modes.sell ? (
                <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <span>💰</span>
                  <span>Buy</span>
                </span>
              ) : null}
              {listing?.modes.gift ? (
                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <span>🎁</span>
                  <span>Gift</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-primary/20 p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-foreground" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold mb-1">Unique QR Code</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Scan to instantly check-in, track rental status, and verify
                  authenticity
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">
                JD
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">John Davis</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Verified owner · 47 rentals
                </p>
              </div>

              <button className="flex-shrink-0 p-2 hover:bg-muted rounded-full transition-colors">
                <MessageCircle className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">About this item</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {listing?.description?.trim() ||
                "Professional gear in great condition. Contact the owner with any questions before booking."}
            </p>
          </div>

          {listing?.instructionsUrl?.trim() ? (
            <button
              type="button"
              onClick={() => onOpenAttachment(listing.instructionsUrl, "Instructions")}
              className="w-full bg-card border border-border py-3 rounded-xl flex items-center justify-between px-4 hover:border-primary/50 transition-colors"
            >
              <span className="font-medium">Instructions</span>
              <span className="text-sm text-primary">View</span>
            </button>
          ) : null}

          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Rental includes</h3>

            <div className="space-y-3">
              {hasDelivery ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">
                    {deliverySummary ?? "Round-trip delivery available"}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{DEPOSIT_PROTECTION_LABEL} on rentals</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">24/7 support</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ScanLine className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">QR tracking system</span>
              </div>
            </div>
          </div>

          <button className="w-full bg-card border border-border py-3 rounded-xl flex items-center justify-between px-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Check availability</span>
            </div>
            <span className="text-sm text-primary">View calendar</span>
          </button>
        </div>
      </div>

      {shareOpen ? (
        <div className="shrink-0 border-t border-border bg-card p-4">
          <p className="mb-2 text-sm font-semibold">Share this listing</p>
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
          <span className="font-medium">Share</span>
        </button>

        <button
          onClick={onBook}
          className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-xl transition-colors font-medium"
        >
          Book Now · ${dailyRate}/day
        </button>
      </div>
    </div>
  );
}
