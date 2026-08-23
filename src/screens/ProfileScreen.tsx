import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { ProfilePhotoCapture } from "../components/profile/ProfilePhotoCapture";
import { ProfilePhotoOnboarding } from "../components/profile/ProfilePhotoOnboarding";
import { ProfileTrustBadges } from "../components/profile/ProfileTrustBadges";
import { ConnectSetupError } from "../components/payments/ConnectSetupError";
import { getHostResponseDisplay } from "../lib/hostResponseRate";
import {
  hasAvatarPhoto,
  isPhotoPromptDeferred,
  saveAvatarPhoto,
  setPhotoPromptDeferred,
} from "../lib/avatarStorage";
import { getAppMode, type AppMode } from "../lib/appMode";
import { RoleModeSwitcher } from "../components/RoleModeSwitcher";
import {
  getProfileDisplayLabel,
  getProfileLocationSummary,
  applyReviewStatsToProfile,
  loadUserProfile,
  refreshProfileStats,
  saveUserProfile,
  setProfileAvatarUrl,
  syncUserProfileFromAuth,
  updateProfileFields,
  updatePreferredMode,
  type UserProfile,
} from "../lib/userProfileStorage";
import { formatBuildStamp } from "../lib/buildInfo";
import { formatUsPhoneDisplay } from "../lib/usPhoneFormat";
import { confirmAndResetAppData } from "../lib/resetAppStorage";
import { useAuth } from "../hooks/AuthProvider";
import { signOut } from "../lib/auth";
import { fetchRemoteProfile } from "../lib/supabaseProfile";
import { fetchReviewsForUserRemote } from "../lib/reviewsStorage";
import { loadConnectStatus, startConnectOnboarding } from "../lib/repositories/connectRepository";
import { useLocaleControls, useMessages } from "../lib/i18n/react";
import type { AppLocale } from "../lib/i18n/types";

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
  return <RoleModeSwitcher active={mode} onChange={onChange} />;
}

