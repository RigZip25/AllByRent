import type { ReactNode } from "react";
import { Bell, ChevronRight, ClipboardList, Heart, MessageCircle } from "lucide-react";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";
const SURFACE = "#F0F4F2";

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

export function ActivityScreen({
  onRentals,
  onMessages,
  onFavorites,
  onNotifications,
}: {
  onRentals: () => void;
  onMessages?: () => void;
  onFavorites: () => void;
  onNotifications: () => void;
}) {
  const t = useMessages();

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-4 pt-3">
        <h1 className="mb-1 text-[22px] font-extrabold" style={{ color: GREEN }}>
          {t.activity.title}
        </h1>
        <p className="mb-4 text-[14px] text-gray-500">{t.activity.subtitle}</p>

        <ul className="flex flex-col gap-2">
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
      </div>
    </div>
  );
}
