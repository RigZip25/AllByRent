import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, BadgeCheck, CreditCard, Loader2, Mail, Phone, User } from "lucide-react";
import { ProfileFieldEditSheet } from "../../components/profile/ProfileFieldEditSheet";
import { PhoneVerifySheet } from "../../components/profile/PhoneVerifySheet";
import { ConnectSetupError } from "../../components/payments/ConnectSetupError";
import { useAuth } from "../../hooks/AuthProvider";
import { useMessages } from "../../lib/i18n/react";
import { fetchRemoteProfile, updateRemoteProfile } from "../../lib/supabaseProfile";
import { phoneDigitsForDisplay } from "../../lib/phoneE164";
import { refreshPhoneVerifiedFromRemote } from "../../lib/phoneKyc";
import {
  loadUserProfile,
  refreshProfileStats,
  syncUserProfileFromAuth,
  updateProfileFields,
  saveUserProfile,
} from "../../lib/userProfileStorage";
import { formatUsPhoneDisplay } from "../../lib/usPhoneFormat";
import { loadConnectStatus, startConnectOnboarding } from "../../lib/repositories/connectRepository";
import { onConnectOnboardingDone } from "../../lib/connectOnboardingBus";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type EditField = "name" | "phone" | "dob" | null;

function Row({
  icon,
  label,
  value,
  badge,
  onClick,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  badge?: string | null;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F4F2]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="truncate text-[15px] font-semibold" style={{ color: GREEN }}>
          {value}
        </p>
        {badge ? (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            {badge}
          </p>
        ) : null}
      </div>
      {trailing}
    </>
  );

  if (!onClick) {
    return (
      <div className="flex w-full items-center gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left active:bg-gray-50"
      style={{ borderColor: BORDER }}
    >
      {inner}
    </button>
  );
}

