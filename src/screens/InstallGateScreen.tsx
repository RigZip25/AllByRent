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
function IosAddButtonIcon() {
  return (
    <span
      className="inline-flex h-12 min-w-[84px] items-center justify-center rounded-full px-6 text-[18px] font-semibold tracking-tight text-white shadow-sm"
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
    <li className="flex items-center gap-3.5 rounded-2xl bg-white px-3.5 py-3.5 shadow-sm ring-1 ring-black/[0.04]">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white"
        style={{ backgroundColor: BRAND_GREEN }}
      >
        {n}
      </span>
      <span className="flex h-14 w-[4.25rem] shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[18px] font-bold leading-snug tracking-tight text-gray-900">
          {title}
        </span>
        {hint ? (
          <span className="mt-1 block text-[15px] leading-snug text-gray-500">{hint}</span>
        ) : null}
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
    <div
      className="screen mx-auto flex w-full max-w-[390px] flex-col"
      style={{
        background:
          "linear-gradient(180deg, #F7FBF8 0%, #EEF7F1 42%, #FFFFFF 100%)",
      }}
    >
      <div className="flex flex-1 flex-col px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top,0px))]">
        <p
          className="text-[12px] font-bold uppercase tracking-[0.14em]"
          style={{ color: `${BRAND_GREEN}B3` }}
        >
          No App Store download
        </p>
        <h1
          className="mt-3 text-[30px] font-extrabold leading-[1.12] tracking-tight"
          style={{ color: BRAND_GREEN }}
        >
          Install {APP_NAME}
          <br />
          in seconds
        </h1>
        <p className="mt-3.5 text-[17px] leading-relaxed text-gray-600">
          Simplified install — the modern method. Four quick taps, then open your icon and go.
          Updates happen automatically.
        </p>

        <div className="mt-6">
          {showIosSteps ? (
            <ol className="space-y-3">
              <StepRow
                n={1}
                icon={<IosShareIcon />}
                title="Square with arrow"
                hint="Center of the bottom bar"
              />
              <StepRow
                n={2}
                icon={<IosViewMoreIcon />}
                title="View More"
                hint="Scroll the Share menu, then tap it"
              />
              <StepRow
                n={3}
                icon={<IosAddHomeIcon />}
                title="Add to Home Screen"
                hint="Square with a plus"
              />
              <StepRow
                n={4}
                icon={<IosAddButtonIcon />}
                title="Add"
                hint="Blue button at the top right"
              />
            </ol>
          ) : (
            <div
              className="rounded-2xl border px-4 py-4 text-[16px] leading-snug text-gray-700"
              style={{ borderColor: `${BRAND_GREEN}33`, backgroundColor: "#F0FDF4" }}
            >
              {pwa.nativeInstallReady ? (
                <p>
                  Tap <strong>Install</strong> below — one tap, no store download.
                </p>
              ) : (
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      1
                    </span>
                    <span className="pt-1.5 text-[16px]">
                      Open the browser menu <strong>⋮</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold text-white"
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      2
                    </span>
                    <span className="pt-1.5 text-[16px]">
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>
                    </span>
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>

        {showIosSteps ? (
          <p className="mt-6 text-[16px] leading-relaxed text-gray-600">
            After <strong className="text-gray-800">Add</strong>, Safari closes and the{" "}
            <strong className="text-gray-800">{APP_NAME}</strong> icon appears on your Home Screen.
            Open it anytime — updates install on their own.
          </p>
        ) : (
          <>
            <p className="mt-5 text-[16px] leading-relaxed text-gray-600">
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
