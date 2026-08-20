import { useState } from "react";
import { AlertTriangle, ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { requestAccountDeletion, signInWithPasskey } from "../../lib/auth";
import { dismissNativeKeyboard } from "../../lib/dismissKeyboard";
import { fetchManageableListings } from "../../lib/hostAccess";
import { useMessages } from "../../lib/i18n/react";
import { isListingBrowsable } from "../../lib/listingStorage";
import { resetAllAppData } from "../../lib/resetAppStorage";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type Phase = "ready" | "confirm" | "success";

export function DeleteAccountScreen({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const auth = useAuth();
  const { common, profileDeep } = useMessages();
  const t = profileDeep.deleteAccount;
  const [phase, setPhase] = useState<Phase>("ready");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.somethingWrong);
    } finally {
      setBusy(null);
    }
  };

  const handleReauthPasskey = () =>
    run("reauth", async () => {
      await signInWithPasskey();
      setMessage(t.reauthSuccess);
    });

  const hasActiveListings = async (): Promise<boolean> => {
    const listings = await fetchManageableListings(auth.userId, auth.userEmail);
    return listings.some(isListingBrowsable);
  };

  const handleRequestDeletion = () =>
    run("delete", async () => {
      if (await hasActiveListings()) {
        setPhase("ready");
        setError(t.activeListingsBlock);
        return;
      }

      const result = await requestAccountDeletion();
      if (!result.ok) {
        setPhase("ready");
        setError(
          result.reason === "active_listings" ? t.activeListingsBlock : result.message,
        );
        return;
      }
      setMessage(result.message || t.successTitle);
      setPhase("success");
      await dismissNativeKeyboard();
      await resetAllAppData();
    });

  if (phase === "success") {
    return (
      <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
        <div className="screen-scroll flex-1 px-4 pb-6 pt-3">
          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: GREEN }}>
              {t.successTitle}
            </h1>
            <p className="mt-2 text-[14px] text-gray-600">{message ?? t.successBody}</p>
            <button
              type="button"
              onClick={onDone}
              className="mt-5 min-h-[48px] w-full rounded-2xl px-4 text-[15px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t.successDone}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {common.back}
        </button>

        <div className="rounded-3xl border bg-white p-5" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h1 className="text-[20px] font-bold leading-tight text-red-700">{t.title}</h1>
          </div>

          <p className="mt-2 text-[14px] text-gray-600">
            {phase === "confirm" ? t.confirmTitle : t.body}
          </p>

          {message && phase !== "confirm" ? (
            <div className="mt-4 whitespace-pre-wrap rounded-2xl border bg-[#F0FDF4] p-4 text-[13px] text-emerald-800">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border bg-[#FEF2F2] p-4 text-[13px] text-red-700">
              {error}
            </div>
          ) : null}

          {phase === "confirm" ? (
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void handleRequestDeletion()}
                className="min-h-[48px] w-full rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: "#B91C1C" }}
              >
                {busy === "delete" ? t.deleteBusy : t.confirmCta}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setError(null);
                  setPhase("ready");
                }}
                className="min-h-[48px] w-full rounded-2xl border bg-white px-4 text-[15px] font-bold disabled:opacity-60 active:bg-[#F9FAFB]"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                {t.confirmCancel}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void handleReauthPasskey()}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[15px] font-bold disabled:opacity-60 active:bg-[#F9FAFB]"
                style={{ borderColor: BORDER, color: GREEN }}
              >
                <KeyRound className="h-5 w-5" />
                {busy === "reauth" ? t.reauthBusy : t.reauthCta}
              </button>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setError(null);
                  setPhase("confirm");
                }}
                className="min-h-[48px] w-full rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: "#B91C1C" }}
              >
                {t.deleteCta}
              </button>
            </div>
          )}

          <p className="mt-4 text-[12px] text-gray-500">{t.supportHint}</p>
        </div>
      </div>
    </div>
  );
}
