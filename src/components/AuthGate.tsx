import { useEffect, useMemo, useState } from "react";
import { Apple, ChevronDown, Chrome, Fingerprint, Mail, ScanFace, X } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import { APP_NAME, mascotSays, MASCOT_NAME } from "../lib/brand";
import type { AuthIntent } from "../lib/authReturn";
import { peekPendingAuthEmail, setPendingAuthEmail } from "../lib/authReturn";
import {
  shouldShowPasskeyLogin,
  signInWithEmailOtp,
  signInWithPasskey,
  signInWithProvider,
  verifyEmailOtp,
} from "../lib/auth";
import { formatAuthError } from "../lib/authErrors";
import { detectCurrentLocation, formatGeolocationErrorMessage } from "../lib/geolocation";
import { getPasskeyEnvironmentHint } from "../lib/passkeyEnvironment";
import { setHomeLocation } from "../lib/listingStorage";
import { peekPendingAuthProfile, savePendingAuthProfile } from "../lib/pendingAuthProfile";
import {
  emailOtpEntryError,
  emailOtpLengthHint,
  isCompleteEmailOtpLength,
  normalizeEmailOtpInput,
} from "../lib/authOtp";
import { formatUsPhoneDisplay, formatUsPhoneInput, normalizeUsPhoneForStorage } from "../lib/usPhoneFormat";
import { RentanoTip } from "./RentanoTip";
import { AddressLocationPicker } from "./AddressLocationPicker";
import type { LocationSuggestion } from "../lib/geocoding";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type Step = "account" | "confirm" | "alternatives";

const EMAIL_COOLDOWN_SECONDS = 60;
const EMAIL_RATE_LIMIT_COOLDOWN_SECONDS = 15 * 60;

const INTENT_COPY: Record<
  AuthIntent,
  { title: string; subtitle: string; rentano: string }
