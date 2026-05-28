import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import { BottomNav } from "../app/components/BottomNav";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { ProfilePhotoCapture } from "../components/profile/ProfilePhotoCapture";
import { ProfilePhotoOnboarding } from "../components/profile/ProfilePhotoOnboarding";
import { RentanoChatSheet } from "../components/RentanoChat";
import { ProfileTrustBadges } from "../components/profile/ProfileTrustBadges";
import { getHostResponseDisplay } from "../lib/hostResponseRate";
import {
  hasAvatarPhoto,
  isPhotoPromptDeferred,
  saveAvatarPhoto,
  setPhotoPromptDeferred,
} from "../lib/avatarStorage";
import { getAppMode, type AppMode } from "../lib/appMode";
import { formatPlanUsage, loadSubscriptionPlanId } from "../lib/subscriptionPlans";
import {
  getProfileLocationSummary,
  loadUserProfile,
  refreshProfileStats,
  setProfileAvatarUrl,
  updatePreferredMode,
  type UserProfile,
} from "../lib/userProfileStorage";
import { formatBuildStamp } from "../lib/buildInfo";
import { confirmAndResetAppData } from "../lib/resetAppStorage";
import { useAuth } from "../hooks/AuthProvider";
import { signOut } from "../lib/auth";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const AMBER = "#F0B429";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </p>
  );
}

