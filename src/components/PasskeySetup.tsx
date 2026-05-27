import { useState } from "react";
import { ScanFace } from "lucide-react";
import { dismissEnablePasskeyPrompt, enrollPasskey } from "../lib/auth";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

export function PasskeySetup({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleLater = () => {
    dismissEnablePasskeyPrompt();
    onDone();
  };

  const handleEnable = async () => {
    setError(null);
    setBusy(true);
    try {
      await enrollPasskey();
      dismissEnablePasskeyPrompt();
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enable Face ID.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[390px] rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
        <div className="flex items-center gap-2">
          <ScanFace className="h-6 w-6" style={{ color: GREEN }} />
          <h2 className="text-[20px] font-bold leading-tight" style={{ color: GREEN }}>
            Enable Face ID for faster login?
          </h2>
        </div>
        <p className="mt-2 text-[14px] text-gray-500">
          Use Face ID, Touch ID, or your device passcode next time — no email code needed.
        </p>

        {error ? (
          <div className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[13px] text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleEnable()}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {busy ? "Setting up…" : "Enable Face ID"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleLater}
            className="w-full rounded-2xl border py-3 text-[13px] font-semibold text-gray-600 disabled:opacity-60"
            style={{ borderColor: BORDER }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
