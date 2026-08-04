import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Share, Smartphone } from "lucide-react";
import {
  APP_NAME,
  BRAND_AMBER,
  BRAND_GREEN,
  MASCOT_NAME,
  PWA_SHORT_NAME,
} from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { isAndroid, isIos } from "../lib/pwaInstall";
import { onboardingAssets } from "../lib/onboardingAssets";
import { OnboardingTopBar } from "./OnboardingTopBar";
import {
  INSTALL_HINT_SECONDS,
  markInstallHintSeen,
  shouldShowInstallHint,
} from "../lib/pwaInstallGate";

type InstallHintToastProps = {
  mode?: "step" | "overlay";
  enabled: boolean;
  onDone?: () => void;
  onBack?: () => void;
};

function IosShareIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="12" y="17" width="24" height="22" rx="5" stroke="#111827" strokeWidth="2.4" />
      <path d="M24 6v20" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M16.5 13.5 24 6l7.5 7.5"
        stroke="#111827"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IosViewMoreIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="20" fill="#3A3A3C" />
      <path
        d="M15 21.5 24 30.5 33 21.5"
        stroke="#F2F2F7"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IosAddHomeIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="8" y="8" width="32" height="32" rx="8" stroke="#111827" strokeWidth="2.4" />
      <path d="M24 15v18M15 24h18" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const progress = seconds / total;
  return (
    <div className="relative flex h-11 w-11 items-center justify-center" aria-hidden>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#E8E6E0" strokeWidth="2.5" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={BRAND_GREEN}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-1000 linear"
        />
      </svg>
      <span className="text-[12px] font-bold tabular-nums" style={{ color: BRAND_GREEN }}>
        {seconds}
      </span>
    </div>
  );
}

