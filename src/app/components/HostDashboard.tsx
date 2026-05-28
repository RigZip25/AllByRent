import type { ReactNode } from "react";
import { DollarSign, Package, Plus, TrendingUp } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { loadManageableListings } from "../../lib/hostAccess";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { useMediaUrl } from "../../lib/useMediaUrl";

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
}: {
  onListItem: () => void;
  onOpenListing: (listingId: string) => void;
}) {
  const auth = useAuth();
  const listings = loadManageableListings(auth.userId, auth.userEmail);
  const activeCount = listings.filter((item) => item.listingStatus === "active").length;
  const needsQrCount = listings.filter((item) => item.listingStatus === "pending_qr").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <h2 className="mb-3 shrink-0 text-[20px] font-extrabold" style={{ color: GREEN_DARK }}>
        Host Dashboard
      </h2>

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
            value="$0"
            icon={<DollarSign className="h-4 w-4" style={{ color: GREEN }} />}
          />
          <StatCard
            label="Views"
            value="—"
            icon={<TrendingUp className="h-4 w-4" style={{ color: GREEN }} />}
          />
        </div>

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

        {listings.length === 0 ? (
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
                    <ListingThumb media={listing.photos?.[0] ?? null} />
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

function ListingThumb({ media }: { media: { id: string; mimeType: string; thumbId?: string } | null }) {
  const thumb = media?.thumbId ? { ...media, id: media.thumbId } : media;
  const { url } = useMediaUrl(thumb);
  if (url) {
    return <img src={url} alt="" className="h-full w-full object-cover" />;
  }
  return <span aria-hidden>📦</span>;
}
