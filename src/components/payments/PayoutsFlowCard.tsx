import type { ReactNode } from "react";
import { Check, CreditCard, Landmark, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { BRAND_SECURE, BRAND_SECURE_SOFT } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";
const INK = "#0B3D2A";

export type PayoutsFlowStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  onboardingComplete: boolean;
  last4?: string | null;
};

export type PayoutsFlowPhase = "setup" | "finish" | "pending" | "ready";

export function resolvePayoutsFlowPhase(status: PayoutsFlowStatus): PayoutsFlowPhase {
  if (status.payoutsEnabled) return "ready";
  if (status.onboardingComplete) return "pending";
  if (status.connected) return "finish";
  return "setup";
}

type Props = {
  status: PayoutsFlowStatus;
  busy?: boolean;
  /** full = Account settings; compact = Earnings strip */
  variant?: "full" | "compact";
  onPrimary: () => void;
  onViewEarnings?: () => void;
  errorSlot?: ReactNode;
};

function StepPill({
  index,
  label,
  state,
}: {
  index: number;
  label: string;
  state: "done" | "current" | "todo";
}) {
  const bg =
    state === "done" ? GREEN : state === "current" ? BRAND_SECURE : "#E8E6E0";
  const color = state === "todo" ? "#6B7280" : "#FFFFFF";
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-extrabold"
        style={{ backgroundColor: bg, color }}
        aria-hidden
      >
        {state === "done" ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index}
      </span>
      <span
        className="max-w-full text-center text-[11px] font-semibold leading-tight"
        style={{ color: state === "todo" ? "#9CA3AF" : INK }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Informative in-app payouts status: steps, how money moves, primary CTA.
 * Keeps hosts inside Evorios — Stripe hosted pages only when starting/finishing KYC.
 */
export function PayoutsFlowCard({
  status,
  busy = false,
  variant = "full",
  onPrimary,
  onViewEarnings,
  errorSlot,
}: Props) {
  const { profile: t } = useMessages();
  const phase = resolvePayoutsFlowPhase(status);
  const compact = variant === "compact";

  const statusLabel =
    phase === "ready"
      ? t.payoutsEnabled(status.last4 ?? undefined)
      : phase === "pending"
        ? t.pendingVerification
        : phase === "finish"
          ? t.finishPayoutSetup
          : t.requiredPayouts;

  const headline =
    phase === "ready"
      ? t.payoutsFlowReadyTitle
      : phase === "pending"
        ? t.payoutsFlowPendingTitle
        : phase === "finish"
          ? t.payoutsFlowFinishTitle
          : t.payoutsFlowSetupTitle;

  const body =
    phase === "ready"
      ? t.payoutsFlowReadyBody
      : phase === "pending"
        ? t.payoutsFlowPendingBody
        : phase === "finish"
          ? t.payoutsFlowFinishBody
          : t.payoutsFlowSetupBody;

  const cta =
    phase === "ready"
      ? t.payoutsFlowCtaUpdate
      : phase === "pending"
        ? t.payoutsFlowCtaRefresh
        : phase === "finish"
          ? t.payoutsFlowCtaContinue
          : t.payoutsFlowCtaSetup;

  const step1: "done" | "current" | "todo" =
    phase === "setup" ? "current" : "done";
  const step2: "done" | "current" | "todo" =
    phase === "setup" ? "todo" : phase === "finish" ? "current" : "done";
  const step3: "done" | "current" | "todo" =
    phase === "ready" ? "done" : phase === "pending" ? "current" : "todo";

  const badgeBg =
    phase === "ready"
      ? "#D1FAE5"
      : phase === "pending"
        ? BRAND_SECURE_SOFT
        : phase === "finish"
          ? "#FEF3C7"
          : "#F3F4F6";
  const badgeColor =
    phase === "ready"
      ? GREEN
      : phase === "pending"
        ? "#4338CA"
        : phase === "finish"
          ? "#B45309"
          : "#4B5563";

  return (
    <section
      className={
        compact
          ? "overflow-hidden rounded-2xl border bg-white"
          : "overflow-hidden rounded-[1.35rem] border bg-white shadow-sm"
      }
      style={{ borderColor: BORDER }}
      aria-labelledby="payouts-flow-title"
    >
      <div
        className="relative px-4 pb-3 pt-4"
        style={{
          background:
            phase === "ready"
              ? `linear-gradient(145deg, #F0FDF4 0%, #FFFFFF 55%, ${BRAND_SECURE_SOFT} 100%)`
              : `linear-gradient(160deg, #FFFEFA 0%, #F4F7F5 50%, ${BRAND_SECURE_SOFT} 100%)`,
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: phase === "ready" ? "#D1FAE5" : BRAND_SECURE_SOFT,
              color: phase === "ready" ? GREEN : BRAND_SECURE,
            }}
          >
            {phase === "ready" ? (
              <Landmark className="h-5 w-5" />
            ) : (
              <CreditCard className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                id="payouts-flow-title"
                className="text-[16px] font-extrabold leading-tight"
                style={{ color: GREEN }}
              >
                {headline}
              </p>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: badgeBg, color: badgeColor }}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-600">{body}</p>
          </div>
        </div>

        {!compact ? (
          <div className="mt-4 flex items-start gap-1 rounded-2xl border bg-white/80 px-2 py-3" style={{ borderColor: BORDER }}>
            <StepPill index={1} label={t.payoutsFlowStepVerify} state={step1} />
            <span className="mt-3 h-px flex-1 bg-gray-200" aria-hidden />
            <StepPill index={2} label={t.payoutsFlowStepBank} state={step2} />
            <span className="mt-3 h-px flex-1 bg-gray-200" aria-hidden />
            <StepPill index={3} label={t.payoutsFlowStepReady} state={step3} />
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div className="space-y-3 border-t px-4 py-4" style={{ borderColor: BORDER }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
            {t.payoutsFlowHowTitle}
          </p>
          <ol className="space-y-2.5">
            {(
              [
                { icon: Wallet, text: t.payoutsFlowHowPay },
                { icon: ShieldCheck, text: t.payoutsFlowHowHold },
                { icon: Landmark, text: t.payoutsFlowHowBank },
              ] as const
            ).map((row, i) => (
              <li key={row.text} className="flex gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[12px] font-extrabold text-white"
                  style={{ backgroundColor: i === 2 ? GREEN : BRAND_SECURE }}
                >
                  <row.icon className="h-4 w-4" />
                </span>
                <p className="pt-1 text-[13px] leading-snug text-gray-700">{row.text}</p>
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-1.5 text-[11px] leading-snug text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: BRAND_SECURE }} />
            {t.payoutsFlowSecureNote}
          </p>
        </div>
      ) : null}

      <div
        className={`flex flex-col gap-2 border-t px-4 py-3 ${compact ? "" : "sm:flex-row"}`}
        style={{ borderColor: BORDER }}
      >
        <button
          type="button"
          onClick={onPrimary}
          disabled={busy}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-bold text-white active:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: phase === "ready" ? GREEN : BRAND_SECURE }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {cta}
        </button>
        {phase === "ready" && onViewEarnings ? (
          <button
            type="button"
            onClick={onViewEarnings}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border bg-white px-4 text-[14px] font-bold active:bg-gray-50"
            style={{ borderColor: BORDER, color: GREEN }}
          >
            {t.payoutsFlowCtaEarnings}
          </button>
        ) : null}
      </div>

      {errorSlot ? <div className="px-4 pb-3">{errorSlot}</div> : null}
    </section>
  );
}
