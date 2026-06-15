import { useEffect } from "react";
import { createPortal } from "react-dom";
import evoriosSplashImg from "../../imports/evorios_splash_garage.png";
import { MASCOT_NAME } from "../../lib/brand";

const SPLASH_CANVAS_BG = "#eef2ea";

type SplashScreenProps = {
  onDone: () => void;
  /** `?screen=splash` — only the artwork, no Continue, no auto-advance */
  preview?: boolean;
};

export function SplashScreen({ onDone, preview = false }: SplashScreenProps) {
  useEffect(() => {
    const root = document.documentElement;
    const appRoot = document.getElementById("root");
    const prevHtmlBg = root.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;
    const prevAppRootBg = appRoot?.style.backgroundColor ?? "";

    root.classList.add("splash-v2-active");
    root.style.backgroundColor = SPLASH_CANVAS_BG;
    document.body.style.backgroundColor = SPLASH_CANVAS_BG;
    document.body.style.overflow = "hidden";
    if (appRoot) appRoot.style.backgroundColor = SPLASH_CANVAS_BG;

    return () => {
      root.classList.remove("splash-v2-active");
      root.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.overflow = prevBodyOverflow;
      if (appRoot) appRoot.style.backgroundColor = prevAppRootBg;
    };
  }, []);

  return createPortal(
    <div className="splash-v2-overlay splash-static-overlay flex flex-col overflow-hidden">
      <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
          <img
            src={evoriosSplashImg}
            alt={preview ? "Evorios splash preview" : `${MASCOT_NAME} — open garage showcase`}
            draggable={false}
            className="splash-static-artwork"
          />
        </div>

        {!preview ? (
          <footer className="relative z-20 shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-2">
            <p className="mb-3 text-center text-sm font-medium text-[#0D5C3A]/80">{MASCOT_NAME}</p>
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-2xl bg-[#0D5C3A] px-6 py-3.5 text-[clamp(1rem,4.2vw,1.25rem)] font-semibold text-white transition hover:bg-[#0a4d31] active:scale-[0.99]"
            >
              Continue
            </button>
          </footer>
        ) : (
          <p className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] left-0 right-0 text-center text-xs text-[#0D5C3A]/45">
            Splash preview — replace src/imports/evorios_splash_garage.png
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
