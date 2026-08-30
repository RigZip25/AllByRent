import type { ReactNode } from "react";
import { Check, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { BRAND_GREEN, BRAND_GREEN_LIGHT } from "../../lib/brand";
import { connectAssets } from "../../lib/connectAssets";
import { useMessages } from "../../lib/i18n/react";

const GREEN = BRAND_GREEN;
const GREEN_SOFT = "#E8F2EC";
const GREEN_MIST = "#F3F8F5";
const BORDER = "#D8E0DA";
const INK = "#0B3D2A";
const MUTED = "#5C6B63";
const PAPER = "#FFFEFA";

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

function StepDot({
  index,
  label,
  state,
}: {
  index: number;
  label: string;
  state: "done" | "current" | "todo";
}) {
  const done = state === "done";
  const current = state === "current";
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold"
        style={{
          backgroundColor: done || current ? GREEN : "#EEF3F0",
          color: done || current ? "#FFFFFF" : MUTED,
          boxShadow: current ? `0 0 0 4px ${GREEN_SOFT}` : undefined,
        }}
        aria-hidden
      >
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index}
      </span>
      <span
        className="max-w-full text-center text-[11px] leading-tight"
        style={{
          color: current || done ? INK : MUTED,
          fontWeight: current ? 700 : 560,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Account settings / earnings payouts panel.
 * Full variant merges Mr. Evorios secure art with status, steps, and CTA —
 * so hosts don’t see the same picture twice before bank setup.
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
  const showArt = !compact && (phase === "setup" || phase === "finish" || phase === "pending");

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

  const step1: "done" | "current" | "todo" = phase === "setup" ? "current" : "done";
  const step2: "done" | "current" | "todo" =
    phase === "setup" ? "todo" : phase === "finish" ? "current" : "done";
  const step3: "done" | "current" | "todo" =
    phase === "ready" ? "done" : phase === "pending" ? "current" : "todo";

  const chipBg =
    phase === "ready"
      ? GREEN_SOFT
      : phase === "pending"
        ? "#EEF2FF"
        : phase === "finish"
          ? "#FEF6E8"
          : GREEN_MIST;
  const chipColor =
    phase === "ready"
      ? GREEN
      : phase === "pending"
        ? "#3730A3"
        : phase === "finish"
          ? "#9A6700"
          : MUTED;

  if (compact) {
    return (
      <section
        className="overflow-hidden rounded-2xl border"
        style={{
          borderColor: BORDER,
          background: `linear-gradient(145deg, ${PAPER} 0%, ${GREEN_MIST} 100%)`,
        }}
        aria-labelledby="payouts-flow-title"
      >
        <div className="flex items-start gap-3 px-4 pt-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: GREEN_SOFT, color: GREEN }}
          >
            <Landmark className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p id="payouts-flow-title" className="text-[15px] font-bold leading-snug" style={{ color: GREEN }}>
              {headline}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
              {body}
            </p>
            <span
              className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: chipBg, color: chipColor }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={onPrimary}
            disabled={busy}
            className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-bold text-white active:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cta}
          </button>
        </div>
        {errorSlot ? <div className="px-4 pb-3">{errorSlot}</div> : null}
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-[1.5rem] border"
      style={{
        borderColor: BORDER,
        background: PAPER,
        boxShadow: "0 12px 32px rgba(11, 61, 42, 0.07)",
      }}
      aria-labelledby="payouts-flow-title"
    >
      <div
        className="relative px-4 pb-4 pt-4 sm:px-5"
        style={{
          background:
            phase === "ready"
              ? `linear-gradient(165deg, #ECF8F1 0%, ${PAPER} 55%, ${GREEN_MIST} 100%)`
              : `linear-gradient(168deg, ${GREEN_MIST} 0%, ${PAPER} 40%, #F7FAF8 100%)`,
        }}
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: chipBg, color: chipColor }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: phase === "ready" ? BRAND_GREEN_LIGHT : chipColor }}
          />
          {statusLabel}
        </span>

        <h2
          id="payouts-flow-title"
          className="mt-3 text-[22px] font-extrabold leading-[1.15] tracking-tight"
          style={{ color: GREEN }}
        >
          {headline}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
          {body}
        </p>

        {showArt ? (
          <div className="mt-4 overflow-hidden rounded-[1.25rem] border bg-white" style={{ borderColor: BORDER }}>
            <img
              src={connectAssets.securePreview}
              alt={t.connectIntroAlt}
              className="mx-auto block h-auto w-full max-w-[280px] object-contain object-top"
            />
          </div>
        ) : phase === "ready" ? (
          <div
            className="mt-4 flex items-center gap-3 rounded-[1.25rem] border px-4 py-3.5"
            style={{ borderColor: "#A7F3D0", backgroundColor: "#ECFDF5" }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#D1FAE5", color: GREEN }}
            >
              <Landmark className="h-5 w-5" />
            </span>
            <p className="text-[13px] font-semibold leading-snug" style={{ color: GREEN }}>
              {t.payoutsEnabled(status.last4 ?? undefined)}
            </p>
          </div>
        ) : null}

        <div
          className="mt-4 flex items-start gap-1 rounded-2xl border bg-white/80 px-2 py-3.5"
          style={{ borderColor: BORDER }}
        >
          <StepDot index={1} label={t.payoutsFlowStepVerify} state={step1} />
          <span className="mt-4 h-px min-w-[12px] flex-1 bg-[#E2E8E4]" aria-hidden />
          <StepDot index={2} label={t.payoutsFlowStepBank} state={step2} />
          <span className="mt-4 h-px min-w-[12px] flex-1 bg-[#E2E8E4]" aria-hidden />
          <StepDot index={3} label={t.payoutsFlowStepReady} state={step3} />
        </div>
      </div>

      <div className="space-y-3 border-t px-4 py-4 sm:px-5" style={{ borderColor: BORDER }}>
        <p className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: MUTED }}>
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GREEN }} />
          {t.payoutsFlowSecureNote}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onPrimary}
            disabled={busy}
            className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white transition-opacity active:opacity-90 disabled:opacity-60"
            style={{
              background: `linear-gradient(180deg, ${BRAND_GREEN_LIGHT} 0%, ${GREEN} 100%)`,
              boxShadow: "0 8px 18px rgba(13, 92, 58, 0.22)",
            }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {cta}
          </button>
          {phase === "ready" && onViewEarnings ? (
            <button
              type="button"
              onClick={onViewEarnings}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-2xl border bg-white px-4 text-[15px] font-bold active:bg-gray-50"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              {t.payoutsFlowCtaEarnings}
            </button>
          ) : null}
        </div>
      </div>

      {errorSlot ? <div className="px-4 pb-4 sm:px-5">{errorSlot}</div> : null}
    </section>
  );
}
