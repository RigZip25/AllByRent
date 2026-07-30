import { useEffect, useState, startTransition, type ReactNode } from "react";
import { DollarSign, Package, Plus, Share2 } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { fetchManageableListings, getManageableHostIds, loadManageableListings } from "../../lib/hostAccess";
import { getAbandonedListingDrafts } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { loadRentalBookings, type RentalBooking } from "../../lib/rentalsStorage";
import { BookingRequestCard } from "../../components/rentals/BookingRequestCard";
import { ProactiveAgentCard, wasAgentStepDismissed } from "../../components/agent/ProactiveAgentCard";
import { hasRecentShare } from "../../lib/socialShare";
import { agentTipsEnabled } from "../../lib/agentPrefs";
import { loadNotificationPreferences } from "../../lib/notificationPreferences";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";
import type { ListingDraft } from "../../screens/listing/types";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import type { AppMessages } from "../../lib/i18n/types";

function formatHostBookingStatus(
  status: RentalBooking["status"],
  copy: AppMessages["garageUi"],
): string {
  switch (status) {
    case "pending_approval":
      return copy.statusAwaitingOk;
    case "pending_checkin":
      return copy.statusReadyPickup;
    case "active":
      return copy.statusOutWithNeighbor;
    case "overdue":
      return copy.statusOverdue;
    case "completed":
      return copy.statusCompleted;
    default:
      return status.replace(/_/g, " ");
  }
}

function ListingThumb({ listing }: { listing: ListingDraft }) {
  const t = useMessages();
  const cover = listing.photos?.[0] ?? null;
  const { url } = useCoverMediaUrl(cover);
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-gray-400" aria-hidden>
      {(listing.title || t.garageUi.itemFallback).slice(0, 1)}
    </span>
  );
}

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div
      className="flex flex-1 flex-col gap-1 rounded-2xl border bg-white p-3"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-bold" style={{ color: GREEN_DARK }}>
        {value}
      </p>
    </div>
  );
}

