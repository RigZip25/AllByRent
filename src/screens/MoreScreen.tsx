import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Heart,
  HelpCircle,
  MessageCircle,
  TrendingUp,
  User,
  Warehouse,
} from "lucide-react";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { useAuth } from "../hooks/AuthProvider";
import { MASCOT_NAME, APP_NAME } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import { loadUserProfile, refreshProfileStats, getProfileDisplayLabel } from "../lib/userProfileStorage";

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

export function MoreScreen({
  onProfile,
  onRentals,
  onMessages,
  onFavorites,
  onNotifications,
  onEarnBusiness,
  onGarage,
  onMrE,
  onHowItWorks,
}: {
  onProfile: () => void;
  onRentals: () => void;
  onMessages?: () => void;
  onFavorites: () => void;
  onNotifications: () => void;
  onEarnBusiness: () => void;
  onGarage: () => void;
  onMrE: () => void;
  onHowItWorks?: () => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const [profile, setProfile] = useState(() =>
    refreshProfileStats(loadUserProfile(), auth.userId),
  );

  useEffect(() => {
    setProfile(refreshProfileStats(loadUserProfile(), auth.userId));
  }, [auth.userId, auth.userEmail]);

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
          onClick={onProfile}
          className="mb-5 flex w-full items-center gap-4 rounded-3xl border bg-white p-4 text-left active:bg-[#F9FAFB]"
          style={{ borderColor: BORDER }}
        >
          <ProfileAvatar avatarUrl={profile.avatarUrl} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold" style={{ color: GREEN }}>
              {displayNameLabel}
            </p>
            <p className="mt-0.5 text-[13px] text-gray-500">{t.more.profileHint}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
        </button>

        <SectionTitle>{t.more.sectionActivity}</SectionTitle>
        <ul className="mb-5 flex flex-col gap-2">
          <li>
            <MenuRow
              icon={<ClipboardList className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={t.more.rentals}
              hint={t.more.rentalsHint}
              onClick={onRentals}
            />
          </li>
          {onMessages ? (
            <li>
              <MenuRow
                icon={<MessageCircle className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
                label={t.more.messages}
                hint={t.more.messagesHint}
                onClick={onMessages}
              />
            </li>
          ) : null}
          <li>
            <MenuRow
              icon={<Heart className="h-5 w-5" style={{ color: "#E11D48" }} />}
              label={t.more.favorites}
              hint={t.more.favoritesHint}
              onClick={onFavorites}
            />
          </li>
          <li>
            <MenuRow
              icon={<Bell className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={t.more.notifications}
              hint={t.more.notificationsHint}
              onClick={onNotifications}
            />
          </li>
        </ul>

        <SectionTitle>{t.more.sectionGarage}</SectionTitle>
        <ul className="mb-5 flex flex-col gap-2">
          <li>
            <MenuRow
              icon={<Warehouse className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={t.more.myGarage}
              hint={t.more.myGarageHint}
              onClick={onGarage}
            />
          </li>
          <li>
            <MenuRow
              icon={<TrendingUp className="h-5 w-5" style={{ color: "#F59E0B" }} />}
              label={t.more.earnDashboard}
              hint={t.more.earnDashboardHint}
              onClick={onEarnBusiness}
            />
          </li>
        </ul>

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
              icon={<User className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={t.more.accountSettings}
              hint={t.more.accountSettingsHint}
              onClick={onProfile}
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
