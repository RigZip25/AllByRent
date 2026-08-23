import { useEffect, useState, startTransition } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { fetchManageableListings, loadManageableListings, resolveGarageHostId } from "../../lib/hostAccess";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { removePublishedListing, removePublishedListingRemote } from "../../lib/listingStorage";
import { useCoverMediaUrl } from "../../lib/useMediaUrl";
import type { ListingDraft } from "../../screens/listing/types";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import { deriveGarageShelfStatus } from "../../lib/garageShelfStatus";
import { listingNeedsStickerReminder } from "../../lib/listingQr";
import { formatCountdown, getOpenSaleForListing, isListingOnOpenSale } from "../../lib/openSale";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";
const AMBER = "#B45309";

export type HostGarageListMode = "live" | "drafts";

function isDraftListing(listing: ListingDraft): boolean {
  return listing.listingStatus === "draft";
}

function listingUpdatedMs(listing: ListingDraft): number {
  const ms = listing.updatedAt ? Date.parse(listing.updatedAt) : 0;
  return Number.isFinite(ms) ? ms : 0;
}

function ListingThumb({ listing }: { listing: ListingDraft }) {
  const t = useMessages();
  const cover = listing.photos?.[0] ?? null;
  const { url } = useCoverMediaUrl(cover);
  if (url) {
    return <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />;
  }
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-gray-400" aria-hidden>
      {(listing.title || t.garageUi.itemFallback).slice(0, 1)}
    </span>
  );
}

type HostGarageListSectionProps = {
  mode: HostGarageListMode;
  onBack: () => void;
  onOpenListing: (listingId: string) => void;
  onResumeDraft?: (listingId: string) => void;
  onListItem: () => void;
};

export function HostGarageListSection({
  mode,
  onBack,
  onOpenListing,
  onResumeDraft,
  onListItem,
}: HostGarageListSectionProps) {
  const auth = useAuth();
  const t = useMessages();
  const [listings, setListings] = useState<ListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const syncLoad = () => {
      const localListings = loadManageableListings(auth.userId, auth.userEmail);
      startTransition(() => {
        if (!mounted) return;
        setListings(localListings);
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
  const live = listings
    .filter((item) => !isDraftListing(item) && item.listingStatus === "active" && !item.paused)
    .sort((a, b) => listingUpdatedMs(b) - listingUpdatedMs(a));
  const rows = mode === "drafts" ? drafts : live;

  const title = mode === "drafts" ? t.garageUi.draftsStat : t.garageUi.live;
  const emptyTitle = mode === "drafts" ? t.garageUi.emptyDraftsTitle : t.garageUi.emptyLiveTitle;
  const emptyBody = mode === "drafts" ? t.garageUi.emptyDraftsBody : t.garageUi.emptyLiveBody;

  const statusLabel = (listing: ListingDraft): string => {
    if (isDraftListing(listing)) return t.garageUi.statusDraft(listing.wizardStep ?? 1);
    if (isListingOnOpenSale(listing.id)) {
      const event = getOpenSaleForListing(listing.id);
      if (event?.status === "presale") {
        return `Auction · starts in ${formatCountdown(event.startsAt)}`;
      }
      if (event?.status === "live") {
        return `Auction · ends ${formatCountdown(event.endsAt)}`;
      }
      return "On auction";
    }
    const shelf = deriveGarageShelfStatus(listing);
    if (shelf.kind === "rented") return t.garageUi.statusOutWithNeighbor;
    if (shelf.kind === "reserved") return t.garageUi.statusReserved;
    if (shelf.kind === "sold") return t.garageUi.statusSold;
    if (shelf.kind === "pending_payment") return t.garageUi.statusPendingPayment;
    if (shelf.kind === "paused" || listing.paused) return t.garageUi.statusPaused;
    if (listingNeedsStickerReminder(listing)) return t.garageUi.statusNeedsQr;
    return t.garageUi.statusAvailable;
  };

  const openListing = (listing: ListingDraft) => {
    if (isDraftListing(listing) && onResumeDraft) {
      onResumeDraft(listing.id);
      return;
    }
    onOpenListing(listing.id);
  };

  const deleteDraft = async (listingId: string) => {
    setConfirmId(null);
    setDeletingId(listingId);
    const ownerId = resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId || "";
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:bg-white/80"
          aria-label={t.common.back}
        >
          <ArrowLeft className="h-5 w-5" style={{ color: GREEN_DARK }} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-[20px] font-extrabold leading-tight" style={{ color: GREEN_DARK }}>
            {title}
          </h2>
          <p className="text-[12px] text-gray-500">
            {mode === "drafts" ? t.garageUi.draftsSection : t.garageUi.liveSection}
          </p>
        </div>
        <button
          type="button"
          onClick={onListItem}
          className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold"
          style={{ color: GREEN }}
        >
          <Plus className="h-4 w-4" />
          {t.garageUi.newListing}
        </button>
      </div>

      {loading && rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">{t.garageUi.loading}</p>
      ) : rows.length === 0 ? (
        <div
          className="rounded-2xl border bg-white px-4 py-10 text-center"
          style={{ borderColor: BORDER }}
        >
          <p className="text-base font-semibold text-gray-800">{emptyTitle}</p>
          <p className="mt-1 text-sm text-gray-500">{emptyBody}</p>
          <button
            type="button"
            onClick={onListItem}
            className="mt-4 inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: GREEN_DARK }}
          >
            <Plus className="h-4 w-4" />
            {t.garageUi.newListing}
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((listing) => {
            const draft = isDraftListing(listing);
            return (
              <li
                key={listing.id}
                className="flex items-center gap-2 rounded-2xl border bg-white p-3"
                style={{ borderColor: draft ? "#F5E6C8" : BORDER }}
              >
                <button
                  type="button"
                  onClick={() => openListing(listing)}
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
                      {statusLabel(listing)}
                      {listing.category ? ` · ${localizeCategoryLabel(listing.category)}` : ""}
                    </p>
                    {draft ? (
                      <p className="mt-0.5 text-[12px] font-semibold" style={{ color: GREEN }}>
                        {t.garageUi.resumeDraft}
                      </p>
                    ) : null}
                  </div>
                </button>
                {draft ? (
                  <button
                    type="button"
                    disabled={deletingId === listing.id}
                    onClick={() => setConfirmId(listing.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    aria-label={t.garageUi.deleteDraftAria(getListingDisplayTitle(listing.title))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {confirmId ? (
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
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border py-3 text-sm font-semibold text-gray-700"
                style={{ borderColor: BORDER }}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => void deleteDraft(confirmId)}
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
