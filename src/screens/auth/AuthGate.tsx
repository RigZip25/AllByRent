import { useMemo, useState } from "react";
import { KeyRound, Apple, Chrome, ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/AuthProvider";
import { signInWithPasskey, signInWithProvider } from "../../lib/auth";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

export function AuthGate({
  title = "Sign in",
  subtitle = "Continue with a passkey (recommended), or use Apple/Google.",
  onBack,
  onContinueAsGuest,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onContinueAsGuest?: () => void;
}) {
  const { configured } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUseSupabase = useMemo(() => configured, [configured]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(null);
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
          <h1 className="text-[22px] font-bold leading-tight" style={{ color: GREEN }}>
            {title}
          </h1>
          <p className="mt-1 text-[14px] text-gray-500">{subtitle}</p>

          {!canUseSupabase ? (
            <div className="mt-4 rounded-2xl border bg-[#FFFBEB] p-4 text-[13px] text-amber-800">
              Supabase env vars are missing, so the app is running in demo mode. You can keep browsing
              without signing in.
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
              disabled={!canUseSupabase || busy !== null}
              onClick={() => run("passkey", () => signInWithPasskey())}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <KeyRound className="h-5 w-5" />
              {busy === "passkey" ? "Opening passkey…" : "Continue with Passkey"}
            </button>

            <button
              type="button"
              disabled={!canUseSupabase || busy !== null}
              onClick={() => run("apple", () => signInWithProvider("apple"))}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[15px] font-bold text-gray-900 disabled:opacity-60 active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER }}
            >
              <Apple className="h-5 w-5" />
              {busy === "apple" ? "Redirecting…" : "Continue with Apple"}
            </button>

            <button
              type="button"
              disabled={!canUseSupabase || busy !== null}
              onClick={() => run("google", () => signInWithProvider("google"))}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[15px] font-bold text-gray-900 disabled:opacity-60 active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER }}
            >
              <Chrome className="h-5 w-5" />
              {busy === "google" ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>

          {onContinueAsGuest ? (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="mt-4 w-full rounded-2xl border py-3 text-[13px] font-semibold text-gray-600 active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER }}
            >
              Continue without an account
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

