import { Loader2 } from "lucide-react";
import { Step2ItemInfo } from "./Step2ItemInfo";
import { Step3Modes } from "./Step3Modes";
import type { StepProps } from "../types";
import { APP_NAME } from "../../../lib/brand";
import { useMessages } from "../../../lib/i18n/react";

const GREEN = "#0D5C3A";

/** Progress of the AI field fill, plus a retry that never blocks manual entry. */
function AiDetailsBanner({
  status,
  detected,
  total,
  copyPending,
  copyFailed,
  onRetry,
}: {
  status: "idle" | "pending" | "done" | "failed";
  detected: number;
  total: number;
  copyPending: boolean;
  copyFailed: boolean;
  onRetry?: () => void;
}) {
  const { listing } = useMessages();
  const copy = listing.aiCategory;
  const remaining = Math.max(0, total - detected);

  if (status === "idle" && !copyPending && !copyFailed) return null;

  return (
    <div className="mx-auto w-full max-w-[390px] px-4 pt-4">
      <div className="rounded-2xl border bg-white px-4 py-3" style={{ borderColor: `${GREEN}33` }}>
        {status === "pending" ? (
          <p className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: GREEN }} />
            {copy.preparingDetails(APP_NAME)}
          </p>
        ) : null}

        {status === "done" && total > 0 ? (
          <>
            <p className="text-[13px] font-bold" style={{ color: GREEN }}>
              {copy.detailsProgress(APP_NAME, detected, total)}
            </p>
            {remaining > 0 ? (
              <p className="mt-0.5 text-[12px] text-gray-500">{copy.detailsRemaining(remaining)}</p>
            ) : null}
          </>
        ) : null}

        {status === "failed" ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[13px] font-semibold text-amber-800">{copy.detailsFailed}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="text-[13px] font-bold underline"
                style={{ color: GREEN }}
              >
                {copy.tryAgain}
              </button>
            ) : null}
          </div>
        ) : null}

        {copyPending ? (
          <p className="mt-1 flex items-center gap-2 text-[12px] text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: GREEN }} />
            {copy.writingCopy(APP_NAME)}
          </p>
        ) : null}

        {copyFailed && !copyPending ? (
          <p className="mt-1 text-[12px] font-semibold text-amber-800">{copy.writingCopyFailed}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Frictionless wizard step 2 — item details + rent/sell pricing in one scroll. */
export function Step2Details({
  draft,
  setDraft,
  gateMessage = null,
  onDismissGateMessage,
  onEditPhotos,
  aiFieldStatus = "idle",
  aiFieldsDetected = 0,
  aiFieldsTotal = 0,
  copyPending = false,
  copyFailed = false,
  onRetryFieldFill,
}: StepProps & {
  gateMessage?: string | null;
  onDismissGateMessage?: () => void;
  onEditPhotos?: () => void;
  aiFieldStatus?: "idle" | "pending" | "done" | "failed";
  aiFieldsDetected?: number;
  aiFieldsTotal?: number;
  copyPending?: boolean;
  copyFailed?: boolean;
  onRetryFieldFill?: () => void;
}) {
  return (
    <div className="flex flex-col">
      <AiDetailsBanner
        status={aiFieldStatus}
        detected={aiFieldsDetected}
        total={aiFieldsTotal}
        copyPending={copyPending}
        copyFailed={copyFailed}
        onRetry={onRetryFieldFill}
      />
      <Step2ItemInfo
        draft={draft}
        setDraft={setDraft}
        gateMessage={gateMessage}
        onDismissGateMessage={onDismissGateMessage}
        onEditPhotos={onEditPhotos}
      />
      <Step3Modes draft={draft} setDraft={setDraft} />
    </div>
  );
}
