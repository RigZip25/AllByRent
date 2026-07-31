import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Smartphone } from "lucide-react";
import { APP_NAME, BRAND_GREEN, PWA_SHORT_NAME } from "../lib/brand";
import { markInstallGateDone } from "../lib/pwaInstallGate";
import { isAndroid, isIos, isStandalonePwa } from "../lib/pwaInstall";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { applyDocumentLang } from "../lib/i18n";
import { useMessages } from "../lib/i18n/react";

type InstallGateScreenProps = {
  onInstalledContinue: () => void;
  onContinueInBrowser: () => void;
};

/** iOS Share — square with upward arrow (bottom-center Safari bar). */
function IosShareIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="12" y="17" width="24" height="22" rx="5" stroke="#111827" strokeWidth="2.6" />
      <path d="M24 6v20" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M16.5 13.5 24 6l7.5 7.5"
        stroke="#111827"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** iOS Share sheet “View More” — gray circle with chevron down. */
function IosViewMoreIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="#3A3A3C" />
      <path
        d="M15 21.5 24 30.5 33 21.5"
        stroke="#F2F2F7"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** iOS “Add to Home Screen” — rounded square with plus. */
function IosAddHomeIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="8" y="8" width="32" height="32" rx="8" stroke="#111827" strokeWidth="2.6" />
      <path d="M24 15v18M15 24h18" stroke="#111827" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Final iOS confirmation — blue Add pill. */
function IosAddButtonIcon({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-12 min-w-[84px] items-center justify-center rounded-full px-6 text-[18px] font-semibold tracking-tight text-white shadow-sm"
      style={{ backgroundColor: "#007AFF" }}
      aria-hidden
    >
      {label}
    </span>
  );
}

