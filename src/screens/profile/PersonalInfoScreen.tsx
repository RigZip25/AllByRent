import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import { ProfileFieldEditSheet } from "../../components/profile/ProfileFieldEditSheet";
import { useAuth } from "../../hooks/AuthProvider";
import { useMessages } from "../../lib/i18n/react";
import { fetchRemoteProfile, updateRemoteProfile } from "../../lib/supabaseProfile";
import {
  loadUserProfile,
  refreshProfileStats,
  syncUserProfileFromAuth,
  updateProfileFields,
} from "../../lib/userProfileStorage";
import { formatUsPhoneDisplay } from "../../lib/usPhoneFormat";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type EditField = "name" | "phone" | null;

function Row({
  icon,
  label,
  value,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onClick?: () => void;
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
      </div>
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
  initialEdit,
}: {
  onBack: () => void;
  initialEdit?: "name" | "phone";
}) {
  const auth = useAuth();
  const { common, profileDeep } = useMessages();
  const t = profileDeep.personalInfo;
  const [profile, setProfile] = useState(() => refreshProfileStats(loadUserProfile(), auth.userId));
  const [editing, setEditing] = useState<EditField>(null);

  useEffect(() => {
    if (initialEdit) setEditing(initialEdit);
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

    void fetchRemoteProfile(auth.userId).then((remote) => {
      if (!mounted || !remote) return;
      apply(auth.userEmail, remote.email);
    });

    return () => {
      mounted = false;
    };
  }, [auth.userId, auth.userEmail]);

  const email =
    auth.userEmail?.trim() ||
    profile.email?.trim() ||
    (auth.userId ? t.loadingEmail : t.notSignedIn);
  const displayName = profile.displayName?.trim() || t.addName;
  const phone = profile.phone?.trim()
    ? formatUsPhoneDisplay(profile.phone)
    : t.addPhone;

  const saveName = (nextName: string) => {
    if (!nextName) return;
    const next = updateProfileFields({ displayName: nextName });
    setProfile(refreshProfileStats(next, auth.userId));
    setEditing(null);
    if (auth.userId) {
      void updateRemoteProfile(auth.userId, { display_name: nextName }).catch(() => undefined);
    }
  };

  const savePhone = (nextPhone: string) => {
    const normalized = formatUsPhoneDisplay(nextPhone);
    const next = updateProfileFields({ phone: normalized });
    setProfile(refreshProfileStats(next, auth.userId));
    setEditing(null);
    if (auth.userId) {
      void updateRemoteProfile(auth.userId, { phone: normalized }).catch(() => undefined);
    }
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
          onClick={() => setEditing("phone")}
        />
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
        open={editing === "phone"}
        title={t.phone}
        label={t.phoneLabel}
        value={profile.phone}
        inputType="tel"
        placeholder={t.phonePlaceholder}
        onClose={() => setEditing(null)}
        onSave={savePhone}
      />
    </div>
  );
}
