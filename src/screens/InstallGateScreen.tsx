import { Share, Smartphone, TriangleAlert } from "lucide-react";
import { APP_NAME, BRAND_AMBER, BRAND_GREEN, MASCOT_NAME } from "../lib/brand";
import { isAndroid, isIos, isStandalonePwa } from "../lib/pwaInstall";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";

type InstallGateScreenProps = {
  onInstalledContinue: () => void;
  onContinueInBrowser: () => void;
};

export function InstallGateScreen({
  onInstalledContinue,
  onContinueInBrowser,
}: InstallGateScreenProps) {
  const pwa = usePwaInstallPrompt();
  const ios = isIos();
  const android = isAndroid();

  const handleInstalled = () => {
    if (isStandalonePwa()) {
      onInstalledContinue();
      return;
    }
    // Still in Safari/Chrome — they must open the home-screen icon.
    window.alert(
      `Almost there!\n\nOpen the ${APP_NAME} icon on your Home Screen (not this browser tab). That keeps the back button inside the app.`,
    );
  };

  return (
    <div className="screen mx-auto flex w-full max-w-[390px] flex-col bg-white">
      <div className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))]">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#0D5C3A]/70">
          One quick step
        </p>
        <h1 className="mt-2 text-[26px] font-extrabold leading-tight" style={{ color: BRAND_GREEN }}>
          Add {APP_NAME} to your Home Screen
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          In the browser, Back leaves {APP_NAME} and returns to the previous website. Installed from
          Home Screen, Back stays inside the app — like a normal app.
        </p>

        <div
          className="mt-5 rounded-2xl border px-4 py-4"
          style={{ borderColor: `${BRAND_GREEN}33`, backgroundColor: "#F0FDF4" }}
        >
          {ios || (!android && pwa.manualIos) ? (
            <ol className="space-y-3 text-[14px] leading-snug text-gray-700">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0D5C3A]">
                  1
                </span>
                <span>
                  Tap <Share className="inline h-4 w-4 align-text-bottom text-[#0D5C3A]" />{" "}
                  <strong>Share</strong> at the bottom of Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0D5C3A]">
                  2
                </span>
                <span>
                  A list of apps appears first — <strong>scroll down</strong> past them
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0D5C3A]">
                  3
                </span>
                <span className="min-w-0">
                  Tap the row with a <strong>square and +</strong>
                  <span
                    className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#0D5C3A]/25 bg-white align-middle text-[15px] font-bold leading-none text-[#0D5C3A]"
                    aria-hidden
                  >
                    +
                  </span>{" "}
                  — <strong>Add to Home Screen</strong> (lower in the list)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0D5C3A]">
                  4
                </span>
                <span>
                  Open the <strong>{APP_NAME}</strong> icon on your Home Screen
                </span>
              </li>
            </ol>
          ) : (
            <div className="space-y-3 text-[14px] leading-snug text-gray-700">
              {pwa.nativeInstallReady ? (
                <p>
                  Tap <strong>Install</strong> below — Chrome will add {APP_NAME} like a normal app.
                </p>
              ) : (
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0D5C3A]">
                      1
                    </span>
                    <span>
                      Open the browser menu <strong>⋮</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0D5C3A]">
                      2
                    </span>
                    <span>
                      Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>
                    </span>
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>

        <div
          className="mt-4 flex gap-2 rounded-xl border px-3 py-2.5 text-[13px] leading-snug"
          style={{ borderColor: `${BRAND_AMBER}66`, backgroundColor: "#FFFBEB", color: "#92400E" }}
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {MASCOT_NAME}: After install, leave this Safari tab and open {APP_NAME} from your Home
            Screen.
          </span>
        </div>

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
            Continue in browser (Back may leave the app)
          </button>
        </div>
      </div>
    </div>
  );
}
