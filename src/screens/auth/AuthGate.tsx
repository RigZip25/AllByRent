import { useEffect, useMemo, useState } from "react";
import { KeyRound, Apple, Chrome, ArrowLeft, Mail } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../app/components/ui/input-otp";
import { useAuth } from "../../hooks/AuthProvider";
import {
  peekPendingAuthEmail,
  setPendingAuthEmail,
} from "../../lib/authReturn";
import {
  signInWithEmailOtp,
  signInWithPasskey,
  verifyEmailOtp,
} from "../../lib/auth";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type Step = "landing" | "email" | "sent" | "otp";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AuthGate({
  title = "Sign in",
  subtitle = "Continue with email — we'll send a magic link or an 8-digit code.",
  onBack,
  onContinueAsGuest,
  initialStep,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onContinueAsGuest?: () => void;
  initialStep?: Step;
}) {
  const { configured } = useAuth();
  const [step, setStep] = useState<Step>(initialStep ?? "landing");
  const [email, setEmail] = useState(() => peekPendingAuthEmail() ?? "");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUseSupabase = useMemo(() => configured, [configured]);

  useEffect(() => {
    const pending = peekPendingAuthEmail();
    if (pending && step === "landing") {
      setEmail(pending);
    }
  }, [step]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleSendEmail = () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    void run("email", async () => {
      setPendingAuthEmail(email);
      await signInWithEmailOtp(email);
      setStep("sent");
    });
  };

  const handleVerifyOtp = () => {
    void run("otp", async () => {
      await verifyEmailOtp(email, otp);
    });
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
            {step === "sent"
              ? "Check your email"
              : step === "otp"
                ? "Enter your code"
                : title}
          </h1>
          <p className="mt-1 text-[14px] text-gray-500">
            {step === "sent"
              ? `We sent a sign-in link and an 8-digit code to ${email}. Open the link on this device, or enter the code below.`
              : step === "otp"
                ? "Enter the 8-digit code from your email."
                : subtitle}
          </p>

          {!canUseSupabase ? (
            <div className="mt-4 rounded-2xl border bg-[#FFFBEB] p-4 text-[13px] text-amber-800">
              Supabase env vars are missing, so the app is running in demo mode. You can keep
              browsing without signing in.
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border bg-[#FEF2F2] p-4 text-[13px] text-red-700">
              {error}
            </div>
          ) : null}

          {step === "landing" ? (
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={!canUseSupabase || busy !== null}
                onClick={() => setStep("email")}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                <Mail className="h-5 w-5" />
                Continue with Email
              </button>

              <button
                type="button"
                disabled={!canUseSupabase || busy !== null}
                onClick={() => run("passkey", () => signInWithPasskey())}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[15px] font-bold text-gray-900 disabled:opacity-60 active:bg-[#F9FAFB]"
                style={{ borderColor: BORDER }}
              >
                <KeyRound className="h-5 w-5" />
                {busy === "passkey" ? "Opening passkey…" : "Continue with Passkey"}
              </button>

              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-[#F9FAFB] px-4 text-[15px] font-bold text-gray-400"
                style={{ borderColor: BORDER }}
              >
                <Apple className="h-5 w-5" />
                Continue with Apple
                <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  Soon
                </span>
              </button>

              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-[#F9FAFB] px-4 text-[15px] font-bold text-gray-400"
                style={{ borderColor: BORDER }}
              >
                <Chrome className="h-5 w-5" />
                Continue with Google
                <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  Soon
                </span>
              </button>
            </div>
          ) : null}

          {step === "email" ? (
            <div className="mt-4">
              <label className="text-[13px] font-semibold text-gray-600" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                style={{ borderColor: BORDER }}
              />
              <button
                type="button"
                disabled={!canUseSupabase || busy !== null}
                onClick={handleSendEmail}
                className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {busy === "email" ? "Sending…" : "Send magic link & code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("landing")}
                className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-500"
              >
                Back to sign-in options
              </button>
            </div>
          ) : null}

          {step === "sent" ? (
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStep("otp")}
                className="flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 text-[15px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                Enter 8-digit code
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={handleSendEmail}
                className="w-full rounded-2xl border py-3 text-[13px] font-semibold text-gray-600 disabled:opacity-60 active:bg-[#F9FAFB]"
                style={{ borderColor: BORDER }}
              >
                {busy === "email" ? "Resending…" : "Resend email"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full py-2 text-[13px] font-semibold text-gray-500"
              >
                Use a different email
              </button>
            </div>
          ) : null}

          {step === "otp" ? (
            <div className="mt-4">
              <p className="mb-3 text-[13px] text-gray-500">
                Code sent to <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={8}
                  value={otp}
                  onChange={setOtp}
                  inputMode="numeric"
                  pattern="[0-9]*"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 8 }, (_, i) => (
                      <InputOTPSlot key={i} index={i} className="h-11 w-9 text-[16px] font-bold" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <button
                type="button"
                disabled={!canUseSupabase || busy !== null || otp.replace(/\D/g, "").length !== 8}
                onClick={handleVerifyOtp}
                className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: GREEN }}
              >
                {busy === "otp" ? "Verifying…" : "Verify code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("sent")}
                className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-500"
              >
                Back
              </button>
            </div>
          ) : null}

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
