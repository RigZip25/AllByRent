import { useState } from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import { dismissEnablePasskeyPrompt, enrollPasskey } from "../../lib/auth";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

export function EnablePasskeyPrompt({
  onBack,
  onDone,
}: {
  onBack?: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(e instanceof Error ? e.message : "Could not enable passkey.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-6 pt-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold text-gray-600 active:bg-[#F9FAFB]"
            style={{ borderColor: BORDER }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}

        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" style={{ color: GREEN }} />
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: GREEN }}>
              Enable a passkey?
            </h1>
          </div>
          <p className="mt-2 text-[14px] text-gray-500">
            Passkeys let you sign in faster with Face ID / Touch ID / device unlock. You can still
            use Apple/Google as a backup.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border bg-[#FEF2F2] p-4 text-[13px] text-red-700">
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
              {busy ? "Starting…" : "Create passkey"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={handleLater}
              className="w-full rounded-2xl border py-3 text-[13px] font-semibold text-gray-600 disabled:opacity-60 active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER }}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

