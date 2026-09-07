import { useEffect, useState } from "react";
import { Flag, MoreHorizontal, ShieldCheck, ShieldOff, X } from "lucide-react";

import { useAuth } from "../../hooks/AuthProvider";
import { useMessages } from "../../lib/i18n/react";
import {
  blockUser,
  isUserBlocked,
  onBlocksChanged,
  unblockUser,
} from "../../lib/moderation/blockStorage";
import type { ReportTargetKind } from "../../lib/moderation/reportsStorage";
import { ReportSheet } from "./ReportSheet";

const BORDER = "#E8E6E0";

export type ModerationMenuProps = {
  targetKind: ReportTargetKind;
  targetId: string;
  targetThreadKey?: string;
  /** Who the content belongs to. Blocking is offered only when this is known. */
  reportedUserId?: string | null;
  evidence?: string;
  /** Drop the "report" entry when the surface already has its own. */
  showReport?: boolean;
  className?: string;
};

/**
 * The "⋯" every screen with someone else's content needs: report it, and stop
 * seeing that person. Block state is read from the local list, which the
 * enforcement filters share, so the label flips as soon as it changes anywhere.
 */
export function ModerationMenu({
  targetKind,
  targetId,
  targetThreadKey,
  reportedUserId,
  evidence,
  showReport = true,
  className,
}: ModerationMenuProps) {
  const { common, moderation } = useMessages();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [blocked, setBlocked] = useState(() => isUserBlocked(reportedUserId));

  useEffect(() => {
    setBlocked(isUserBlocked(reportedUserId));
    return onBlocksChanged(() => setBlocked(isUserBlocked(reportedUserId)));
  }, [reportedUserId]);

  const canBlock = Boolean(
    reportedUserId && reportedUserId.trim() && reportedUserId !== auth.userId,
  );

  const applyBlock = async () => {
    if (!reportedUserId) return;
    if (blocked) {
      await unblockUser({ viewerId: auth.userId, blockedId: reportedUserId });
    } else {
      await blockUser({ viewerId: auth.userId, blockedId: reportedUserId });
    }
    setConfirmBlock(false);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full border bg-white"
        }
        style={className ? undefined : { borderColor: BORDER }}
        aria-label={moderation.moreActionsAria}
      >
        <MoreHorizontal className="h-5 w-5 text-gray-600" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <button
            type="button"
            className="absolute inset-0"
            aria-label={common.close}
            onClick={() => {
              setOpen(false);
              setConfirmBlock(false);
            }}
          />
          <div
            className="relative w-full max-w-[390px] rounded-t-3xl border bg-white px-4 pb-[max(3.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] pt-4"
            style={{ borderColor: BORDER }}
            role="dialog"
            aria-modal="true"
            aria-label={moderation.moreActionsAria}
          >
            {confirmBlock ? (
              <>
                <h2 className="text-lg font-bold text-gray-900">
                  {blocked ? moderation.unblockUser : moderation.blockConfirmTitle}
                </h2>
                <p className="mt-1 text-[15px] leading-relaxed text-gray-600">
                  {blocked ? moderation.unblockConfirmBody : moderation.blockConfirmBody}
                </p>
                <button
                  type="button"
                  onClick={() => void applyBlock()}
                  className="mt-4 w-full touch-manipulation rounded-xl py-3.5 text-base font-bold text-white"
                  style={{ backgroundColor: blocked ? "#0D5C3A" : "#B42318" }}
                >
                  {blocked ? moderation.unblockUser : moderation.blockUser}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBlock(false)}
                  className="mt-2 w-full touch-manipulation rounded-xl border py-3.5 text-base font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {moderation.cancel}
                </button>
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="text-[15px] font-semibold uppercase tracking-wide text-gray-500">
                    {moderation.moreActionsAria}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border bg-white"
                    style={{ borderColor: BORDER }}
                    aria-label={common.close}
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {showReport ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setReporting(true);
                    }}
                    className="flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl border px-3 py-3 text-left text-[15px] font-semibold text-gray-800"
                    style={{ borderColor: BORDER }}
                  >
                    <Flag className="h-5 w-5 text-gray-500" aria-hidden />
                    {targetKind === "listing"
                      ? moderation.reportListing
                      : targetKind === "message"
                        ? moderation.reportMessage
                        : targetKind === "request"
                          ? moderation.reportRequest
                          : moderation.reportUser}
                  </button>
                ) : null}

                {canBlock ? (
                  <button
                    type="button"
                    onClick={() => setConfirmBlock(true)}
                    className="mt-2 flex min-h-12 w-full touch-manipulation items-center gap-3 rounded-xl border px-3 py-3 text-left text-[15px] font-semibold"
                    style={{ borderColor: BORDER, color: blocked ? "#0D5C3A" : "#B42318" }}
                  >
                    {blocked ? (
                      <ShieldCheck className="h-5 w-5" aria-hidden />
                    ) : (
                      <ShieldOff className="h-5 w-5" aria-hidden />
                    )}
                    {blocked ? moderation.unblockUser : moderation.blockUser}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      {reporting ? (
        <ReportSheet
          targetKind={targetKind}
          targetId={targetId}
          targetThreadKey={targetThreadKey}
          reportedUserId={reportedUserId}
          evidence={evidence}
          onClose={() => setReporting(false)}
        />
      ) : null}
    </>
  );
}
