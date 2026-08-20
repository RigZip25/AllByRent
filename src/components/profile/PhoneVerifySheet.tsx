import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { formatUsPhoneDisplay, formatUsPhoneInput } from "../../lib/usPhoneFormat";
import {
  isPhoneOtpClientEnabled,
  normalizePhoneToE164,
  phoneDigitsForDisplay,
  phoneOtpSoftUnavailableMessage,
  sanitizePhoneOtpUserReason,
} from "../../lib/phoneE164";
import { sendPhoneVerificationCode, verifyPhoneVerificationCode } from "../../lib/phoneKyc";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type Step = "phone" | "code" | "done";

export function PhoneVerifySheet({
  open,
  initialPhone,
  alreadyVerified,
  onClose,
  onVerified,
}: {
  open: boolean;
  initialPhone: string;
  alreadyVerified?: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
}) {
  const { profileDeep } = useMessages();
  const t = profileDeep.personalInfo;
  const [step, setStep] = useState<Step>("phone");
  const [phoneDraft, setPhoneDraft] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const otpEnabled = isPhoneOtpClientEnabled();

  useEffect(() => {
    if (!open) return;
    setPhoneDraft(
      initialPhone.trim().startsWith("+")
        ? initialPhone.trim()
        : formatUsPhoneDisplay(initialPhone),
    );
    setCode("");
    setError(null);
    setBusy(null);
    setStep(alreadyVerified && initialPhone.trim() ? "done" : "phone");
  }, [open, initialPhone, alreadyVerified]);

  if (!open) return null;

  const sendCode = () => {
    if (!otpEnabled) {
      setError(phoneOtpSoftUnavailableMessage());
      return;
    }
    setBusy("send");
    setError(null);
    void sendPhoneVerificationCode(phoneDraft).then((result) => {
      setBusy(null);
      if (!result.ok) {
        setError(sanitizePhoneOtpUserReason(result.reason));
        return;
      }
      setPhoneDraft(phoneDigitsForDisplay(result.phone));
      setStep("code");
    });
  };

  const verifyCode = () => {
    if (!otpEnabled) {
      setError(phoneOtpSoftUnavailableMessage());
      return;
    }
    setBusy("verify");
    setError(null);
    void verifyPhoneVerificationCode(phoneDraft, code).then((result) => {
      setBusy(null);
      if (!result.ok) {
        setError(sanitizePhoneOtpUserReason(result.reason));
        return;
      }
      const display = phoneDigitsForDisplay(result.phone);
      onVerified(display);
      setStep("done");
    });
  };

  const e164Ok = Boolean(normalizePhoneToE164(phoneDraft));

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl"
        style={{ borderColor: BORDER }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-extrabold" style={{ color: GREEN }}>
            {t.phoneVerifyTitle}
          </h2>
          <button type="button" onClick={onClose} aria-label={t.phoneVerifyClose}>
            <X className="h-5 w-5 text-red-600" />
          </button>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-500">{t.phoneVerifySubtitle}</p>

        {!otpEnabled && step !== "done" ? (
          <p className="mt-3 whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-950">
            {phoneOtpSoftUnavailableMessage()}
          </p>
        ) : null}

        {step === "done" ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-[14px] font-semibold text-emerald-900">{t.phoneVerifiedBadge}</p>
              <p className="mt-0.5 text-[13px] text-emerald-800">
                {phoneDigitsForDisplay(phoneDraft)}
              </p>
            </div>
          </div>
        ) : null}

        {step === "phone" ? (
          <label className="mt-4 block">
            <span className="text-[13px] font-semibold text-gray-700">{t.phoneLabel}</span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phoneDraft}
              onChange={(e) => {
                const v = e.target.value;
                setPhoneDraft(v.trim().startsWith("+") ? v : formatUsPhoneInput(v));
              }}
              placeholder={t.phonePlaceholderE164}
              autoFocus
              disabled={!otpEnabled}
              className="mt-2 w-full rounded-2xl border bg-white px-3 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 disabled:opacity-60"
              style={{ borderColor: BORDER }}
            />
            <span className="mt-1 block text-[12px] text-gray-500">{t.phoneE164Hint}</span>
          </label>
        ) : null}

        {step === "code" ? (
          <label className="mt-4 block">
            <span className="text-[13px] font-semibold text-gray-700">{t.phoneCodeLabel}</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder={t.phoneCodePlaceholder}
              autoFocus
              disabled={!otpEnabled}
              className="mt-2 w-full rounded-2xl border bg-white px-3 py-3 text-[15px] tracking-widest outline-none focus:ring-2 focus:ring-[#0D5C3A]/20 disabled:opacity-60"
              style={{ borderColor: BORDER }}
            />
            <span className="mt-1 block text-[12px] text-gray-500">
              {t.phoneCodeSentTo(phoneDigitsForDisplay(phoneDraft))}
            </span>
          </label>
        ) : null}

        {error ? (
          <p className="mt-3 whitespace-pre-wrap rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-950">
            {error}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border px-4 py-3 text-[14px] font-semibold text-gray-700"
            style={{ borderColor: BORDER }}
          >
            {step === "done" ? t.phoneVerifyDone : t.phoneVerifyCancel}
          </button>
          {step === "phone" ? (
            <button
              type="button"
              disabled={!otpEnabled || !e164Ok || busy !== null}
              onClick={sendCode}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy === "send" ? t.phoneSending : t.phoneSendCode}
            </button>
          ) : null}
          {step === "code" ? (
            <button
              type="button"
              disabled={!otpEnabled || code.length < 6 || busy !== null}
              onClick={verifyCode}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {busy === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy === "verify" ? t.phoneVerifying : t.phoneVerifyCode}
            </button>
          ) : null}
          {step === "done" ? (
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
              className="rounded-2xl px-4 py-3 text-[14px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t.phoneChangeNumber}
            </button>
          ) : null}
        </div>

        {step === "code" ? (
          <button
            type="button"
            disabled={!otpEnabled || busy !== null}
            onClick={sendCode}
            className="mt-3 w-full text-center text-[13px] font-semibold underline disabled:opacity-50"
            style={{ color: GREEN }}
          >
            {t.phoneResendCode}
          </button>
        ) : null}
      </div>
    </div>
  );
}
