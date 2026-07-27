import type { ReactNode } from "react";
import { Smartphone } from "lucide-react";
import { APP_NAME, BRAND_GREEN } from "../lib/brand";
import { isAndroid, isIos, isStandalonePwa } from "../lib/pwaInstall";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";

type InstallGateScreenProps = {
  onInstalledContinue: () => void;
  onContinueInBrowser: () => void;
};

/** iOS Share — square with upward arrow (bottom-center Safari bar). */
function IosShareIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" aria-hidden>
      <rect x="11" y="16" width="22" height="20" rx="4.5" stroke="#111827" strokeWidth="2.4" />
      <path
        d="M22 6v18"
        stroke="#111827"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M15.5 12.5 22 6l6.5 6.5"
        stroke="#111827"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** iOS Share sheet “View More” — gray circle with chevron down. */
function IosViewMoreIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="18" fill="#3A3A3C" />
      <path
        d="M14 19.5 22 27.5 30 19.5"
        stroke="#E5E5EA"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** iOS “Add to Home Screen” — rounded square with plus. */
function IosAddHomeIcon({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 44 44" fill="none" aria-hidden>
      <rect x="7" y="7" width="30" height="30" rx="7" stroke="#111827" strokeWidth="2.4" />
      <path
        d="M22 14v16M14 22h16"
        stroke="#111827"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Final iOS confirmation — blue Add pill. */
function IosAddButtonIcon() {
  return (
    <span
      className="inline-flex h-11 min-w-[72px] items-center justify-center rounded-full px-5 text-[17px] font-semibold text-white"
      style={{ backgroundColor: "#007AFF" }}
      aria-hidden
    >
      Add
    </span>
  );
}

function StepRow({
  n,
  icon,
  title,
  hint,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <li className="flex items-center gap-3.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
        style={{ backgroundColor: BRAND_GREEN }}
      >
        {n}
      </span>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-bold leading-snug text-gray-900">{title}</span>
        {hint ? <span className="mt-0.5 block text-[13px] leading-snug text-gray-500">{hint}</span> : null}
      </span>
    </li>
  );
}

export function InstallGateScreen({
  onInstalledContinue,
  onContinueInBrowser,
}: InstallGateScreenProps) {
  const pwa = usePwaInstallPrompt();
  const ios = isIos();
  const android = isAndroid();
  const showIosSteps = ios || (!android && pwa.manualIos);

  const handleInstalled = () => {
    if (isStandalonePwa()) {
      onInstalledContinue();
      return;
    }
    window.alert(
      `Almost there!\n\nOpen the ${APP_NAME} icon on your Home Screen (not this browser tab).`,
    );
  };

  return (
    <div className="screen mx-auto flex w-full max-w-[390px] flex-col bg-white">
      <div className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))]">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#0D5C3A]/70">
          No App Store download
        </p>
        <h1 className="mt-2 text-[26px] font-extrabold leading-tight" style={{ color: BRAND_GREEN }}>
          Install {APP_NAME} in seconds
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-gray-600">
          Simplified install — the modern method. Four quick taps, then use the app. Updates happen
          automatically.
        </p>

        <div
          className="mt-5 rounded-2xl border px-3.5 py-4"
          style={{ borderColor: `${BRAND_GREEN}33`, backgroundColor: "#F0FDF4" }}
        >
          {showIosSteps ? (
            <ol className="space-y-4">
              <StepRow
                n={1}
                icon={<IosShareIcon />}
                title="Square with arrow"
                hint="Center of the bottom bar"
              />
              <StepRow n={2} icon={<IosViewMoreIcon />} title="View More" />
              <StepRow n={3} icon={<IosAddHomeIcon />} title="Add to Home Screen" />
              <StepRow n={4} icon={<IosAddButtonIcon />} title="Add" />
            </ol>
          ) : (
            <div className="space-y-3 text-[15px] leading-snug text-gray-700">
              {pwa.nativeInstallReady ? (
                <p>
                  Tap <strong>Install</strong> below — one tap, no store download.
                </p>
              ) : (
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      1
                    </span>
                    <span className="pt-1">
                      Open the browser menu <strong>⋮</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold text-white"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      2
                    </span>
                    <span className="pt-1">
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>
                    </span>
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>

        {showIosSteps ? (
          <p className="mt-4 text-[14px] leading-snug text-gray-500">
            After <strong>Add</strong>, Safari closes and the {APP_NAME} icon appears on your Home
            Screen. Open it — updates install automatically.
          </p>
        ) : (
          <>
            <p className="mt-4 text-[14px] leading-snug text-gray-500">
              Open the {APP_NAME} icon from your Home Screen. You’re set — updates install on their
              own.
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
                  Install {APP_NAME}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleInstalled}
                className="flex min-h-[52px] w-full items-center justify-center rounded-2xl text-[16px] font-bold text-white"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                I’ve added it — continue
              </button>

              <button
                type="button"
                onClick={onContinueInBrowser}
                className="min-h-[44px] w-full text-[14px] font-semibold text-gray-500 underline"
              >
                Continue in browser
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
