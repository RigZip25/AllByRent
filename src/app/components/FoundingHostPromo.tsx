import { useEffect } from "react";
import { Sparkles, Trophy } from "lucide-react";
import type { AppMode } from "../../lib/appMode";
import {
  isFoundingHostPromoSeen,
  markFoundingHostPromoSeen,
} from "../../lib/foundingHostPromoStorage";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import { loadOpsSettings } from "../../lib/ops/opsSettings";

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
  const t = useMessages();
  const founding = t.shelf.founding;
  const isEarn = appMode === "earn";
  const seen = isFoundingHostPromoSeen();
  const enabled = loadOpsSettings().foundingPromoEnabled;
  const subcategoryDisplay = localizeCategoryLabel(subcategoryLabel);

  useEffect(() => {
    if (enabled && !seen) markFoundingHostPromoSeen();
  }, [enabled, seen]);

  if (!enabled) return null;

  const primaryLabel = isEarn ? founding.listFirstCta : founding.postRequestCta;
  const primaryHint = isEarn ? founding.hintEarn : founding.hintRent;

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
            {isEarn ? founding.badgeFounding : founding.badgeCommunity}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            style={{ borderColor: `${GOLD}66`, color: GREEN_DARK, backgroundColor: `${GOLD}18` }}
          >
            <Sparkles className="h-3 w-3" style={{ color: GOLD }} aria-hidden="true" />
            {founding.firstHosts}
          </span>
        </div>

        <div>
          <p className="text-[22px] font-bold leading-tight" style={{ color: GREEN_DARK }}>
            {isEarn ? (
              <>
                {founding.titleEarnPrefix}{" "}
                <span style={{ color: GOLD }}>{founding.titleEarnHighlight}</span>
              </>
            ) : (
              <>{founding.titleRent}</>
            )}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {isEarn
              ? founding.bodyEarn(subcategoryDisplay)
              : founding.bodyRent(subcategoryDisplay)}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {founding.launchOffer}
            {!seen ? founding.spotsFilling : null}
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
            {founding.shareNeighbors}
          </button>
        ) : null}
      </div>
    </div>
  );
}