export function HostDashboard({
  onListItem,
  onOpenListing,
  onResumeDraft,
  onShareGarage,
  onViewProfile,
  onOpenRental,
}: {
  onListItem: () => void;
  onOpenListing: (listingId: string) => void;
  onResumeDraft?: (listingId: string) => void;
  onShareGarage?: () => void;
  onViewProfile?: (userId: string) => void;
  onOpenRental?: (bookingId: string) => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const [listings, setListings] = useState<Awaited<ReturnType<typeof loadManageableListings>>>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const syncLoad = () => {
      const localListings = loadManageableListings(auth.userId, auth.userEmail);
      const localBookings = loadRentalBookings();
      startTransition(() => {
        if (!mounted) return;
        setListings(localListings);
        setBookings(localBookings);
      });
    };

    const refreshRemote = (markLoaded = false) => {
      void fetchManageableListings(auth.userId, auth.userEmail)
        .then((next) => {
          if (!mounted) return;
          startTransition(() => setListings(next));
        })
        .finally(() => {
          if (mounted && markLoaded) setLoading(false);
        });
    };

    const idleId = window.setTimeout(syncLoad, 0);
    refreshRemote(true);

    const onListingsChanged = () => {
      syncLoad();
      refreshRemote(false);
    };
    window.addEventListener("evorios-listings-changed", onListingsChanged);
    window.addEventListener("focus", onListingsChanged);

    return () => {
      mounted = false;
      window.clearTimeout(idleId);
      window.removeEventListener("evorios-listings-changed", onListingsChanged);
      window.removeEventListener("focus", onListingsChanged);
    };
  }, [auth.userId, auth.userEmail]);

  const activeCount = listings.filter(
    (item) => item.listingStatus === "active" && !item.paused,
  ).length;
  const needsQrCount = listings.filter((item) => item.listingStatus === "pending_qr").length;
  const pendingRequests = bookings.filter((b) => b.role === "host" && b.status === "pending_approval");
  const activeRentals = bookings.filter((b) => b.role === "host" && (b.status === "active" || b.status === "pending_checkin" || b.status === "overdue"));
  const totalEarned = bookings
    .filter((b) => b.role === "host" && (b.status === "completed" || b.status === "active" || b.status === "overdue"))
    .reduce((sum, b) => sum + (b.totalUsd ?? 0), 0);

  const hostId = resolveHostAccountId(auth.userId);
  const hostIds = getManageableHostIds(auth.userId, auth.userEmail);
  const abandonedDraft = getAbandonedListingDrafts(hostIds)[0] ?? null;
  const showDraftNudge =
    Boolean(onResumeDraft) &&
    Boolean(abandonedDraft) &&
    agentTipsEnabled(loadNotificationPreferences()) &&
    abandonedDraft != null &&
    !wasAgentStepDismissed(`finish-draft-${abandonedDraft.id}`);
  const showShareNudge =
    !showDraftNudge &&
    loadNotificationPreferences().agentTips &&
    listings.length > 0 &&
    !hasRecentShare("garage", hostId) &&
    !wasAgentStepDismissed(`garage-share-${hostId}`) &&
    Boolean(onShareGarage);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {showDraftNudge && abandonedDraft ? (
        <div className="mb-3 shrink-0">
          <ProactiveAgentCard
            step={{
              id: `finish-draft-${abandonedDraft.id}`,
              dismissKey: `finish-draft-${abandonedDraft.id}`,
              title: t.garageUi.finishPublishingTitle,
              body: t.garageUi.finishPublishingBody(
                getListingDisplayTitle(abandonedDraft.title) || "",
                abandonedDraft.wizardStep ?? 1,
              ),
              cta: t.garageUi.resumeDraft,
              onAction: () => onResumeDraft?.(abandonedDraft.id),
            }}
          />
        </div>
      ) : null}
      {showShareNudge ? (
        <div className="mb-3 shrink-0">
          <ProactiveAgentCard
            step={{
              id: "garage-share",
              dismissKey: `garage-share-${hostId}`,
              title: t.garageUi.garageLiveShareTitle,
              body: t.garageUi.garageLiveShareBody,
              cta: t.garageUi.openShareSheet,
              onAction: () => onShareGarage?.(),
            }}
          />
        </div>
      ) : null}

      <div className="mb-3 flex shrink-0 items-center justify-end gap-2">
        {onShareGarage && listings.length > 0 ? (
          <button
            type="button"
            onClick={onShareGarage}
            className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: GREEN }}
          >
            <Share2 className="h-4 w-4" />
            {t.garageUi.shareGarage}
          </button>
        ) : null}
      </div>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        <div className="mb-4 flex gap-2">
          <StatCard
            label={t.garageUi.live}
            value={String(activeCount)}
            icon={<Package className="h-4 w-4" style={{ color: GREEN }} />}
          />
          <StatCard
            label={t.garageUi.needsQr}
            value={String(needsQrCount)}
            icon={<Package className="h-4 w-4" style={{ color: GREEN }} />}
          />
          <StatCard
            label={t.garageUi.earnings}
            value={totalEarned > 0 ? `$${totalEarned}` : t.garageUi.noneYet}
            icon={<DollarSign className="h-4 w-4" style={{ color: GREEN }} />}
          />
        </div>

        {pendingRequests.length > 0 ? (
          <div className="mb-4">
            <h3 className="mb-2 px-1 text-[13px] font-bold" style={{ color: GREEN_DARK }}>
              {t.garageUi.pendingBookingRequests}
            </h3>
            <div className="space-y-2">
              {pendingRequests.slice(0, 3).map((b) => (
                <BookingRequestCard
                  key={b.id}
                  booking={b}
                  onRefresh={() => setBookings(loadRentalBookings())}
                  onViewProfile={onViewProfile ?? (() => undefined)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {activeRentals.length > 0 ? (
          <div className="mb-4">
            <h3 className="mb-2 px-1 text-[13px] font-bold" style={{ color: GREEN_DARK }}>
              {t.garageUi.activeRentals}
            </h3>
            <ul className="space-y-2">
              {activeRentals.slice(0, 4).map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    disabled={!onOpenRental}
                    onClick={() => onOpenRental?.(b.id)}
                    className="w-full rounded-2xl border bg-white p-3 text-left transition-colors disabled:cursor-default"
                    style={{ borderColor: BORDER }}
                  >
                    <p className="text-[14px] font-semibold text-gray-900">{b.itemTitle}</p>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      {b.counterpartyName} · {formatHostBookingStatus(b.status, t.garageUi)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold" style={{ color: GREEN_DARK }}>
            {t.garageUi.yourListings}
          </h3>
          <button
            type="button"
            onClick={onListItem}
            className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: GREEN }}
          >
            <Plus className="h-4 w-4" />
            {t.garageUi.newListing}
          </button>
        </div>

        {loading && listings.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{t.garageUi.loading}</p>
        ) : listings.length === 0 ? (
          <div
            className="rounded-2xl border bg-white px-4 py-8 text-center"
            style={{ borderColor: BORDER }}
          >
            <p className="text-base font-semibold text-gray-800">{t.garageUi.noListingsYet}</p>
            <p className="mt-1 text-sm text-gray-500">
              {t.garageUi.noListingsBodyBefore}{" "}
              <button
                type="button"
                onClick={onListItem}
                className="font-semibold underline"
                style={{ color: GREEN }}
              >
                {t.garageUi.newListing}
              </button>{" "}
              {t.garageUi.noListingsBodyAfter}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex items-center gap-3 rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <button
                  type="button"
                  onClick={() => onOpenListing(listing.id)}
                  className="flex w-full items-center gap-3 text-left"
                  aria-label={t.garageUi.openListingAria(getListingDisplayTitle(listing.title))}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F0F4F2]">
                    <ListingThumb listing={listing} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {getListingDisplayTitle(listing.title)}
                    </p>
                    <p className="text-sm capitalize text-gray-500">
                      {listing.paused
                        ? t.garageUi.statusPaused
                        : listing.listingStatus === "pending_qr"
                          ? t.garageUi.statusNeedsQr
                          : listing.listingStatus}
                      {listing.category ? ` · ${localizeCategoryLabel(listing.category)}` : ""}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
