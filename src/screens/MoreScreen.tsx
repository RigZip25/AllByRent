import { type ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Heart,
  HelpCircle,
  TrendingUp,
  User,
  Warehouse,
} from "lucide-react";
import { BottomNav } from "../app/components/BottomNav";
import { ProfileAvatar } from "../components/profile/ProfileAvatar";
import { useAuth } from "../hooks/AuthProvider";
import { MASCOT_NAME } from "../lib/brand";
import { loadUserProfile, refreshProfileStats } from "../lib/userProfileStorage";

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
  onHome,
  onMrE,
  onStockGarage,
  onGarage,
  onProfile,
  onRentals,
  onFavorites,
  onNotifications,
  onEarnBusiness,
}: {
  onHome: () => void;
  onMrE: () => void;
  onStockGarage: () => void;
  onGarage: () => void;
  onProfile: () => void;
  onRentals: () => void;
  onFavorites: () => void;
  onNotifications: () => void;
  onEarnBusiness: () => void;
}) {
  const auth = useAuth();
  const profile = refreshProfileStats(loadUserProfile(), auth.userId);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-4 pt-3">
        <h1 className="mb-1 text-[22px] font-extrabold" style={{ color: GREEN }}>
          More
        </h1>
        <p className="mb-4 text-[14px] text-gray-500">Account, bookings, and app settings</p>

        <button
          type="button"
          onClick={onProfile}
          className="mb-5 flex w-full items-center gap-4 rounded-3xl border bg-white p-4 text-left active:bg-[#F9FAFB]"
          style={{ borderColor: BORDER }}
        >
          <ProfileAvatar avatarUrl={profile.avatarUrl} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold" style={{ color: GREEN }}>
              {profile.displayName}
            </p>
            <p className="mt-0.5 text-[13px] text-gray-500">Profile &amp; account settings</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
        </button>

        <SectionTitle>Activity</SectionTitle>
        <ul className="mb-5 flex flex-col gap-2">
          <li>
            <MenuRow
              icon={<ClipboardList className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Rentals"
              hint="Active, upcoming, and history"
              onClick={onRentals}
            />
          </li>
          <li>
            <MenuRow
              icon={<Heart className="h-5 w-5" style={{ color: "#E11D48" }} />}
              label="Favorites"
              hint="Saved listings"
              onClick={onFavorites}
            />
          </li>
          <li>
            <MenuRow
              icon={<Bell className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Notifications"
              hint="Bookings, messages, updates"
              onClick={onNotifications}
            />
          </li>
        </ul>

        <SectionTitle>Your garage</SectionTitle>
        <ul className="mb-5 flex flex-col gap-2">
          <li>
            <MenuRow
              icon={<Warehouse className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="My Garage"
              hint="Listings, requests, and earnings"
              onClick={onGarage}
            />
          </li>
          <li>
            <MenuRow
              icon={<TrendingUp className="h-5 w-5" style={{ color: "#F59E0B" }} />}
              label="Earn dashboard"
              hint="Revenue and listing performance"
              onClick={onEarnBusiness}
            />
          </li>
        </ul>

        <SectionTitle>Support</SectionTitle>
        <ul className="mb-2 flex flex-col gap-2">
          <li>
            <MenuRow
              icon={<HelpCircle className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label={`Chat with ${MASCOT_NAME}`}
              hint="Always in the bottom menu — tap his tab anytime"
              onClick={onMrE}
            />
          </li>
          <li>
            <MenuRow
              icon={<User className="h-5 w-5" style={{ color: GREEN_LIGHT }} />}
              label="Account settings"
              hint="Name, phone, payouts, sign out"
              onClick={onProfile}
            />
          </li>
        </ul>
      </div>

      <div className="shrink-0">
        <BottomNav
          activeTab="more"
          onHome={onHome}
          onMrE={onMrE}
          onAdd={onStockGarage}
          onGarage={onGarage}
          onMore={() => undefined}
        />
      </div>
    </div>
  );
}
