import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bike, Camera, Car, Guitar, Home, MapPin, Tent } from "lucide-react";
import evoriosSplashImg from "../../imports/evorios_splash_garage.png";
import {
  APP_NAME,
  APP_TAGLINE,
  BRAND_AMBER,
  BRAND_GREEN_LIGHT,
  MASCOT_NAME,
  PRODUCT_METAPHOR,
  SPLASH_BG_DARK,
  SPLASH_GRADIENT,
} from "../../lib/brand";

const SPLASH_CANVAS_BG = "#eef2ea";

/** Dynamic splash: fly-in → title → tagline (~2.6s) */
const T_FLYIN_END = 700;
const T_TITLE_END = 1400;
const T_READY_END = 2000;
const T_AUTO_ADVANCE = 2600;

const S = 0.85;
const ICON_ROW_GAP = Math.round(52 * S);
const ICON_ROW_Y = Math.round(150 * S);
const ICON_BOX = `${5 * S}rem`;
const ICON_OFFSET = `${-2.5 * S}rem`;
const FLY_OFFSET = Math.round(520 * S);

type DynamicPhase = "flyIn" | "title" | "ready";

const flyItems: {
  Icon: typeof Camera;
  delay: number;
  from: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}[] = [
  { Icon: Camera, delay: 0, from: "top-left" },
  { Icon: Bike, delay: 0.04, from: "top-right" },
  { Icon: Tent, delay: 0.08, from: "bottom-left" },
  { Icon: Car, delay: 0.11, from: "bottom-right" },
  { Icon: Guitar, delay: 0.14, from: "top-left" },
  { Icon: Home, delay: 0.17, from: "top-right" },
];

function getCornerStart(from: string) {
  switch (from) {
    case "top-left":
      return { x: -FLY_OFFSET, y: -FLY_OFFSET, opacity: 0, scale: 0.35 };
    case "top-right":
      return { x: FLY_OFFSET, y: -FLY_OFFSET, opacity: 0, scale: 0.35 };
    case "bottom-left":
      return { x: -FLY_OFFSET, y: FLY_OFFSET, opacity: 0, scale: 0.35 };
    case "bottom-right":
      return { x: FLY_OFFSET, y: FLY_OFFSET, opacity: 0, scale: 0.35 };
    default:
      return { x: 0, y: 0, opacity: 0, scale: 0.35 };
  }
}

function getRowPos(index: number) {
  const totalSpan = (flyItems.length - 1) * ICON_ROW_GAP;
  return {
    x: -totalSpan / 2 + index * ICON_ROW_GAP,
    y: ICON_ROW_Y,
    opacity: 1,
    scale: 0.88,
  };
}

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
  /** `?screen=splash` — static full layout, no auto-advance */
  preview?: boolean;
  /** `?screen=splash&art=1` — artwork file only */
  artOnly?: boolean;
  /** `?screen=splash&dynamic=1` — animated splash, no auto-advance */
  dynamicPreview?: boolean;
};

function SplashArtOnly() {
  return (
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
          Art only — <code className="rounded bg-[#0D5C3A]/8 px-1">evorios_splash_garage.png</code>
        </p>
      </div>
    </div>
  );
}

function SplashStaticPreview() {
  return (
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
          <h1
            className="text-[clamp(2rem,10.5vw,3.25rem)] font-extrabold leading-none tracking-tight"
            style={{ color: BRAND_GREEN_LIGHT }}
          >
            {APP_NAME}
          </h1>
          <p className="mt-1 text-[clamp(0.82rem,3.5vw,1rem)] font-semibold tracking-wide text-[#0D5C3A]/75">
            {PRODUCT_METAPHOR}
          </p>
          <p className="mt-2 text-[clamp(0.95rem,4vw,1.15rem)] font-medium leading-snug text-[#0D5C3A]/85">
            {APP_TAGLINE}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <TrustChip icon={<Home className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />} label="Your garage" />
            <span className="text-[#0D5C3A]/25">·</span>
            <TrustChip icon={<MapPin className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />} label="On the block" />
          </div>
        </div>

        <footer className="shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-2">
          <p className="text-center text-xs text-[#0D5C3A]/50">Static splash preview — no auto-advance</p>
        </footer>
      </div>
    </div>
  );
}