export function InstallHintToast({
  mode = "overlay",
  enabled,
  onDone,
  onBack,
}: InstallHintToastProps) {
  const { pwa, install: i, taglineShort } = useMessages();
  const pwaPrompt = usePwaInstallPrompt();
  const ios = isIos();
  const android = isAndroid();
  const showIos = ios || (!android && pwaPrompt.manualIos);
  const asStep = mode === "step";

  const [visible, setVisible] = useState(asStep);
  const [secondsLeft, setSecondsLeft] = useState(INSTALL_HINT_SECONDS);
  const [iosStep, setIosStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const iosSteps = useMemo(
    () =>
      [
        {
          icon: <IosShareIcon />,
          title: i.iosStep1Title,
          hint: i.iosStep1Hint,
        },
        {
          icon: <IosViewMoreIcon />,
          title: i.iosStep2Title,
          hint: i.iosStep2Hint,
        },
        {
          icon: <IosAddHomeIcon />,
          title: i.iosStep3Title,
          hint: i.iosStep3Hint,
        },
        {
          icon: (
            <span
              className="inline-flex h-10 min-w-[72px] items-center justify-center rounded-full px-4 text-[15px] font-semibold text-white"
              style={{ backgroundColor: "#007AFF" }}
            >
              {i.iosAddButton}
            </span>
          ),
          title: i.iosStep4Title,
          hint: i.iosStep4Hint(PWA_SHORT_NAME),
        },
      ] as { icon: ReactNode; title: string; hint: string }[],
    [i],
  );

  const finish = useCallback(() => {
    markInstallHintSeen();
    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 240);
  }, [onDone]);

  useEffect(() => {
    if (!enabled) {
      if (!asStep) setVisible(false);
      return;
    }
    if (asStep) {
      setVisible(true);
      setSecondsLeft(INSTALL_HINT_SECONDS);
      setIosStep(0);
      setExiting(false);
      return;
    }
    if (!shouldShowInstallHint()) return;
    const start = window.setTimeout(() => {
      setVisible(true);
      setSecondsLeft(INSTALL_HINT_SECONDS);
      setIosStep(0);
      setExiting(false);
    }, 500);
    return () => window.clearTimeout(start);
  }, [enabled, asStep]);

  useEffect(() => {
    if (!visible || exiting) return;
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [visible, exiting, secondsLeft, finish]);

  useEffect(() => {
    if (!visible || exiting || !showIos) return;
    const t = window.setInterval(() => {
      setIosStep((n) => (n + 1) % iosSteps.length);
    }, 2600);
    return () => window.clearInterval(t);
  }, [visible, exiting, showIos, iosSteps.length]);

  if (!visible) return null;

  const active = iosSteps[iosStep];

  const body = (
    <div
      className={`flex h-full min-h-0 w-full flex-col bg-white transition-opacity duration-240 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role={asStep ? "main" : "dialog"}
      aria-modal={asStep ? undefined : true}
      aria-labelledby="install-hint-title"
    >
      <OnboardingTopBar onSkip={finish} onBack={onBack} />

      <div className="flex shrink-0 items-center justify-between px-5 pb-2">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={onboardingAssets.mrEvoriosFull}
            alt=""
            className="h-12 w-12 rounded-full object-cover object-top ring-2 ring-[#E8F5EE]"
            draggable={false}
          />
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight" style={{ color: BRAND_GREEN }}>
              {MASCOT_NAME}
            </p>
            <p className="truncate text-[13px] text-gray-500">{taglineShort}</p>
          </div>
        </div>
        <div className="shrink-0" title={pwa.hintCountdown(secondsLeft)}>
          <CountdownRing seconds={secondsLeft} total={INSTALL_HINT_SECONDS} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <div
          className="rounded-2xl border px-4 py-3.5"
          style={{ borderColor: "#D8EDE3", backgroundColor: "#F7FBF8" }}
        >
          <p className="text-[15px] italic leading-relaxed text-gray-700">
            {pwa.hintCoachLine(APP_NAME, PWA_SHORT_NAME)}
          </p>
        </div>

        <h2
          id="install-hint-title"
          className="mt-5 text-[24px] font-extrabold leading-tight tracking-tight"
          style={{ color: BRAND_GREEN }}
        >
          {pwa.hintToastTitle}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
          {pwa.tipInstallBefore(APP_NAME)}
          <strong style={{ color: BRAND_GREEN }}>{PWA_SHORT_NAME}</strong>
          {pwa.tipInstallAfter}
        </p>

        {showIos ? (
          <div className="mt-5">
            <div
              key={iosStep}
              className="install-hint-step rounded-3xl border bg-white px-4 py-5 shadow-sm"
              style={{ borderColor: "#E8E6E0" }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F7FBF8]">
                  {active?.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {pwa.hintStepLabel(iosStep + 1, iosSteps.length)}
                  </p>
                  <p className="mt-1 text-[18px] font-bold leading-snug" style={{ color: BRAND_GREEN }}>
                    {active?.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-snug text-gray-500">{active?.hint}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
              {iosSteps.map((_, idx) => (
                <span
                  key={idx}
                  className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: idx === iosStep ? BRAND_GREEN : "#D1D5DB",
                    width: idx === iosStep ? 18 : 6,
                  }}
                />
              ))}
            </div>

            <p className="mt-4 flex items-start gap-2 text-[14px] leading-relaxed text-gray-500">
              <Share className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
              <span>{i.nudgeBody}</span>
            </p>
          </div>
        ) : pwaPrompt.nativeInstallReady ? (
          <div className="mt-6 space-y-4">
            <p className="text-[15px] leading-relaxed text-gray-600">
              {pwa.bannerInstallsAs}
              <strong style={{ color: BRAND_GREEN }}>{PWA_SHORT_NAME}</strong>
              {pwa.bannerAndroidReady(APP_NAME)}
            </p>
            <button
              type="button"
              onClick={() => {
                void pwaPrompt.install().finally(() => finish());
              }}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-bold"
              style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
            >
              <Smartphone className="h-5 w-5" />
              {pwa.installShort(PWA_SHORT_NAME)}
            </button>
          </div>
        ) : (
          <ol className="mt-6 space-y-3">
            {[
              <>
                {pwa.bannerAndroidManualBefore}
                <strong>⋮</strong>
              </>,
              <>
                <strong>{pwa.bannerAndroidManualInstall}</strong>
                {pwa.bannerAndroidManualLookFor}
                <strong>{pwa.androidManual.promptName}</strong>
              </>,
            ].map((content, idx) => (
              <li
                key={idx}
                className="flex gap-3 rounded-2xl border px-3.5 py-3.5"
                style={{ borderColor: "#E8E6E0", backgroundColor: "#FAfaf8" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  {idx + 1}
                </span>
                <span className="pt-1 text-[15px] leading-snug text-gray-700">{content}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div
        className="shrink-0 border-t px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3"
        style={{ borderColor: "#E8E6E0" }}
      >
        <button
          type="button"
          onClick={finish}
          className="w-full rounded-xl py-3.5 text-[16px] font-bold"
          style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
        >
          {pwa.hintContinue}
        </button>
        <p className="mt-2 text-center text-[12px] text-gray-400">
          {pwa.hintCountdown(secondsLeft)}
        </p>
      </div>
    </div>
  );

  if (asStep) {
    return (
      <div className="screen onboarding-step mx-auto h-full w-full max-w-[390px] bg-white">
        {body}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 transition-opacity duration-300 sm:items-center sm:p-4 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label={pwa.dismissAria}
        onClick={finish}
      />
      <div className="relative z-[1] h-[min(88dvh,680px)] w-full max-w-[390px] overflow-hidden rounded-t-[24px] bg-white shadow-xl sm:rounded-[24px]">
        {body}
      </div>
    </div>
  );
}
