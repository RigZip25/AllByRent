import { ChevronRight, Sparkles, X } from "lucide-react";
import { MASCOT_NAME, mascotSays } from "../../lib/brand";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const AMBER = "#F59E0B";

export type ProactiveStep = {
  id: string;
  title: string;
  body: string;
  cta: string;
  onAction: () => void;
  dismissKey?: string;
};

const DISMISS_PREFIX = "allbyrent_agent_dismiss_";

export function wasAgentStepDismissed(key: string): boolean {
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}${key}`) === "1";
  } catch {
    return false;
  }
}

export function dismissAgentStep(key: string): void {
  try {
    localStorage.setItem(`${DISMISS_PREFIX}${key}`, "1");
  } catch {
    /* ignore */
  }
}

export function ProactiveAgentCard({
  step,
  onDismiss,
}: {
  step: ProactiveStep;
  onDismiss?: () => void;
}) {
  const handleDismiss = () => {
    if (step.dismissKey) dismissAgentStep(step.dismissKey);
    onDismiss?.();
  };

  return (
    <div
      className="relative rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: BORDER }}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100"
        aria-label="Dismiss suggestion"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-6">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${AMBER}22` }}
        >
          <Sparkles className="h-5 w-5" style={{ color: AMBER }} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {MASCOT_NAME} suggests
          </p>
          <p className="mt-0.5 text-[15px] font-bold" style={{ color: GREEN }}>
            {step.title}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-gray-600">{mascotSays(step.body)}</p>
          <button
            type="button"
            onClick={step.onAction}
            className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold"
            style={{ color: GREEN }}
          >
            {step.cta}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
