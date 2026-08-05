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
import {
  markInstallHintSeen,
  shouldShowInstallHint,
} from "../lib/pwaInstallGate";

type InstallHintToastProps = {
  mode?: "step" | "overlay";
  enabled: boolean;
  onDone?: () => void;
  onBack?: () => void;
};

function IosShareIcon({ className = "h-9 w-9" }: { className?: string }) {
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

function IosViewMoreIcon({ className = "h-9 w-9" }: { className?: string }) {
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

function IosAddHomeIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="8" y="8" width="32" height="32" rx="8" stroke="#111827" strokeWidth="2.4" />
      <path d="M24 15v18M15 24h18" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function GuideRow({
  n,
  icon,
  title,
  hint,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border bg-white px-3 py-3" style={{ borderColor: "#E8E6E0" }}>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ backgroundColor: BRAND_GREEN }}
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7FBF8]">
          {icon}
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-[15px] font-bold leading-snug" style={{ color: BRAND_GREEN }}>
            {title}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{hint}</p>
        </div>
      </div>
    </li>
  );
}

/**
 * Mandatory install coach until store apps ship.
 * No timer — user must tap amber Understood to continue.
 */
export function InstallHintToast({
  mode = "overlay",
  enabled,
  onDone,
  onBack,
}: InstallHintToastProps) {
  const { pwa, install: i, taglineShort, common } = useMessages();
  const pwaPrompt = usePwaInstallPrompt();
  const ios = isIos();
  const android = isAndroid();
  const showIos = ios || (!android && pwaPrompt.manualIos);
  const asStep = mode === "step";

  const [visible, setVisible] = useState(asStep);
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
              className="inline-flex h-9 min-w-[64px] items-center justify-center rounded-full px-3 text-[14px] font-semibold text-white"
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
    }, 220);
  }, [onDone]);

  useEffect(() => {
    if (!enabled) {
      if (!asStep) setVisible(false);
      return;
    }
    if (asStep) {
      setVisible(true);
      setExiting(false);
      return;
    }
    if (!shouldShowInstallHint()) return;
    const start = window.setTimeout(() => {
      setVisible(true);
      setExiting(false);
    }, 400);
    return () => window.clearTimeout(start);
  }, [enabled, asStep]);

  if (!visible) return null;

  const body = (
    <div
      className={`flex h-full min-h-0 w-full flex-col bg-white transition-opacity duration-200 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role={asStep ? "main" : "dialog"}
      aria-modal="true"
      aria-labelledby="install-hint-title"
    >
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-[max(1.25rem,calc(env(safe-area-inset-top,0px)+0.75rem))]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-[15px] font-medium text-gray-600"
          >
            {common.back}
          </button>
        ) : (
          <span className="w-14" aria-hidden />
        )}
        <span className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {pwa.hintRequiredLabel}
        </span>
        <span className="w-14" aria-hidden />
      </div>

      <div className="flex shrink-0 items-center gap-3 px-5 pb-3">
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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <div
          className="rounded-2xl border px-4 py-3.5"
          style={{ borderColor: "#D8EDE3", backgroundColor: "#F7FBF8" }}
        >
          <p className="text-[15px] leading-relaxed text-gray-700">
            {pwa.hintCoachLine(APP_NAME, PWA_SHORT_NAME)}
          </p>
        </div>

        <h2
          id="install-hint-title"
          className="mt-4 text-[22px] font-extrabold leading-tight tracking-tight"
          style={{ color: BRAND_GREEN }}
        >
          {pwa.hintToastTitle}
        </h2>

        {showIos ? (
          <div className="mt-4 space-y-3">
            <p className="flex items-start gap-2 text-[15px] font-semibold leading-snug" style={{ color: BRAND_GREEN }}>
              <Share className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{pwa.hintSafariRequired}</span>
            </p>
            <p className="text-[14px] leading-relaxed text-gray-600">{i.nudgeBody}</p>
            <ol className="space-y-2">
              {iosSteps.map((step, idx) => (
                <GuideRow
                  key={step.title}
                  n={idx + 1}
                  icon={step.icon}
                  title={step.title}
                  hint={step.hint}
                />
              ))}
            </ol>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="flex items-start gap-2 text-[15px] font-semibold leading-snug" style={{ color: BRAND_GREEN }}>
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{pwa.hintAndroidRequired}</span>
            </p>
            {pwaPrompt.nativeInstallReady ? (
              <>
                <p className="text-[14px] leading-relaxed text-gray-600">
                  {pwa.bannerInstallsAs}
                  <strong style={{ color: BRAND_GREEN }}>{PWA_SHORT_NAME}</strong>
                  {pwa.bannerAndroidReady(APP_NAME)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void pwaPrompt.install();
                  }}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 text-[15px] font-bold"
                  style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
                >
                  <Smartphone className="h-5 w-5" />
                  {pwa.installShort(PWA_SHORT_NAME)}
                </button>
              </>
            ) : (
              <ol className="space-y-2">
                <GuideRow
                  n={1}
                  icon={<span className="text-[18px] font-bold text-gray-800">⋮</span>}
                  title={i.androidMenuStep}
                  hint={pwa.bannerAndroidManualBefore.trim()}
                />
                <GuideRow
                  n={2}
                  icon={<Smartphone className="h-5 w-5" style={{ color: BRAND_GREEN }} />}
                  title={i.androidInstallStep}
                  hint={`${pwa.androidManual.promptName}`}
                />
              </ol>
            )}
          </div>
        )}

        <p className="mt-4 text-[13px] leading-snug text-gray-500">{pwa.hintUnderstoodNote}</p>
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
          {pwa.hintUnderstood}
        </button>
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
      className={`fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-0 transition-opacity duration-300 sm:items-center sm:p-4 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* No backdrop dismiss — Understood is required */}
      <div className="relative z-[1] h-[min(92dvh,720px)] w-full max-w-[390px] overflow-hidden rounded-t-[24px] bg-white shadow-xl sm:rounded-[24px]">
        {body}
      </div>
    </div>
  );
}
