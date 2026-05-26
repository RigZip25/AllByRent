import rentanoNavImg from "../../imports/No_back_rentano.png";
import type { AppMode } from "../../lib/appMode";

const BORDER = "#E8E6E0";
const RENTANO_GREEN = "#0D5C3A";

export type BottomNavTab =
  | "home"
  | "rentals"
  | "rentano"
  | "favorites"
  | "business"
  | "profile"
  | "none";

function NavIconHome({ active }: { active?: boolean }) {
  const c = active ? RENTANO_GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <path d="M4 10 L12 4 L20 10 V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10Z" stroke={c} strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function NavIconRentals({ active }: { active?: boolean }) {
  const c = active ? RENTANO_GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="2" stroke={c} strokeWidth="2" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NavIconFavorites({ active }: { active?: boolean }) {
  const c = active ? RENTANO_GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <path
        d="M12 20.5l-1.1-1C6.5 15.4 4 13.1 4 10.2 4 7.8 5.8 6 8.2 6c1.4 0 2.7.7 3.8 1.8L12 8.8l.1-.1C13.1 6.7 14.4 6 15.8 6 18.2 6 20 7.8 20 10.2c0 2.9-2.5 5.2-6.9 9.3L12 20.5z"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={active ? `${RENTANO_GREEN}22` : "none"}
      />
    </svg>
  );
}

function NavIconBusiness({ active }: { active?: boolean }) {
  const c = active ? RENTANO_GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <rect x="5" y="14" width="4" height="5" rx="1.5" stroke={c} strokeWidth="2" />
      <rect x="10" y="10" width="4" height="9" rx="1.5" stroke={c} strokeWidth="2" />
      <rect x="15" y="5" width="4" height="14" rx="1.5" stroke={c} strokeWidth="2" />
    </svg>
  );
}

function NavIconProfile({ active }: { active?: boolean }) {
  const c = active ? RENTANO_GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[28px] w-[28px]" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="2" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TabLabel({
  children,
  active,
}: {
  children: string;
  active: boolean;
}) {
  return (
    <span
      className="text-[13px]"
      style={{
        color: active ? RENTANO_GREEN : "#888",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </span>
  );
}

export function BottomNav({
  activeTab = "home",
  appMode,
  onHome,
  onRentals,
  onRentano,
  onFourthTab,
  onProfile,
}: {
  activeTab?: BottomNavTab;
  appMode: AppMode;
  onHome: () => void;
  onRentals: () => void;
  onRentano?: () => void;
  onFourthTab: () => void;
  onProfile: () => void;
}) {
  const fourthLabel = appMode === "earn" ? "Business" : "Favorites";
  const fourthActive =
    appMode === "earn" ? activeTab === "business" : activeTab === "favorites";

  return (
    <div
      className="flex shrink-0 items-center border-t bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2"
      style={{ borderColor: BORDER, minHeight: 84 }}
    >
      <div className="mx-auto flex w-full max-w-md items-end justify-around">
        <button type="button" onClick={onHome} className="flex min-w-[56px] flex-col items-center gap-1.5 py-1">
          <NavIconHome active={activeTab === "home"} />
          <TabLabel active={activeTab === "home"}>Home</TabLabel>
        </button>

        <button type="button" onClick={onRentals} className="flex min-w-[56px] flex-col items-center gap-1.5 py-1">
          <NavIconRentals active={activeTab === "rentals"} />
          <TabLabel active={activeTab === "rentals"}>Rentals</TabLabel>
        </button>

        <button
          type="button"
          onClick={onRentano}
          className="-mt-8 flex min-w-[64px] flex-col items-center gap-1"
          aria-label="Open Rentano menu"
        >
          <div
            className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-lg"
            style={{
              boxShadow:
                activeTab === "rentano"
                  ? "0 8px 24px rgba(13, 92, 58, 0.35)"
                  : "0 8px 20px rgba(0, 0, 0, 0.12)",
            }}
          >
            <img
              src={rentanoNavImg}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          <TabLabel active={activeTab === "rentano"}>Rentano</TabLabel>
        </button>

        <button type="button" onClick={onFourthTab} className="flex min-w-[56px] flex-col items-center gap-1.5 py-1">
          {appMode === "earn" ? (
            <NavIconBusiness active={fourthActive} />
          ) : (
            <NavIconFavorites active={fourthActive} />
          )}
          <TabLabel active={fourthActive}>{fourthLabel}</TabLabel>
        </button>

        <button type="button" onClick={onProfile} className="flex min-w-[56px] flex-col items-center gap-1.5 py-1">
          <NavIconProfile active={activeTab === "profile"} />
          <TabLabel active={activeTab === "profile"}>Profile</TabLabel>
        </button>
      </div>
    </div>
  );
}
