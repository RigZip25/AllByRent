import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, MapPin, ChevronRight } from "lucide-react";
import { Emoji } from "./Emoji";
import { BottomNav } from "./BottomNav";
import { HostDashboard } from "./HostDashboard";
import { RentanoChatSheet } from "../../components/RentanoChat";
import { usePwaUpdate } from "../../hooks/PwaUpdateProvider";
import { APP_MODE_LABELS } from "../../lib/brand";
import { getAppMode, setAppMode, type AppMode } from "../../lib/appMode";
import {
  getActiveRentLocationLabel,
  hasRentLocationSetup,
} from "../../lib/listingStorage";
import { searchActiveListingsRemote } from "../../lib/listingStorage";
import {
  CATEGORIES,
  categoryGridLabel,
  categoryIdFromName,
} from "../../screens/listing/listingItemCategories";
import { MrRentano } from "./MrRentano";

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
            className="rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors"
            style={{
              backgroundColor: active ? GREEN_DARK : "transparent",
              color: active ? "white" : "#888",
            }}
          >
            {APP_MODE_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}

export function HomeFeed({
  selectedCategoryId,
  onNavigate,
  onCategorySelect,
  onOpenNotifications,
  onEditLocation,
  onHome,
  onRentals,
  onFourthTab,
  onProfile,
}: {
  selectedCategoryId: string | null;
  onNavigate: (screen: string) => void;
  onCategorySelect: (categoryId: string, categoryLabel: string) => void;
  onOpenNotifications: () => void;
  onEditLocation: () => void;
  onHome: () => void;
  onRentals: () => void;
  onFourthTab: () => void;
  onProfile: () => void;
}) {
  const [rentanoOpen, setRentanoOpen] = useState(false);
  const [mode, setMode] = useState<AppMode>(() => getAppMode());
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ id: string; title: string; subtitle: string }[]>([]);
  const { updateAvailable, updateJustCompleted, simulateUpdateNotification } = usePwaUpdate();
  const showBellBadge = updateAvailable || updateJustCompleted;
  const bellTapRef = useRef({ count: 0, openTimer: 0 });

  const handleBellPress = () => {
    const taps = bellTapRef.current;
    taps.count += 1;
    window.clearTimeout(taps.openTimer);

    if (taps.count >= 5) {
      taps.count = 0;
      simulateUpdateNotification();
      onOpenNotifications();
      return;
    }

    // Wait briefly — if more taps come, don't open yet (allows 5 quick taps).
    taps.openTimer = window.setTimeout(() => {
      taps.count = 0;
      onOpenNotifications();
    }, 450);
  };
  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setAppMode(newMode);
    if (newMode === "rent" && !hasRentLocationSetup()) {
      onEditLocation();
    }
  };

  const cityLabel = getActiveRentLocationLabel() || "Set your location";
  const needsLocation = mode === "rent" && !hasRentLocationSetup();

  const city = getActiveRentLocationLabel().trim();
  const selectedCategory = useMemo(() => {
    const match = categories.find((c) => c.id === selectedCategoryId);
    return match?.fullLabel ?? undefined;
  }, [selectedCategoryId]);

  useEffect(() => {
    if (mode !== "rent") return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    let mounted = true;
    setSearching(true);
    void searchActiveListingsRemote({ query: q, city, category: selectedCategory })
      .then((list) => {
        if (!mounted) return;
        setResults(
          list.slice(0, 10).map((l) => ({
            id: l.id,
            title: l.title || "Listing",
            subtitle: `${l.subcategory || l.category}`,
          })),
        );
      })
      .finally(() => {
        if (!mounted) return;
        setSearching(false);
      });
    return () => {
      mounted = false;
    };
  }, [city, mode, query, selectedCategory]);

  return (
    <div className="screen bg-[#F0F4F2] flex flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-4 pb-3 bg-[#F0F4F2]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <ModeSwitcher mode={mode} onChange={handleModeChange} />
          <button
            type="button"
            onClick={handleBellPress}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white transition-colors active:bg-gray-50"
            style={{ borderColor: BORDER }}
            aria-label={
              showBellBadge ? "Notifications — update available" : "Notifications"
            }
          >
            <Bell className="h-6 w-6" style={{ color: GREEN_DARK }} />
            {showBellBadge ? (
              <span
                className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ backgroundColor: "#F0B429" }}
                aria-hidden
              />
            ) : null}
          </button>
        </div>

        <div className="mb-3 min-w-0">
          <p className="mb-1 text-[14px] text-gray-500">Good morning</p>
          <button
            type="button"
            onClick={onEditLocation}
            className="flex min-w-0 items-center gap-1.5 text-left"
            aria-label={needsLocation ? "Set your location" : "Change location"}
          >
            <MapPin
              className="h-5 w-5 shrink-0"
              style={{ color: needsLocation ? "#F59E0B" : GREEN }}
              fill={needsLocation ? "#F59E0B" : GREEN}
              stroke={GREEN_DARK}
              strokeWidth={1.5}
            />
            <span
              className="truncate text-[18px] font-bold"
              style={{ color: needsLocation ? "#B45309" : GREEN_DARK }}
            >
              {cityLabel}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
          </button>
          {needsLocation ? (
            <p className="mt-1 text-[13px] text-amber-800">
              Tap to choose: at home or planning a trip
            </p>
          ) : null}
        </div>

        {mode === "rent" ? (
          <div className="mb-1">
            <div className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2.5" style={{ borderColor: BORDER }}>
              <span className="text-[14px] text-gray-400">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gear, keywords…"
                className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
              />
              {searching ? <span className="text-[12px] text-gray-400">Searching…</span> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4">
        {mode === "earn" ? (
          <HostDashboard
            onListItem={() => onNavigate("listItem")}
            onOpenListing={(listingId) => onNavigate(`hostListingDetail:${listingId}`)}
          />
        ) : (
          <>
            {query.trim() ? (
              <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
                {results.length === 0 && !searching ? (
                  <div className="mx-auto mt-10 max-w-[320px] text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border bg-white" style={{ borderColor: BORDER }}>
                      <MrRentano size={34} />
                    </div>
                    <p className="text-[16px] font-bold" style={{ color: GREEN_DARK }}>
                      No results
                    </p>
                    <p className="mt-1 text-[13px] text-gray-500">
                      Rentano: Try a shorter keyword — or change category / city.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {results.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => onNavigate(`hostListingDetail:${r.id}`)}
                          className="w-full rounded-2xl border bg-white p-3 text-left"
                          style={{ borderColor: BORDER }}
                        >
                          <p className="font-semibold text-gray-900">{r.title}</p>
                          <p className="mt-0.5 text-[13px] text-gray-500">{r.subtitle}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
          </>
        )}
      </div>

      <div className="shrink-0">
        <BottomNav
          activeTab={rentanoOpen ? "rentano" : "home"}
          appMode={mode}
          onHome={onHome}
          onRentals={onRentals}
          onRentano={() => setRentanoOpen(true)}
          onFourthTab={onFourthTab}
          onProfile={onProfile}
        />
      </div>
      <RentanoChatSheet
        open={rentanoOpen}
        onClose={() => setRentanoOpen(false)}
        defaultView="chat"
        context={{ screen: "home", appMode: mode }}
      />
    </div>
  );
}
