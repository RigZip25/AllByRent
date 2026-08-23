import type { AppMode } from "../lib/appMode";
import { BRAND_BROWSE_ORANGE, BRAND_GREEN } from "../lib/brand";
import { useAppModeLabels, useMessages } from "../lib/i18n/react";

const BORDER = "#E8E6E0";

type RoleModeSwitcherProps = {
  /** Which side matches the screen you’re on (not only stored preference). */
  active: AppMode;
  onChange: (mode: AppMode) => void;
  className?: string;
};

/** Browse ↔ My Garage — visible role switch on Home and Garage. */
export function RoleModeSwitcher({ active, onChange, className = "" }: RoleModeSwitcherProps) {
  const { profile } = useMessages();
  const modeLabels = useAppModeLabels();

  return (
    <div
      className={`flex rounded-full border bg-white p-0.5 ${className}`.trim()}
      style={{ borderColor: BORDER }}
      role="tablist"
      aria-label={profile.preferredModeAria}
    >
      {(["rent", "earn"] as const).map((tab) => {
        const selected = active === tab;
        const activeFill = tab === "rent" ? BRAND_BROWSE_ORANGE : BRAND_GREEN;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              if (tab !== active) onChange(tab);
            }}
            className="min-h-[40px] flex-1 rounded-full px-3 py-2 text-[13px] font-bold transition-colors"
            style={{
              backgroundColor: selected ? activeFill : "transparent",
              color: selected ? "#fff" : "#6b7280",
            }}
          >
            {modeLabels[tab]}
          </button>
        );
      })}
    </div>
  );
}
