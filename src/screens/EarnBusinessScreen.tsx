import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Download,
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
import {
  computeEarningsStatement,
  downloadEarningsStatementCsv,
  formatStatementDate,
  formatStatementMoney,
} from "../lib/earnStatement";
import { useLocale, useMessages } from "../lib/i18n/react";
import type { EarnBusinessMessages } from "../lib/i18n/types";
import { useAuth } from "../hooks/AuthProvider";
import { loadConnectStatus, startConnectOnboarding } from "../lib/repositories/connectRepository";
import { onConnectOnboardingDone } from "../lib/connectOnboardingBus";
import { PayoutsFlowCard } from "../components/payments/PayoutsFlowCard";
import { ConnectSetupError } from "../components/payments/ConnectSetupError";

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

function Sparkline({
  points,
  hint,
  emptyHint,
}: {
  points: { label: string; amountUsd: number }[];
  hint: string;
  emptyHint: string;
}) {
  const hasAny = points.some((p) => p.amountUsd > 0);
  const max = Math.max(...points.map((p) => p.amountUsd), 1);

  if (!hasAny) {
    return (
      <div className="mt-4 rounded-xl bg-[#F0F4F2] px-3 py-3">
        <p className="text-[12px] leading-snug text-gray-500">{emptyHint}</p>
      </div>
    );
  }

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
                  background: `linear-gradient(180deg, ${GOLD} 0%, ${GREEN_LIGHT} 100%)`,
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

function ListingRow({
  row,
  monthLabel,
  allTimeLabel,
  trendAria,
}: {
  row: ListingEarnBreakdown;
  monthLabel: string;
  allTimeLabel: string;
  trendAria: (t: string) => string;
}) {
  return (
    <li
      className="flex items-start gap-3 border-b px-3.5 py-3 last:border-b-0"
      style={{ borderColor: BORDER }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-snug text-gray-900 [overflow-wrap:anywhere]">
          {row.title}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-gray-500">
          <span>
            {monthLabel}{" "}
            <span className="font-bold" style={{ color: GOLD }}>
              {formatUsd(row.earnedThisMonth)}
            </span>
          </span>
          <span>
            {allTimeLabel}{" "}
            <span className="font-semibold text-gray-700">{formatUsd(row.earnedTotal)}</span>
          </span>
        </div>
      </div>
      <span
        className="mt-0.5 inline-flex shrink-0 items-center"
        aria-label={trendAria(row.trend)}
      >
        <TrendIcon trend={row.trend} />
      </span>
    </li>
  );
}

type NextMove = {
  id: string;
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
};

function buildNextMoves(
  stats: ReturnType<typeof computeEarnBusinessStats>,
  copy: EarnBusinessMessages,
  actions: { onStock: () => void; onGarage: () => void },
): NextMove[] {
  const moves: NextMove[] = [];
  const zeroHistory = stats.earnedThisMonth === 0 && stats.earnedLastMonth === 0;
  const hasRealPace = stats.perListing.some((row) => row.earnedThisMonth > 0);

  if (zeroHistory) {
    moves.push({
      id: "first-booking",
      title: copy.tipFirstBookingTitle,
      body: copy.tipFirstBookingBody,
      cta: copy.ctaGarage,
      onCta: actions.onGarage,
    });
    if (stats.draftCount > 0) {
      moves.push({
        id: "finish-draft",
        title: copy.tipFinishDraftTitle,
        body: copy.tipFinishDraftBody,
        cta: copy.ctaGarage,
        onCta: actions.onGarage,
      });
    } else if (stats.liveCount > 0) {
      moves.push({
        id: "bookable",
        title: copy.tipBookableTitle,
        body: copy.tipBookableBody,
        cta: copy.ctaGarage,
        onCta: actions.onGarage,
      });
    } else {
      moves.push({
        id: "stock-first",
        title: copy.tipStockFirstTitle,
        body: copy.tipStockFirstBody,
        cta: copy.ctaStock,
        onCta: actions.onStock,
      });
    }
    return moves.slice(0, 2);
  }

  if (hasRealPace) {
    const earners = stats.perListing.filter((row) => row.earnedThisMonth > 0);
    const avg = Math.round(
      earners.reduce((sum, row) => sum + row.earnedThisMonth, 0) / Math.max(earners.length, 1),
    );
    moves.push({
      id: "expand",
      title: copy.tipExpandTitle,
      body: copy.tipExpandBody(formatUsd(avg)),
      cta: copy.ctaStock,
      onCta: actions.onStock,
    });
  }

  if (stats.growthPercentMonthOverMonth !== null && stats.growthPercentMonthOverMonth > 0) {
    moves.push({
      id: "momentum",
      title: copy.tipMomentumTitle,
      body: copy.tipMomentumBody(
        stats.growthPercentMonthOverMonth,
        formatUsd(stats.earnedLastMonth),
        formatUsd(stats.earnedThisMonth),
      ),
    });
  } else if (stats.earnedThisMonth < stats.earnedLastMonth && stats.earnedLastMonth > 0) {
    moves.push({
      id: "recover",
      title: copy.tipRecoverTitle,
      body: copy.tipRecoverBody(formatUsd(stats.earnedLastMonth)),
      cta: copy.ctaGarage,
      onCta: actions.onGarage,
    });
  }

  if (stats.activeItemsOut > 0) {
    moves.push({
      id: "field",
      title: copy.tipFieldTitle,
      body: copy.tipFieldBody(formatUsd(stats.activeEarningNowUsd), stats.activeItemsOut),
    });
  }

  if (moves.length === 0 && stats.draftCount > 0) {
    moves.push({
      id: "finish-draft",
      title: copy.tipFinishDraftTitle,
      body: copy.tipFinishDraftBody,
      cta: copy.ctaGarage,
      onCta: actions.onGarage,
    });
  }

  if (moves.length === 0) {
    moves.push({
      id: "stock",
      title: copy.tipStockFirstTitle,
      body: copy.tipStockFirstBody,
      cta: copy.ctaStock,
      onCta: actions.onStock,
    });
  }

  return moves.slice(0, 3);
}

function StatementSection({
  copy,
  onOpenPayoutSettings,
}: {
  copy: EarnBusinessMessages;
  onOpenPayoutSettings?: () => void;
}) {
  const locale = useLocale();
  const defaultYear = new Date().getFullYear();
  const [year, setYear] = useState(defaultYear);
  const statement = useMemo(() => computeEarningsStatement(year), [year]);

  const onDownload = () => {
    downloadEarningsStatementCsv(statement, {
      date: copy.colDate,
      listing: copy.colListing,
      bookingId: copy.colBookingId,
      gross: copy.colGross,
      platformFee: copy.colPlatformFee,
      stripeFee: copy.colStripeFee,
      refunds: copy.colRefunds,
      delivery: copy.colDelivery,
      net: copy.colNet,
      notAvailable: copy.notAvailable,
    });
  };

  return (
    <section className="mb-4">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2 px-1">
        <div className="min-w-0">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {copy.statementTitle}
          </h2>
          <p className="mt-0.5 text-[12px] leading-snug text-gray-500">{copy.statementSubtitle}</p>
        </div>
        <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-600">
          <span className="sr-only">{copy.periodLabel}</span>
          <select
            value={statement.year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border bg-white px-2.5 py-1.5 text-[13px] font-semibold text-gray-800"
            style={{ borderColor: BORDER }}
            aria-label={copy.periodLabel}
          >
            {statement.availableYears.map((y) => (
              <option key={y} value={y}>
                {copy.yearOption(y)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
        <div className="grid grid-cols-2 gap-2 border-b px-3.5 py-3 sm:grid-cols-3" style={{ borderColor: BORDER }}>
          <KpiChip label={copy.colGross} value={formatStatementMoney(statement.totals.gross)} />
          <KpiChip label={copy.colPlatformFee} value={formatStatementMoney(statement.totals.platformFee)} />
          <KpiChip label={copy.colNet} value={formatStatementMoney(statement.totals.net)} />
          <KpiChip label={copy.colRefunds} value={formatStatementMoney(statement.totals.refunds)} />
          <KpiChip label={copy.colDelivery} value={formatStatementMoney(statement.totals.delivery)} />
          <KpiChip label={copy.colStripeFee} value={copy.notAvailable} />
        </div>

        {statement.rows.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="font-semibold text-gray-800">{copy.emptyStatementTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{copy.emptyStatementBody}</p>
          </div>
        ) : (
          <ul>
            {statement.rows.map((row) => (
              <li
                key={row.id}
                className="border-b px-3.5 py-3 last:border-b-0"
                style={{ borderColor: BORDER }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 [overflow-wrap:anywhere]">
                      {row.listingTitle}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {formatStatementDate(row.dateIso, locale)}
                      {row.delivery > 0
                        ? ` · ${copy.colDelivery} ${formatStatementMoney(row.delivery)}`
                        : ""}
                      {row.refunds > 0
                        ? ` · ${copy.colRefunds} ${formatStatementMoney(row.refunds)}`
                        : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[14px] font-bold" style={{ color: GREEN }}>
                      {formatStatementMoney(row.net)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {copy.colGross} {formatStatementMoney(row.gross)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {copy.colPlatformFee} {formatStatementMoney(row.platformFee)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 border-t px-3.5 py-3" style={{ borderColor: BORDER }}>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.downloadCsv}
            </button>
            {onOpenPayoutSettings ? (
              <button
                type="button"
                onClick={onOpenPayoutSettings}
                className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[13px] font-bold"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.stripePayoutsLink}
              </button>
            ) : null}
          </div>
          <p className="text-[11px] leading-snug text-gray-500">{copy.disclaimer}</p>
          <p className="text-[11px] leading-snug text-gray-500">{copy.countryTaxNote}</p>
          {statement.isUsMarket ? (
            <p className="text-[11px] leading-snug text-gray-500">{copy.usTaxFormsNote}</p>
          ) : null}
          {statement.feesPartiallyEstimated ? (
            <p className="text-[11px] leading-snug text-gray-500">{copy.feesEstimatedNote}</p>
          ) : null}
          <p className="text-[11px] leading-snug text-gray-400">{copy.ledgerGapNote}</p>
        </div>
      </div>
    </section>
  );
}

export function EarnBusinessScreen({
  onBack,
  onHome,
  onRentals: _onRentals,
  onStock,
  onGarage,
  onOpenPayoutSettings,
}: {
  onBack?: () => void;
  onHome: () => void;
  onRentals: () => void;
  onStock?: () => void;
  onGarage?: () => void;
  /** Account settings → bank / payouts (stay in Evorios). */
  onOpenPayoutSettings?: () => void;
}) {
  const auth = useAuth();
  const messages = useMessages();
  const copy = messages.earnBusiness;
  const profileCopy = messages.profile;
  const common = messages.common;
  const earningsTitle = messages.garageUi.earnings;
  const stats = useMemo(() => computeEarnBusinessStats(), []);
  const stock = onStock ?? onHome;
  const garage = onGarage ?? onHome;
  const moves = useMemo(
    () => buildNextMoves(stats, copy, { onStock: stock, onGarage: garage }),
    [stats, copy, stock, garage],
  );

  const [stripeStatus, setStripeStatus] = useState({
    connected: false,
    payoutsEnabled: false,
    onboardingComplete: false,
    last4: null as string | null,
  });
  const [connectBusy, setConnectBusy] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectErrorCode, setConnectErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.userId) return;
    let mounted = true;
    const refresh = () => {
      void loadConnectStatus(auth.userId).then((status) => {
        if (!mounted) return;
        setStripeStatus({
          connected: status.connected,
          payoutsEnabled: status.payoutsEnabled,
          onboardingComplete: status.onboardingComplete,
          last4: status.last4,
        });
      });
    };
    refresh();
    return onConnectOnboardingDone(refresh);
  }, [auth.userId]);

  const openPayouts = () => {
    setConnectBusy(true);
    setConnectError(null);
    setConnectErrorCode(null);
    void startConnectOnboarding("/?screen=earnBusiness", { allowUpdate: true })
      .then((result) => {
        if (!result.ok) {
          setConnectError(
            result.code === "phone_unverified" ? profileCopy.phoneVerifyNeeded : result.reason,
          );
          setConnectErrorCode(result.code ?? null);
          return;
        }
        if (result.mode === "redirect") {
          window.location.assign(result.url);
        }
      })
      .finally(() => setConnectBusy(false));
  };

  const refreshPayoutStatus = () => {
    if (!auth.userId) return;
    setConnectBusy(true);
    void loadConnectStatus(auth.userId)
      .then((status) => {
        setStripeStatus({
          connected: status.connected,
          payoutsEnabled: status.payoutsEnabled,
          onboardingComplete: status.onboardingComplete,
          last4: status.last4,
        });
      })
      .finally(() => setConnectBusy(false));
  };

  const onPayoutsPrimary = () => {
    if (onOpenPayoutSettings && stripeStatus.payoutsEnabled) {
      onOpenPayoutSettings();
      return;
    }
    if (stripeStatus.onboardingComplete && !stripeStatus.payoutsEnabled) {
      refreshPayoutStatus();
      return;
    }
    openPayouts();
  };

  const hasEarnings = stats.earnedThisMonth > 0 || stats.earnedLastMonth > 0 || stats.totalEarnedAllTime > 0;
  const growthPositive =
    stats.growthPercentMonthOverMonth === null || stats.growthPercentMonthOverMonth >= 0;
  const growthLabel =
    stats.growthPercentMonthOverMonth === null
      ? copy.growthNew
      : copy.growthVsLast(
          `${stats.growthPercentMonthOverMonth > 0 ? "+" : ""}${stats.growthPercentMonthOverMonth}`,
        );

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      {onBack ? (
        <header
          className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-3"
          style={{ borderColor: BORDER }}
        >
          <button type="button" onClick={onBack} className="p-2" aria-label={common.back}>
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <h1 className="text-[18px] font-bold" style={{ color: GREEN }}>
            {earningsTitle}
          </h1>
        </header>
      ) : null}
      <div className="screen-scroll flex-1 px-4 pb-4 pt-3">
        <div
          className="mb-3 rounded-3xl border bg-white p-5 shadow-sm"
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
            {hasEarnings ? (
              <span className="text-[12px] text-gray-500">
                {copy.projectedByMonthEnd(formatUsd(stats.projectedThisMonth))}
              </span>
            ) : null}
          </div>

          <Sparkline
            points={stats.earnedLast7Days}
            hint={copy.sparklineHint}
            emptyHint={copy.sparklineEmpty}
          />
        </div>

        {auth.userId ? (
          <div className="mb-4">
            <PayoutsFlowCard
              variant="compact"
              status={stripeStatus}
              busy={connectBusy}
              onPrimary={onPayoutsPrimary}
              onViewEarnings={undefined}
              errorSlot={
                connectError ? (
                  <ConnectSetupError message={connectError} code={connectErrorCode} />
                ) : null
              }
            />
          </div>
        ) : null}

        <div className="mb-4 flex gap-2">
          {hasEarnings ? (
            <>
              <KpiChip label={copy.kpiThisMonth} value={formatUsd(stats.earnedThisMonth)} />
              <KpiChip label={copy.kpiLastMonth} value={formatUsd(stats.earnedLastMonth)} />
              <KpiChip
                label={copy.kpiOut}
                value={stats.activeItemsOut > 0 ? formatUsd(stats.activeEarningNowUsd) : formatUsd(0)}
              />
            </>
          ) : (
            <>
              <KpiChip label={copy.kpiLive} value={String(stats.liveCount)} />
              <KpiChip label={copy.kpiDrafts} value={String(stats.draftCount)} />
              <KpiChip label={copy.kpiOut} value={String(stats.activeItemsOut)} />
            </>
          )}
        </div>

        <StatementSection copy={copy} onOpenPayoutSettings={onOpenPayoutSettings ?? openPayouts} />

        <section className="mb-4">
          <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
            {copy.growingTitle}
          </h2>
          <ul className="space-y-2">
            {moves.map((move) => (
              <li
                key={move.id}
                className="rounded-2xl border bg-white p-3"
                style={{ borderColor: BORDER }}
              >
                <div className="flex gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${GREEN}12` }}
                  >
                    <Lightbulb className="h-4 w-4" style={{ color: GREEN_LIGHT }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold" style={{ color: GREEN }}>
                      {move.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-gray-600">{move.body}</p>
                    {move.cta && move.onCta ? (
                      <button
                        type="button"
                        onClick={move.onCta}
                        className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold"
                        style={{ color: GREEN_LIGHT }}
                      >
                        {move.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
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
              <p className="mt-1 text-sm text-gray-500">{copy.emptyBody}</p>
              <button
                type="button"
                onClick={stock}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: GREEN_LIGHT }}
              >
                {copy.ctaStock}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{ borderColor: BORDER }}
            >
              <ul>
                {stats.perListing.map((row) => (
                  <ListingRow
                    key={row.listingId}
                    row={row}
                    monthLabel={copy.colMonth}
                    allTimeLabel={copy.colAllTime}
                    trendAria={copy.trendAria}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>

        <p className="px-1 text-center text-[11px] text-gray-400">
          {copy.activeListings(stats.liveCount)}
        </p>
      </div>
    </div>
  );
}