function RowButton({
  icon,
  label,
  value,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left active:bg-[#F9FAFB]"
      style={{ borderColor: BORDER }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: SURFACE }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold" style={{ color: GREEN }}>
          {label}
        </p>
        {value ? <p className="mt-0.5 truncate text-[13px] text-gray-500">{value}</p> : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
    </button>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-1 flex-col rounded-2xl border bg-white px-3 py-3 text-center"
      style={{ borderColor: BORDER }}
    >
      <p className="text-[18px] font-bold" style={{ color: GREEN }}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{label}</p>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: AppMode; onChange: (m: AppMode) => void }) {
  return (
    <div
      className="flex rounded-full border bg-white p-0.5"
      style={{ borderColor: BORDER }}
      role="tablist"
      aria-label="Preferred mode"
    >
      {(["rent", "earn"] as const).map((tab) => {
        const active = mode === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className="flex-1 rounded-full px-3 py-2 text-[13px] font-bold transition-colors"
            style={{
              backgroundColor: active ? GREEN : "transparent",
              color: active ? "white" : "#888",
            }}
          >
            {tab === "rent" ? "Rent" : "Earn"}
          </button>
        );
      })}
    </div>
  );
}

export function ProfileScreen({
  onHome,
  onRentals,
  onFourthTab,
  onEditLocation,
  onOpenPlans,
  onOpenCoHosts,
  onDeleteAccount,
  onViewPublicProfile,
}: {
  onHome: () => void;
  onRentals: () => void;
  onFourthTab: () => void;
  onEditLocation: () => void;
  onOpenPlans: () => void;
  onOpenCoHosts?: () => void;
  onDeleteAccount?: () => void;
  onViewPublicProfile?: () => void;
}) {
  const [rentanoOpen, setRentanoOpen] = useState(false);
  const auth = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() =>
    refreshProfileStats(loadUserProfile(), auth.userId),
  );
  const [captureMode, setCaptureMode] = useState<"camera" | "library" | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const mode = getAppMode();
  const locationSummary = useMemo(() => getProfileLocationSummary(), [profile]);

  const hasPhoto = hasAvatarPhoto(profile.id);
  const showOnboarding = !hasPhoto && !isPhotoPromptDeferred();

  const planId = loadSubscriptionPlanId();
  const planSummary = formatPlanUsage(planId, profile.host.listingsCount);
  const responseDisplay = getHostResponseDisplay(profile.id, profile.host.usesManualBooking);

  const memberYear = useMemo(() => {
    try {
      return new Date(profile.memberSince).getFullYear().toString();
    } catch {
      return "2026";
    }
  }, [profile.memberSince]);

  const handleModeChange = (next: AppMode) => {
    updatePreferredMode(next);
    setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
  };

  const persistPhoto = async (blob: Blob) => {
    const dataUrl = await saveAvatarPhoto(profile.id, blob);
    setPhotoPromptDeferred(false);
    setProfileAvatarUrl(dataUrl);
    setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
  };

  if (showOnboarding) {
    return (
      <ProfilePhotoOnboarding
        onPhotoSaved={(blob) => void persistPhoto(blob)}
        onDeferred={() => setProfile(refreshProfileStats(loadUserProfile(), auth.userId))}
      />
    );
  }

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-4 pt-3">
        <div
          className="mb-4 rounded-3xl border bg-white p-5"
          style={{ borderColor: BORDER }}
        >
          <div className="flex items-start gap-4">
            <ProfileAvatar
              avatarUrl={profile.avatarUrl}
              size={64}
              showHint={!hasPhoto}
              onClick={() => setCaptureMode("camera")}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[22px] font-bold leading-tight" style={{ color: GREEN }}>
                  {profile.displayName}
                </h1>
              </div>
              <p className="mt-0.5 text-[14px] text-gray-500">Member since {memberYear}</p>
              <ProfileTrustBadges profile={profile} />
              {onViewPublicProfile ? (
                <button
                  type="button"
                  onClick={onViewPublicProfile}
                  className="mt-2 text-[13px] font-semibold underline"
                  style={{ color: GREEN }}
                >
                  Preview public profile
                </button>
              ) : null}
            </div>
          </div>

          {!hasPhoto ? (
            <button
              type="button"
              onClick={() => setCaptureMode("camera")}
              className="mt-3 w-full rounded-xl py-2.5 text-[14px] font-bold text-white"
              style={{ backgroundColor: "#F59E0B" }}
            >
              Add profile photo
            </button>
          ) : null}

          {profile.bio ? (
            <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{profile.bio}</p>
          ) : null}
        </div>

        <SectionTitle>Default experience</SectionTitle>
        <div className="mb-4">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          <p className="mt-2 px-1 text-[12px] text-gray-500">
            Rent or Earn — same profile. Home opens in this mode.
          </p>
        </div>

        <SectionTitle>Your stats</SectionTitle>
        <div className="mb-4 flex gap-2">
          <StatTile
            label="As renter"
            value={
              profile.renter.completedRentals > 0
                ? `${profile.renter.rating}★ · ${profile.renter.completedRentals}`
                : "—"
            }
          />
          <StatTile
            label="As host"
            value={
              profile.host.listingsCount > 0
                ? `${profile.host.rating}★ · ${profile.host.listingsCount} listings`
                : "—"
            }
          />
          <StatTile label="Response" value={responseDisplay.label} />
        </div>

        <SectionTitle>Account</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<MapPin className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Location"
              value={locationSummary}
              onClick={onEditLocation}
            />
          </li>
          <li>
            <RowButton
              icon={<User className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Personal info"
              value={profile.email || "Add email"}
            />
          </li>
          <li>
            <RowButton
              icon={<Sparkles className="h-5 w-5" style={{ color: "#F59E0B" }} />}
              label="Subscription plan"
              value={planSummary}
              onClick={onOpenPlans}
            />
          </li>
          {onOpenCoHosts ? (
            <li>
              <RowButton
                icon={<Users className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
                label="Co-hosts"
                value="Invite helpers for your listings"
                onClick={onOpenCoHosts}
              />
            </li>
          ) : null}
        </ul>

        <SectionTitle>Trust &amp; payments</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<Shield className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Verification"
              value={
                profile.verification.identity
                  ? "Fully verified"
                  : "Complete ID for higher limits"
              }
            />
          </li>
          <li>
            <RowButton
              icon={<CreditCard className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Payouts (Stripe)"
              value={profile.payoutConnected ? "Connected" : "Not connected — demo"}
            />
          </li>
          <li>
            <RowButton
              icon={<Star className="h-5 w-5" style={{ color: AMBER }} />}
              label="Reviews"
              value="View ratings as renter and host"
            />
          </li>
        </ul>

        <SectionTitle>Preferences</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<Bell className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Notifications"
              value={profile.notificationsEnabled ? "On" : "Off"}
            />
          </li>
          <li>
            <RowButton
              icon={<HelpCircle className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Help &amp; FAQ"
              onClick={() => setRentanoOpen(true)}
            />
          </li>
        </ul>

        <button
          type="button"
          disabled={auth.configured ? authBusy : true}
          onClick={() => {
            if (!auth.configured) return;
            setAuthBusy(true);
            void signOut()
              .catch(() => undefined)
              .finally(() => setAuthBusy(false));
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-[15px] font-semibold text-gray-500 disabled:opacity-60"
          style={{ borderColor: BORDER }}
        >
          <LogOut className="h-4 w-4" />
          {auth.configured ? (authBusy ? "Signing out…" : "Sign out") : "Log out (demo)"}
        </button>

        {auth.configured ? (
          <div className="mt-3 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              Auth
            </p>
            <p className="mt-1 text-[13px] text-gray-600">
              {auth.session
                ? `Signed in as ${auth.userEmail ?? auth.userId ?? "user"}`
                : "Not signed in"}
            </p>
            <button
              type="button"
              onClick={onDeleteAccount}
              className="mt-3 w-full min-h-[44px] touch-manipulation rounded-xl border py-2 text-center text-[13px] font-semibold text-red-600/80 active:text-red-700"
              style={{ borderColor: BORDER }}
            >
              Delete account
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => confirmAndResetAppData()}
          className="mt-3 w-full min-h-[44px] touch-manipulation py-2 text-center text-[12px] font-medium text-red-600/70 active:text-red-700"
        >
          Reset app
        </button>

        <p
          className="mt-4 text-center text-[11px] text-gray-400"
          title="Deployment id — compare after a release"
        >
          {formatBuildStamp()}
        </p>
      </div>

      <div className="shrink-0">
        <BottomNav
          activeTab="profile"
          appMode={mode}
          onHome={onHome}
          onRentals={onRentals}
          onRentano={() => setRentanoOpen(true)}
          onFourthTab={onFourthTab}
          onProfile={() => undefined}
        />
      </div>

      <ProfilePhotoCapture
        open={captureMode !== null}
        mode={captureMode ?? "camera"}
        onClose={() => setCaptureMode(null)}
        onCaptured={(blob) => {
          setCaptureMode(null);
          void persistPhoto(blob);
        }}
      />

      <RentanoChatSheet
        open={rentanoOpen}
        onClose={() => setRentanoOpen(false)}
        context={{ screen: "profile", appMode: mode }}
      />
    </div>
  );
}
