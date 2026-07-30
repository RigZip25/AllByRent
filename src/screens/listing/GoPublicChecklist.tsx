import { Check, Circle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { RentanoHint } from "../../components/RentanoHint";
import { ConnectSetupError } from "../../components/payments/ConnectSetupError";
import { MASCOT_NAME } from "../../lib/brand";
import type { SellerGoPublicStatus, SellerGoPublicStep } from "../../lib/sellerGoPublic";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

type ChecklistBusy = null | "identity" | "stripe" | "refresh";

type Props = {
  status: SellerGoPublicStatus | null;
  loading: boolean;
  busy: ChecklistBusy;
  error: string | null;
  onSignIn: () => void;
  onVerifyIdentity: () => void;
  onConnectBank: () => void;
  onRefresh: () => void;
  onGoLive: () => void;
  onBack: () => void;
  isPublishing: boolean;
};

type Row = {
  id: SellerGoPublicStep;
  title: string;
  detail: string;
  done: boolean;
  actionLabel: string;
  onAction: () => void;
  actionBusy: boolean;
  disabled: boolean;
};

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: GREEN }}
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
        active ? "" : "opacity-70"
      }`}
      style={{ borderColor: active ? AMBER : "#D1D5DB" }}
    >
      <Circle
        className="h-3 w-3"
        style={{ color: active ? AMBER : "#9CA3AF" }}
        fill={active ? AMBER : "transparent"}
      />
    </span>
  );
}

export function GoPublicChecklist({
  status,
  loading,
  busy,
  error,
  onSignIn,
  onConnectBank,
  onRefresh,
  onGoLive,
  onBack,
  isPublishing,
}: Props) {
  const { listing } = useMessages();
  const gp = listing.goPublic;

  const signedIn = Boolean(status?.signedIn);
  const stripeDone = Boolean(status?.payoutsEnabled || status?.onboardingComplete);
  const next = status?.nextStep ?? "sign_in";
  const ready = Boolean(status?.ready);

  const rows: Row[] = [
    {
      id: "sign_in",
      title: gp.signInTitle,
      detail: signedIn ? gp.signInDone : gp.signInPending,
      done: signedIn,
      actionLabel: gp.signInCta,
      onAction: onSignIn,
      actionBusy: false,
      disabled: signedIn || loading,
    },
    {
      id: "stripe",
      title: gp.stripeTitle,
      detail: stripeDone
        ? status?.bankLast4
          ? gp.stripeConnectedBank(status.bankLast4)
          : status?.payoutsEnabled
            ? gp.stripePayoutsEnabled
            : gp.stripeOnboardingComplete
        : status?.connected
          ? gp.stripeFinishForm
          : gp.stripePending,
      done: stripeDone,
      actionLabel: busy === "stripe" ? gp.openingStripe : gp.continueStripe,
      onAction: onConnectBank,
      actionBusy: busy === "stripe",
      disabled: !signedIn || stripeDone || loading || busy !== null,
    },
  ];

  return (
    <motion.div
      className="mx-auto flex min-h-full w-full max-w-[390px] flex-col bg-[#F9FAFB] px-4 pb-8 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-3 self-start text-sm font-semibold text-gray-600"
      >
        {gp.backToReview}
      </button>

      <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
        {gp.title}
      </h2>
      <p className="mt-1 text-base text-gray-500">
        {gp.subtitle}
      </p>

      {loading && !status ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: GREEN }} />
          {gp.checkingSetup}
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {rows.map((row, index) => {
            const active = !row.done && next === row.id;
            return (
              <li
                key={row.id}
                className={`rounded-2xl border bg-white p-4 ${
                  active ? "border-amber-300 shadow-sm" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <StepIcon done={row.done} active={active} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">
                      {index + 1}. {row.title}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{row.detail}</p>
                    {!row.done ? (
                      <button
                        type="button"
                        onClick={row.onAction}
                        disabled={row.disabled}
                        className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: active ? GREEN : "#9CA3AF" }}
                      >
                        {row.actionBusy ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {row.actionLabel}
                          </span>
                        ) : (
                          row.actionLabel
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {error ? <ConnectSetupError message={error} /> : null}

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading || busy === "refresh"}
        className="mt-4 text-sm font-semibold underline disabled:opacity-50"
        style={{ color: GREEN }}
      >
        {busy === "refresh" || loading ? gp.refreshing : gp.refreshStatus}
      </button>

      <RentanoHint
        className="mt-5"
        hint={gp.tip(MASCOT_NAME)}
        showTapLabel
      />

      <button
        type="button"
        onClick={onGoLive}
        disabled={!ready || isPublishing || loading}
        className="btn-primary mt-6 flex h-14 w-full items-center justify-center text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: ready ? GREEN : "#9CA3AF" }}
      >
        {isPublishing ? gp.goingLive : ready ? gp.goLive : gp.completeSteps}
      </button>
    </motion.div>
  );
}
