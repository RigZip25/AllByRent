import { Check, Circle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { RentanoHint } from "../../components/RentanoHint";
import { ConnectSetupError } from "../../components/payments/ConnectSetupError";
import { MASCOT_NAME } from "../../lib/brand";
import type { SellerGoPublicStatus, SellerGoPublicStep } from "../../lib/sellerGoPublic";

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
  const signedIn = Boolean(status?.signedIn);
  const stripeDone = Boolean(status?.payoutsEnabled || status?.onboardingComplete);
  const next = status?.nextStep ?? "sign_in";
  const ready = Boolean(status?.ready);

  const rows: Row[] = [
    {
      id: "sign_in",
      title: "Sign in",
      detail: signedIn
        ? "Account ready — your draft stays with you."
        : "Save your draft to your account before going live.",
      done: signedIn,
      actionLabel: "Sign in",
      onAction: onSignIn,
      actionBusy: false,
      disabled: signedIn || loading,
    },
    {
      id: "stripe",
      title: "Verify & connect bank",
      detail: stripeDone
        ? status?.bankLast4
          ? `Stripe connected · **** ${status.bankLast4}`
          : status?.payoutsEnabled
            ? "Stripe connected — payouts enabled."
            : "Stripe onboarding complete — you can go live."
        : status?.connected
          ? "Stripe started — finish ID + bank in the Stripe form, then tap refresh."
          : "Stripe checks your ID and links your bank so neighbors can pay you.",
      done: stripeDone,
      actionLabel: busy === "stripe" ? "Opening Stripe…" : "Continue with Stripe",
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
        ← Back to review
      </button>

      <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
        Finish to go public
      </h2>
      <p className="mt-1 text-base text-gray-500">
        Two steps — in order. Your listing stays a private draft until both are done.
      </p>

      {loading && !status ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: GREEN }} />
          Checking your seller setup…
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
        {busy === "refresh" || loading ? "Refreshing…" : "I finished Stripe — refresh status"}
      </button>

      <RentanoHint
        className="mt-5"
        hint={`${MASCOT_NAME}: Sign in, then Stripe verifies your ID and bank in one flow. No separate Identity menu.`}
        showTapLabel
      />

      <button
        type="button"
        onClick={onGoLive}
        disabled={!ready || isPublishing || loading}
        className="btn-primary mt-6 flex h-14 w-full items-center justify-center text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: ready ? GREEN : "#9CA3AF" }}
      >
        {isPublishing ? "Going live…" : ready ? "Go live 🚀" : "Complete steps above"}
      </button>
    </motion.div>
  );
}
