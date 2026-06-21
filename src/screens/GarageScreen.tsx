import { useMemo, useState } from "react";
import { Share2, Store } from "lucide-react";
import { HostDashboard } from "../app/components/HostDashboard";
import { useAuth } from "../hooks/AuthProvider";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { getActiveRentLocationLabel } from "../lib/listingStorage";
import { loadUserProfile } from "../lib/userProfileStorage";
import { SocialShareButtons } from "../components/share/SocialShareButtons";
import { buildGarageSharePayload, garageShareUrl } from "../lib/socialShare";

const GREEN_DARK = "#0D5C3A";

type GarageScreenProps = {
  onNavigate: (screen: string) => void;
  onStockGarage: () => void;
  onViewShop: () => void;
};

export function GarageScreen({ onNavigate, onStockGarage, onViewShop }: GarageScreenProps) {
  const auth = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const hostId = resolveHostAccountId(auth.userId);
  const profile = useMemo(() => loadUserProfile(), []);
  const city = getActiveRentLocationLabel().trim();

  const sharePayload = useMemo(
    () =>
      buildGarageSharePayload({
        garageName: profile.displayName || "My garage",
        url: garageShareUrl(hostId),
        city: city || undefined,
      }),
    [city, hostId, profile.displayName],
  );

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
        <div>
          <h1 className="text-[22px] font-extrabold" style={{ color: GREEN_DARK }}>
            My Garage
          </h1>
          <p className="text-[13px] text-gray-500">Your household storefront</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewShop}
            className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold"
            style={{ borderColor: "#E8E6E0", color: GREEN_DARK }}
          >
            <Store className="h-4 w-4" />
            Shop
          </button>
          <button
            type="button"
            onClick={() => setShareOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold text-gray-700"
            style={{ borderColor: "#E8E6E0" }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {shareOpen ? (
        <div className="shrink-0 px-4 pb-3">
          <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#E8E6E0" }}>
            <p className="mb-2 text-[13px] font-semibold text-gray-800">Share your garage showcase</p>
            <p className="mb-3 text-[12px] text-gray-500">
              Story format for TikTok &amp; Instagram · landscape for Facebook &amp; Nextdoor.
            </p>
            <SocialShareButtons
              payload={sharePayload}
              shareKind="garage"
              targetId={hostId}
              compact
            />
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden px-4">
        <HostDashboard
          onListItem={onStockGarage}
          onOpenListing={(listingId) => onNavigate(`hostListingDetail:${listingId}`)}
          onShareGarage={() => setShareOpen(true)}
        />
      </div>
    </div>
  );
}
