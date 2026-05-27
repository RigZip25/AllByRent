import { useEffect } from "react";
import { Sparkles, Trophy } from "lucide-react";
import type { AppMode } from "../../lib/appMode";
import {
  isFoundingHostPromoSeen,
  markFoundingHostPromoSeen,
} from "../../lib/foundingHostPromoStorage";

const GREEN_DARK = "#0D5C3A";
const GREEN = "#1A9E6E";
const GOLD = "#F59E0B";
const BORDER = "#E8E6E0";

interface FoundingHostPromoProps {
  appMode: AppMode;
  subcategoryLabel: string;
  onPrimary: () => void;
  onShare?: () => void;
}

export function FoundingHostPromo({
  appMode,
  subcategoryLabel,
  onPrimary,
  onShare,
}: FoundingHostPromoProps) {
  const isEarn = appMode === "earn";
  const seen = isFoundingHostPromoSeen();

  useEffect(() => {
    if (!seen) markFoundingHostPromoSeen();
  }, [seen]);

  const primaryLabel = isEarn ? "List your first item" : "Post a Request";
  const primaryHint = isEarn
    ? "Start earning in minutes — neighbors are already looking."
    : "Be first to ask — hosts list where demand shows up.";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-5"
      style={{
        borderColor: `${GREEN}44`,
        background:
          "linear-gradient(145deg, rgba(13,92,58,0.08) 0%, rgba(26,158,110,0.14) 45%, rgba(245,158,11,0.08) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30"
        style={{ background: `radial-gradient(circle, ${GOLD}55, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: GREEN_DARK }}
          >
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            {isEarn ? "Founding Host" : "Early Community"}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ borderColor: `${GOLD}66`, color: GREEN_DARK, backgroundColor: `${GOLD}18` }}
          >
            <Sparkles className="h-3 w-3" style={{ color: GOLD }} aria-hidden="true" />
            First 1,000 hosts
          </span>
        </div>

        <div>
          <p className="text-[22px] font-bold leading-tight" style={{ color: GREEN_DARK }}>
            {isEarn ? (
              <>
                3 months <span style={{ color: GOLD }}>free listing</span>
              </>
            ) : (
              <>Help fill this shelf first</>
            )}
          </p>
          {isEarn ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Launch offer for early hosts in{" "}
              <span className="font-semibold text-foreground">{subcategoryLabel}</span> — low
              competition, priority placement while we grow.
            </p>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Post what you need in{" "}
              <span className="font-semibold text-foreground">{subcategoryLabel}</span>. Your
              request signals demand — the first hosts list where neighbors ask.
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Launch offer · limited spots
            {!seen ? " · spots filling" : null}
          </p>
        </div>

        <button
          type="button"
          onClick={onPrimary}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          style={{ backgroundColor: GREEN_DARK }}
        >
          {primaryLabel}
        </button>
        <p className="text-center text-xs text-muted-foreground">{primaryHint}</p>

        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="w-full rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-white/60"
            style={{ borderColor: BORDER, color: GREEN_DARK }}
          >
            Share with neighbors
          </button>
        ) : null}
      </div>
    </div>
  );
}