> = {
  list: {
    title: "Sign in or create account",
    subtitle: "Add your details — we'll email a sign-in code, then save your listing draft.",
    rentano: mascotSays("List your gear and start earning. One quick sign-in to continue."),
  },
  book: {
    title: "Sign in or create account",
    subtitle: "Add your details — we'll email a sign-in code so hosts can reach you.",
    rentano: `${MASCOT_NAME}: Booking needs an account. Enter the code from your email and you're in.`,
  },
  message: {
    title: "Sign in or create account",
    subtitle: "Add your details — we'll email a sign-in code to unlock messaging.",
    rentano: `${MASCOT_NAME}: Messaging is for members — enter the code from your email to continue.`,
  },
  generic: {
    title: "Sign in or create account",
    subtitle: "New or returning — enter your details and we'll email a sign-in code.",
    rentano: `${MASCOT_NAME}: One account for your garage, bookings, and chat.`,
  },
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function hydrateAuthForm(): {
  fullName: string;
  phone: string;
  email: string;
  location: LocationSuggestion | null;
} {
  const pendingProfile = peekPendingAuthProfile();
  return {
    fullName: pendingProfile?.fullName ?? "",
    phone: pendingProfile?.phone ? formatUsPhoneDisplay(pendingProfile.phone) : "",
    email: peekPendingAuthEmail() ?? "",
    location: pendingProfile?.location ?? null,
  };
}

function SummaryRow({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[13px]">
      <span className="shrink-0 font-medium text-gray-500">{label}</span>
      <div className="min-w-0 text-right">
        <p className="break-words font-semibold text-gray-800 [overflow-wrap:anywhere]">{value}</p>
        {badge ? (
          <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function AuthGate({
  open,
  intent = "generic",
  initialStep,
  onDismiss,
  onAuthenticated,
}: {
  open: boolean;
  intent?: AuthIntent;
  initialStep?: Step;
  onDismiss?: () => void;
  onAuthenticated?: () => void;
}) {
  const { configured, session } = useAuth();
  const copy = INTENT_COPY[intent];
  const hydrated = useMemo(() => hydrateAuthForm(), []);
  const [step, setStep] = useState<Step>(initialStep ?? "account");
  const [fullName, setFullName] = useState(hydrated.fullName);
  const [phone, setPhone] = useState(hydrated.phone);
  const [email, setEmail] = useState(hydrated.email);
  const [location, setLocation] = useState<LocationSuggestion | null>(hydrated.location);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkeyPrimary, setPasskeyPrimary] = useState(false);
  const passkeyHint = useMemo(() => getPasskeyEnvironmentHint(), []);
  const [emailCooldownUntil, setEmailCooldownUntil] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [otpCode, setOtpCode] = useState("");

  const canUseSupabase = useMemo(() => configured, [configured]);

  useEffect(() => {
    if (!open || !session) return;
    onAuthenticated?.();
  }, [open, session, onAuthenticated]);

  useEffect(() => {
    if (!open) return;
    setPasskeyPrimary(shouldShowPasskeyLogin());
    const next = hydrateAuthForm();
    setFullName(next.fullName);
    setPhone(next.phone);
    setEmail(next.email);
    setLocation(next.location);
    setOtpCode("");
    setShowAlternatives(false);
    setError(null);
    if (initialStep) {
      setStep(initialStep);
    } else if (next.email) {
      setStep("confirm");
    } else if (shouldShowPasskeyLogin()) {
      setStep("alternatives");
    } else {
      setStep("account");
    }
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
        setError("Too many emails requested. Please wait about 15 minutes, then try again.");
      } else {
        setError(message);
      }
      if (import.meta.env.DEV) console.error("[AuthGate]", e);
    } finally {
      setBusy(null);
    }
  };

  const emailCooldownRemaining = Math.max(0, Math.ceil((emailCooldownUntil - nowMs) / 1000));
  const canRequestEmail = emailCooldownRemaining === 0 && busy === null && canUseSupabase;

  const persistPendingProfile = () => {
    if (!location) return;
    savePendingAuthProfile({
      fullName: fullName.trim(),
      phone: normalizeUsPhoneForStorage(phone) || undefined,
      location,
    });
    setHomeLocation({
      displayName: location.label,
      lat: location.lat,
      lng: location.lng,
    });
  };

  const validateAccountForm = (): boolean => {
    if (!fullName.trim()) {
      setError("Enter your name.");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return false;
    }
    if (!location) {
      setError("Pick your area — auto-detect or search by ZIP or city.");
      return false;
    }
    return true;
  };

  const handleSendConfirmationCode = () => {
    if (!validateAccountForm() || !canRequestEmail || !location) return;
    void run("email", async () => {
      setPendingAuthEmail(email);
      persistPendingProfile();
      await signInWithEmailOtp(email);
      setEmailCooldownUntil(Date.now() + EMAIL_COOLDOWN_SECONDS * 1000);
      setOtpCode("");
      setStep("confirm");
    });
  };

  const handleVerifyCode = () => {
    const digits = normalizeEmailOtpInput(otpCode);
    if (!isCompleteEmailOtpLength(digits.length)) {
      setError(emailOtpEntryError());
      return;
    }
    void run("verify", async () => {
      await verifyEmailOtp(email, digits);
    });
  };

  const handlePasskeyLogin = () => {
    void run("passkey", async () => {
      await signInWithPasskey(passkeyPrimary ? undefined : email || undefined);
    });
  };

  const handleOAuth = (provider: "google" | "apple", options?: { skipProfile?: boolean }) => {
    if (!options?.skipProfile && !validateAccountForm()) return;
    void run(provider, async () => {
      if (!options?.skipProfile && location) {
        persistPendingProfile();
      }
      await signInWithProvider(provider);
    });
  };

  const handleAutoDetectLocation = () => {
    void run("locate", async () => {
      const detected = await detectCurrentLocation();
      if (!detected.ok) {
        setError(formatGeolocationErrorMessage(detected.reason));
        return;
      }
      setLocation({
        label: detected.location.displayName,
        primaryLine: detected.location.displayName,
        secondaryLine: "",
        city: detected.location.displayName,
        country: "",
        region: "",
        countryCode: "",
        flag: "📍",
        lat: detected.location.lat,
        lng: detected.location.lng,
        precision: "gps",
      });
    });
  };

  const confirmTitle = "Enter your sign-in code";
  const confirmSubtitle = `We sent a code to ${email}. Paste every digit from the email (${emailOtpLengthHint()}) — no need to leave the app.`;

  const otpDigits = normalizeEmailOtpInput(otpCode);
  const canVerifyCode = isCompleteEmailOtpLength(otpDigits.length) && busy === null && canUseSupabase;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4"
      onClick={() => onDismiss?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[390px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
            aria-label="Close sign-in"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}

        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />

        <RentanoTip message={copy.rentano} className="mb-1" />

        <h2 className="mt-3 text-[22px] font-bold leading-tight" style={{ color: GREEN }}>
          {step === "confirm" ? confirmTitle : step === "alternatives" ? "Quick sign-in" : copy.title}
        </h2>
        <p className="mt-1 text-[14px] text-gray-500">
          {step === "confirm"
            ? confirmSubtitle
            : step === "alternatives"
              ? "Already set up Face ID or Google on this device?"
              : copy.subtitle}
        </p>

        {!canUseSupabase ? (
          <div className="mt-4 rounded-2xl border bg-[#FFFBEB] p-3 text-[13px] text-amber-800">
            Supabase env vars are missing — sign-in is unavailable in this build.
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[13px] text-red-700">{error}</div>
        ) : null}

        {step === "alternatives" ? (
          <div className="mt-4 flex flex-col gap-2">
            {passkeyPrimary ? (
              <>
                <button
                  type="button"
                  disabled={!canUseSupabase || busy !== null}
                  onClick={handlePasskeyLogin}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: GREEN }}
                >
                  <ScanFace className="h-5 w-5" />
                  {busy === "passkey" ? "Opening Face ID…" : "Continue with Face ID"}
                </button>
                {passkeyHint ? (
                  <p className="text-center text-[12px] leading-snug text-gray-500">{passkeyHint}</p>
                ) : null}
              </>
            ) : null}

            <button
              type="button"
              disabled={!canUseSupabase || busy !== null}
              onClick={() => handleOAuth("google", { skipProfile: true })}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-bold text-gray-800 disabled:opacity-60"
              style={{ borderColor: BORDER }}
            >
              <Chrome className="h-5 w-5" />
              Google
            </button>
            <button
              type="button"
              disabled={!canUseSupabase || busy !== null}
              onClick={() => handleOAuth("apple", { skipProfile: true })}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-bold text-gray-800 disabled:opacity-60"
              style={{ borderColor: BORDER }}
            >
              <Apple className="h-5 w-5" />
              Apple
            </button>

            {!passkeyPrimary && shouldShowPasskeyLogin() ? (
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

            <button
              type="button"
              onClick={() => setStep("account")}
              className="mt-2 w-full py-2 text-[13px] font-semibold text-gray-600"
            >
              Sign in with email instead
            </button>
          </div>
        ) : null}

        {step === "account" ? (
          <div className="mt-4">
            <label className="text-[13px] font-semibold text-gray-600" htmlFor="auth-name">
              Your name
            </label>
            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="How neighbors will see you"
              className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              style={{ borderColor: BORDER }}
            />

            <label className="mt-3 block text-[13px] font-semibold text-gray-600" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendConfirmationCode();
              }}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              style={{ borderColor: BORDER }}
            />

            <label className="mt-3 block text-[13px] font-semibold text-gray-600" htmlFor="auth-phone">
              Phone <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="auth-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(formatUsPhoneInput(e.target.value))}
              placeholder="(555) 123-4567"
              className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              style={{ borderColor: BORDER }}
            />

            <div className="mt-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-gray-700">Your area</p>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={handleAutoDetectLocation}
                  className="text-[12px] font-semibold text-gray-600 disabled:opacity-60"
                >
                  {busy === "locate" ? "Detecting…" : "Use my location"}
                </button>
              </div>
              <div className="mt-3">
                <AddressLocationPicker
                  variant="area"
                  placeholder="ZIP code or city, state"
                  emptyHint="ZIP (e.g. 72701) or city — Fayetteville, AR"
                  selected={location}
                  onSelect={setLocation}
                  onClear={() => setLocation(null)}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!canRequestEmail}
              onClick={handleSendConfirmationCode}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <Mail className="h-5 w-5" />
              {busy === "email"
                ? "Sending…"
                : emailCooldownRemaining > 0
                  ? `Resend in ${emailCooldownRemaining}s`
                  : "Send sign-in code"}
            </button>

            {(shouldShowPasskeyLogin() || canUseSupabase) && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowAlternatives((open) => !open)}
                  className="flex w-full items-center justify-center gap-1 py-2 text-[13px] font-semibold text-gray-500"
                >
                  Other sign-in options
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showAlternatives ? "rotate-180" : ""}`}
                  />
                </button>
                {showAlternatives ? (
                  <div className="mt-1 flex flex-col gap-2">
                    {shouldShowPasskeyLogin() ? (
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={handlePasskeyLogin}
                        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-semibold text-gray-700"
                        style={{ borderColor: BORDER }}
                      >
                        <Fingerprint className="h-4 w-4" />
                        {busy === "passkey" ? "Opening Face ID…" : "Face ID"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={!canUseSupabase || busy !== null}
                      onClick={() => handleOAuth("google")}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-bold text-gray-800 disabled:opacity-60"
                      style={{ borderColor: BORDER }}
                    >
                      <Chrome className="h-5 w-5" />
                      Google
                    </button>
                    <button
                      type="button"
                      disabled={!canUseSupabase || busy !== null}
                      onClick={() => handleOAuth("apple")}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-bold text-gray-800 disabled:opacity-60"
                      style={{ borderColor: BORDER }}
                    >
                      <Apple className="h-5 w-5" />
                      Apple
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {step === "confirm" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="space-y-3 rounded-2xl border bg-[#F9FAFB] p-4" style={{ borderColor: BORDER }}>
              <SummaryRow label="Name" value={fullName.trim() || "—"} />
              <SummaryRow label="Email" value={email} badge="Code sent" />
              {phone.trim() ? (
                <SummaryRow label="Phone" value={formatUsPhoneDisplay(phone)} />
              ) : null}
              {location ? (
                <SummaryRow
                  label="Area"
                  value={location.secondaryLine ? `${location.primaryLine}, ${location.secondaryLine}` : location.primaryLine}
                />
              ) : null}
            </div>

            <label className="text-[13px] font-semibold text-gray-600" htmlFor="auth-otp">
              Sign-in code
            </label>
            <input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={8}
              value={otpCode}
              onChange={(e) => setOtpCode(normalizeEmailOtpInput(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyCode();
              }}
              placeholder="Code from email"
              className="w-full rounded-2xl border bg-white px-4 py-3 text-center text-[22px] font-bold tracking-[0.35em] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              style={{ borderColor: BORDER }}
            />

            <button
              type="button"
              disabled={!canVerifyCode}
              onClick={handleVerifyCode}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy === "verify" ? "Checking code…" : "Confirm and sign in"}
            </button>

            <p className="rounded-2xl border bg-[#FFFBEB] px-4 py-3 text-[13px] leading-relaxed text-amber-950">
              The email may show <strong>Supabase</strong> as the sender until {APP_NAME} mail is fully
              set up. Open the message and copy your <strong>{APP_NAME} sign-in code</strong> — it may be{" "}
              <strong>{emailOtpLengthHint()}</strong>. You can ignore any link and paste the numbers here.
            </p>

            <p className="rounded-2xl border bg-[#F0FDF4] px-4 py-3 text-[13px] leading-relaxed text-gray-700">
              Wrong name or email? Tap Edit details, fix it, and send a new code.
            </p>

            <button
              type="button"
              disabled={busy !== null || emailCooldownRemaining > 0}
              onClick={handleSendConfirmationCode}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 text-[14px] font-semibold text-gray-700 disabled:opacity-60"
              style={{ borderColor: BORDER }}
            >
              <Mail className="h-4 w-4" />
              {busy === "email"
                ? "Sending…"
                : emailCooldownRemaining > 0
                  ? `New code in ${emailCooldownRemaining}s`
                  : "Send a new code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setOtpCode("");
                setStep("account");
              }}
              className="w-full py-2 text-[13px] font-semibold text-gray-600"
            >
              Edit details
            </button>

            <p className="text-center text-[12px] leading-relaxed text-gray-400">
              Check spam or promotions if the code doesn&apos;t arrive within a minute.
            </p>
          </div>
        ) : null}

        <p className="mt-4 text-center text-[12px] text-gray-400">Free to join · No credit card</p>
      </div>
    </div>
  );
}
