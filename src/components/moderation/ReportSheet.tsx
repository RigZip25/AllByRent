import { useState } from "react";
import { Flag, ShieldOff, X } from "lucide-react";

import { useAuth } from "../../hooks/AuthProvider";
import { useMessages } from "../../lib/i18n/react";
import { blockUser } from "../../lib/moderation/blockStorage";
import {
  REPORT_REASONS,
  hasReported,
  submitContentReport,
  type ReportReason,
  type ReportTargetKind,
} from "../../lib/moderation/reportsStorage";
import { SignInPrompt } from "../SignInPrompt";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export type ReportSheetProps = {
  targetKind: ReportTargetKind;
  targetId: string;
  /** Thread key for a reported message, so a moderator can find the conversation. */
  targetThreadKey?: string;
  reportedUserId?: string | null;
  /** Copy of the reported text — the author can delete the original. */
  evidence?: string;
  onClose: () => void;
  onBlocked?: () => void;
};

export function ReportSheet({
  targetKind,
  targetId,
  targetThreadKey,
  reportedUserId,
  evidence,
  onClose,
  onBlocked,
}: ReportSheetProps) {
  const { common, moderation } = useMessages();
  const auth = useAuth();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const title =
    targetKind === "listing"
      ? moderation.reportListing
      : targetKind === "message"
        ? moderation.reportMessage
        : targetKind === "request"
          ? moderation.reportRequest
          : moderation.reportUser;

  const canBlock = Boolean(reportedUserId && reportedUserId !== auth.userId);

  const submit = async () => {
    if (!reason) {
      setError(moderation.reasonLabel);
      return;
    }
    // "Something else" tells a moderator nothing on its own.
    if (reason === "other" && details.trim().length < 3) {
      setError(moderation.detailsRequired);
      return;
    }
    setSending(true);
    await submitContentReport({
      targetKind,
      targetId,
      targetThreadKey,
      reportedUserId,
      reporterId: auth.userId,
      reason,
      details,
      evidence,
    });
    if (alsoBlock && reportedUserId) {
      await blockUser({ viewerId: auth.userId, blockedId: reportedUserId });
      onBlocked?.();
    }
    setSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <button type="button" className="absolute inset-0" aria-label={common.close} onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] max-h-[90dvh] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] rounded-t-3xl border bg-white px-4 pb-[max(3.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] pt-4"
        style={{ borderColor: BORDER }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Flag className="h-5 w-5" style={{ color: GREEN }} aria-hidden />
              {sent ? moderation.thanksTitle : title}
            </h2>
            <p className="mt-1 text-[15px] leading-relaxed text-gray-600">
              {sent ? moderation.thanksBody : moderation.sheetSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER }}
            aria-label={common.close}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {sent ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full touch-manipulation rounded-xl py-3.5 text-base font-bold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {common.close}
          </button>
        ) : !auth.userId ? (
          <SignInPrompt message={moderation.signInNeeded} intent="book" />
        ) : (
          <>
            {hasReported(targetKind, targetId) ? (
              <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-[14px] text-amber-900">
                {moderation.alreadyReported}
              </p>
            ) : null}

            <fieldset>
              <legend className="text-[15px] font-semibold text-gray-700">
                {moderation.reasonLabel}
              </legend>
              <div className="mt-2 space-y-1.5">
                {REPORT_REASONS.map((option) => (
                  <label
                    key={option}
                    className="flex min-h-11 touch-manipulation items-center gap-3 rounded-xl border px-3 py-2 text-[15px] text-gray-800"
                    style={{
                      borderColor: reason === option ? GREEN : BORDER,
                      backgroundColor: reason === option ? "#F1F7F3" : "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      className="h-4 w-4"
                      checked={reason === option}
                      onChange={() => {
                        setReason(option);
                        setError(null);
                      }}
                    />
                    {moderation.reasons[option]}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 block text-[15px] font-semibold text-gray-700">
              {moderation.detailsLabel}
              <textarea
                value={details}
                onChange={(event) => {
                  setDetails(event.target.value.slice(0, 4000));
                  setError(null);
                }}
                rows={3}
                placeholder={moderation.detailsPlaceholder}
                className="mt-1.5 w-full rounded-xl border px-3 py-2 text-base font-normal"
                style={{ borderColor: BORDER }}
              />
            </label>

            {canBlock ? (
              <label className="mt-3 flex min-h-11 touch-manipulation items-center gap-3 text-[15px] text-gray-800">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={alsoBlock}
                  onChange={(event) => setAlsoBlock(event.target.checked)}
                />
                <span className="flex items-center gap-1.5">
                  <ShieldOff className="h-4 w-4 text-gray-500" aria-hidden />
                  {moderation.alsoBlock}
                </span>
              </label>
            ) : null}

            {error ? <p className="mt-2 text-[15px] font-medium text-red-600">{error}</p> : null}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={sending}
              className="mt-4 flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <Flag className="h-4 w-4" aria-hidden />
              {sending ? moderation.submitting : moderation.submit}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
