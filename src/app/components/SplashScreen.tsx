import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HandHeart, Home, MapPin } from "lucide-react";
import evoriosSplashImg from "../../imports/evorios_splash_garage.png";
import {
  APP_TAGLINE,
  BRAND_AMBER,
  BRAND_GREEN,
  BRAND_GREEN_LIGHT,
  MASCOT_NAME,
  PRODUCT_METAPHOR,
} from "../../lib/brand";

const SPLASH_CANVAS_BG = "#eef2ea";

function TrustChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[clamp(0.78rem,3.2vw,0.95rem)] font-medium text-[#0D5C3A]/88">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D5C3A]/10">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

type SplashScreenProps = {
  onDone: () => void;
  /** `?screen=splash` — full layout, no Continue, no auto-advance */
  preview?: boolean;
  /** `?screen=splash&art=1` — artwork file only (for PNG review) */
  artOnly?: boolean;
};

export function SplashScreen({ onDone, preview = false, artOnly = false }: SplashScreenProps) {
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

  if (artOnly) {
    return createPortal(
      <div className="splash-v2-overlay splash-static-overlay flex flex-col overflow-hidden">
        <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
            <img
              src={evoriosSplashImg}
              alt="Evorios splash artwork"
              draggable={false}
              className="splash-static-artwork"
            />
          </div>
          <p className="pointer-events-none shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] text-center text-xs text-[#0D5C3A]/45">
            Art only — add <code className="rounded bg-[#0D5C3A]/8 px-1">evorios_splash_garage.png</code>
          </p>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="splash-v2-overlay splash-static-overlay flex flex-col overflow-hidden">
      <div className="splash-v2-safe splash-static-layout relative flex min-h-0 flex-1 flex-col">
        <div className="splash-static-hero">
          <img
            src={evoriosSplashImg}
            alt={`${MASCOT_NAME} — open garage showcase`}
            draggable={false}
            className="splash-static-hero-img"
          />
        </div>

        <div className="splash-static-copy shrink-0 px-5 pb-2 pt-1 text-center">
          <h1 className="whitespace-nowrap text-[clamp(2rem,10.5vw,3.25rem)] font-extrabold leading-none tracking-tight">
            <span style={{ color: BRAND_GREEN_LIGHT }}>Evo</span>
            <span style={{ color: BRAND_AMBER }}>rios</span>
          </h1>
          <p className="mt-1 text-[clamp(0.82rem,3.5vw,1rem)] font-semibold tracking-wide text-[#0D5C3A]/75">
            {PRODUCT_METAPHOR}
          </p>
          <p className="mt-2 text-[clamp(0.9rem,3.8vw,1.05rem)] font-medium text-[#0D5C3A]/90">
            with {MASCOT_NAME}
          </p>
          <p className="mt-2 text-[clamp(0.95rem,4vw,1.15rem)] font-medium leading-snug text-[#0D5C3A]/85">
            {APP_TAGLINE}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <TrustChip icon={<Home className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />} label="Your garage" />
            <span className="text-[#0D5C3A]/25">·</span>
            <TrustChip icon={<MapPin className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />} label="On the block" />
            <span className="text-[#0D5C3A]/25">·</span>
            <TrustChip
              icon={<HandHeart className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />}
              label="Borrow nearby"
            />
          </div>
        </div>

        <footer className="relative z-20 shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2">
          {preview ? (
            <p className="text-center text-xs text-[#0D5C3A]/50">
              Splash preview — full layout, no auto-advance
            </p>
          ) : (
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-2xl bg-[#0D5C3A] px-6 py-3.5 text-[clamp(1rem,4.2vw,1.25rem)] font-semibold text-white transition hover:bg-[#0a4d31] active:scale-[0.99]"
            >
              Continue
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
