import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/Button";
import { TabBar } from "../components/TabBar";
import { INTERESTS } from "../data/interests";
import { DESTINATIONS } from "../data/destinations";
import { cn } from "../lib/cn";
import { useMftStore } from "../store";
import type { InterestId } from "../types";

function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { left: `${x}%`, top: `${Math.min(88, Math.max(12, y))}%` };
}

export function ExploreScreen() {
  const navigate = useNavigate();
  const selectedId = useMftStore((s) => s.selectedMapDestinationId);
  const setSelected = useMftStore((s) => s.setSelectedMapDestination);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<InterestId | "all">("all");

  const filtered = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q);
      const matchC = category === "all" || d.categories.includes(category);
      return matchQ && matchC;
    });
  }, [query, category]);

  const selected =
    filtered.find((d) => d.id === selectedId) ?? filtered[0] ?? DESTINATIONS[0];

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden pb-[calc(var(--tab-bar-height)+140px)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#141418_0%,#0a0a0c_70%)]">
          <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(226,176,94,0.08)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <ellipse
              cx="50%"
              cy="48%"
              rx="42%"
              ry="28%"
              fill="none"
              stroke="rgba(226,176,94,0.15)"
              strokeWidth="1"
            />
            <ellipse
              cx="50%"
              cy="48%"
              rx="28%"
              ry="18%"
              fill="none"
              stroke="rgba(226,176,94,0.1)"
              strokeWidth="1"
            />
          </svg>
          {filtered.map((d) => {
            const pos = project(d.lat, d.lng);
            const active = selected?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d.id)}
                className={cn(
                  "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition",
                  active
                    ? "z-10 h-4 w-4 bg-[var(--accent-gold)] shadow-[0_0_16px_rgba(226,176,94,0.8)]"
                    : "bg-[var(--accent-primary)]/80 hover:scale-125",
                )}
                style={pos}
                aria-label={d.name}
              />
            );
          })}
        </div>

        <div className="absolute inset-x-0 top-0 z-20 space-y-3 p-4">
          <div className="flex h-11 items-center gap-2 rounded-full bg-[var(--bg-elevated)]/90 px-4 ring-1 ring-white/10 backdrop-blur-md">
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Искать направление…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[var(--text-dim)]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px]",
                category === "all"
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--bg-card)]/90 text-[var(--text-cream)]",
              )}
            >
              Все
            </button>
            {INTERESTS.slice(0, 6).map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setCategory(i.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[12px]",
                  category === i.id
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[var(--bg-card)]/90 text-[var(--text-cream)]",
                )}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="absolute inset-x-3 bottom-[calc(var(--tab-bar-height)+12px)] z-20 overflow-hidden rounded-[16px] bg-[var(--bg-card)] shadow-[0_-8px_40px_rgba(0,0,0,0.45)]">
            <div className="flex gap-3 p-3">
              <img
                src={selected.photos[0]}
                alt=""
                className="h-24 w-24 shrink-0 rounded-[10px] object-cover"
              />
              <div className="min-w-0 flex-1 py-0.5">
                <div className="truncate text-[15px] font-semibold">
                  {selected.name}
                </div>
                <div className="text-[12px] text-[var(--text-muted)]">
                  {selected.country}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.activities.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[12px] text-[var(--accent-gold)]">
                    <Star className="h-3 w-3 fill-current" /> {selected.rating}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {selected.seasonBadge}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-3 pb-3">
              <Button
                fullWidth
                className="h-10 text-[14px]"
                onClick={() => navigate(`/destination/${selected.id}`)}
              >
                Смотреть
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      <TabBar />
    </div>
  );
}
