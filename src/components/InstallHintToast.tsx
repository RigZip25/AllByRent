import { useCallback, useEffect, useMemo, useState } from "react";
import { Share, Smartphone, X } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, PWA_SHORT_NAME } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { isAndroid, isIos } from "../lib/pwaInstall";
import {
  INSTALL_HINT_SECONDS,
  markInstallHintSeen,
  shouldShowInstallHint,
} from "../lib/pwaInstallGate";

type InstallHintToastProps = {
  /** Hide on splash / full-screen blockers. */
  enabled: boolean;
};

export function InstallHintToast({ enabled }: InstallHintToastProps) {
  const { pwa, install: i } = useMessages();
  const pwaPrompt = usePwaInstallPrompt();
  const ios = isIos();
  const android = isAndroid();
  const showIos = ios || (!android && pwaPrompt.manualIos);

  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(INSTALL_HINT_SECONDS);
  const [iosStep, setIosStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const iosSteps = useMemo(
    () => [
      { title: i.iosStep1Title, hint: i.iosStep1Hint },
      { title: i.iosStep2Title, hint: i.iosStep2Hint },
      { title: i.iosStep3Title, hint: i.iosStep3Hint },
      { title: i.iosStep4Title, hint: i.iosStep4Hint(PWA_SHORT_NAME) },
    ],
    [i],
  );

  const dismiss = useCallback(() => {
    markInstallHintSeen();
    setExiting(true);
    window.setTimeout(() => setVisible(false), 280);
  }, []);

  useEffect(() => {
    if (!enabled || !shouldShowInstallHint()) return;
    const start = window.setTimeout(() => {
      setVisible(true);
      setSecondsLeft(INSTALL_HINT_SECONDS);
      setIosStep(0);
      setExiting(false);
    }, 900);
    return () => window.clearTimeout(start);
  }, [enabled]);

  useEffect(() => {
    if (!visible || exiting) return;
    if (secondsLeft <= 0) {
      dismiss();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [visible, exiting, secondsLeft, dismiss]);

  useEffect(() => {
    if (!visible || exiting || !showIos) return;
    const t = window.setInterval(() => {
      setIosStep((n) => (n + 1) % iosSteps.length);
    }, 2200);
    return () => window.clearInterval(t);
  }, [visible, exiting, showIos, iosSteps.length]);

  if (!visible) return null;

  const progress = secondsLeft / INSTALL_HINT_SECONDS;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-3"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto w-full max-w-[390px] overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition-all duration-280 ${
          exiting ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
        }`}
        style={{
          background: `linear-gradient(135deg, ${BRAND_GREEN} 0%, #0a3d28 100%)`,
        }}
        role="status"
      >
        <div
          className="h-1 origin-left bg-white/85 transition-[transform] duration-1000 linear"
          style={{ transform: `scaleX(${progress})` }}
        />

        <div className="relative flex gap-3 p-3.5 pr-11">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={pwa.dismissAria}
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"
            aria-hidden
          >
            <Smartphone className="h-5 w-5 text-white" strokeWidth={1.75} />
            <span
              className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold tabular-nums"
              style={{ color: BRAND_GREEN }}
            >
              {secondsLeft}
            </span>
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-bold leading-snug text-white">
              {pwa.hintToastTitle}
              <span className="ml-1.5 font-semibold text-white/70 tabular-nums">
                {pwa.hintCountdown(secondsLeft)}
              </span>
            </p>

            {showIos ? (
              <div className="mt-1.5">
                <p className="text-xs leading-relaxed text-white/85">
                  {pwa.bannerIosBeforeShare}
                  <span className="inline-flex items-center gap-0.5 font-semibold text-white">
                    {pwa.bannerIosShare} <Share className="inline h-3.5 w-3.5" />
                  </span>
                  {pwa.bannerIosMid}
                  <strong>{pwa.bannerIosAddToHome}</strong>
                  {pwa.bannerIosAs}
                  <strong>{PWA_SHORT_NAME}</strong>.
                </p>
                <div className="mt-2 rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-white/60">
                    {pwa.hintStepLabel(iosStep + 1, iosSteps.length)}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {iosSteps[iosStep]?.title}
                  </p>
                  <p className="text-xs text-white/80">{iosSteps[iosStep]?.hint}</p>
                </div>
              </div>
            ) : pwaPrompt.nativeInstallReady ? (
              <div className="mt-1.5">
                <p className="text-xs leading-relaxed text-white/85">
                  {pwa.bannerInstallsAs}
                  <strong>{PWA_SHORT_NAME}</strong>
                  {pwa.bannerAndroidReady(APP_NAME)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void pwaPrompt.install().finally(() => dismiss());
                  }}
                  className="mt-2.5 rounded-full px-4 py-2 text-xs font-bold shadow-md transition-opacity hover:opacity-95"
                  style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
                >
                  {pwa.installShort(PWA_SHORT_NAME)}
                </button>
              </div>
            ) : (
              <p className="mt-1.5 text-xs leading-relaxed text-white/85">
                {pwa.bannerAndroidManualBefore}
                <strong>⋮</strong> → <strong>{pwa.bannerAndroidManualInstall}</strong>
                {pwa.bannerAndroidManualLookFor}
                <strong>{pwa.androidManual.promptName}</strong>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
