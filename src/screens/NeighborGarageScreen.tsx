import { useEffect, useMemo, useState } from "react";
import { HomeFeedCard } from "../app/components/HomeFeedCard";
import { garageDisplayName } from "../lib/garageDisplay";
import { fetchActiveListingsForCityRemote, getActiveRentLocationLabel } from "../lib/listingStorage";
import { useAuth } from "../hooks/AuthProvider";
import {
  isFollowingGarage,
} from "../lib/garageFollowStorage";
import { persistFollow, persistUnfollow } from "../lib/repositories/garageRepository";
import { pushInAppNotification } from "../lib/inAppNotifications";

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
  const auth = useAuth();
  const [listings, setListings] = useState<Awaited<ReturnType<typeof fetchActiveListingsForCityRemote>>>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(() => isFollowingGarage(hostId));
  const [followHint, setFollowHint] = useState<string | null>(null);
  const city = getActiveRentLocationLabel().trim();
  const garageName = useMemo(() => garageDisplayName(hostId), [hostId]);

  useEffect(() => {
    let mounted = true;
    void fetchActiveListingsForCityRemote(city)
      .then((all) => {
        if (!mounted) return;
        setListings(
          all.filter(
            (l) => l.listingStatus === "active" && (l.hostId ?? "") === hostId,
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
          {garageName}
        </h1>
        <p className="text-[14px] text-gray-500">Peek inside — garage sale style</p>
        <button
          type="button"
          onClick={() => {
            const followerId = auth.userId;
            if (!followerId) {
              setFollowHint("Sign in to follow this garage and get listing alerts.");
              return;
            }
            setFollowHint(null);
            if (following) {
              void persistUnfollow(hostId, followerId).then(() => setFollowing(false));
              return;
            }
            void persistFollow(
              {
                hostId,
                displayName: garageName,
                followedAt: new Date().toISOString(),
                notifyNewListings: true,
                notifyOpenHouse: true,
              },
              followerId,
            ).then(() => {
              setFollowing(true);
              pushInAppNotification({
                type: "general",
                title: "Following garage",
                body: `You'll get alerts when ${garageName} lists something new (push when enabled).`,
              });
            });
          }}
          className="mt-3 rounded-full border px-4 py-2 text-[13px] font-semibold"
          style={{
            borderColor: following ? GREEN : "#E8E6E0",
            color: following ? "white" : GREEN,
            backgroundColor: following ? GREEN : "white",
          }}
        >
          {following ? "Following · alerts on" : "Follow · get new listing alerts"}
        </button>
        {followHint ? <p className="mt-2 text-[13px] font-medium text-amber-800">{followHint}</p> : null}
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
