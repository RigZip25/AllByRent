import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, Share2, Store } from "lucide-react";
import { HostDashboard } from "../app/components/HostDashboard";
import { HostGarageListSection, type HostGarageListMode } from "../app/components/HostGarageListSection";
import { RoleModeSwitcher } from "../components/RoleModeSwitcher";
import { GarageLookEditor } from "../components/GarageLookEditor";
import { StoreLiveToggle } from "../components/StoreLiveToggle";
import { useAuth } from "../hooks/AuthProvider";
import type { AppMode } from "../lib/appMode";
import {
  fetchStoreLiveByHostIds,
  getLocalStoreLive,
  onStoreLiveChanged,
} from "../lib/garageStoreLive";
import { resolveGarageHostId } from "../lib/hostAccess";
import { SocialShareButtons } from "../components/share/SocialShareButtons";
import { hostGarageSharePayload } from "../lib/garageMarketingShare";
import { garageSaleOpenLabel, getGarageSaleSchedule } from "../lib/garageSaleStorage";
import { loadUserProfile } from "../lib/userProfileStorage";
import { useMessages } from "../lib/i18n/react";
import {
  HouseholdGarageSetupScreen,
  shouldShowHouseholdGarageSetup,
} from "./HouseholdGarageSetupScreen";

const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

type GarageScreenProps = {
  onBack?: () => void;
  onNavigate: (screen: string) => void;
  onStockGarage: () => void;
  onResumeDraft?: (listingId: string) => void;
  onViewShop: () => void;
  onPreviewAsNeighbor?: () => void;
  onViewProfile?: (userId: string) => void;
  onOpenRental?: (bookingId: string) => void;
  onOpenEarnings?: () => void;
  onRoleModeChange: (mode: AppMode) => void;
};

export function GarageScreen({
  onBack,
  onNavigate,
  onStockGarage,
  onResumeDraft,
  onViewShop,
  onPreviewAsNeighbor,
  onViewProfile,
  onOpenRental,
  onOpenEarnings,
  onRoleModeChange,
}: GarageScreenProps) {
  const auth = useAuth();
  const t = useMessages();
  const [shareOpen, setShareOpen] = useState(false);
  const [lookOpen, setLookOpen] = useState(false);
  const [listMode, setListMode] = useState<HostGarageListMode | null>(null);
  const [householdSetupDone, setHouseholdSetupDone] = useState(false);
  const hostId = resolveGarageHostId(auth.userId, auth.userEmail);
  const [storeLive, setStoreLive] = useState(() => getLocalStoreLive(hostId));

  const showHouseholdSetup =
    !householdSetupDone &&
    Boolean(auth.userId) &&
    shouldShowHouseholdGarageSetup({
      shopName: loadUserProfile().garageIdentity.shopName,
      userId: auth.userId,
      email: auth.userEmail,
    });

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
      if (id === hostId) {
        setStoreLive(live);
        if (!live) setShareOpen(false);
      }
    });
  }, [hostId, auth.userId, auth.userEmail]);

  const sharePayload = useMemo(
    () =>
      hostGarageSharePayload({
        hostId,
        openUntilLabel: garageSaleOpenLabel(getGarageSaleSchedule()),
      }),
    [hostId],
  );

  const openHostListing = (listingId: string) => onNavigate(`hostListingDetail:${listingId}`);

  if (showHouseholdSetup) {
    return (
      <HouseholdGarageSetupScreen
        onDone={() => setHouseholdSetupDone(true)}
        onSkipAlone={() => setHouseholdSetupDone(true)}
      />
    );
  }

  if (listMode) {
    return (
      <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
        <div className="screen-scroll flex-1 px-4 pb-8 pt-3">
          <HostGarageListSection
            mode={listMode}
            onBack={() => setListMode(null)}
            onOpenListing={openHostListing}
            onResumeDraft={onResumeDraft}
            onListItem={onStockGarage}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-8 pt-3">
        <div className="mb-3">
          {onBack ? (
            <div className="mb-1 flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:bg-white/80"
                aria-label={t.common.back}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: GREEN_DARK }} />
              </button>
              <h1
                className="text-[22px] font-extrabold leading-tight tracking-tight"
                style={{ color: GREEN_DARK }}
              >
                {t.garage.title}
              </h1>
            </div>
          ) : (
            <h1
              className="text-[22px] font-extrabold leading-tight tracking-tight"
              style={{ color: GREEN_DARK }}
            >
              {t.garage.title}
            </h1>
          )}
          <p className="mt-0.5 text-[13px] text-gray-500">{t.garage.subtitle}</p>
        </div>

        <StoreLiveToggle onOpenProfile={() => onNavigate("profile")} />

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={onViewShop}
            className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border bg-white px-2 py-2 text-[12px] font-semibold"
            style={{ borderColor: BORDER, color: GREEN_DARK }}
          >
            <Store className="h-4 w-4 shrink-0" />
            <span className="truncate">{t.garageUi.shop}</span>
          </button>
          {onPreviewAsNeighbor ? (
            <button
              type="button"
              onClick={onPreviewAsNeighbor}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border bg-white px-2 py-2 text-[12px] font-semibold text-gray-700"
              style={{ borderColor: BORDER }}
            >
              <Eye className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.garageUi.previewNeighbor}</span>
            </button>
          ) : null}
          {storeLive ? (
            <button
              type="button"
              onClick={() => setShareOpen((v) => !v)}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border bg-white px-2 py-2 text-[12px] font-semibold text-gray-700"
              style={{ borderColor: BORDER }}
            >
              <Share2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.garageUi.share}</span>
            </button>
          ) : null}
        </div>

        <RoleModeSwitcher active="earn" onChange={onRoleModeChange} />

        <button
          type="button"
          onClick={() => setLookOpen((v) => !v)}
          className="mt-2.5 w-full rounded-xl border bg-white px-3 py-2 text-left text-[13px] font-semibold"
          style={{ borderColor: BORDER, color: GREEN_DARK }}
        >
          {lookOpen ? t.garageUi.lookHide : t.garageUi.lookShow}
        </button>
        {lookOpen ? (
          <div className="mt-2">
            <GarageLookEditor />
          </div>
        ) : null}

        {shareOpen && storeLive ? (
          <div className="mt-3 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <p className="mb-2 text-[13px] font-semibold text-gray-800">
              {t.garageUi.shareShowcaseTitle}
            </p>
            <p className="mb-3 text-[12px] text-gray-500">{t.garageUi.shareShowcaseBody}</p>
            <SocialShareButtons
              payload={sharePayload}
              shareKind="garage"
              targetId={hostId}
              compact
            />
          </div>
        ) : null}

        <div className="mt-4">
          <HostDashboard
            onListItem={onStockGarage}
            onOpenListing={openHostListing}
            onResumeDraft={onResumeDraft}
            onShareGarage={storeLive ? () => setShareOpen(true) : undefined}
            onViewProfile={onViewProfile}
            onOpenRental={onOpenRental}
            onOpenLive={() => setListMode("live")}
            onOpenDrafts={() => setListMode("drafts")}
            onOpenEarnings={onOpenEarnings}
          />
        </div>
      </div>
    </div>
  );
}
