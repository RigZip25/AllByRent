import { useEffect, useMemo, useState } from "react";
import { Apple, Chrome, Fingerprint, Mail, ScanFace } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../app/components/ui/input-otp";
import { useAuth } from "../hooks/AuthProvider";
import type { AuthIntent } from "../lib/authReturn";
import { peekPendingAuthEmail, setPendingAuthEmail } from "../lib/authReturn";
import {
  shouldShowPasskeyLogin,
  signInWithEmailOtp,
  signInWithPasskey,
  verifyEmailOtp,
} from "../lib/auth";
import { formatAuthError } from "../lib/authErrors";
import { RentanoTip } from "./RentanoTip";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type Step = "landing" | "email" | "sent" | "otp";

const INTENT_COPY: Record<
  AuthIntent,
  { title: string; subtitle: string; rentano: string }
> = {
  list: {
    title: "Sign in to list your item",
    subtitle: "Create your listing in minutes — free to join.",
    rentano:
      "Rentano: List your gear and start earning. Sign in so we can save your listing draft.",
  },
  book: {
    title: "Sign in to book",
    subtitle: "Reserve this item — we'll hold your spot while you check out.",
    rentano: "Rentano: Booking needs an account so hosts can reach you. Quick email sign-in.",
  },
  message: {
    title: "Sign in to message",
    subtitle: "Chat with hosts and renters securely.",
    rentano: "Rentano: Messaging is for members only — sign in to continue the conversation.",
  },
  generic: {
    title: "Join AllByRent",
    subtitle: "Continue with email — we'll send a magic link or an 8-digit code.",
    rentano: "Rentano: Sign in to unlock listing, booking, and chat.",
  },
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AuthGate({
  open,
  intent = "generic",
  onClose,
  onContinueAsGuest,
  initialStep,
}: {
  open: boolean;
  intent?: AuthIntent;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
  initialStep?: Step;
}) {
  const { configured } = useAuth();
  const copy = INTENT_COPY[intent];
  const [step, setStep] = useState<Step>(initialStep ?? "landing");
  const [email, setEmail] = useState(() => peekPendingAuthEmail() ?? "");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkeyPrimary, setPasskeyPrimary] = useState(false);

  const canUseSupabase = useMemo(() => configured, [configured]);

  useEffect(() => {
    if (!open) return;
    setPasskeyPrimary(shouldShowPasskeyLogin());
    const pending = peekPendingAuthEmail();
    if (pending) setEmail(pending);
    if (initialStep) setStep(initialStep);
    else if (pending) setStep("sent");
    else setStep(shouldShowPasskeyLogin() ? "landing" : "email");
  }, [open, initialStep]);

  if (!open) return null;

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setError(formatAuthError(e));
      if (import.meta.env.DEV) console.error("[AuthGate]", e);
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

  const handlePasskeyLogin = () => {
    void run("passkey", async () => {
      await signInWithPasskey(passkeyPrimary ? undefined : email || undefined);
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[390px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />

        <RentanoTip message={copy.rentano} className="mb-1" />

        <h2 className="mt-3 text-[22px] font-bold leading-tight" style={{ color: GREEN }}>
          {step === "sent"
            ? "Check your inbox"
            : step === "otp"
              ? "Enter your code"
              : copy.title}
        </h2>
        <p className="mt-1 text-[14px] text-gray-500">
          {step === "sent"
            ? `We sent a sign-in link and an 8-digit code to ${email}.`
            : step === "otp"
              ? "Enter the 8-digit code from your email."
              : copy.subtitle}
        </p>

        {!canUseSupabase ? (
          <div className="mt-4 rounded-2xl border bg-[#FFFBEB] p-3 text-[13px] text-amber-800">
            Supabase env vars are missing — demo mode. You can keep browsing without signing in.
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[13px] text-red-700">
            {error}
          </div>
        ) : null}

        {step === "landing" && passkeyPrimary ? (
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={!canUseSupabase || busy !== null}
              onClick={handlePasskeyLogin}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <ScanFace className="h-5 w-5" />
              {busy === "passkey" ? "Opening Face ID…" : "Login with Face ID"}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => setStep("email")}
              className="w-full rounded-2xl border py-3 text-[13px] font-semibold text-gray-600 active:bg-[#F9FAFB]"
              style={{ borderColor: BORDER }}
            >
              Use email instead
            </button>
          </div>
        ) : null}

        {step === "landing" && !passkeyPrimary ? (
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled
              title="Coming soon"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-[#F9FAFB] px-4 text-[14px] font-bold text-gray-400"
              style={{ borderColor: BORDER }}
            >
              <Chrome className="h-5 w-5" />
              Google
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase">
                Soon
              </span>
            </button>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-[#F9FAFB] px-4 text-[14px] font-bold text-gray-400"
              style={{ borderColor: BORDER }}
            >
              <Apple className="h-5 w-5" />
              Apple
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase">
                Soon
              </span>
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              disabled={!canUseSupabase || busy !== null}
              onClick={() => setStep("email")}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <Mail className="h-5 w-5" />
              Continue with email
            </button>

            {canUseSupabase && shouldShowPasskeyLogin() ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={handlePasskeyLogin}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-semibold text-gray-700"
                style={{ borderColor: BORDER }}
              >
                <Fingerprint className="h-4 w-4" />
                {busy === "passkey" ? "Opening passkey…" : "Use passkey"}
              </button>
            ) : null}
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
            {passkeyPrimary ? (
              <button
                type="button"
                onClick={() => setStep("landing")}
                className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-500"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep("landing")}
                className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-500"
              >
                Back to sign-in options
              </button>
            )}
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
              className="w-full rounded-2xl border py-3 text-[13px] font-semibold text-gray-600 disabled:opacity-60"
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
              {busy === "otp" ? "Verifying…" : "Verify & continue"}
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
            className="mt-3 w-full py-2 text-[13px] font-semibold text-gray-500"
          >
            Continue browsing as guest
          </button>
        ) : null}

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-1 w-full py-2 text-[13px] font-semibold text-gray-400"
          >
            Close
          </button>
        ) : null}

        <p className="mt-4 text-center text-[12px] text-gray-400">Free to join · No credit card</p>
      </div>
    </div>
  );
}
