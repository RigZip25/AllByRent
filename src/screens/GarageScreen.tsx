import { useMemo, useState } from "react";
import { Share2, Store } from "lucide-react";
import { HostDashboard } from "../app/components/HostDashboard";
import { RoleModeSwitcher } from "../components/RoleModeSwitcher";
import { useAuth } from "../hooks/AuthProvider";
import type { AppMode } from "../lib/appMode";
import { resolveHostAccountId } from "../lib/hostIdentity";
import { SocialShareButtons } from "../components/share/SocialShareButtons";
import { hostGarageSharePayload } from "../lib/garageMarketingShare";
import { garageSaleOpenLabel, getGarageSaleSchedule } from "../lib/garageSaleStorage";
import { useMessages } from "../lib/i18n/react";

const GREEN_DARK = "#0D5C3A";

type GarageScreenProps = {
  onNavigate: (screen: string) => void;
  onStockGarage: () => void;
  onResumeDraft?: (listingId: string) => void;
  onViewShop: () => void;
  onViewProfile?: (userId: string) => void;
  onOpenRental?: (bookingId: string) => void;
  onRoleModeChange: (mode: AppMode) => void;
};

export function GarageScreen({
  onNavigate,
  onStockGarage,
  onResumeDraft,
  onViewShop,
  onViewProfile,
  onOpenRental,
  onRoleModeChange,
}: GarageScreenProps) {
  const auth = useAuth();
  const t = useMessages();
  const [shareOpen, setShareOpen] = useState(false);
  const hostId = resolveHostAccountId(auth.userId);

  const sharePayload = useMemo(
    () =>
      hostGarageSharePayload({
        hostId,
        openUntilLabel: garageSaleOpenLabel(getGarageSaleSchedule()),
      }),
    [hostId],
  );

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="shrink-0 px-4 pb-2 pt-3">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold" style={{ color: GREEN_DARK }}>
              {t.garage.title}
            </h1>
            <p className="text-[13px] text-gray-500">{t.garage.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onViewShop}
              className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold"
              style={{ borderColor: "#E8E6E0", color: GREEN_DARK }}
            >
              <Store className="h-4 w-4" />
              {t.garageUi.shop}
            </button>
            <button
              type="button"
              onClick={() => setShareOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold text-gray-700"
              style={{ borderColor: "#E8E6E0" }}
            >
              <Share2 className="h-4 w-4" />
              {t.garageUi.share}
            </button>
          </div>
        </div>

        <RoleModeSwitcher active="earn" onChange={onRoleModeChange} />
      </div>

      {shareOpen ? (
        <div className="shrink-0 px-4 pb-3">
          <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#E8E6E0" }}>
            <p className="mb-2 text-[13px] font-semibold text-gray-800">
              {t.garageUi.shareShowcaseTitle}
            </p>
            <p className="mb-3 text-[12px] text-gray-500">
              {t.garageUi.shareShowcaseBody}
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
          onResumeDraft={onResumeDraft}
          onShareGarage={() => setShareOpen(true)}
          onViewProfile={onViewProfile}
          onOpenRental={onOpenRental}
        />
      </div>
    </div>
  );
}
