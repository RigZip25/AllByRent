import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Smartphone } from "lucide-react";
import { APP_NAME, BRAND_GREEN, PWA_SHORT_NAME } from "../lib/brand";
import { isAndroid, isIos, isStandalonePwa } from "../lib/pwaInstall";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { applyDocumentLang } from "../lib/i18n";
import { useMessages } from "../lib/i18n/react";

type InstallGateScreenProps = {
  onInstalledContinue: () => void;
  onContinueInBrowser: () => void;
};

const STEP_HOLD_MS = [4500, 2800, 2800, 3200] as const;

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
      className="inline-flex h-14 min-w-[96px] items-center justify-center rounded-full px-7 text-[20px] font-semibold tracking-tight text-white shadow-sm"
      style={{ backgroundColor: "#007AFF" }}
      aria-hidden
    >
      {label}
    </span>
  );
}

function SafariShareNudge({
  title,
  body,
  emphasized,
}: {
  title: string;
  body: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`install-share-nudge ${emphasized ? "install-share-nudge-flash" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="install-share-nudge-card">
        <span className="install-share-nudge-icon" aria-hidden>
          <IosShareIcon className="h-5 w-5" />
        </span>
        <div className="install-share-nudge-text">
          <p className="install-share-nudge-kicker">{title}</p>
          <p className="install-share-nudge-body">{body}</p>
        </div>
      </div>
      <div className="install-share-nudge-arrow" aria-hidden>
        <span className="install-share-nudge-chevron">↓</span>
      </div>
    </div>
  );
}

type GuideStep = {
  n: number;
  icon: ReactNode;
  title: string;
  hint: string;
};

function LiveInstallGuide({
  steps,
  copy,
  onCoachShare,
}: {
  steps: GuideStep[];
  copy: {
    liveNow: string;
    liveThen: string;
    livePlaying: string;
    livePaused: string;
    liveTapReplay: string;
    stepCoachShare: string;
    stepCoachLater: string;
    stepTapAria: (n: number) => string;
  };
  onCoachShare: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [coach, setCoach] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[index] ?? steps[0]!;

  useEffect(() => {
    if (!playing) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIndex((cur) => {
        // After the last step, pause on it — don't loop forever (felt like “skipping”).
        if (cur >= steps.length - 1) {
          setPlaying(false);
          return cur;
        }
        return cur + 1;
      });
    }, STEP_HOLD_MS[index] ?? 2400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, playing, steps.length]);

  // Keep the Safari Share nudge alive whenever step 1 is showing.
  useEffect(() => {
    if (step.n === 1) onCoachShare();
    // Intentionally only when the visible step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid re-firing on parent identity churn
  }, [step.n]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (coachTimer.current) clearTimeout(coachTimer.current);
    };
  }, []);

  const showCoach = (message: string, alsoShare: boolean) => {
    setCoach(message);
    if (alsoShare) onCoachShare();
    if (coachTimer.current) clearTimeout(coachTimer.current);
    coachTimer.current = setTimeout(() => setCoach(null), 3800);
  };

  const handleStageTap = () => {
    if (step.n === 1) {
      showCoach(copy.stepCoachShare, true);
      return;
    }
    showCoach(copy.stepCoachLater, false);
  };

  const handleDotTap = (i: number) => {
    setPlaying(false);
    setIndex(i);
    const next = steps[i];
    if (next?.n === 1) showCoach(copy.stepCoachShare, true);
    else showCoach(copy.stepCoachLater, false);
  };

  return (
    <div className="install-live-guide">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {playing ? copy.livePlaying : copy.livePaused}
        </p>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full px-2.5 py-1 text-[12px] font-bold"
          style={{ color: BRAND_GREEN, backgroundColor: `${BRAND_GREEN}14` }}
        >
          {playing ? "❚❚" : "▶"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleStageTap}
        aria-label={copy.stepTapAria(step.n)}
        className="install-live-stage"
      >
        <span className="install-live-badge">
          {step.n === 1 ? copy.liveNow : copy.liveThen} · {step.n}/{steps.length}
        </span>
        <span key={step.n} className="install-live-icon" aria-hidden>
          {step.icon}
        </span>
        <span className="install-live-title">{step.title}</span>
        <span className="install-live-hint">{step.hint}</span>
        <span className="install-live-replay">{copy.liveTapReplay}</span>
      </button>

      <div className="install-live-dots" role="tablist" aria-label="Install steps">
        {steps.map((s, i) => (
          <button
            key={s.n}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={copy.stepTapAria(s.n)}
            onClick={() => handleDotTap(i)}
            className={`install-live-dot ${i === index ? "is-active" : ""} ${i < index ? "is-done" : ""}`}
          />
        ))}
      </div>

      <ol className="install-live-rail" aria-hidden>
        {steps.map((s, i) => (
          <li
            key={s.n}
            className={`install-live-rail-item ${i === index ? "is-active" : ""}`}
          >
            <span className="install-live-rail-num">{s.n}</span>
            <span className="install-live-rail-label">{s.title}</span>
          </li>
        ))}
      </ol>

      {coach ? (
        <p className="install-live-coach" role="status">
          {coach}
        </p>
      ) : null}
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
  const [nudgeFlash, setNudgeFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guideSteps = useMemo<GuideStep[]>(
    () => [
      {
        n: 1,
        icon: <IosShareIcon className="h-16 w-16" />,
        title: i.iosStep1Title,
        hint: i.iosStep1Hint,
      },
      {
        n: 2,
        icon: <IosViewMoreIcon className="h-16 w-16" />,
        title: i.iosStep2Title,
        hint: i.iosStep2Hint,
      },
      {
        n: 3,
        icon: <IosAddHomeIcon className="h-16 w-16" />,
        title: i.iosStep3Title,
        hint: i.iosStep3Hint,
      },
      {
        n: 4,
        icon: <IosAddButtonIcon label={i.iosAddButton} />,
        title: i.iosStep4Title,
        hint: i.iosStep4Hint(PWA_SHORT_NAME),
      },
    ],
    [i],
  );

  useEffect(() => {
    applyDocumentLang();
  }, []);

  // Do NOT mark the gate done on mount — that made Back/refresh skip the
  // instructions and jump straight into the app after a reset.

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const pulseNudge = useCallback(() => {
    setNudgeFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setNudgeFlash(false), 1600);
  }, []);

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
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top,0px))] ${
          showIosSteps ? "pb-4" : "pb-8"
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
              <LiveInstallGuide
                steps={guideSteps}
                copy={{
                  liveNow: i.liveNow,
                  liveThen: i.liveThen,
                  livePlaying: i.livePlaying,
                  livePaused: i.livePaused,
                  liveTapReplay: i.liveTapReplay,
                  stepCoachShare: i.stepCoachShare,
                  stepCoachLater: i.stepCoachLater,
                  stepTapAria: i.stepTapAria,
                }}
                onCoachShare={pulseNudge}
              />

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
          emphasized={nudgeFlash}
        />
      ) : null}
    </div>
  );
}
