import { useEffect, useMemo, useState } from "react";
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
  toggleFavoriteListing,
} from "../../lib/favoritesStorage";
import {
  fetchListingByIdRemote,
  getActiveRentLocationLabel,
  getPublishedListingById,
} from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import {
  deliverySummaryForListing,
  listingOffersDelivery,
  parseListingDailyRate,
} from "../../lib/rentalPricing";
import { useMediaUrl } from "../../lib/useMediaUrl";
import { APP_NAME, DEPOSIT_PROTECTION_LABEL } from "../../lib/brand";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { buildListingSharePayload, listingShareUrl } from "../../lib/socialShare";
import type { ListingDraft } from "../../screens/listing/types";

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
  onBook: () => void;
  onOpenAttachment: (url: string, title?: string) => void;
}

function formatBlockedDates(listing: ListingDraft): string[] {
  return (listing.blockedDates ?? [])
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && "start" in entry) {
        const row = entry as { start?: string; end?: string };
        if (row.start && row.end && row.start !== row.end) {
          return `${row.start} – ${row.end}`;
        }
        return row.start ?? row.end ?? "";
      }
      return "";
    })
    .filter(Boolean);
}

function AvailabilityPanel({
  listing,
  onClose,
}: {
  listing: ListingDraft;
  onClose: () => void;
}) {
  const blocked = formatBlockedDates(listing);
  const weekday =
    listing.handoff.inPersonTimeStart && listing.handoff.inPersonTimeEnd
      ? `${listing.handoff.inPersonTimeStart}–${listing.handoff.inPersonTimeEnd}`
      : null;
  const weekend =
    listing.handoff.inPersonWeekendTimeStart && listing.handoff.inPersonWeekendTimeEnd
      ? `${listing.handoff.inPersonWeekendTimeStart}–${listing.handoff.inPersonWeekendTimeEnd}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
      <div className="w-full max-w-[390px] rounded-2xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Availability</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted"
            aria-label="Close availability"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {listing.paused ? (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This listing is paused — the owner is not accepting new bookings right now.
          </p>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">
            Pickup windows below. Confirm exact dates when you book.
          </p>
        )}

        <dl className="space-y-2 text-sm">
          {weekday ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Weekdays</dt>
              <dd className="font-medium">{weekday}</dd>
            </div>
          ) : null}
          {weekend ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Weekends</dt>
              <dd className="font-medium">{weekend}</dd>
            </div>
          ) : null}
        </dl>

        {blocked.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-semibold">Blocked dates</p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-muted-foreground">
              {blocked.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No blocked dates listed.</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-4 w-full rounded-xl py-3 font-semibold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function ItemDetail({ itemId, onBack, onBook, onOpenAttachment }: ItemDetailProps) {
  const [favorited, setFavorited] = useState(() => isFavoriteListing(itemId));
  const [shareOpen, setShareOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [messageHint, setMessageHint] = useState(false);
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
  const coverThumb = cover?.thumbId ? { ...cover, id: cover.thumbId } : cover;
  const coverUrl = useMediaUrl(coverThumb).url;

  const title = listing
    ? getListingDisplayTitle(listing.title) || listing.title || "Listing"
    : "Listing";
  const dailyRate = listing ? parseListingDailyRate(listing.pricing.dailyRate) || 0 : 0;
  const deliverySummary = listing ? deliverySummaryForListing(listing) : null;
  const hasDelivery = listing ? listingOffersDelivery(listing) : false;
  const isHeavy = listing?.handoff.itemHeavy ?? false;
  const canBook = Boolean(listing && listing.listingStatus === "active" && !listing.paused);

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
    setFavorited(toggleFavoriteListing(itemId));
  };

  const handleMessageHost = () => {
    setMessageHint(true);
    onBook();
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
          Loading item…
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
          <h1 className="font-semibold flex-1">Item not found</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">
            This listing may have been removed or is no longer available in your area.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white"
          >
            Go back
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

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {[listing.category, listing.subcategory].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="text-right shrink-0">
                {dailyRate > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-primary">${dailyRate}</p>
                    <p className="text-xs text-muted-foreground">per day</p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">Ask owner</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">New on block</span>
            </div>
          </div>

          {listing.paused ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Paused — not accepting new bookings right now.
            </p>
          ) : null}

          {messageHint ? (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
              In-app chat with the owner opens once your booking is confirmed.
            </p>
          ) : null}

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
                  Scan to check in, track rental status, and verify the item at pickup.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium text-primary">
                {listing.hostId?.slice(0, 2).toUpperCase() || "H"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold">Garage host</span>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Verified host on {APP_NAME}</p>
              </div>
              <button
                type="button"
                onClick={handleMessageHost}
                disabled={!canBook}
                className="flex-shrink-0 p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-40"
                aria-label="Message host after booking"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">About this item</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {listing.description?.trim() ||
                "Contact the owner with any questions before booking."}
            </p>
          </div>

          {listing.instructionsUrl?.trim() ? (
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
                <span className="text-sm">In-app support via Mr.E</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ScanLine className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">QR check-in at pickup</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAvailabilityOpen(true)}
            className="w-full bg-card border border-border py-3 rounded-xl flex items-center justify-between px-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Check availability</span>
            </div>
            <span className="text-sm text-primary">View calendar</span>
          </button>
        </div>
      </div>

      {availabilityOpen ? (
        <AvailabilityPanel listing={listing} onClose={() => setAvailabilityOpen(false)} />
      ) : null}

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
          type="button"
          onClick={onBook}
          disabled={!canBook}
          className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-3 px-6 rounded-xl transition-colors font-medium"
        >
          {canBook
            ? dailyRate > 0
              ? `Book Now · $${dailyRate}/day`
              : "Book Now"
            : listing.paused
              ? "Paused"
              : "Not available"}
        </button>
      </div>
    </div>
  );
}