function StepRow({
  n,
  icon,
  title,
  hint,
  active,
  ariaLabel,
  onTap,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  hint?: string;
  active?: boolean;
  ariaLabel: string;
  onTap: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onTap}
        aria-label={ariaLabel}
        className={`flex w-full items-center gap-3.5 rounded-2xl bg-white px-3.5 py-3.5 text-left shadow-sm ring-1 transition-all active:scale-[0.99] ${
          active
            ? "ring-2 ring-[#0D5C3A]/45 bg-[#F0FDF4]"
            : "ring-black/[0.04] hover:bg-[#F9FAFB]"
        }`}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          {n}
        </span>
        <span className="flex h-14 w-[4.25rem] shrink-0 items-center justify-center opacity-90">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-bold leading-snug tracking-tight text-gray-900">
            {title}
          </span>
          {hint ? (
            <span className="mt-1 block text-[15px] leading-snug text-gray-500">{hint}</span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

function SafariShareNudge({
  title,
  body,
  shareLabel,
  emphasized,
}: {
  title: string;
  body: string;
  shareLabel: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`install-share-nudge ${emphasized ? "install-share-nudge-flash" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="install-share-nudge-card">
        <p className="install-share-nudge-kicker">{title}</p>
        <div className="install-share-nudge-row">
          <span className="install-share-nudge-icon" aria-hidden>
            <IosShareIcon className="h-9 w-9" />
          </span>
          <p className="install-share-nudge-body">{body}</p>
        </div>
        <p className="install-share-nudge-share">{shareLabel}</p>
      </div>
      <div className="install-share-nudge-arrow" aria-hidden>
        <span className="install-share-nudge-chevron">↓</span>
      </div>
    </div>
  );
}

export function InstallGateScreen({
  onInstalledContinue,
  onContinueInBrowser,
}: InstallGateScreenProps) {
  const t = useMessages();
  const i = t.install;
  const pwa = usePwaInstallPrompt();
  const ios = isIos();
  const android = isAndroid();
  const showIosSteps = ios || (!android && pwa.manualIos);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);
  const [nudgeFlash, setNudgeFlash] = useState(false);
  const coachTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyDocumentLang();
  }, []);

  // iOS has no “continue” CTA (Safari closes after Add). Remember this browser
  // saw the gate so “Open Evorios” from the marketing site doesn’t loop forever.
  // Note: iOS still cannot deep-link https → the Home Screen PWA; only the icon can.
  useEffect(() => {
    if (!showIosSteps) return;
    markInstallGateDone();
  }, [showIosSteps]);

  useEffect(() => {
    return () => {
      if (coachTimer.current) clearTimeout(coachTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const pulseNudge = () => {
    setNudgeFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setNudgeFlash(false), 1600);
  };

  const handleStepTap = (n: number) => {
    setActiveStep(n);
    setCoachOpen(true);
    pulseNudge();
    if (coachTimer.current) clearTimeout(coachTimer.current);
    coachTimer.current = setTimeout(() => setCoachOpen(false), 4200);
  };

  const handleInstalled = () => {
    if (isStandalonePwa()) {
      onInstalledContinue();
      return;
    }
    window.alert(i.almostThereAlert(PWA_SHORT_NAME));
  };

  return (
    <div
      className="screen mx-auto flex w-full max-w-[390px] flex-col"
      style={{
        background:
          "linear-gradient(180deg, #F7FBF8 0%, #EEF7F1 42%, #FFFFFF 100%)",
      }}
    >
      <div
        className={`flex flex-1 flex-col px-5 pt-[max(1.5rem,env(safe-area-inset-top,0px))] ${
          showIosSteps ? "pb-[7.5rem]" : "pb-8"
        }`}
      >
        <p
          className="text-[12px] font-bold uppercase tracking-[0.14em]"
          style={{ color: `${BRAND_GREEN}B3` }}
        >
          {i.eyebrow}
        </p>
        <h1
          className="mt-3 text-[30px] font-extrabold leading-[1.12] tracking-tight"
          style={{ color: BRAND_GREEN }}
        >
          {i.titleLine1}
          <br />
          {i.titleLine2}
        </h1>
        <p className="mt-3.5 text-[17px] leading-relaxed text-gray-600">
          {i.body(APP_NAME, PWA_SHORT_NAME)}
        </p>

        <div className="mt-5">
          {showIosSteps ? (
            <>
              <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
                {i.stepsGuideLabel}
              </p>
              <ol className="space-y-2.5">
                <StepRow
                  n={1}
                  icon={<IosShareIcon />}
                  title={i.iosStep1Title}
                  hint={i.iosStep1Hint}
                  active={activeStep === 1}
                  ariaLabel={i.stepTapAria(1)}
                  onTap={() => handleStepTap(1)}
                />
                <StepRow
                  n={2}
                  icon={<IosViewMoreIcon />}
                  title={i.iosStep2Title}
                  hint={i.iosStep2Hint}
                  active={activeStep === 2}
                  ariaLabel={i.stepTapAria(2)}
                  onTap={() => handleStepTap(2)}
                />
                <StepRow
                  n={3}
                  icon={<IosAddHomeIcon />}
                  title={i.iosStep3Title}
                  hint={i.iosStep3Hint}
                  active={activeStep === 3}
                  ariaLabel={i.stepTapAria(3)}
                  onTap={() => handleStepTap(3)}
                />
                <StepRow
                  n={4}
                  icon={<IosAddButtonIcon label={i.iosAddButton} />}
                  title={i.iosStep4Title}
                  hint={i.iosStep4Hint(PWA_SHORT_NAME)}
                  active={activeStep === 4}
                  ariaLabel={i.stepTapAria(4)}
                  onTap={() => handleStepTap(4)}
                />
              </ol>

              {coachOpen ? (
                <p
                  className="mt-3 rounded-2xl border px-3.5 py-3 text-[15px] font-semibold leading-snug"
                  style={{
                    borderColor: `${BRAND_GREEN}55`,
                    backgroundColor: "#ECFDF5",
                    color: BRAND_GREEN,
                  }}
                  role="status"
                >
                  {i.tapStepCoach}
                </p>
              ) : null}

              <p className="mt-5 text-[15px] leading-relaxed text-gray-600">
                {i.iosAfterAdd(APP_NAME)}
              </p>

              <button
                type="button"
                onClick={onContinueInBrowser}
                className="mt-5 min-h-[44px] w-full text-[14px] font-semibold text-gray-500 underline"
              >
                {i.continueBrowser}
              </button>
            </>
          ) : (
            <div
              className="rounded-2xl border px-4 py-4 text-[16px] leading-snug text-gray-700"
              style={{ borderColor: `${BRAND_GREEN}33`, backgroundColor: "#F0FDF4" }}
            >
              {pwa.nativeInstallReady ? (
                <p>{i.androidInstallReady}</p>
              ) : (
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      1
                    </span>
                    <span className="pt-1.5 text-[16px]">{i.androidMenuStep}</span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      2
                    </span>
                    <span className="pt-1.5 text-[16px]">{i.androidInstallStep}</span>
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>

        {!showIosSteps ? (
          <>
            <p className="mt-5 text-[16px] leading-relaxed text-gray-600">
              {i.androidAfter(APP_NAME)}
            </p>

            <div className="mt-auto flex flex-col gap-3 pt-8 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
              {pwa.nativeInstallReady ? (
                <button
                  type="button"
                  onClick={() => void pwa.install()}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-bold text-white"
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  <Smartphone className="h-5 w-5" />
                  {i.installApp(APP_NAME)}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleInstalled}
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl text-[16px] font-bold text-white"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                {i.addedContinue}
              </button>

              <button
                type="button"
                onClick={onContinueInBrowser}
                className="min-h-[44px] w-full text-[14px] font-semibold text-gray-500 underline"
              >
                {i.continueBrowser}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {showIosSteps ? (
        <SafariShareNudge
          title={i.nudgeTitle}
          body={i.nudgeBody}
          shareLabel={i.nudgeShareLabel}
          emphasized={nudgeFlash || coachOpen}
        />
      ) : null}
    </div>
  );
}
