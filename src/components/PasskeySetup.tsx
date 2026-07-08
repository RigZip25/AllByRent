import { useEffect, useState } from "react";
import { ScanFace, X } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { dismissEnablePasskeyPrompt } from "../lib/auth";
import {
  fetchPasskeyRegistrationBundle,
  verifyPasskeyRegistration,
  type PasskeyRegistrationBundle,
} from "../lib/passkey";
import { formatPasskeyError } from "../lib/passkeyErrors";
import { getPasskeyEnvironmentHint } from "../lib/passkeyEnvironment";

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
  const [preparing, setPreparing] = useState(false);
  const [bundle, setBundle] = useState<PasskeyRegistrationBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setBundle(null);
      setError(null);
      setPreparing(false);
      setBusy(false);
      return;
    }

    let cancelled = false;
    setPreparing(true);
    setError(null);
    setBundle(null);

    void fetchPasskeyRegistrationBundle()
      .then((next) => {
        if (!cancelled) setBundle(next);
      })
      .catch((e) => {
        if (!cancelled) setError(formatPasskeyError(e));
      })
      .finally(() => {
        if (!cancelled) setPreparing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const passkeyHint = getPasskeyEnvironmentHint();

  const handleLater = () => {
    dismissEnablePasskeyPrompt();
    onDone();
  };

  const refreshBundle = async (): Promise<PasskeyRegistrationBundle> => {
    const next = await fetchPasskeyRegistrationBundle();
    setBundle(next);
    return next;
  };

  const handleEnable = async () => {
    setError(null);
    let activeBundle = bundle;
    if (!activeBundle) {
      setPreparing(true);
      try {
        activeBundle = await refreshBundle();
      } catch (e) {
        setError(formatPasskeyError(e));
        return;
      } finally {
        setPreparing(false);
      }
    }

    setBusy(true);
    try {
      const attestationResponse = await startRegistration({ optionsJSON: activeBundle.options });
      await verifyPasskeyRegistration(attestationResponse, activeBundle.challengeToken);
      dismissEnablePasskeyPrompt();
      onDone();
    } catch (e) {
      setError(formatPasskeyError(e));
      void refreshBundle().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  };

  const enableLabel = busy
    ? "Opening Face ID…"
    : preparing
      ? "Preparing Face ID…"
      : "Enable Face ID";

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4"
      onClick={handleLater}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[390px] rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleLater}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
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
        {passkeyHint ? (
          <p className="mt-2 text-[12px] leading-snug text-gray-500">{passkeyHint}</p>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[13px] text-red-700" role="alert">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy || preparing}
            onClick={() => void handleEnable()}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {enableLabel}
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
