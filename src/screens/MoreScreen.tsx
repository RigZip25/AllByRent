import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageSquareWarning,
} from "lucide-react";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { useAuth } from "../hooks/AuthProvider";
import { MASCOT_NAME, APP_NAME, SUPPORT_EMAIL } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import {
  loadUserProfile,
  refreshProfileStats,
  getProfileDisplayLabel,
} from "../lib/userProfileStorage";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </p>
  );
}

function MenuRow({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
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
        {hint ? <p className="mt-0.5 text-[13px] text-gray-500">{hint}</p> : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
    </button>
  );
}

/** Account + support only — activity is its own tab; garage lives under Home. */
export function MoreScreen({
  onAccountSettings,
  onMrE,
  onHowItWorks,
  onFeedback,
}: {
  onAccountSettings: () => void;
  onMrE: () => void;
  onHowItWorks?: () => void;
  onFeedback?: () => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const [profile, setProfile] = useState(() =>
    refreshProfileStats(loadUserProfile(), auth.userId),
  );

  useEffect(() => {
    setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
  }, [auth.userId, auth.userEmail]);

  const openSupportEmail = () => {
    const subject = encodeURIComponent(`${APP_NAME} support`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
  };

  const displayNameLabel = getProfileDisplayLabel(profile.displayName);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-4 pt-3">
        <h1 className="mb-1 text-[22px] font-extrabold" style={{ color: GREEN }}>
          {t.more.title}
        </h1>
        <p className="mb-4 text-[14px] text-gray-500">{t.more.subtitle}</p>

        <button
          type="button"
          onClick={onAccountSettings}
          className="mb-5 flex w-full items-center gap-4 rounded-3xl border bg-white p-4 text-left active:bg-[#F9FAFB]"
          style={{ borderColor: BORDER }}
        >
          <ProfileAvatar avatarUrl={profile.avatarUrl} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold" style={{ color: GREEN }}>
              {displayNameLabel}
            </p>
            <p className="mt-0.5 text-[13px] text-gray-500">{t.more.accountSettings}</p>
            <p className="mt-0.5 text-[12px] text-gray-400">{t.more.accountSettingsHint}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
        </button>

        <SectionTitle>{t.more.sectionSupport}</SectionTitle>
        <ul className="mb-2 flex flex-col gap-2">
          {onHowItWorks ? (
            <li>
              <MenuRow
                icon={<BookOpen className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
                label={t.more.howItWorks(APP_NAME)}
                hint={t.more.howItWorksHint}
                onClick={onHowItWorks}
              />
            </li>
          ) : null}
          <li>
            <MenuRow
              icon={<HelpCircle className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={t.more.chatWith(MASCOT_NAME)}
              hint={t.more.chatWithHint}
              onClick={onMrE}
            />
          </li>
          <li>
            <MenuRow
              icon={<Mail className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={t.more.contactSupport}
              hint={t.more.contactSupportHint}
              onClick={openSupportEmail}
            />
          </li>
          {onFeedback ? (
            <li>
              <MenuRow
                icon={<MessageSquareWarning className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
                label={t.more.sendFeedback}
                hint={t.more.sendFeedbackHint}
                onClick={onFeedback}
              />
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
