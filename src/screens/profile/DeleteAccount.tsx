import { useState } from "react";
import { AlertTriangle, ArrowLeft, KeyRound } from "lucide-react";
import { requestAccountDeletion, signInWithPasskey } from "../../lib/auth";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

export function DeleteAccountScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const handleReauthPasskey = () =>
    run("reauth", async () => {
      await signInWithPasskey();
      setMessage("Re-authenticated with passkey. You can continue.");
    });

  const handleRequestDeletion = () =>
    run("delete", async () => {
      const result = await requestAccountDeletion();
      setMessage(result.message);
      onDone();
    });

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="screen-scroll flex-1 px-4 pb-6 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold text-gray-600 active:bg-[#F9FAFB]"
          style={{ borderColor: BORDER }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h1 className="text-[20px] font-bold leading-tight text-red-700">Delete account</h1>
          </div>

          <p className="mt-2 text-[14px] text-gray-600">
            For a frontend-only app, permanent deletion requires a secure server-side call (Supabase
            Admin API / Edge Function). This screen implements a user-initiated request flow and
            signs you out locally.
          </p>

          {message ? (
            <div className="mt-4 whitespace-pre-wrap rounded-2xl border bg-[#F0FDF4] p-4 text-[13px] text-emerald-800">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border bg-[#FEF2F2] p-4 text-[13px] text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void handleReauthPasskey()}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[15px] font-bold disabled:opacity-60 active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER, color: GREEN }}
            >
              <KeyRound className="h-5 w-5" />
              {busy === "reauth" ? "Opening passkey…" : "Re-auth with Passkey"}
            </button>

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void handleRequestDeletion()}
              className="min-h-[48px] w-full rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: "#B91C1C" }}
            >
              {busy === "delete" ? "Submitting…" : "Request account deletion"}
            </button>
          </div>

          <p className="mt-4 text-[12px] text-gray-500">
            Next step: implement a Supabase Edge Function (service role) and call it here after
            re-auth.
          </p>
        </div>
      </div>
    </div>
  );
}

