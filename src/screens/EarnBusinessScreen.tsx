import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Lightbulb,
  Minus,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  computeEarnBusinessStats,
  formatUsd,
  type EarningsTrend,
  type ListingEarnBreakdown,
} from "../lib/earnStats";
import { useMessages } from "../lib/i18n/react";
import type { EarnBusinessMessages } from "../lib/i18n/types";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const GOLD = "#F59E0B";
const BORDER = "#E8E6E0";

function TrendIcon({ trend }: { trend: EarningsTrend }) {
  if (trend === "up") {
    return <ArrowUpRight className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
  }
  if (trend === "down") {
    return <ArrowDownRight className="h-4 w-4 text-red-500" aria-hidden="true" />;
  }
  return <Minus className="h-4 w-4 text-gray-400" aria-hidden="true" />;
}

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col rounded-xl border bg-white px-3 py-2.5"
      style={{ borderColor: BORDER }}
    >
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[15px] font-bold" style={{ color: GREEN }}>
        {value}
      </p>
    </div>
  );
}

function Sparkline({ points, hint }: { points: { label: string; amountUsd: number }[]; hint: string }) {
  const max = Math.max(...points.map((p) => p.amountUsd), 1);

  return (
    <div className="mt-4">
      <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
        {points.map((point) => {
          const heightPct = Math.max(8, Math.round((point.amountUsd / max) * 100));
          return (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${heightPct}%`,
                  background:
                    point.amountUsd > 0
                      ? `linear-gradient(180deg, ${GOLD} 0%, ${GREEN_LIGHT} 100%)`
                      : "#E5E7EB",
                }}
              />
              <span className="text-[10px] font-medium text-gray-400">{point.label}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-gray-500">{hint}</p>
    </div>
  );
}

function ListingRow({ row, trendAria }: { row: ListingEarnBreakdown; trendAria: (t: string) => string }) {
  return (
    <tr className="border-b last:border-b-0" style={{ borderColor: BORDER }}>
      <td className="py-3 pr-2">
        <p className="truncate text-[13px] font-semibold text-gray-900">{row.title}</p>
      </td>
      <td className="whitespace-nowrap py-3 px-2 text-right text-[13px] font-bold" style={{ color: GOLD }}>
        {formatUsd(row.earnedThisMonth)}
      </td>
      <td className="whitespace-nowrap py-3 px-2 text-right text-[13px] text-gray-600">
        {formatUsd(row.earnedTotal)}
      </td>
      <td className="py-3 pl-2 text-right">
        <span className="inline-flex items-center justify-end" aria-label={trendAria(row.trend)}>
          <TrendIcon trend={row.trend} />
        </span>
      </td>
    </tr>
  );
}


function localizeGrowthTips(
  stats: ReturnType<typeof computeEarnBusinessStats>,
  copy: EarnBusinessMessages,
) {
  const tips: { title: string; body: string }[] = [];
  const earningListings = stats.perListing.filter((row) => row.earnedTotal > 0);
  const avgMonthlyPerListing =
    earningListings.length > 0
      ? Math.round(
          earningListings.reduce((sum, row) => sum + row.earnedThisMonth, 0) /
            Math.max(earningListings.filter((row) => row.earnedThisMonth > 0).length, 1),
        )
      : 40;
  if (stats.listingsCount > 0) {
    tips.push({
      title: copy.tipExpandTitle,
      body: copy.tipExpandBody(String(Math.max(avgMonthlyPerListing, 35))),
    });
  }
  if (stats.growthPercentMonthOverMonth !== null && stats.growthPercentMonthOverMonth > 0) {
    tips.push({
      title: copy.tipMomentumTitle,
      body: copy.tipMomentumBody(
        stats.growthPercentMonthOverMonth,
        String(stats.earnedLastMonth),
        String(stats.earnedThisMonth),
      ),
    });
  } else if (stats.earnedThisMonth < stats.earnedLastMonth && stats.earnedLastMonth > 0) {
    tips.push({
      title: copy.tipRecoverTitle,
      body: copy.tipRecoverBody(String(stats.earnedLastMonth)),
    });
  } else {
    tips.push({
      title: copy.tipTargetTitle,
      body: copy.tipTargetBody(String(Math.max(stats.earnedThisMonth + 40, 80))),
    });
  }
  if (stats.activeItemsOut > 0) {
    tips.push({
      title: copy.tipFieldTitle,
      body: copy.tipFieldBody(String(stats.activeEarningNowUsd), stats.activeItemsOut),
    });
  }
  return tips.slice(0, 3);
}

export function EarnBusinessScreen({
  onHome,
  onRentals: _onRentals,
}: {
  onHome: () => void;
  onRentals: () => void;
}) {
  const copy = useMessages().earnBusiness;
  const stats = useMemo(() => computeEarnBusinessStats(), []);
  const tips = useMemo(() => localizeGrowthTips(stats, copy), [stats, copy]);

  const growthPositive =
    stats.growthPercentMonthOverMonth === null ||
    stats.growthPercentMonthOverMonth >= 0;
  const growthLabel =
    stats.growthPercentMonthOverMonth === null
      ? copy.growthNew
      : copy.growthVsLast(
          `${stats.growthPercentMonthOverMonth > 0 ? "+" : ""}${stats.growthPercentMonthOverMonth}`,
        );

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-4 pt-4">
        <div
          className="mb-4 rounded-3xl border bg-white p-5 shadow-sm"
          style={{ borderColor: BORDER }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-500">
            {copy.earnedThisMonth}
          </p>
          <p className="mt-1 text-[40px] font-extrabold leading-none" style={{ color: GOLD }}>
            {formatUsd(stats.earnedThisMonth)}
          </p>
          <p className="mt-2 text-[14px] text-gray-500">
            {copy.allTime}{" "}
            <span className="font-semibold" style={{ color: GREEN }}>
              {formatUsd(stats.totalEarnedAllTime)}
            </span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold"
              style={{
                backgroundColor: growthPositive ? "#DCFCE7" : "#FEE2E2",
                color: growthPositive ? GREEN : "#B91C1C",
              }}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {growthLabel}
            </span>
            <span className="text-[12px] text-gray-500">
              {copy.projectedByMonthEnd(formatUsd(stats.projectedThisMonth))}
            </span>
          </div>

          <Sparkline points={stats.earnedLast7Days} hint={copy.sparklineHint} />
        </div>

        <div className="mb-4 flex gap-2">
          <KpiChip label={copy.kpiThisMonth} value={formatUsd(stats.earnedThisMonth)} />
          <KpiChip label={copy.kpiLastMonth} value={formatUsd(stats.earnedLastMonth)} />
          <KpiChip
            label={copy.kpiActiveNow}
            value={
              stats.activeItemsOut > 0
                ? formatUsd(stats.activeEarningNowUsd)
                : "$0"
            }
          />
        </div>

        <section className="mb-4">
          <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {copy.growingTitle}
          </h2>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li
                key={tip.title}
                className="flex gap-3 rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${GREEN}12` }}
                >
                  <Lightbulb className="h-4 w-4" style={{ color: GREEN_LIGHT }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: GREEN }}>
                    {tip.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-gray-600">{tip.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-3">
          <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {copy.byListing}
          </h2>
          {stats.perListing.length === 0 ? (
            <div
              className="rounded-2xl border bg-white px-4 py-8 text-center"
              style={{ borderColor: BORDER }}
            >
              <Package className="mx-auto mb-3 h-8 w-8" style={{ color: GREEN_LIGHT }} />
              <p className="font-semibold text-gray-800">{copy.emptyTitle}</p>
              <p className="mt-1 text-sm text-gray-500">
                {copy.emptyBody}
              </p>
              <button
                type="button"
                onClick={onHome}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: GREEN_LIGHT }}
              >
                {copy.backToBrowse}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{ borderColor: BORDER }}
            >
              <table className="w-full table-fixed px-3">
                <thead>
                  <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-gray-400" style={{ borderColor: BORDER }}>
                    <th className="py-2.5 pr-2 text-left font-semibold">{copy.colItem}</th>
                    <th className="whitespace-nowrap px-2 py-2.5 text-right font-semibold">{copy.colMonth}</th>
                    <th className="whitespace-nowrap px-2 py-2.5 text-right font-semibold">{copy.colAllTime}</th>
                    <th className="w-8 py-2.5 pl-2 text-right font-semibold" aria-label={copy.colAllTime}>
                      <span className="sr-only">Trend</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="px-3">
                  {stats.perListing.map((row) => (
                    <ListingRow key={row.listingId} row={row} trendAria={copy.trendAria} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="px-1 text-center text-[11px] text-gray-400">{copy.activeListings(stats.listingsCount)}</p>
      </div>
    </div>
  );
}
