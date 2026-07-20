import { useEffect, useState, startTransition, type ReactNode } from "react";
import { DollarSign, Package, Plus, Share2, TrendingUp } from "lucide-react";
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

    const idleId = window.setTimeout(syncLoad, 0);

    void fetchManageableListings(auth.userId, auth.userEmail)
      .then((next) => {
        if (!mounted) return;
        startTransition(() => setListings(next));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      window.clearTimeout(idleId);
    };
  }, [auth.userId, auth.userEmail]);

  const activeCount = listings.filter((item) => item.listingStatus === "active").length;
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
              title: "Finish publishing?",
              body: `You left ${getListingDisplayTitle(abandonedDraft.title) || "a listing"} on step ${abandonedDraft.wizardStep ?? 1}. Tap to pick up where you stopped.`,
              cta: "Resume draft",
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
              title: "Your garage is live — share it",
              body: "Post your showcase to Nextdoor or Facebook so neighbors know you're open for rentals.",
              cta: "Open share sheet",
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
            Share garage
          </button>
        ) : null}
      </div>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        <div className="mb-4 flex gap-2">
          <StatCard
            label="Active listings"
            value={String(activeCount)}
            icon={<Package className="h-4 w-4" style={{ color: GREEN }} />}
          />
          <StatCard
            label="Needs QR"
            value={String(needsQrCount)}
            icon={<Package className="h-4 w-4" style={{ color: GREEN }} />}
          />
          <StatCard
            label="This month"
            value={`$${totalEarned}`}
            icon={<DollarSign className="h-4 w-4" style={{ color: GREEN }} />}
          />
          <StatCard
            label="Views"
            value="—"
            icon={<TrendingUp className="h-4 w-4" style={{ color: GREEN }} />}
          />
        </div>

        {pendingRequests.length > 0 ? (
          <div className="mb-4">
            <h3 className="mb-2 px-1 text-[13px] font-bold" style={{ color: GREEN_DARK }}>
              Pending booking requests
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
              Active rentals
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
                      {b.counterpartyName} · {b.status}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-bold" style={{ color: GREEN_DARK }}>
            Your listings
          </h3>
          <button
            type="button"
            onClick={onListItem}
            className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: GREEN }}
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>

        {loading && listings.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">Loading your garage…</p>
        ) : listings.length === 0 ? (
          <div
            className="rounded-2xl border bg-white px-4 py-8 text-center"
            style={{ borderColor: BORDER }}
          >
            <p className="text-base font-semibold text-gray-800">No listings yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Publish from a category when you are ready — or tap{" "}
              <button
                type="button"
                onClick={onListItem}
                className="font-semibold underline"
                style={{ color: GREEN }}
              >
                New
              </button>{" "}
              above.
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
                  aria-label={`Open ${getListingDisplayTitle(listing.title)} listing details`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F0F4F2] text-2xl">
                    <span aria-hidden>📦</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">
                      {getListingDisplayTitle(listing.title)}
                    </p>
                    <p className="text-sm capitalize text-gray-500">
                      {listing.listingStatus === "pending_qr" ? "Needs QR setup" : listing.listingStatus}
                      {listing.category ? ` · ${listing.category}` : ""}
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