export function ProfileScreen({
  onRentals: _onRentals,
  onMrE,
  onEditLocation,
  onOpenNotifications,
  onOpenCoHosts,
  onOpenPersonalInfo,
  onOpenIdentity,
  onOpenAgentActivity: _onOpenAgentActivity,
  onViewPublicProfile,
  onRequireAuth,
  onPreferredModeChange,
}: {
  onRentals: () => void;
  onMrE: () => void;
  onEditLocation: () => void;
  onOpenNotifications: () => void;
  onOpenCoHosts?: () => void;
  onOpenPersonalInfo?: (field?: "name" | "phone") => void;
  onOpenIdentity?: () => void;
  onOpenAgentActivity?: () => void;
  onViewPublicProfile?: (userId?: string) => void;
  onRequireAuth?: () => void;
  onPreferredModeChange?: (mode: AppMode) => void;
}) {
  const auth = useAuth();
  const { profile: profileCopy } = useMessages();
  const localeControls = useLocaleControls();
  const [profile, setProfile] = useState<UserProfile>(() =>
    refreshProfileStats(loadUserProfile(), auth.userId),
  );
  const [captureMode, setCaptureMode] = useState<"camera" | "library" | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const mode = getAppMode();
  const locationSummary = useMemo(() => getProfileLocationSummary(), [profile]);
  const [recentReviews, setRecentReviews] = useState<{ rating: number; comment: string; createdAt: string }[]>([]);
  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; payoutsEnabled: boolean; last4?: string | null }>({
    connected: false,
    payoutsEnabled: false,
    last4: null,
  });
  const [connectBusy, setConnectBusy] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectErrorCode, setConnectErrorCode] = useState<string | null>(null);
  const [publicProfileError, setPublicProfileError] = useState<string | null>(null);
  const authPromptedRef = useRef(false);

  const displayNameLabel = getProfileDisplayLabel(profile.displayName);

  useEffect(() => {
    if (!auth.userId) return;
    const synced = syncUserProfileFromAuth({
      userId: auth.userId,
      userEmail: auth.userEmail,
    });
    setProfile(refreshProfileStats(synced, auth.userId));
  }, [auth.userId, auth.userEmail]);

  useEffect(() => {
    if (!auth.userId) return;
    let mounted = true;
    void loadConnectStatus(auth.userId).then((status) => {
      if (!mounted) return;
      setStripeStatus({
        connected: status.connected,
        payoutsEnabled: status.payoutsEnabled,
        last4: status.last4,
      });
    });
    void fetchRemoteProfile(auth.userId).then((remote) => {
      if (!mounted || !remote) return;
      const synced = syncUserProfileFromAuth({
        userId: auth.userId!,
        userEmail: auth.userEmail,
        remoteDisplayName: remote.display_name,
        remoteEmail: remote.email,
      });
      const displayName = synced.displayName;
      const memberSince = remote.created_at?.slice(0, 10) || synced.memberSince;
      const resolvedEmail = auth.userEmail ?? remote.email ?? synced.email;
      const next = updateProfileFields({
        displayName,
        email: resolvedEmail,
        phone: remote.phone ?? synced.phone,
        avatarUrl: synced.avatarUrl,
      });
      next.memberSince = memberSince;
      next.verification = {
        ...next.verification,
        email: Boolean(resolvedEmail),
        phone: Boolean(remote.phone_verified ?? next.verification.phone),
        identity: Boolean(remote.identity_verified ?? next.verification.identity),
      };
      if (remote.rating != null && Number.isFinite(remote.rating)) {
        next.host.rating = Number(remote.rating);
      }
      setStripeStatus({
        connected: Boolean(remote.stripe_connect_account_id),
        payoutsEnabled: Boolean(remote.stripe_payouts_enabled),
        last4: remote.stripe_bank_last4 ?? null,
      });
      setProfile(refreshProfileStats(next, auth.userId));
    });
    return () => {
      mounted = false;
    };
  }, [auth.userId, auth.userEmail]);

  useEffect(() => {
    if (!auth.configured || auth.loading || auth.session || authPromptedRef.current) return;
    authPromptedRef.current = true;
    onRequireAuth?.();
  }, [auth.configured, auth.loading, auth.session, onRequireAuth]);

  useEffect(() => {
    if (!auth.userId) return;
    let mounted = true;
    void fetchReviewsForUserRemote(auth.userId).then((rows) => {
      if (!mounted) return;
      setRecentReviews(
        rows.slice(0, 3).map((r) => ({
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
      );
      setProfile((prev) => {
        const next = applyReviewStatsToProfile(prev, rows);
        saveUserProfile(next);
        return next;
      });
    });
    return () => {
      mounted = false;
    };
  }, [auth.userId]);

  const hasPhoto = hasAvatarPhoto((auth.userId ?? profile.id).trim() || profile.id);
  const showOnboarding = !hasPhoto && !isPhotoPromptDeferred();

  const responseKind = getHostResponseDisplay(profile.id, profile.host.usesManualBooking);
  const responseLabel =
    responseKind.kind === "rate"
      ? `${responseKind.percent}%`
      : responseKind.kind === "new_host"
        ? profileCopy.newHost
        : profileCopy.responseNotTracked;

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
    onPreferredModeChange?.(next);
  };

  const handleEditName = () => {
    onOpenPersonalInfo?.("name");
  };

  const handleEditPhone = () => {
    onOpenPersonalInfo?.("phone");
  };

  const openPublicProfile = () => {
    setPublicProfileError(null);
    if (auth.loading) return;

    if (!onViewPublicProfile) {
      setPublicProfileError(profileCopy.publicPreviewUnavailable);
      return;
    }

    const userId = (auth.userId ?? profile.id ?? loadUserProfile().id).trim();
    if (!userId) {
      if (auth.configured && !auth.session) {
        onRequireAuth?.();
        return;
      }
      setPublicProfileError(profileCopy.couldNotLoadAccount);
      return;
    }

    onViewPublicProfile(userId);
  };

  const needsDisplayName = !profile.displayName?.trim();

  const persistPhoto = async (blob: Blob) => {
    const ownerId = (auth.userId ?? profile.id).trim() || loadUserProfile().id.trim();
    if (!ownerId) return;
    const dataUrl = await saveAvatarPhoto(ownerId, blob);
    setPhotoPromptDeferred(false);
    setProfileAvatarUrl(dataUrl);
    setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
  };

  if (showOnboarding) {
    return (
      <ProfilePhotoOnboarding
        onPhotoSaved={(blob) => void persistPhoto(blob)}
        onDeferred={() => setProfile(refreshProfileStats(loadUserProfile(), auth.userId))}
        onOpenPersonalInfo={() => onOpenPersonalInfo?.()}
        onViewPublicProfile={() => openPublicProfile()}
      />
    );
  }

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-4 pt-3">
        {needsDisplayName ? (
          <div
            className="mb-4 rounded-2xl border bg-white p-4"
            style={{ borderColor: BORDER }}
          >
            <p className="text-[14px] font-semibold" style={{ color: GREEN }}>
              {profileCopy.whatShouldWeCallYou}
            </p>
            <p className="mt-1 text-[13px] text-gray-500">
              {profileCopy.displayNameHint}
            </p>
            <button
              type="button"
              onClick={() => onOpenPersonalInfo?.("name")}
              className="mt-3 w-full rounded-xl py-2.5 text-[14px] font-bold text-white"
              style={{ backgroundColor: "#F59E0B" }}
            >
              {profileCopy.addYourName}
            </button>
          </div>
        ) : null}

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
                  {displayNameLabel}
                </h1>
              </div>
              <p className="mt-0.5 text-[14px] text-gray-500">
                {profileCopy.memberSince(memberYear)}
              </p>
              <ProfileTrustBadges profile={profile} />
              {onViewPublicProfile ? (
                <button
                  type="button"
                  onClick={openPublicProfile}
                  className="mt-2 text-[13px] font-semibold underline"
                  style={{ color: GREEN }}
                >
                  {profileCopy.previewPublicProfile}
                </button>
              ) : null}
              {publicProfileError ? (
                <div className="mt-2 space-y-2" role="status">
                  <p className="text-[12px] font-medium text-amber-800">{publicProfileError}</p>
                  {auth.configured && !auth.session && onRequireAuth ? (
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      className="text-[13px] font-semibold underline"
                      style={{ color: GREEN }}
                    >
                      {profileCopy.signInPublicProfile}
                    </button>
                  ) : null}
                </div>
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
              {profileCopy.addProfilePhoto}
            </button>
          ) : null}

          {profile.bio ? (
            <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{profile.bio}</p>
          ) : null}
        </div>

        <SectionTitle>{profileCopy.defaultExperience}</SectionTitle>
        <div className="mb-4">
          <ModeToggle mode={mode} onChange={handleModeChange} />
          <p className="mt-2 px-1 text-[12px] text-gray-500">
            {profileCopy.defaultExperienceHint}
          </p>
        </div>

        <SectionTitle>{profileCopy.yourStats}</SectionTitle>
        <div className="mb-4 flex gap-2">
          <StatTile
            label={profileCopy.asRenter}
            value={
              profile.renter.completedRentals > 0
                ? `${profile.renter.rating}★ · ${profile.renter.completedRentals}`
                : profileCopy.noRentalsYet
            }
          />
          <StatTile
            label={profileCopy.asHost}
            value={
              profile.host.listingsCount > 0
                ? profile.host.reviewCount > 0 && profile.host.rating > 0
                  ? `${profile.host.rating}★ · ${profileCopy.listingsCount(profile.host.listingsCount)}`
                  : profileCopy.listingsCount(profile.host.listingsCount)
                : profileCopy.noListingsYet
            }
          />
          <StatTile label={profileCopy.response} value={responseLabel} />
        </div>

        <SectionTitle>{profileCopy.account}</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<MapPin className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={profileCopy.location}
              value={locationSummary}
              onClick={onEditLocation}
            />
          </li>
          <li>
            <RowButton
              icon={<User className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={profileCopy.name}
              value={displayNameLabel}
              onClick={handleEditName}
            />
          </li>
          {onOpenPersonalInfo ? (
            <li>
              <RowButton
                icon={<Settings className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
                label={profileCopy.settings}
                value={profileCopy.settingsHint}
                onClick={() => onOpenPersonalInfo()}
              />
            </li>
          ) : null}
          <li>
            <RowButton
              icon={<Sparkles className="h-5 w-5" style={{ color: "#F59E0B" }} />}
              label={profileCopy.phone}
              value={
                profile.phone?.trim()
                  ? `${formatUsPhoneDisplay(profile.phone)}${
                      profile.verification.phone ? ` · ${profileCopy.phoneVerifiedShort}` : ` · ${profileCopy.phoneVerifyNeeded}`
                    }`
                  : profileCopy.addPhone
              }
              onClick={handleEditPhone}
            />
          </li>
          {onOpenCoHosts ? (
            <li>
              <RowButton
                icon={<Users className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
                label={profileCopy.coHosts}
                value={profileCopy.coHostsHint}
                onClick={onOpenCoHosts}
              />
            </li>
          ) : null}
        </ul>

        <SectionTitle>{profileCopy.payouts}</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<CreditCard className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={stripeStatus.connected ? profileCopy.bankConnected : profileCopy.connectBank}
              value={
                connectBusy
                  ? profileCopy.openingStripe
                  : stripeStatus.connected
                    ? stripeStatus.payoutsEnabled
                      ? profileCopy.payoutsEnabled(stripeStatus.last4 ?? undefined)
                      : profileCopy.pendingVerification
                    : profileCopy.requiredPayouts
              }
              onClick={() => {
                setConnectBusy(true);
                setConnectError(null);
                setConnectErrorCode(null);
                void startConnectOnboarding("/?screen=profile")
                  .then((result) => {
                    if (!result.ok) {
                      setConnectError(
                        result.code === "phone_unverified"
                          ? profileCopy.phoneVerifyNeeded
                          : result.reason,
                      );
                      setConnectErrorCode(result.code ?? null);
                      return;
                    }
                    window.location.href = result.url;
                  })
                  .finally(() => setConnectBusy(false));
              }}
            />
          </li>
          {connectError ? (
            <li className="list-none">
              <ConnectSetupError message={connectError} code={connectErrorCode} />
            </li>
          ) : null}
        </ul>

        {recentReviews.length > 0 ? (
          <>
            <SectionTitle>{profileCopy.reviews}</SectionTitle>
            <ul className="mb-4 flex flex-col gap-2">
              {recentReviews.map((r, idx) => (
                <li key={`${r.createdAt}-${idx}`} className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                  <p className="text-[14px] font-semibold" style={{ color: GREEN }}>
                    {r.rating}★
                  </p>
                  {r.comment ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{r.comment}</p>
                  ) : (
                    <p className="mt-1 text-[13px] text-gray-400">{profileCopy.noComment}</p>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <SectionTitle>{profileCopy.trustPayments}</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<Shield className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={profileCopy.verification}
              value={
                profile.verification.identity
                  ? profileCopy.fullyVerified
                  : profileCopy.completeId
              }
              onClick={() => {
                if (onOpenIdentity) {
                  onOpenIdentity();
                  return;
                }
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set("screen", "identity");
                  window.location.href = url.toString();
                } catch {
                  window.location.href = "/?screen=identity";
                }
              }}
            />
          </li>
          <li>
            <RowButton
              icon={<Star className="h-5 w-5" style={{ color: AMBER }} />}
              label={profileCopy.reviews}
              value={profileCopy.reviewsHint}
              onClick={openPublicProfile}
            />
          </li>
        </ul>

        <SectionTitle>{profileCopy.preferences}</SectionTitle>
        <ul className="mb-4 flex flex-col gap-2">
          <li>
            <RowButton
              icon={<Globe className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={profileCopy.language}
              value={
                localeControls.auto
                  ? localeControls.pageTranslateLang
                    ? profileCopy.languageAutoTranslated(
                        localeControls.pageTranslateLabel || localeControls.pageTranslateLang,
                      )
                    : profileCopy.languageAuto
                  : profileCopy.languageValue(localeControls.labels[localeControls.locale])
              }
              onClick={() => {
                if (localeControls.auto) {
                  localeControls.setLocale("en");
                  return;
                }
                const order = localeControls.supported;
                const idx = order.indexOf(localeControls.locale);
                const next = order[idx + 1];
                if (next) {
                  localeControls.setLocale(next as AppLocale);
                  return;
                }
                localeControls.setLocaleAuto();
              }}
            />
            <p className="mt-1.5 px-1 text-[12px] text-gray-500">{profileCopy.languageHint}</p>
          </li>
          <li>
            <RowButton
              icon={<Bell className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={profileCopy.notifications}
              value={profile.notificationsEnabled ? profileCopy.on : profileCopy.off}
              onClick={onOpenNotifications}
            />
          </li>
          <li>
            <RowButton
              icon={<HelpCircle className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={profileCopy.helpFaq}
              onClick={onMrE}
            />
          </li>
        </ul>

        {auth.session ? (
          <button
            type="button"
            disabled={!auth.configured || authBusy}
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
            {authBusy ? profileCopy.signingOut : profileCopy.signOut}
          </button>
        ) : auth.configured && onRequireAuth ? (
          <button
            type="button"
            onClick={onRequireAuth}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[15px] font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {profileCopy.signInCreate}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-[15px] font-semibold text-gray-500 opacity-60"
            style={{ borderColor: BORDER }}
          >
            {profileCopy.signInRequired}
          </button>
        )}

        {auth.configured && auth.session ? (
          <div className="mt-3 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              {profileCopy.authSection}
            </p>
            <p className="mt-1 text-[13px] text-gray-600">
              {profileCopy.signedInAs(
                auth.userEmail ?? auth.userId ?? profileCopy.userFallback,
              )}
            </p>
          </div>
        ) : auth.configured ? (
          <div className="mt-3 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              {profileCopy.authSection}
            </p>
            <p className="mt-1 text-[13px] text-gray-600">{profileCopy.notSignedIn}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => confirmAndResetAppData()}
          className="mt-3 w-full min-h-[44px] touch-manipulation py-2 text-center text-[12px] font-medium text-red-600/70 active:text-red-700"
        >
          {profileCopy.resetApp}
        </button>

        <p
          className="mt-4 text-center text-[11px] text-gray-400"
          title="Deployment id — compare after a release"
        >
          {formatBuildStamp()}
        </p>
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

    </div>
  );
}
