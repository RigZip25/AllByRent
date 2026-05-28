import { useState } from "react";
import { ArrowDownCircle, CheckCircle2, Sparkles } from "lucide-react";
import { usePwaUpdate } from "../hooks/PwaUpdateProvider";
import { formatBuildStamp } from "../lib/buildInfo";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const AMBER = "#F0B429";
const BORDER = "#E8E6E0";

export function PwaUpdateNotificationCard({
  onOpenDetail,
}: {
  onOpenDetail: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenDetail}
      className="flex w-full gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors active:bg-[#F9FAFB]"
      style={{ borderColor: `${AMBER}88` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${AMBER}22` }}
      >
        <ArrowDownCircle className="h-5 w-5" style={{ color: AMBER }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold" style={{ color: GREEN }}>
          App update ready
        </p>
        <p className="mt-0.5 text-[14px] leading-snug text-gray-500">
          A new version is available. Tap to install and restart.
        </p>
        <p className="mt-2 text-[12px] font-semibold" style={{ color: GREEN_LIGHT }}>
          Tap to update →
        </p>
      </div>
    </button>
  );
}

export function PwaUpdateSuccessCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="flex w-full gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm"
      style={{ borderColor: `${GREEN_LIGHT}55` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${GREEN_LIGHT}18` }}
      >
        <CheckCircle2 className="h-5 w-5" style={{ color: GREEN_LIGHT }} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold" style={{ color: GREEN }}>
          Version updated
        </p>
        <p className="mt-0.5 text-[14px] leading-snug text-gray-500">
          You&apos;re on the latest AllByRent. Have a great day!
        </p>
        <p className="mt-1 text-[11px] text-gray-400">{formatBuildStamp()}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-3 text-[13px] font-semibold underline-offset-2 hover:underline"
          style={{ color: GREEN_LIGHT }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function PwaUpdateConfirmSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { applyUpdate } = usePwaUpdate();
  const [updating, setUpdating] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setUpdating(true);
    try {
      await applyUpdate();
    } catch {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-update-title"
        className="w-full max-w-[390px] rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${AMBER}22` }}
        >
          <Sparkles className="h-7 w-7" style={{ color: AMBER }} />
        </div>
        <h2 id="pwa-update-title" className="text-center text-[20px] font-bold" style={{ color: GREEN }}>
          Install update?
        </h2>
        <p className="mt-2 text-center text-[15px] leading-relaxed text-gray-500">
          The app will restart once to load the latest version with new fixes and improvements.
        </p>
        <p className="mt-2 text-center text-[11px] text-gray-400">{formatBuildStamp()}</p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={updating}
            onClick={() => void handleConfirm()}
            className="btn-primary w-full py-3.5 font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {updating ? "Updating…" : "Update now"}
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={onClose}
            className="w-full rounded-2xl border py-3 text-[15px] font-semibold text-gray-600"
            style={{ borderColor: BORDER }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
