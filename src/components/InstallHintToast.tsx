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
  /** Only true after splash + Mr. Evorios onboarding — never during intro. */
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
    window.setTimeout(() => setVisible(false), 320);
  }, []);

  useEffect(() => {
    if (!enabled || !shouldShowInstallHint()) {
      setVisible(false);
      return;
    }
    const start = window.setTimeout(() => {
      setVisible(true);
      setSecondsLeft(INSTALL_HINT_SECONDS);
      setIosStep(0);
      setExiting(false);
    }, 400);
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
    }, 2400);
    return () => window.clearInterval(t);
  }, [visible, exiting, showIos, iosSteps.length]);

  if (!visible) return null;

  const progress = secondsLeft / INSTALL_HINT_SECONDS;

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-stretch justify-end transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-hint-title"
      aria-live="polite"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label={pwa.dismissAria}
        onClick={dismiss}
      />

      <div
        className={`relative z-[1] mx-auto flex h-[min(92dvh,720px)] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] shadow-2xl transition-transform duration-300 ${
          exiting ? "translate-y-8" : "translate-y-0"
        }`}
        style={{
          background: `linear-gradient(165deg, ${BRAND_GREEN} 0%, #0a3d28 55%, #062a1c 100%)`,
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex justify-center pt-3 pb-1" aria-hidden>
          <div className="h-1.5 w-12 rounded-full bg-white/30" />
        </div>

        <div
          className="mx-5 h-1.5 origin-left rounded-full bg-white/90 transition-[transform] duration-1000 linear"
          style={{ transform: `scaleX(${progress})` }}
        />

        <div className="relative flex min-h-0 flex-1 flex-col px-5 pt-4">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-4 top-0 flex h-10 w-10 items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={pwa.dismissAria}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-3 pr-10">
            <div
              className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15"
              aria-hidden
            >
              <Smartphone className="h-7 w-7 text-white" strokeWidth={1.75} />
              <span
                className="absolute -bottom-1.5 -right-1.5 flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-1.5 text-sm font-extrabold tabular-nums shadow"
                style={{ color: BRAND_GREEN }}
              >
                {secondsLeft}
              </span>
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/65">
                {pwa.hintCountdown(secondsLeft)}
              </p>
              <h2
                id="install-hint-title"
                className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight text-white"
              >
                {pwa.hintToastTitle}
              </h2>
              <p className="mt-1.5 text-[15px] leading-snug text-white/85">
                {pwa.tipInstallBefore(APP_NAME)}
                <strong>{PWA_SHORT_NAME}</strong>
                {pwa.tipInstallAfter}
              </p>
            </div>
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-3">
            {showIos ? (
              <div className="space-y-4">
                <p className="text-[16px] leading-relaxed text-white/90">
                  {pwa.bannerIosBeforeShare}
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    {pwa.bannerIosShare} <Share className="inline h-4 w-4" />
                  </span>
                  {pwa.bannerIosMid}
                  <strong>{pwa.bannerIosAddToHome}</strong>
                  {pwa.bannerIosAs}
                  <strong>{PWA_SHORT_NAME}</strong>.
                </p>

                <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-5">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-white/55">
                    {pwa.hintStepLabel(iosStep + 1, iosSteps.length)}
                  </p>
                  <p className="mt-2 text-[22px] font-extrabold leading-snug text-white">
                    {iosSteps[iosStep]?.title}
                  </p>
                  <p className="mt-2 text-[16px] leading-relaxed text-white/85">
                    {iosSteps[iosStep]?.hint}
                  </p>
                  <div className="mt-4 flex gap-1.5" aria-hidden>
                    {iosSteps.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          idx === iosStep ? "bg-white" : "bg-white/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[14px] leading-relaxed text-white/70">
                  {i.nudgeBody}
                </p>
              </div>
            ) : pwaPrompt.nativeInstallReady ? (
              <div className="space-y-5">
                <p className="text-[17px] leading-relaxed text-white/90">
                  {pwa.bannerInstallsAs}
                  <strong>{PWA_SHORT_NAME}</strong>
                  {pwa.bannerAndroidReady(APP_NAME)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void pwaPrompt.install().finally(() => dismiss());
                  }}
                  className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl text-[17px] font-bold shadow-md"
                  style={{ backgroundColor: BRAND_AMBER, color: BRAND_GREEN }}
                >
                  <Smartphone className="h-5 w-5" />
                  {pwa.installShort(PWA_SHORT_NAME)}
                </button>
              </div>
            ) : (
              <ol className="space-y-4 text-[17px] leading-snug text-white/90">
                <li className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-[16px] font-extrabold text-white">
                    1
                  </span>
                  <span className="pt-2">
                    {pwa.bannerAndroidManualBefore}
                    <strong>⋮</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-[16px] font-extrabold text-white">
                    2
                  </span>
                  <span className="pt-2">
                    <strong>{pwa.bannerAndroidManualInstall}</strong>
                    {pwa.bannerAndroidManualLookFor}
                    <strong>{pwa.androidManual.promptName}</strong>
                  </span>
                </li>
              </ol>
            )}
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="mt-auto mb-1 flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-[16px] font-bold text-white backdrop-blur-sm"
          >
            {pwa.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
}
