import { Menu, Plus } from "lucide-react";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

export type BottomNavTab = "home" | "search" | "add" | "garage" | "more" | "none";

function runNavAction(action: () => void) {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }
  action();
}

function NavIconHome({ active }: { active?: boolean }) {
  const c = active ? GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none" aria-hidden="true">
      <path
        d="M4 10 L12 4 L20 10 V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10Z"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 20v-6h6v6" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function NavIconSearch({ active }: { active?: boolean }) {
  const c = active ? GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke={c} strokeWidth="2" />
      <path d="M16 16 L20 20" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NavIconGarage({ active }: { active?: boolean }) {
  const c = active ? GREEN : "#888";
  return (
    <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none" aria-hidden="true">
      <path
        d="M4 19V11L12 5l8 6v8H4Z"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 19v-5h6v5" stroke={c} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function TabLabel({ children, active }: { children: string; active: boolean }) {
  return (
    <span
      className="text-[12px]"
      style={{ color: active ? GREEN : "#888", fontWeight: active ? 600 : 400 }}
    >
      {children}
    </span>
  );
}

function NavIconMore({ active }: { active?: boolean }) {
  const c = active ? GREEN : "#888";
  return <Menu className="h-[26px] w-[26px]" style={{ color: c }} strokeWidth={2} aria-hidden="true" />;
}

export function BottomNav({
  activeTab = "home",
  onHome,
  onSearch,
  onAdd,
  onGarage,
  onMore,
}: {
  activeTab?: BottomNavTab;
  onHome: () => void;
  onSearch: () => void;
  onAdd: () => void;
  onGarage: () => void;
  onMore: () => void;
}) {
  return (
    <nav
      className="bottom-nav-bar flex shrink-0 items-center border-t bg-white px-1 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-2"
      style={{ borderColor: BORDER, minHeight: 80 }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex w-full max-w-md items-end justify-around">
        <button
          type="button"
          onClick={() => runNavAction(onHome)}
          className="flex min-h-[44px] min-w-[52px] touch-manipulation flex-col items-center justify-end gap-1 py-1"
        >
          <NavIconHome active={activeTab === "home"} />
          <TabLabel active={activeTab === "home"}>Home</TabLabel>
        </button>

        <button
          type="button"
          onClick={() => runNavAction(onSearch)}
          className="flex min-h-[44px] min-w-[52px] touch-manipulation flex-col items-center justify-end gap-1 py-1"
        >
          <NavIconSearch active={activeTab === "search"} />
          <TabLabel active={activeTab === "search"}>Search</TabLabel>
        </button>

        <button
          type="button"
          onClick={() => runNavAction(onAdd)}
          className="relative z-10 -mt-7 flex min-h-[44px] min-w-[64px] touch-manipulation flex-col items-center justify-end gap-1"
          aria-label="Stock an item in your garage"
        >
          <div
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-4 border-white shadow-lg"
            style={{
              backgroundColor: GREEN,
              boxShadow:
                activeTab === "add"
                  ? "0 8px 24px rgba(13, 92, 58, 0.4)"
                  : "0 8px 20px rgba(0, 0, 0, 0.14)",
            }}
          >
            <Plus className="h-8 w-8 text-white" strokeWidth={2.5} aria-hidden />
          </div>
          <TabLabel active={activeTab === "add"}>Stock</TabLabel>
        </button>

        <button
          type="button"
          onClick={() => runNavAction(onGarage)}
          className="flex min-h-[44px] min-w-[52px] touch-manipulation flex-col items-center justify-end gap-1 py-1"
        >
          <NavIconGarage active={activeTab === "garage"} />
          <TabLabel active={activeTab === "garage"}>Garage</TabLabel>
        </button>

        <button
          type="button"
          onClick={() => runNavAction(onMore)}
          className="flex min-h-[44px] min-w-[52px] touch-manipulation flex-col items-center justify-end gap-1 py-1"
          aria-label="More — account and settings"
        >
          <NavIconMore active={activeTab === "more"} />
          <TabLabel active={activeTab === "more"}>More</TabLabel>
        </button>
      </div>
    </nav>
  );
}
