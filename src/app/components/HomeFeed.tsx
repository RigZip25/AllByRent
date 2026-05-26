import { useState } from "react";
import { Bell, MapPin, ChevronRight } from "lucide-react";
import { Emoji } from "./Emoji";
import { BottomNav } from "./BottomNav";
import { HostDashboard } from "./HostDashboard";
import { RentanoChatSheet } from "../../components/RentanoChat";
import { getAppMode, setAppMode, type AppMode } from "../../lib/appMode";
import { getActiveRentLocationLabel } from "../../lib/listingStorage";
import {
  CATEGORIES,
  categoryGridLabel,
  categoryIdFromName,
} from "../../screens/listing/listingItemCategories";
import { usePwaInstallPrompt } from "../../hooks/PwaInstallProvider";
import { PwaInstallRentanoTip } from "../../components/PwaInstallRentanoTip";

const GREEN = "#1A9E6E";
const GREEN_DARK = "#0D5C3A";
const BORDER = "#E8E6E0";

const categories = Object.entries(CATEGORIES).map(([fullLabel, data]) => ({
  id: categoryIdFromName(fullLabel),
  label: categoryGridLabel(fullLabel),
  fullLabel,
  emoji: data.icon,
}));

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}) {
  return (
    <div
      className="flex shrink-0 rounded-full border p-0.5"
      style={{ borderColor: BORDER, backgroundColor: "white" }}
      role="tablist"
      aria-label="Home mode"
    >
      {(["earn", "rent"] as const).map((tab) => {
        const active = mode === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className="rounded-full px-3.5 py-1.5 text-sm font-bold capitalize transition-colors"
            style={{
              backgroundColor: active ? GREEN_DARK : "transparent",
              color: active ? "white" : "#888",
            }}
          >
            {tab === "earn" ? "Earn" : "Rent"}
          </button>
        );
      })}
    </div>
  );
}

export function HomeFeed({
  selectedCategoryId,
  onPostRequest,
  onNavigate,
  onCategorySelect,
  onOpenNotifications,
}: {
  selectedCategoryId: string | null;
  onPostRequest: () => void;
  onNavigate: (screen: string) => void;
  onCategorySelect: (categoryId: string, categoryLabel: string) => void;
  onOpenNotifications: () => void;
}) {
  const [rentanoOpen, setRentanoOpen] = useState(false);
  const [mode, setMode] = useState<AppMode>(() => getAppMode());
  const pwa = usePwaInstallPrompt();

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setAppMode(newMode);
  };

  const cityLabel = getActiveRentLocationLabel() || "Set your location";

  return (
    <div className="screen bg-[#F0F4F2] flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-4 pb-3 bg-[#F0F4F2]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <ModeSwitcher mode={mode} onChange={handleModeChange} />
          <button
            type="button"
            onClick={onOpenNotifications}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white transition-colors active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label="Notifications"
          >
            <Bell className="h-6 w-6" style={{ color: GREEN_DARK }} />
          </button>
        </div>

        <div className="mb-3 min-w-0">
          <p className="mb-1 text-[14px] text-gray-500">Good morning</p>
          <button type="button" className="flex min-w-0 items-center gap-1.5">
            <MapPin
              className="h-5 w-5 shrink-0"
              style={{ color: GREEN }}
              fill={GREEN}
              stroke={GREEN_DARK}
              strokeWidth={1.5}
            />
            <span className="truncate text-[18px] font-bold" style={{ color: GREEN_DARK }}>
              {cityLabel}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4">
        {mode === "earn" ? (
          <HostDashboard onListItem={() => onNavigate("listItem")} />
        ) : (
          <>
            <h2 className="mb-3 shrink-0 text-[20px] font-extrabold" style={{ color: GREEN_DARK }}>
              Browse by Category
            </h2>
            <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
              <div className="grid grid-cols-2 gap-[10px]">
                {categories.map(({ id, fullLabel, emoji }) => {
                  const active = selectedCategoryId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onCategorySelect(id, fullLabel)}
                      className="flex flex-col items-center justify-center gap-2 border transition-colors"
                      style={{
                        minHeight: 112,
                        padding: 14,
                        borderRadius: 16,
                        borderColor: active ? GREEN : BORDER,
                        backgroundColor: active ? GREEN : "white",
                      }}
                    >
                      <Emoji emoji={emoji} size={52} />
                      <span
                        className="line-clamp-2 w-full px-0.5 text-center text-[14px] font-semibold leading-snug"
                        style={{ color: active ? "white" : "#888" }}
                      >
                        {fullLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="shrink-0">
        {pwa.visible ? (
          <PwaInstallRentanoTip
            nativeInstallReady={pwa.nativeInstallReady}
            manualIos={pwa.manualIos}
            onInstall={() => void pwa.install()}
            onDismiss={pwa.dismiss}
          />
        ) : null}

        <BottomNav
          activeTab="home"
          onHome={() => undefined}
          onPostRequest={onPostRequest}
          onRentano={() => setRentanoOpen(true)}
        />
      </div>
      <RentanoChatSheet open={rentanoOpen} onClose={() => setRentanoOpen(false)} />
    </div>
  );
}
