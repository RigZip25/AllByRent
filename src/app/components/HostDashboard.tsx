import type { ReactNode } from "react";
import { DollarSign, Package, Plus, TrendingUp } from "lucide-react";
import { loadPublishedListings } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const AMBER = "#F0B429";
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

export function HostDashboard({ onListItem }: { onListItem: () => void }) {
  const listings = loadPublishedListings();
  const activeCount = listings.filter(
    (item) =>
      item.listingStatus === "active" ||
      item.listingStatus === "published" ||
      item.listingStatus === "pending_sticker",
  ).length;

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
              List your first item and start earning in your area.
            </p>
            <button
              type="button"
              onClick={onListItem}
              className="mt-4 w-full rounded-xl py-3 text-base font-bold text-white"
              style={{ backgroundColor: AMBER, color: GREEN_DARK }}
            >
              List something →
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className="flex items-center gap-3 rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F0F4F2] text-2xl"
                >
                  {listing.photos[0] ? (
                    <img
                      src={listing.photos[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>📦</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {getListingDisplayTitle(listing.title)}
                  </p>
                  <p className="text-sm capitalize text-gray-500">
                    {listing.listingStatus}
                    {listing.category ? ` · ${listing.category}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
