import { useEffect, useState } from "react";
import { HomeFeedCard } from "../app/components/HomeFeedCard";
import { garageDisplayName } from "../lib/garageDisplay";
import { fetchActiveListingsForCityRemote, getActiveRentLocationLabel } from "../lib/listingStorage";

const GREEN = "#0D5C3A";

export function NeighborGarageScreen({
  hostId,
  onBack,
  onOpenListing,
}: {
  hostId: string;
  onBack: () => void;
  onOpenListing: (listingId: string) => void;
}) {
  const [listings, setListings] = useState<Awaited<ReturnType<typeof fetchActiveListingsForCityRemote>>>([]);
  const [loading, setLoading] = useState(true);
  const city = getActiveRentLocationLabel().trim();

  useEffect(() => {
    let mounted = true;
    void fetchActiveListingsForCityRemote(city)
      .then((all) => {
        if (!mounted) return;
        setListings(
          all.filter(
            (l) => l.listingStatus === "active" && (l.hostId ?? "demo-user") === hostId,
          ),
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [city, hostId]);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 px-4 py-3">
        <button type="button" onClick={onBack} className="text-[15px] font-semibold" style={{ color: GREEN }}>
          ← Back
        </button>
        <h1 className="mt-2 text-[22px] font-extrabold" style={{ color: GREEN }}>
          {garageDisplayName(hostId)}
        </h1>
        <p className="text-[14px] text-gray-500">Peek inside — garage sale style</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {loading ? (
          <p className="py-10 text-center text-gray-500">Loading shelf…</p>
        ) : listings.length === 0 ? (
          <p className="py-10 text-center text-gray-500">Shelf is empty right now.</p>
        ) : (
          <ul className="space-y-2.5">
            {listings.map((listing) => (
              <li key={listing.id}>
                <HomeFeedCard listing={listing} onSelect={() => onOpenListing(listing.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
