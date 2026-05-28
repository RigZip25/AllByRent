import { useEffect, useMemo, useState } from "react";
import { Apple, Chrome, Fingerprint, Mail, ScanFace } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import type { AuthIntent } from "../lib/authReturn";
import { peekPendingAuthEmail, setPendingAuthEmail } from "../lib/authReturn";
import {
  shouldShowPasskeyLogin,
  signInWithEmailOtp,
  signInWithPasskey,
} from "../lib/auth";
import { formatAuthError } from "../lib/authErrors";
import { getPasskeyEnvironmentHint } from "../lib/passkeyEnvironment";
import { RentanoTip } from "./RentanoTip";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type Step = "landing" | "email" | "sent";
const EMAIL_COOLDOWN_SECONDS = 60;
const EMAIL_RATE_LIMIT_COOLDOWN_SECONDS = 15 * 60;

const INTENT_COPY: Record<
  AuthIntent,
  { title: string; subtitle: string; rentano: string }
> = {
  list: {
    title: "Sign in to list your item",
    subtitle: "Enter your email — we'll send a magic link to sign in.",
    rentano:
      "Rentano: List your gear and start earning. Sign in so we can save your listing draft.",
  },
  book: {
    title: "Sign in to book",
    subtitle: "Enter your email — we'll send a magic link to continue.",
    rentano: "Rentano: Booking needs an account so hosts can reach you. Quick email sign-in.",
  },
  message: {
    title: "Sign in to message",
    subtitle: "Enter your email — we'll send a magic link to continue.",
    rentano: "Rentano: Messaging is for members only — sign in to continue the conversation.",
  },
  generic: {
    title: "Join AllByRent",
    subtitle: "Enter your email — we'll send a magic link to sign in.",
    rentano: "Rentano: Sign in to unlock listing, booking, and chat.",
  },
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AuthGate({
  open,
  intent = "generic",
  initialStep,
}: {
  open: boolean;
  intent?: AuthIntent;
  initialStep?: Step;
}) {
  const { configured } = useAuth();
  const copy = INTENT_COPY[intent];
  const [step, setStep] = useState<Step>(initialStep ?? "email");
  const [email, setEmail] = useState(() => peekPendingAuthEmail() ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkeyPrimary, setPasskeyPrimary] = useState(false);
  const passkeyHint = useMemo(() => getPasskeyEnvironmentHint(), []);
  const [emailCooldownUntil, setEmailCooldownUntil] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

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

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const run = async (key: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      const message = formatAuthError(e);
      if (/rate limit/i.test(message)) {
        setEmailCooldownUntil(Date.now() + EMAIL_RATE_LIMIT_COOLDOWN_SECONDS * 1000);
        setError(
          "Too many emails requested. Please wait about 15 minutes, then try again.",
        );
      } else {
        setError(message);
      }
      if (import.meta.env.DEV) console.error("[AuthGate]", e);
    } finally {
      setBusy(null);
    }
  };

  const emailCooldownRemaining = Math.max(
    0,
    Math.ceil((emailCooldownUntil - nowMs) / 1000),
  );
  const canRequestEmail = emailCooldownRemaining === 0 && busy === null && canUseSupabase;

  const handleSendMagicLink = () => {
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!canRequestEmail) return;
    void run("email", async () => {
      setPendingAuthEmail(email);
      await signInWithEmailOtp(email);
      setEmailCooldownUntil(Date.now() + EMAIL_COOLDOWN_SECONDS * 1000);
      setStep("sent");
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
          {step === "sent" ? "Check your email" : copy.title}
        </h2>
        <p className="mt-1 text-[14px] text-gray-500">
          {step === "sent"
            ? `We sent a sign-in link to ${email}. Open the email on this device and tap the link.`
            : copy.subtitle}
        </p>

        {!canUseSupabase ? (
          <div className="mt-4 rounded-2xl border bg-[#FFFBEB] p-3 text-[13px] text-amber-800">
            Supabase env vars are missing — sign-in is unavailable in this build.
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
            {passkeyHint ? (
              <p className="text-center text-[12px] leading-snug text-gray-500">{passkeyHint}</p>
            ) : null}

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                or
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => setStep("email")}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[15px] font-semibold text-gray-700"
              style={{ borderColor: BORDER }}
            >
              <Mail className="h-5 w-5" style={{ color: GREEN }} />
              Sign in with magic link
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
              Sign in with magic link
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
                {busy === "passkey" ? "Opening passkey…" : "Use Face ID"}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMagicLink();
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              style={{ borderColor: BORDER }}
            />
            <button
              type="button"
              disabled={!canRequestEmail}
              onClick={handleSendMagicLink}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <Mail className="h-5 w-5" />
              {busy === "email"
                ? "Sending…"
                : emailCooldownRemaining > 0
                  ? `Resend in ${emailCooldownRemaining}s`
                  : "Send magic link"}
            </button>
            {passkeyPrimary ? (
              <button
                type="button"
                onClick={() => setStep("landing")}
                className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-500"
              >
                Back to Face ID
              </button>
            ) : shouldShowPasskeyLogin() ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={handlePasskeyLogin}
                className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-600"
              >
                {busy === "passkey" ? "Opening Face ID…" : "Use Face ID instead"}
              </button>
            ) : null}
          </div>
        ) : null}

        {step === "sent" ? (
          <div className="mt-4 flex flex-col gap-2">
            <p className="rounded-2xl border bg-[#F0FDF4] px-4 py-3 text-[13px] leading-relaxed text-gray-700">
              The link opens AllByRent in this browser. If you don&apos;t see the email, check
              spam or promotions.
            </p>
            <button
              type="button"
              disabled={busy !== null || emailCooldownRemaining > 0}
              onClick={handleSendMagicLink}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <Mail className="h-5 w-5" />
              {busy === "email"
                ? "Sending…"
                : emailCooldownRemaining > 0
                  ? `Resend in ${emailCooldownRemaining}s`
                  : "Resend magic link"}
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

        <p className="mt-4 text-center text-[12px] text-gray-400">Free to join · No credit card</p>
      </div>
    </div>
  );
}
