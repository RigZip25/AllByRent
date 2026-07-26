import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bike, Camera, Car, Guitar, Home, MapPin, Tent } from "lucide-react";
import mascotImg from "../../imports/rentano_splash_transparent.png";
import evoriosSplashImg from "../../imports/evorios_splash_garage.png";
import { EvoriosWordmark } from "../../components/EvoriosWordmark";
import {
  APP_TAGLINE,
  BRAND_GREEN,
  MASCOT_NAME,
  PRODUCT_METAPHOR,
} from "../../lib/brand";

/** Light splash canvas — white field, green accents */
const SPLASH_CANVAS_BG = "#F7FBF8";
const SPLASH_SURFACE =
  "radial-gradient(ellipse 90% 70% at 50% 32%, #ffffff 0%, #F0F7F3 48%, #E8F2EC 100%)";

/** Dynamic splash: mascot → title → tagline (~2.7s) */
const T_FLYIN_END = 800;
const T_TITLE_END = 1500;
const T_AUTO_ADVANCE = 2700;

type DynamicPhase = "flyIn" | "title" | "ready";

const orbitIcons: {
  Icon: typeof Camera;
  delay: number;
  angleDeg: number;
}[] = [
  { Icon: Camera, delay: 0.02, angleDeg: -125 },
  { Icon: Bike, delay: 0.06, angleDeg: -70 },
  { Icon: Tent, delay: 0.1, angleDeg: -20 },
  { Icon: Car, delay: 0.14, angleDeg: 35 },
  { Icon: Guitar, delay: 0.18, angleDeg: 90 },
  { Icon: Home, delay: 0.22, angleDeg: 145 },
];

function orbitPos(angleDeg: number, radiusPx: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * radiusPx,
    y: Math.sin(rad) * radiusPx,
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

function MascotCircle({
  className = "",
  sizeClass = "h-[min(52vw,15.5rem)] w-[min(52vw,15.5rem)]",
}: {
  className?: string;
  sizeClass?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-full",
        "bg-gradient-to-b from-white to-[#E8F5EE]",
        "ring-[3px] ring-[#0D5C3A]/18",
        "shadow-[0_18px_40px_-12px_rgba(13,92,58,0.28)]",
        sizeClass,
        className,
      ].join(" ")}
    >
      <img
        src={mascotImg}
        alt={MASCOT_NAME}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-[center_18%] select-none"
      />
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
        <div className="splash-static-hero flex flex-col items-center justify-center gap-5">
          <MascotCircle />
          <div className="splash-static-copy shrink-0 px-5 text-center">
            <h1 className="text-[clamp(2rem,10.5vw,3.25rem)] leading-none">
              <EvoriosWordmark variant="splash-light" />
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
  const orbitRadius = 128;

  return (
    <div
      className="splash-v2-overlay splash-light-overlay flex flex-col overflow-hidden"
      style={{ background: SPLASH_SURFACE }}
    >
      <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, rgba(13,92,58,0.07) 0%, transparent 42%), radial-gradient(circle at 82% 70%, rgba(245,158,11,0.08) 0%, transparent 40%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-6">
          <div className="relative mb-2 flex h-[min(58vw,17.5rem)] w-full max-w-[390px] items-center justify-center">
            <AnimatePresence>
              {showIcons &&
                orbitIcons.map(({ Icon, delay, angleDeg }, index) => {
                  const pos = orbitPos(angleDeg, orbitRadius);
                  return (
                    <motion.div
                      key={index}
                      className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#0D5C3A]/12 bg-white shadow-[0_8px_18px_-8px_rgba(13,92,58,0.35)]"
                      style={{ marginLeft: -22, marginTop: -22 }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                      animate={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
                      transition={{
                        delay,
                        duration: 0.75,
                        type: "spring",
                        stiffness: 110,
                        damping: 14,
                      }}
                    >
                      <Icon className="h-[1.15rem] w-[1.15rem]" style={{ color: BRAND_GREEN }} strokeWidth={2} aria-hidden />
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            <motion.div
              className="relative z-20"
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, type: "spring", stiffness: 120, damping: 16 }}
            >
              <MascotCircle />
            </motion.div>
          </div>

          <div className="mt-8 flex min-h-[7.5rem] w-full max-w-[390px] flex-col items-center justify-start px-2 text-center">
            <AnimatePresence>
              {showTitle && (
                <motion.h1
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, type: "spring", stiffness: 120, damping: 18 }}
                  className="text-[clamp(2.35rem,11vw,3.6rem)] leading-none"
                >
                  <EvoriosWordmark variant="splash-light" reveal />
                </motion.h1>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showTagline && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-3 w-full"
                >
                  <p className="text-[clamp(0.95rem,4.2vw,1.2rem)] font-medium leading-snug text-[#0D5C3A]/88">
                    {APP_TAGLINE}
                  </p>
                  <p className="mt-2 text-[clamp(0.78rem,3.2vw,1rem)] font-semibold tracking-wide text-[#0D5C3A]/55">
                    {PRODUCT_METAPHOR}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {preview ? (
          <footer className="relative z-20 shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <p className="text-center text-xs text-[#0D5C3A]/45">Dynamic splash preview — no auto-advance</p>
          </footer>
        ) : null}
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

    root.classList.add("splash-v2-active", "splash-v2-light");
    root.style.backgroundColor = SPLASH_CANVAS_BG;
    document.body.style.backgroundColor = SPLASH_CANVAS_BG;
    document.body.style.overflow = "hidden";
    if (appRoot) appRoot.style.backgroundColor = SPLASH_CANVAS_BG;

    return () => {
      root.classList.remove("splash-v2-active", "splash-v2-light");
      root.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.overflow = prevBodyOverflow;
      if (appRoot) appRoot.style.backgroundColor = prevAppRootBg;
    };
  }, []);

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
