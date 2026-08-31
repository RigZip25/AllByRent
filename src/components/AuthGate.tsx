import { useEffect, useMemo, useState } from "react";
import { Mail, MapPin, ScanFace, X } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import { mascotSays, MASCOT_NAME, PRIVACY_URL, TERMS_URL } from "../lib/brand";
import type { AuthIntent } from "../lib/authReturn";
import { peekPendingAuthEmail, setPendingAuthEmail } from "../lib/authReturn";
import { shouldShowPasskeyLogin, signInWithEmailOtp, signInWithPasskey, verifyEmailOtp } from "../lib/auth";
import { formatAuthError } from "../lib/authErrors";
import { suggestCorrectedEmail } from "../lib/emailDomainSuggest";
import { detectCurrentLocation, formatGeolocationErrorMessage } from "../lib/geolocation";
import { getHomeLocation, setHomeLocation } from "../lib/listingStorage";
import { peekPendingAuthProfile, savePendingAuthProfile } from "../lib/pendingAuthProfile";
import {
  emailOtpEntryError,
  emailOtpLengthHint,
  isCompleteEmailOtpLength,
  normalizeEmailOtpInput,
} from "../lib/authOtp";
import { formatUsPhoneDisplay, formatUsPhoneInput, normalizeUsPhoneForStorage } from "../lib/usPhoneFormat";
import { loadUserProfile } from "../lib/userProfileStorage";
import { useMessages } from "../lib/i18n/react";
import { RentanoTip } from "./RentanoTip";
import { AddressLocationPicker } from "./AddressLocationPicker";
import type { LocationSuggestion } from "../lib/geocoding";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type Step = "account" | "confirm";

const EMAIL_COOLDOWN_SECONDS = 60;
const EMAIL_RATE_LIMIT_COOLDOWN_SECONDS = 15 * 60;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function locationFromHome(): LocationSuggestion | null {
  const home = getHomeLocation();
  if (!home?.displayName.trim()) return null;
  return {
    label: home.displayName,
    primaryLine: home.displayName,
    secondaryLine: "",
    city: home.displayName,
    country: "",
    region: "",
    countryCode: "",
    flag: "📍",
    lat: home.lat,
    lng: home.lng,
    precision: home.lat === 0 && home.lng === 0 ? "city" : "gps",
  };
}

