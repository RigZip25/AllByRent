import { useEffect, useState, startTransition, type ReactNode } from "react";
import { DollarSign, Package, Plus, Share2, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { fetchManageableListings, loadManageableListings } from "../../lib/hostAccess";
import { getListingDisplayTitle, listingNeedsStickerReminder } from "../../lib/listingQr";
import { loadRentalBookings, type RentalBooking } from "../../lib/rentalsStorage";
import { deriveGarageShelfStatus } from "../../lib/garageShelfStatus";
import { BookingRequestCard } from "../../components/rentals/BookingRequestCard";
import { ProactiveAgentCard, wasAgentStepDismissed } from "../../components/agent/ProactiveAgentCard";
import { hasRecentShare } from "../../lib/socialShare";
import { agentTipsEnabled } from "../../lib/agentPrefs";
import { loadNotificationPreferences } from "../../lib/notificationPreferences";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import { removePublishedListing, removePublishedListingRemote } from "../../lib/listingStorage";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";
import {
  fetchStoreLiveByHostIds,
  getLocalStoreLive,
  onStoreLiveChanged,
} from "../../lib/garageStoreLive";
import type { ListingDraft } from "../../screens/listing/types";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import type { AppMessages } from "../../lib/i18n/types";
import { bookingGross, bookingHostNet, bookingPlatformFee } from "../../lib/earnStatement";
import { formatMoney } from "../../lib/regionalDisplay";

function expectedHostNet(booking: RentalBooking): number {
  if (booking.status === "completed") return bookingHostNet(booking);
  return Math.max(0, bookingGross(booking) - bookingPlatformFee(booking));
}

function isDraftListing(listing: ListingDraft): boolean {
  return listing.listingStatus === "draft";
}

function listingUpdatedMs(listing: ListingDraft): number {
  const ms = listing.updatedAt ? Date.parse(listing.updatedAt) : 0;
  return Number.isFinite(ms) ? ms : 0;
}

function formatHostBookingStatus(
  booking: RentalBooking,
  copy: AppMessages["garageUi"],
): string {
  const status = booking.status;
  if (status === "pending_approval") return copy.statusAwaitingOk;
  if (status === "pending_checkin") {
    if (booking.hostHandedOverAt && !booking.renterReceivedAt) return copy.statusHandedOver;
    if (booking.renterReceivedAt && !booking.hostHandedOverAt) return copy.statusWaitingYourHandover;
    return copy.statusReadyPickup;
  }
  if (status === "active") {
    if (booking.renterReturnedAt && !booking.hostAcceptedReturnAt) {
      return copy.statusReturnPendingYou;
    }
    return copy.statusOutWithNeighbor;
  }
  if (status === "overdue") return copy.statusOverdue;
  if (status === "completed") return copy.statusCompleted;
  return status.replace(/_/g, " ");
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
const AMBER = "#B45309";

function StatCard({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  const className =
    "flex flex-1 flex-col gap-1 rounded-2xl border bg-white p-3 text-left transition-colors";
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} active:bg-[#F0F4F2]`}
        style={{ borderColor: BORDER }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-500">{label}</span>
          {icon}
        </div>
        <p className="text-xl font-bold" style={{ color: GREEN_DARK }}>
          {value}
        </p>
      </button>
    );
  }
  return (
    <div className={className} style={{ borderColor: BORDER }}>
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

function ListingRow({
  listing,
  onOpen,
  onDelete,
  deleting,
}: {
  listing: ListingDraft;
  onOpen: (listing: ListingDraft) => void;
  onDelete?: (listing: ListingDraft) => void;
  deleting?: boolean;
}) {
  const t = useMessages();
  const draft = isDraftListing(listing);
  const statusLabel = (() => {
    if (draft) {
      const step = listing.wizardStep ?? 1;
      return t.garageUi.statusDraft(step);
    }
    const shelf = deriveGarageShelfStatus(listing);
    if (shelf.kind === "rented") return t.garageUi.statusOutWithNeighbor;
    if (shelf.kind === "reserved") return t.garageUi.statusReserved;
    if (shelf.kind === "sold") return t.garageUi.statusSold;
    if (shelf.kind === "pending_payment") return t.garageUi.statusPendingPayment;
    if (shelf.kind === "paused" || listing.paused) return t.garageUi.statusPaused;
    if (listingNeedsStickerReminder(listing)) return t.garageUi.statusNeedsQr;
    return t.garageUi.statusAvailable;
  })();

  return (
    <li
      className="flex items-center gap-2 rounded-2xl border bg-white p-3"
      style={{ borderColor: draft ? "#F5E6C8" : BORDER }}
    >
      <button
        type="button"
        onClick={() => onOpen(listing)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={
          draft
            ? t.garageUi.resumeDraftAria(getListingDisplayTitle(listing.title))
            : t.garageUi.openListingAria(getListingDisplayTitle(listing.title))
        }
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F0F4F2]">
          <ListingThumb listing={listing} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-gray-900">
              {getListingDisplayTitle(listing.title)}
            </p>
            {draft ? (
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: "#FEF3C7", color: AMBER }}
              >
                {t.garageUi.draftBadge}
              </span>
            ) : null}
          </div>
          <p className="text-sm capitalize text-gray-500">
            {statusLabel}
            {listing.category ? ` · ${localizeCategoryLabel(listing.category)}` : ""}
          </p>
          {draft ? (
            <p className="mt-0.5 text-[12px] font-semibold" style={{ color: GREEN }}>
              {t.garageUi.resumeDraft}
            </p>
          ) : null}
        </div>
      </button>
      {draft && onDelete ? (
        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(listing)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          aria-label={t.garageUi.deleteDraftAria(getListingDisplayTitle(listing.title))}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </li>
  );
}

export function HostDashboard({
  onListItem,
  onOpenListing,
  onResumeDraft,
  onShareGarage,
  onViewProfile,
  onOpenRental,
  onOpenLive,
  onOpenDrafts,
  onOpenEarnings,
}: {
  onListItem: () => void;
  onOpenListing: (listingId: string) => void;
  onResumeDraft?: (listingId: string) => void;
  onShareGarage?: () => void;
  onViewProfile?: (userId: string) => void;
  onOpenRental?: (bookingId: string) => void;
  onOpenLive?: () => void;
  onOpenDrafts?: () => void;
  onOpenEarnings?: () => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const [listings, setListings] = useState<Awaited<ReturnType<typeof loadManageableListings>>>([]);
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const hostId = resolveHostAccountId(auth.userId);
  const [storeLive, setStoreLive] = useState(() => getLocalStoreLive(hostId));

  useEffect(() => {
    if (!hostId) {
      setStoreLive(false);
      return;
    }
    setStoreLive(getLocalStoreLive(hostId));
    void fetchStoreLiveByHostIds([hostId], {
      coerceEmptyShelfFor: { userId: auth.userId, email: auth.userEmail },
    }).then((map) => {
      if (Object.prototype.hasOwnProperty.call(map, hostId)) {
        setStoreLive(Boolean(map[hostId]));
      }
    });
    return onStoreLiveChanged((id, live) => {
      if (id === hostId) setStoreLive(live);
    });
  }, [hostId, auth.userId, auth.userEmail]);

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

  const drafts = listings
    .filter(isDraftListing)
    .sort((a, b) => listingUpdatedMs(b) - listingUpdatedMs(a));
  const published = listings
    .filter((item) => !isDraftListing(item))
    .sort((a, b) => listingUpdatedMs(b) - listingUpdatedMs(a));

  const activeCount = published.filter(
    (item) => item.listingStatus === "active" && !item.paused,
  ).length;
  const pendingRequests = bookings.filter((b) => b.role === "host" && b.status === "pending_approval");
  const activeRentals = bookings.filter((b) => b.role === "host" && (b.status === "active" || b.status === "pending_checkin" || b.status === "overdue"));
  const totalEarned = bookings
    .filter((b) => b.role === "host" && (b.status === "completed" || b.status === "active" || b.status === "overdue"))
    .reduce((sum, b) => sum + expectedHostNet(b), 0);

  const primaryDraft = drafts[0] ?? null;
  const showDraftNudge =
    Boolean(onResumeDraft) &&
    Boolean(primaryDraft) &&
    agentTipsEnabled(loadNotificationPreferences()) &&
    primaryDraft != null &&
    !wasAgentStepDismissed(`finish-draft-${primaryDraft.id}`);
  /** Share only after store is Live (Stripe already required to flip Live). */
  const showShareNudge =
    storeLive &&
    !showDraftNudge &&
    loadNotificationPreferences().agentTips &&
    published.length > 0 &&
    !hasRecentShare("garage", hostId) &&
    !wasAgentStepDismissed(`garage-share-${hostId}`) &&
    Boolean(onShareGarage);

  const openListing = (listing: ListingDraft) => {
    if (isDraftListing(listing) && onResumeDraft) {
      onResumeDraft(listing.id);
      return;
    }
    onOpenListing(listing.id);
  };

  const deleteDraft = async (listingId: string) => {
    setConfirmDeleteId(null);
    setDeletingId(listingId);
    const ownerId = resolveHostAccountId(auth.userId) || auth.userId || "";
    try {
      if (ownerId) {
        await removePublishedListingRemote(listingId, ownerId);
      } else {
        removePublishedListing(listingId);
      }
      setListings((prev) => prev.filter((item) => item.id !== listingId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col">
      {showDraftNudge && primaryDraft ? (
        <div className="mb-3">
          <ProactiveAgentCard
            step={{
              id: `finish-draft-${primaryDraft.id}`,
              dismissKey: `finish-draft-${primaryDraft.id}`,
              title: t.garageUi.finishPublishingTitle,
              body: t.garageUi.finishPublishingBody(
                getListingDisplayTitle(primaryDraft.title) || "",
                primaryDraft.wizardStep ?? 1,
              ),
              cta: t.garageUi.resumeDraft,
              onAction: () => onResumeDraft?.(primaryDraft.id),
            }}
          />
        </div>
      ) : null}
      {showShareNudge ? (
        <div className="mb-3">
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

      <div className="mb-3 flex items-center justify-end gap-2">
        {onShareGarage && storeLive && published.length > 0 ? (
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

      <div className="-mx-1 px-1 pb-2">
        <div className="mb-4 flex gap-2">
          <StatCard
            label={t.garageUi.live}
            value={String(activeCount)}
            icon={<Package className="h-4 w-4" style={{ color: GREEN }} />}
            onClick={onOpenLive}
          />
          <StatCard
            label={t.garageUi.draftsStat}
            value={String(drafts.length)}
            icon={<Package className="h-4 w-4" style={{ color: AMBER }} />}
            onClick={onOpenDrafts}
          />
          <StatCard
            label={t.garageUi.earnings}
            value={totalEarned > 0 ? formatMoney(totalEarned) : t.garageUi.noneYet}
            icon={<DollarSign className="h-4 w-4" style={{ color: GREEN }} />}
            onClick={onOpenEarnings}
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
                      {b.counterpartyName} · {formatHostBookingStatus(b, t.garageUi)}
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
            {!auth.userId ? (
              <p className="mt-3 text-[12px] text-gray-500">{t.garageUi.signInForDrafts}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.length > 0 ? (
              <div>
                <h4 className="mb-2 px-1 text-[13px] font-bold" style={{ color: AMBER }}>
                  {t.garageUi.draftsSection}
                </h4>
                <ul className="space-y-2">
                  {drafts.map((listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      onOpen={openListing}
                      onDelete={(item) => setConfirmDeleteId(item.id)}
                      deleting={deletingId === listing.id}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
            {published.length > 0 ? (
              <div>
                {drafts.length > 0 ? (
                  <h4 className="mb-2 px-1 text-[13px] font-bold" style={{ color: GREEN_DARK }}>
                    {t.garageUi.liveSection}
                  </h4>
                ) : null}
                <ul className="space-y-2">
                  {published.map((listing) => (
                    <ListingRow key={listing.id} listing={listing} onOpen={openListing} />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {confirmDeleteId ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 py-[max(1.25rem,env(safe-area-inset-top,0px))] pb-[max(1.25rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))]">
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label={t.garageUi.deleteDraftTitle}
          >
            <h3 className="text-lg font-bold text-gray-900">{t.garageUi.deleteDraftTitle}</h3>
            <p className="mt-2 text-sm text-gray-600">{t.garageUi.deleteDraftBody}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-xl border py-3 text-sm font-semibold text-gray-700"
                style={{ borderColor: BORDER }}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => void deleteDraft(confirmDeleteId)}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white"
              >
                {t.garageUi.deleteDraftConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