export function PersonalInfoScreen({
  onBack,
  onDeleteAccount,
  initialEdit,
}: {
  onBack: () => void;
  onDeleteAccount?: () => void;
  initialEdit?: "name" | "phone";
}) {
  const auth = useAuth();
  const { common, profile: profileCopy, profileDeep } = useMessages();
  const t = profileDeep.personalInfo;
  const [profile, setProfile] = useState(() => refreshProfileStats(loadUserProfile(), auth.userId));
  const [editing, setEditing] = useState<EditField>(null);
  const [phoneSheetOpen, setPhoneSheetOpen] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    payoutsEnabled: boolean;
    last4?: string | null;
  }>({ connected: false, payoutsEnabled: false, last4: null });
  const [connectBusy, setConnectBusy] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectErrorCode, setConnectErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (initialEdit === "name") setEditing("name");
    if (initialEdit === "phone") setPhoneSheetOpen(true);
  }, [initialEdit]);

  useEffect(() => {
    if (!auth.userId) return;
    let mounted = true;

    const apply = (userEmail: string | null, remoteEmail?: string | null) => {
      const synced = syncUserProfileFromAuth({
        userId: auth.userId!,
        userEmail,
        remoteEmail: remoteEmail ?? null,
      });
      if (!mounted) return;
      setProfile(refreshProfileStats(synced, auth.userId));
    };

    apply(auth.userEmail);

    void fetchRemoteProfile(auth.userId).then(async (remote) => {
      if (!mounted || !remote) return;
      apply(auth.userEmail, remote.email);
      if (remote.date_of_birth?.trim()) {
        updateProfileFields({ dateOfBirth: remote.date_of_birth.trim() });
      }
      await refreshPhoneVerifiedFromRemote(auth.userId);
      if (!mounted) return;
      setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
      setStripeStatus({
        connected: Boolean(remote.stripe_connect_account_id),
        payoutsEnabled: Boolean(remote.stripe_payouts_enabled),
        last4: remote.stripe_bank_last4 ?? null,
      });
    });

    return () => {
      mounted = false;
    };
  }, [auth.userId, auth.userEmail]);

  useEffect(() => {
    if (!auth.userId) return;
    let mounted = true;
    const refreshStripe = () => {
      void loadConnectStatus(auth.userId).then((status) => {
        if (!mounted) return;
        setStripeStatus({
          connected: status.connected,
          payoutsEnabled: status.payoutsEnabled,
          last4: status.last4,
        });
      });
    };
    refreshStripe();
    return onConnectOnboardingDone(refreshStripe);
  }, [auth.userId]);

  const email =
    auth.userEmail?.trim() ||
    profile.email?.trim() ||
    (auth.userId ? t.loadingEmail : t.notSignedIn);
  const displayName = profile.displayName?.trim() || t.addName;
  const phone = profile.phone?.trim()
    ? formatUsPhoneDisplay(profile.phone) || phoneDigitsForDisplay(profile.phone)
    : t.addPhone;
  const phoneVerified = Boolean(profile.verification.phone);
  const dob = profile.dateOfBirth?.trim() || t.addDateOfBirth;

  const payoutValue = connectBusy
    ? profileCopy.openingStripe
    : stripeStatus.connected
      ? stripeStatus.payoutsEnabled
        ? `${profileCopy.payoutsEnabled(stripeStatus.last4 ?? undefined)} · ${profileCopy.tapToUpdatePayouts}`
        : profileCopy.pendingVerification
      : profileCopy.requiredPayouts;

  const saveName = (nextName: string) => {
    if (!nextName) return;
    const next = updateProfileFields({ displayName: nextName });
    setProfile(refreshProfileStats(next, auth.userId));
    setEditing(null);
    if (auth.userId) {
      void updateRemoteProfile(auth.userId, { display_name: nextName }).catch(() => undefined);
    }
  };

  const saveDob = (raw: string) => {
    const value = raw.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    const next = updateProfileFields({ dateOfBirth: value });
    setProfile(refreshProfileStats(next, auth.userId));
    setEditing(null);
    if (auth.userId) {
      void updateRemoteProfile(auth.userId, { date_of_birth: value }).catch(() => undefined);
    }
  };

  const openPayouts = () => {
    setConnectBusy(true);
    setConnectError(null);
    setConnectErrorCode(null);
    void startConnectOnboarding("/?screen=personalInfo", { allowUpdate: true })
      .then((result) => {
        if (!result.ok) {
          setConnectError(
            result.code === "phone_unverified" ? profileCopy.phoneVerifyNeeded : result.reason,
          );
          setConnectErrorCode(result.code ?? null);
          return;
        }
        if (result.mode === "redirect") {
          window.location.href = result.url;
        }
      })
      .finally(() => setConnectBusy(false));
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 flex items-center gap-3 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
        <button type="button" onClick={onBack} className="p-2" aria-label={common.back}>
          <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
        </button>
        <h1 className="text-[18px] font-bold" style={{ color: GREEN }}>
          {t.title}
        </h1>
      </header>

      <div className="screen-scroll flex-1 space-y-3 p-4">
        <p className="text-[13px] text-gray-500">{t.subtitle}</p>

        <p className="px-1 pt-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {profileCopy.payouts}
        </p>
        <Row
          icon={<CreditCard className="h-5 w-5" style={{ color: GREEN }} />}
          label={stripeStatus.connected ? profileCopy.bankConnected : profileCopy.connectBank}
          value={payoutValue}
          onClick={openPayouts}
          trailing={
            connectBusy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" /> : null
          }
        />
        {connectError ? <ConnectSetupError message={connectError} code={connectErrorCode} /> : null}
        <p className="px-1 text-[12px] leading-relaxed text-gray-500">{t.payoutsHint}</p>

        <p className="px-1 pt-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {profileCopy.personalInfo}
        </p>
        <Row icon={<Mail className="h-5 w-5" style={{ color: GREEN }} />} label={t.email} value={email} />
        <p className="px-1 text-[12px] leading-relaxed text-gray-500">{t.emailChangeHint}</p>
        <Row
          icon={<User className="h-5 w-5" style={{ color: GREEN }} />}
          label={t.displayName}
          value={displayName}
          onClick={() => setEditing("name")}
        />
        <Row
          icon={<Phone className="h-5 w-5" style={{ color: GREEN }} />}
          label={t.phone}
          value={phone}
          badge={phoneVerified ? t.phoneVerifiedBadge : profile.phone?.trim() ? t.phoneNotVerified : null}
          onClick={() => setPhoneSheetOpen(true)}
        />
        <p className="px-1 text-[12px] leading-relaxed text-gray-500">{t.phoneKycHint}</p>
        <Row
          icon={<User className="h-5 w-5" style={{ color: GREEN }} />}
          label={t.dateOfBirth}
          value={dob}
          onClick={() => setEditing("dob")}
        />
        <p className="px-1 text-[12px] leading-relaxed text-gray-500">{t.dateOfBirthHint}</p>

        {auth.configured && auth.session && onDeleteAccount ? (
          <div className="mt-6 rounded-2xl border bg-white p-4" style={{ borderColor: "#FECACA" }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-red-500/80">
              {profileCopy.authSection}
            </p>
            <p className="mt-1 text-[13px] text-gray-600">
              {profileCopy.signedInAs(
                auth.userEmail ?? auth.userId ?? profileCopy.userFallback,
              )}
            </p>
            <button
              type="button"
              onClick={onDeleteAccount}
              className="mt-3 w-full min-h-[48px] touch-manipulation rounded-xl border border-red-300 bg-red-50 py-2.5 text-center text-[14px] font-bold text-red-700 active:bg-red-100"
            >
              {profileCopy.deleteAccount}
            </button>
          </div>
        ) : null}
      </div>

      <ProfileFieldEditSheet
        open={editing === "name"}
        title={t.displayName}
        label={t.nameLabel}
        value={profile.displayName}
        placeholder={t.namePlaceholder}
        onClose={() => setEditing(null)}
        onSave={saveName}
      />
      <ProfileFieldEditSheet
        open={editing === "dob"}
        title={t.dateOfBirth}
        label={t.dateOfBirth}
        value={profile.dateOfBirth || ""}
        placeholder="YYYY-MM-DD"
        onClose={() => setEditing(null)}
        onSave={saveDob}
      />
      <PhoneVerifySheet
        open={phoneSheetOpen}
        initialPhone={profile.phone}
        alreadyVerified={phoneVerified}
        onClose={() => {
          setPhoneSheetOpen(false);
          setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
        }}
        onVerified={(nextPhone) => {
          const current = loadUserProfile();
          saveUserProfile({
            ...current,
            phone: nextPhone,
            verification: { ...current.verification, phone: true },
          });
          setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
          if (auth.userId) {
            void updateRemoteProfile(auth.userId, { phone: nextPhone }).catch(() => undefined);
          }
        }}
      />
    </div>
  );
}