function SplashDynamic({ onDone, preview }: { onDone: () => void; preview: boolean }) {
  const [phase, setPhase] = useState<DynamicPhase>("flyIn");

  useEffect(() => {
    if (preview) return;
    const t1 = setTimeout(() => setPhase("title"), T_FLYIN_END);
    const t2 = setTimeout(() => setPhase("ready"), T_TITLE_END);
    const t3 = setTimeout(() => onDone(), T_AUTO_ADVANCE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone, preview]);

  const showIcons = phase === "flyIn" || phase === "title" || phase === "ready";
  const showTitle = phase === "title" || phase === "ready";
  const showTagline = phase === "ready";
  const flyDuration = T_FLYIN_END / 1000;

  return (
    <div className="splash-v2-overlay flex flex-col overflow-hidden text-white" style={{ background: SPLASH_GRADIENT }}>
      <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-2">
          <div className="relative flex h-[clamp(17rem,46dvh,28rem)] w-full max-w-[390px] items-center justify-center">
            <AnimatePresence>
              {showIcons &&
                flyItems.map(({ Icon, delay, from }, index) => {
                  const start = getCornerStart(from);
                  const row = getRowPos(index);
                  return (
                    <motion.div
                      key={index}
                      className="absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-3xl border-2 border-white/15 bg-white/10 shadow-xl backdrop-blur-sm"
                      style={{
                        width: ICON_BOX,
                        height: ICON_BOX,
                        marginLeft: ICON_OFFSET,
                        marginTop: ICON_OFFSET,
                      }}
                      initial={{ x: start.x, y: start.y, opacity: 0, scale: start.scale }}
                      animate={{ x: row.x, y: row.y, opacity: row.opacity, scale: row.scale }}
                      transition={{
                        delay,
                        duration: flyDuration,
                        type: "spring",
                        stiffness: 95,
                        damping: 16,
                      }}
                    >
                      <Icon className="h-8 w-8 text-white" strokeWidth={1.75} aria-hidden />
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            <AnimatePresence>
              {showTitle && (
                <motion.h1
                  initial={{ opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, type: "spring", stiffness: 120, damping: 18 }}
                  className="absolute left-1/2 top-1/2 z-30 max-w-[96vw] -translate-x-1/2 -translate-y-[calc(50%+8.5rem)] text-center text-[clamp(2.5rem,13vw,4.25rem)] font-extrabold leading-none tracking-tight"
                >
                  <span style={{ color: BRAND_GREEN_LIGHT }}>{APP_NAME}</span>
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showTagline && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-1 w-full max-w-[390px] px-2 text-center"
              >
                <p className="text-[clamp(0.95rem,4.2vw,1.75rem)] font-medium leading-snug text-white/92">
                  {APP_TAGLINE}
                </p>
                <p
                  className="mt-2 text-[clamp(0.78rem,3.2vw,1rem)] font-semibold tracking-wide"
                  style={{ color: BRAND_AMBER }}
                >
                  {PRODUCT_METAPHOR}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {preview ? (
          <footer className="relative z-20 shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <p className="text-center text-xs text-white/50">Dynamic splash preview — no auto-advance</p>
          </footer>
        ) : null}

        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.12, 0.24, 0.12] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(245, 158, 11, 0.2) 0%, transparent 55%)",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function SplashScreen({
  onDone,
  preview = false,
  artOnly = false,
  dynamicPreview = false,
}: SplashScreenProps) {

  useEffect(() => {
    const root = document.documentElement;
    const appRoot = document.getElementById("root");
    const prevHtmlBg = root.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;
    const prevAppRootBg = appRoot?.style.backgroundColor ?? "";

    const canvas =
      artOnly || (preview && !dynamicPreview) ? SPLASH_CANVAS_BG : SPLASH_BG_DARK;

    root.classList.add("splash-v2-active");
    root.style.backgroundColor = canvas;
    document.body.style.backgroundColor = canvas;
    document.body.style.overflow = "hidden";
    if (appRoot) appRoot.style.backgroundColor = canvas;

    return () => {
      root.classList.remove("splash-v2-active");
      root.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.overflow = prevBodyOverflow;
      if (appRoot) appRoot.style.backgroundColor = prevAppRootBg;
    };
  }, [artOnly, preview, dynamicPreview]);

  const content = artOnly ? (
    <SplashArtOnly />
  ) : dynamicPreview ? (
    <SplashDynamic onDone={onDone} preview />
  ) : preview ? (
    <SplashStaticPreview />
  ) : (
    <SplashDynamic onDone={onDone} preview={false} />
  );

  return createPortal(content, document.body);
}
