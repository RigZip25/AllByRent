import { useEffect, useMemo, useState } from "react";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { BadgeCheck, Shield, Star as StarIcon } from "lucide-react";
import { getPublicProfile, type PublicUserProfile } from "../lib/demoUserProfiles";
import { fetchRemoteProfile, type RemoteProfile } from "../lib/supabaseProfile";
import { loadUserProfile, type UserProfile } from "../lib/userProfileStorage";
import { loadPublishedListings } from "../lib/listingStorage";
import { getListingDisplayTitle } from "../lib/listingQr";
import { categoryEmoji } from "../lib/listingCardMeta";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

function looksLikeUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function publicFromRemote(profile: RemoteProfile): PublicUserProfile {
  return {
    id: profile.id,
    displayName: profile.display_name?.trim() || "Neighbor",
    memberSince: profile.created_at,
    avatarUrl: null,
    identityVerified: Boolean(profile.identity_verified),
    phoneVerified: Boolean(profile.phone_verified),
    rating: profile.rating ?? 0,
    transactionCount: 0,
    reviewCount: 0,
    noShowCount: 0,
    listings: [],
    reviews: [],
  };
}

function publicFromOwn(profile: UserProfile): PublicUserProfile {
  return {
    id: profile.id,
    displayName: profile.displayName,
    memberSince: profile.memberSince,
    avatarUrl: profile.avatarUrl,
    identityVerified: profile.verification.identity,
    phoneVerified: profile.verification.phone,
    rating: profile.host.rating || profile.renter.rating,
    transactionCount: profile.renter.completedRentals + profile.host.listingsCount,
    reviewCount: profile.host.reviewCount + profile.renter.reviewCount,
    noShowCount: profile.renter.noShowCount,
    listings: [],
    reviews: [],
  };
}

function listingsForHost(hostId: string): PublicUserProfile["listings"] {
  return loadPublishedListings()
    .filter((listing) => listing.hostId === hostId && listing.listingStatus === "active")
    .slice(0, 12)
    .map((listing) => ({
      id: listing.id,
      title: getListingDisplayTitle(listing.title),
      emoji: categoryEmoji(listing.category),
      pricePerDay: Number.parseFloat(listing.pricing.dailyRate) || 0,
    }));
}

export function PublicProfileScreen({
  userId,
  onBack,
  onOpenListing,
}: {
  userId: string;
  onBack: () => void;
  onOpenListing?: (listingId: string) => void;
}) {
  const own = loadUserProfile();
  const isSelf = userId === own.id;
  const [remoteProfile, setRemoteProfile] = useState<PublicUserProfile | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);

  const demoProfile = isSelf ? null : getPublicProfile(userId);
  const baseProfile = isSelf ? publicFromOwn(own) : demoProfile ?? remoteProfile;
  const hostListings = useMemo(() => listingsForHost(userId), [userId]);
  const profile = baseProfile
    ? {
        ...baseProfile,
        listings: baseProfile.listings.length > 0 ? baseProfile.listings : hostListings,
      }
    : null;

  useEffect(() => {
    if (isSelf || demoProfile || !looksLikeUuid(userId)) {
      setRemoteProfile(null);
      setRemoteLoading(false);
      return;
    }
    let mounted = true;
    setRemoteLoading(true);
    void fetchRemoteProfile(userId)
      .then((remote) => {
        if (!mounted) return;
        setRemoteProfile(remote ? publicFromRemote(remote) : null);
      })
      .finally(() => {
        if (mounted) setRemoteLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId, isSelf, demoProfile]);

  if (remoteLoading && !profile) {
    return (
      <div className="screen flex flex-col bg-[#F0F4F2] p-4">
        <button type="button" onClick={onBack} className="text-[15px] font-semibold" style={{ color: GREEN }}>
          Back
        </button>
        <p className="mt-8 text-center text-gray-500">Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="screen flex flex-col bg-[#F0F4F2] p-4">
        <button type="button" onClick={onBack} className="text-[15px] font-semibold" style={{ color: GREEN }}>
          Back
        </button>
        <p className="mt-8 text-center text-gray-500">Profile not found.</p>
      </div>
    );
  }

  const memberYear = new Date(profile.memberSince).getFullYear();

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onBack} className="text-[15px] font-semibold" style={{ color: GREEN }}>
          Back
        </button>
        <h1 className="text-[18px] font-bold" style={{ color: GREEN }}>
          {isSelf ? "Your public profile" : profile.displayName}
        </h1>
      </header>

      <div className="screen-scroll flex-1 px-4 pb-6">
        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex gap-4">
            <ProfileAvatar avatarUrl={profile.avatarUrl} size={72} showHint={!profile.avatarUrl} />
            <div>
              <h2 className="text-[20px] font-bold" style={{ color: GREEN }}>
                {profile.displayName}
              </h2>
              <p className="text-[14px] text-gray-500">Member since {memberYear}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.phoneVerified ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    Phone ✓
                  </span>
                ) : null}
                {profile.identityVerified ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
                  >
                    <Shield className="h-3 w-3" />
                    ID Verified ✓
                  </span>
                ) : null}
                {profile.reviewCount > 0 ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: `${GREEN}14`, color: GREEN }}
                  >
                    <StarIcon className="h-3 w-3" />
                    {profile.reviewCount} reviews
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-center">
            <div className="flex-1">
              <p className="text-[18px] font-bold" style={{ color: GREEN }}>
                {profile.rating > 0 ? `${profile.rating}★` : "—"}
              </p>
              <p className="text-[11px] text-gray-500">Rating</p>
            </div>
            <div className="flex-1">
              <p className="text-[18px] font-bold" style={{ color: GREEN }}>
                {profile.transactionCount}
              </p>
              <p className="text-[11px] text-gray-500">Transactions</p>
            </div>
            {profile.noShowCount > 0 ? (
              <div className="flex-1">
                <p className="text-[18px] font-bold text-orange-700">{profile.noShowCount}</p>
                <p className="text-[11px] text-gray-500">No-shows</p>
              </div>
            ) : null}
          </div>
        </div>

        {profile.reviews.length > 0 ? (
          <>
            <h3 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              Reviews
            </h3>
            <ul className="flex flex-col gap-2">
              {profile.reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[14px] font-semibold">{r.authorName}</span>
                    <span className="inline-flex items-center gap-0.5 text-[12px]" style={{ color: "#F59E0B" }}>
                      {r.rating}
                      <StarIcon className="h-3 w-3 fill-current" />
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600">{r.text}</p>
                </li>
              ))}
            </ul>
            {profile.reviewCount > 3 ? (
              <button type="button" className="mt-2 text-[14px] font-semibold" style={{ color: GREEN }}>
                See all {profile.reviewCount} reviews
              </button>
            ) : null}
          </>
        ) : null}

        {profile.listings.length > 0 ? (
          <>
            <h3 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wide text-gray-400">
              Listings
            </h3>
            <ul className="flex flex-col gap-2">
              {profile.listings.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    disabled={!onOpenListing}
                    onClick={() => onOpenListing?.(l.id)}
                    className="flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left disabled:cursor-default"
                    style={{ borderColor: BORDER }}
                  >
                    <span className="text-2xl">{l.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: GREEN }}>
                        {l.title}
                      </p>
                      <p className="text-[13px] text-gray-500">${l.pricePerDay}/day</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {!isSelf ? (
          <p className="mt-6 text-[12px] leading-relaxed text-gray-400">
            Email, phone, address, and payment details are never shown on public profiles.
          </p>
        ) : null}
      </div>
    </div>
  );
}