function hydrateAuthForm(): {
  fullName: string;
  phone: string;
  email: string;
  location: LocationSuggestion | null;
  returning: boolean;
} {
  const pendingProfile = peekPendingAuthProfile();
  const local = loadUserProfile();
  const homeLoc = locationFromHome();
  const fullName =
    pendingProfile?.fullName?.trim() ||
    local.displayName.trim() ||
    "";
  const phoneRaw = pendingProfile?.phone || local.phone || "";
  const email = peekPendingAuthEmail() || local.email.trim() || "";
  const location = pendingProfile?.location ?? homeLoc;
  const returning = Boolean(fullName && email && location);
  return {
    fullName,
    phone: phoneRaw ? formatUsPhoneDisplay(phoneRaw) : "",
    email,
    location,
    returning,
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
  const t = useMessages();
  const a = t.auth;
  const copy = useMemo(
    () =>
      (
        {
          list: {
            title: a.intentTitle,
            subtitle: a.intentListSubtitle,
            rentano: mascotSays(a.intentListRentano),
          },
          book: {
            title: a.intentTitle,
            subtitle: a.intentBookSubtitle,
            rentano: a.intentBookRentano(MASCOT_NAME),
          },
          message: {
            title: a.intentTitle,
            subtitle: a.intentMessageSubtitle,
            rentano: a.intentMessageRentano(MASCOT_NAME),
          },
          generic: {
            title: a.intentTitle,
            subtitle: a.intentGenericSubtitle,
            rentano: a.intentGenericRentano(MASCOT_NAME),
          },
        } satisfies Record<AuthIntent, { title: string; subtitle: string; rentano: string }>
      )[intent],
    [a, intent],
  );
  const hydrated = useMemo(() => hydrateAuthForm(), []);
  const [step, setStep] = useState<Step>(initialStep ?? "account");
  const [fullName, setFullName] = useState(hydrated.fullName);
  const [phone, setPhone] = useState(hydrated.phone);
  const [email, setEmail] = useState(hydrated.email);
  const [location, setLocation] = useState<LocationSuggestion | null>(hydrated.location);
  const [returning, setReturning] = useState(hydrated.returning);
  const [editDetails, setEditDetails] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailCooldownUntil, setEmailCooldownUntil] = useState<number>(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [otpCode, setOtpCode] = useState("");
  const [showPasskey, setShowPasskey] = useState(() => shouldShowPasskeyLogin());

  const canUseSupabase = useMemo(() => configured, [configured]);
  const showProfileFields = !returning || editDetails;

  useEffect(() => {
    if (!open || !session) return;
    onAuthenticated?.();
  }, [open, session, onAuthenticated]);

  useEffect(() => {
    if (!open) return;
    const canPasskey = shouldShowPasskeyLogin();
    setShowPasskey(canPasskey);
    const next = hydrateAuthForm();
    setFullName(next.fullName);
    setPhone(next.phone);
    setEmail(next.email);
    setLocation(next.location);
    setReturning(next.returning);
    setEditDetails(false);
    setOtpCode("");
    setError(null);
    // Face ID first when this device has a passkey — don't jump to OTP confirm.
    if (canPasskey) {
      setStep("account");
    } else if (initialStep) {
      setStep(initialStep);
    } else if (next.returning) {
      setStep("account");
    } else if (next.email) {
      setStep("confirm");
    } else {
      setStep("account");
    }
  }, [open, initialStep]);

  // Auto-prompt Face ID when the sheet opens (if this device enrolled a passkey).
  useEffect(() => {
    if (!open || !configured) return;
    if (!shouldShowPasskeyLogin()) return;

    const emailForPasskey = (hydrateAuthForm().email || "").trim() || undefined;
    let cancelled = false;
    setBusy("passkey");
    setError(null);
    void (async () => {
      try {
        await signInWithPasskey(emailForPasskey);
      } catch (e) {
        if (cancelled) return;
        const message = formatAuthError(e);
        // User dismissed the system sheet — keep the form quiet.
        if (
          /cancelled|canceled|NotAllowed|timed out|was not allowed|user denied/i.test(message)
        ) {
          return;
        }
        setError(message);
        if (import.meta.env.DEV) console.error("[AuthGate] auto Face ID", e);
      } finally {
        if (!cancelled) setBusy(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, configured]);

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
        setError(a.rateLimit);
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

  const suggestedEmail = suggestCorrectedEmail(email);

  const sendConfirmationCode = (emailOverride?: string) => {
    const nextEmail = (emailOverride ?? email).trim();
    const correctingAddress =
      emailOverride != null && nextEmail.toLowerCase() !== email.trim().toLowerCase();

    if (showProfileFields) {
      if (!fullName.trim()) {
        setError(a.nameRequired);
        return;
      }
      if (!location) {
        setError(a.locationRequired);
        return;
      }
    } else if (!fullName.trim() || !location) {
      setEditDetails(true);
      setError(a.locationRequired);
      return;
    }
    if (!isValidEmail(nextEmail)) {
      setError(a.emailInvalid);
      return;
    }
    if (!correctingAddress && !canRequestEmail) return;

    if (emailOverride) setEmail(nextEmail);

    void run("email", async () => {
      setPendingAuthEmail(nextEmail);
      if (location) persistPendingProfile();
      await signInWithEmailOtp(nextEmail);
      setEmailCooldownUntil(Date.now() + EMAIL_COOLDOWN_SECONDS * 1000);
      setOtpCode("");
      setStep("confirm");
    });
  };

  const handleSendConfirmationCode = () => sendConfirmationCode();

  const handlePasskeyLogin = () => {
    void run("passkey", async () => {
      await signInWithPasskey(email.trim() || undefined);
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

  const emailSuggestionBanner =
    suggestedEmail && suggestedEmail.toLowerCase() !== email.trim().toLowerCase() ? (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
        <p className="text-[13px] font-semibold text-amber-950">{a.didYouMeanEmail(suggestedEmail)}</p>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => {
            setError(null);
            if (step === "confirm") {
              sendConfirmationCode(suggestedEmail);
            } else {
              setEmail(suggestedEmail);
            }
          }}
          className="mt-2 text-[13px] font-bold text-[#0D5C3A] underline disabled:opacity-60"
        >
          {a.useSuggestedEmail}
        </button>
      </div>
    ) : null;

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

  const confirmTitle = a.confirmTitle;
  const confirmSubtitle = a.confirmSubtitle(email, MASCOT_NAME, emailOtpLengthHint());

  const otpDigits = normalizeEmailOtpInput(otpCode);
  const canVerifyCode = isCompleteEmailOtpLength(otpDigits.length) && busy === null && canUseSupabase;

  return (
    <div
      className="fixed inset-0 z-[90] overflow-y-auto overscroll-y-contain bg-black/45 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
      onClick={() => onDismiss?.()}
    >
      <div className="mx-auto flex min-h-min w-full max-w-[390px] justify-center py-2">
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full rounded-3xl bg-white p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
            aria-label={a.closeAria}
          >
            <X className="h-5 w-5 text-red-600" />
          </button>
        ) : null}

        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />

        {step !== "confirm" ? <RentanoTip message={copy.rentano} className="mb-1" /> : null}

        <h2 className="mt-3 text-[22px] font-bold leading-tight" style={{ color: GREEN }}>
          {step === "confirm" ? confirmTitle : copy.title}
        </h2>
        <p className="mt-1 text-[14px] text-gray-500">
          {step === "confirm" ? confirmSubtitle : copy.subtitle}
        </p>

        {!canUseSupabase ? (
          <div className="mt-4 rounded-2xl border bg-[#FFFBEB] p-3 text-[13px] text-amber-800">
            {a.supabaseMissing}
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-2xl border bg-[#FEF2F2] p-3 text-[13px] text-red-700">{error}</div>
        ) : null}

        {step === "account" ? (
          <div className="mt-4">
            {showPasskey ? (
              <div className="mb-4">
                <button
                  type="button"
                  disabled={busy !== null || !canUseSupabase}
                  onClick={handlePasskeyLogin}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: GREEN }}
                >
                  <ScanFace className="h-5 w-5" />
                  {busy === "passkey" ? a.checking : a.faceIdCta}
                </button>
                <p className="mt-2 text-center text-[12px] text-gray-500">{a.faceIdHint}</p>
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[12px] font-medium text-gray-400">{a.orEmail}</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              </div>
            ) : null}

            {returning && !editDetails ? (
              <div className="mb-4 space-y-3 rounded-2xl border bg-[#F9FAFB] p-4" style={{ borderColor: BORDER }}>
                <p className="text-[13px] font-semibold text-gray-700">{a.returningHint}</p>
                <SummaryRow label={a.summaryName} value={fullName.trim() || a.emptyValue} />
                <SummaryRow label={a.summaryEmail} value={email || a.emptyValue} />
                {phone.trim() ? (
                  <SummaryRow label={a.summaryPhone} value={formatUsPhoneDisplay(phone)} />
                ) : null}
                {location ? (
                  <SummaryRow
                    label={a.summaryArea}
                    value={location.secondaryLine ? `${location.primaryLine}, ${location.secondaryLine}` : location.primaryLine}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setEditDetails(true)}
                  className="w-full py-1 text-[13px] font-semibold text-gray-600"
                >
                  {a.editDetails}
                </button>
              </div>
            ) : null}

            {showProfileFields ? (
              <>
                <label className="text-[13px] font-semibold text-gray-600" htmlFor="auth-name">
                  {a.nameLabel}
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  autoFocus={!showPasskey}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={a.namePlaceholder}
                  className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                  style={{ borderColor: BORDER }}
                />
              </>
            ) : null}

            <label className="mt-3 block text-[13px] font-semibold text-gray-600" htmlFor="auth-email">
              {a.emailLabel}
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
              placeholder={a.emailPlaceholder}
              className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
              style={{ borderColor: BORDER }}
            />
            {emailSuggestionBanner ? <div className="mt-3">{emailSuggestionBanner}</div> : null}

            {showProfileFields ? (
              <>
                <label className="mt-3 block text-[13px] font-semibold text-gray-600" htmlFor="auth-phone">
                  {a.phoneLabel} <span className="font-normal text-gray-400">{a.phoneOptional}</span>
                </label>
                <input
                  id="auth-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(e) => setPhone(formatUsPhoneInput(e.target.value))}
                  placeholder={a.phonePlaceholder}
                  className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/30"
                  style={{ borderColor: BORDER }}
                />

                <div className="mt-4 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
                  <p className="text-[13px] font-semibold text-gray-700">{a.areaLabel}</p>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={handleAutoDetectLocation}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[14px] font-semibold underline underline-offset-2 disabled:opacity-60"
                    style={{ color: GREEN }}
                  >
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {busy === "locate" ? a.detecting : a.useMyLocation}
                  </button>
                  <p className="mt-1 text-[12px] leading-snug text-gray-500">{a.useMyLocationHint}</p>
                  <div className="mt-3">
                    <AddressLocationPicker
                      variant="area"
                      placeholder={a.areaPlaceholder}
                      emptyHint={a.areaEmptyHint}
                      selected={location}
                      onSelect={setLocation}
                      onClear={() => setLocation(null)}
                    />
                  </div>
                </div>
              </>
            ) : null}

            <button
              type="button"
              disabled={!canRequestEmail}
              onClick={handleSendConfirmationCode}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              <Mail className="h-5 w-5" />
              {busy === "email"
                ? a.sending
                : emailCooldownRemaining > 0
                  ? a.resendIn(emailCooldownRemaining)
                  : a.sendCode}
            </button>

            <p className="mt-3 text-center text-[11px] leading-snug text-gray-500">
              {a.agreePrefix}{" "}
              <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="underline">
                {a.terms}
              </a>{" "}
              {a.and}{" "}
              <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="underline">
                {a.privacy}
              </a>
              .
            </p>
          </div>
        ) : null}

        {step === "confirm" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="space-y-3 rounded-2xl border bg-[#F9FAFB] p-4" style={{ borderColor: BORDER }}>
              <SummaryRow label={a.summaryName} value={fullName.trim() || a.emptyValue} />
              <SummaryRow label={a.summaryEmail} value={email} badge={a.codeSent} />
              {phone.trim() ? (
                <SummaryRow label={a.summaryPhone} value={formatUsPhoneDisplay(phone)} />
              ) : null}
              {location ? (
                <SummaryRow
                  label={a.summaryArea}
                  value={location.secondaryLine ? `${location.primaryLine}, ${location.secondaryLine}` : location.primaryLine}
                />
              ) : null}
            </div>

            {emailSuggestionBanner}

            <div
              className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5"
              role="status"
              aria-live="polite"
            >
              <p className="text-[14px] font-bold text-amber-950">
                {emailCooldownRemaining > 0
                  ? a.codeWaitTitle(emailCooldownRemaining)
                  : a.codeMissingTitle}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-900/90">{a.codeWaitBody}</p>
              <button
                type="button"
                disabled={busy !== null || emailCooldownRemaining > 0}
                onClick={handleSendConfirmationCode}
                className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-white px-4 text-[14px] font-semibold text-amber-950 disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                {busy === "email"
                  ? a.sending
                  : emailCooldownRemaining > 0
                    ? a.newCodeIn(emailCooldownRemaining)
                    : a.sendNewCode}
              </button>
            </div>

            <label className="text-[13px] font-semibold text-gray-600" htmlFor="auth-otp">
              {a.otpLabel}
            </label>
            <input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={otpCode}
              onChange={(e) => setOtpCode(normalizeEmailOtpInput(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyCode();
              }}
              placeholder={a.otpPlaceholder}
              className={`w-full rounded-2xl border bg-white px-4 py-3 text-center outline-none focus:ring-2 focus:ring-[#0D5C3A]/30 ${
                otpCode.length > 0
                  ? "text-[22px] font-bold tracking-[0.35em] tabular-nums text-gray-900"
                  : "text-[15px] font-normal tracking-normal text-gray-900 placeholder:text-[14px] placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400"
              }`}
              style={{ borderColor: BORDER }}
            />

            <button
              type="button"
              disabled={!canVerifyCode}
              onClick={handleVerifyCode}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-[15px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy === "verify" ? a.checking : a.verify}
            </button>

            <p className="text-[13px] leading-relaxed text-gray-500">{a.wrongDetailsHint}</p>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setOtpCode("");
                setEditDetails(true);
                setStep("account");
              }}
              className="w-full py-2 text-[13px] font-semibold text-gray-600"
            >
              {a.editDetails}
            </button>
          </div>
        ) : null}

        <p className="mt-4 text-center text-[12px] text-gray-400">{a.freeToJoin}</p>
        </div>
      </div>
    </div>
  );
}
