import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Mail, Phone, User } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import {
  loadUserProfile,
  refreshProfileStats,
  updateProfileFields,
} from "../../lib/userProfileStorage";
import { updateRemoteProfile } from "../../lib/supabaseProfile";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

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

export function PersonalInfoScreen({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const [profile, setProfile] = useState(() => refreshProfileStats(loadUserProfile(), auth.userId));

  const email = auth.userEmail?.trim() || profile.email?.trim() || "Not signed in";
  const displayName = profile.displayName?.trim() || "Add your name";
  const phone = profile.phone?.trim() || "Add phone";

  const handleEditName = () => {
    const nextName = window.prompt("Name", profile.displayName)?.trim();
    if (!nextName) return;
    const next = updateProfileFields({ displayName: nextName });
    setProfile(refreshProfileStats(next, auth.userId));
    if (auth.userId) {
      void updateRemoteProfile(auth.userId, { display_name: nextName }).catch(() => undefined);
    }
  };

  const handleEditPhone = () => {
    const nextPhone = window.prompt("Phone", profile.phone)?.trim() ?? "";
    const next = updateProfileFields({ phone: nextPhone });
    setProfile(refreshProfileStats(next, auth.userId));
    if (auth.userId) {
      void updateRemoteProfile(auth.userId, { phone: nextPhone }).catch(() => undefined);
    }
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 flex items-center gap-3 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
        <button type="button" onClick={onBack} className="p-2" aria-label="Back">
          <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
        </button>
        <h1 className="text-[18px] font-bold" style={{ color: GREEN }}>
          Personal info
        </h1>
      </header>

      <div className="screen-scroll flex-1 space-y-3 p-4">
        <p className="text-[13px] text-gray-500">
          Email is used for sign-in and receipts. Name and phone appear on your profile and rentals.
        </p>
        <Row icon={<Mail className="h-5 w-5" style={{ color: GREEN }} />} label="Email" value={email} />
        <Row
          icon={<User className="h-5 w-5" style={{ color: GREEN }} />}
          label="Display name"
          value={displayName}
          onClick={handleEditName}
        />
        <Row
          icon={<Phone className="h-5 w-5" style={{ color: GREEN }} />}
          label="Phone"
          value={phone}
          onClick={handleEditPhone}
        />
      </div>
    </div>
  );
}
