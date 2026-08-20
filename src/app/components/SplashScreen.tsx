import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bike, Camera, Car, Guitar, Home, MapPin, Tent } from "lucide-react";
import mascotImg from "../../imports/rentano_splash_transparent.png";
import evoriosSplashImg from "../../imports/evorios_splash_garage.png";
import { EvoriosWordmark } from "../../components/EvoriosWordmark";
import { BRAND_GREEN, MASCOT_NAME } from "../../lib/brand";
import { useMessages } from "../../lib/i18n/react";
import { dismissNativeKeyboard } from "../../lib/dismissKeyboard";
import { hideNativeSplash } from "../../lib/nativeShell";

/** Light splash — white field so the mascot artwork reads cleanly */
const SPLASH_CANVAS_BG = "#FFFFFF";
const SPLASH_SURFACE =
  "radial-gradient(ellipse 100% 80% at 50% 40%, #ffffff 0%, #f7fbf8 55%, #eef5f1 100%)";

/** Dynamic splash: orbit around mascot → row → title/tagline */
const T_ORBIT_END = 1100;
const T_TITLE_END = 1750;
const T_AUTO_ADVANCE = 2400;

const S = 0.85;
const ICON_ROW_GAP = Math.round(52 * S);
/** Icons settle under the mascot after orbiting. */
const ICON_ROW_Y = Math.round(168 * S);
const ICON_BOX = `${5 * S}rem`;
const ICON_OFFSET = `${-2.5 * S}rem`;
/** Orbit ring centered near Mr. Evorios (mascot sits slightly above mid). */
const ORBIT_CY = -36;
const ORBIT_R = Math.round(118 * S);

type DynamicPhase = "orbit" | "title" | "ready";

const splashIcons: {
  Icon: typeof Camera;
  delay: number;
  angleDeg: number;
}[] = [
  { Icon: Camera, delay: 0, angleDeg: -120 },
  { Icon: Bike, delay: 0.04, angleDeg: -60 },
  { Icon: Tent, delay: 0.08, angleDeg: 0 },
  { Icon: Car, delay: 0.11, angleDeg: 60 },
  { Icon: Guitar, delay: 0.15, angleDeg: 120 },
  { Icon: Home, delay: 0.18, angleDeg: 180 },
];

function orbitPos(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * ORBIT_R,
    y: ORBIT_CY + Math.sin(rad) * ORBIT_R,
  };
}

/** Arc keyframes: rise from center, sweep around Mr. Evorios, land on orbit slot. */
function orbitArc(angleDeg: number, sweepDeg = 200) {
  const steps = 5;
  const xs: number[] = [0];
  const ys: number[] = [ORBIT_CY];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const a = angleDeg - sweepDeg * (1 - t);
    const p = orbitPos(a);
    // Ease radius out from ~35% → full so they clear the mascot.
    const rScale = 0.35 + 0.65 * t;
    xs.push(p.x * rScale + (1 - rScale) * 0);
    ys.push(ORBIT_CY + (p.y - ORBIT_CY) * rScale);
  }
  const end = orbitPos(angleDeg);
  xs[xs.length - 1] = end.x;
  ys[ys.length - 1] = end.y;
  return { x: xs, y: ys };
}

function getRowPos(index: number) {
  const totalSpan = (splashIcons.length - 1) * ICON_ROW_GAP;
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
  const messages = useMessages();

  return (
    <div className="splash-v2-overlay splash-static-overlay flex flex-col overflow-hidden">
      <div className="splash-v2-safe splash-static-layout relative flex min-h-0 flex-1 flex-col">
        <div className="splash-static-hero flex flex-col items-center justify-center gap-3 px-5">
          <h1 className="text-[clamp(2rem,10.5vw,3.25rem)] leading-none">
            <EvoriosWordmark variant="splash-light" />
          </h1>
          <img
            src={mascotImg}
            alt={MASCOT_NAME}
            draggable={false}
            className="h-[min(42vw,12.5rem)] w-[min(42vw,12.5rem)] object-contain select-none"
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[Camera, Bike, Tent, Car, Guitar, Home].map((Icon, i) => (
              <span
                key={i}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#0D5C3A]/15 bg-white shadow-sm"
              >
                <Icon className="h-5 w-5" style={{ color: BRAND_GREEN }} strokeWidth={1.75} />
              </span>
            ))}
          </div>
          <div className="splash-static-copy shrink-0 pt-1 text-center">
            <p className="text-[clamp(0.95rem,4vw,1.15rem)] font-medium leading-snug text-[#0D5C3A]/85">
              {messages.tagline}
            </p>
            <p className="mt-1 text-[clamp(0.82rem,3.5vw,1rem)] font-semibold tracking-wide text-[#0D5C3A]/65">
              {messages.taglineShort}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <TrustChip
                icon={<Home className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />}
                label={messages.splash.chipGarage}
              />
              <span className="text-[#0D5C3A]/25">·</span>
              <TrustChip
                icon={<MapPin className="h-4 w-4 text-[#0D5C3A]" strokeWidth={2} />}
                label={messages.splash.chipBlock}
              />
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
  const messages = useMessages();
  const [phase, setPhase] = useState<DynamicPhase>("orbit");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"), T_ORBIT_END);
    const t2 = setTimeout(() => setPhase("ready"), T_TITLE_END);
    const t3 = setTimeout(() => {
      if (!preview) onDone();
    }, T_AUTO_ADVANCE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone, preview]);

  const showIcons = true;
  const showTitle = phase === "title" || phase === "ready";
  const showTagline = phase === "ready";
  const orbiting = phase === "orbit";

  return (
    <div
      className="splash-v2-overlay splash-light-overlay flex flex-col overflow-hidden"
      style={{ background: SPLASH_SURFACE }}
    >
      <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-2">
          <div className="relative flex h-[clamp(19rem,52dvh,30rem)] w-full max-w-[390px] items-center justify-center">
            {/* Orbit around Mr. Evorios, then settle into the row below */}
            <AnimatePresence>
              {showIcons &&
                splashIcons.map(({ Icon, delay, angleDeg }, index) => {
                  const arc = orbitArc(angleDeg);
                  const row = getRowPos(index);
                  return (
                    <motion.div
                      key={index}
                      className="absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-3xl border-2 border-[#0D5C3A]/12 bg-white shadow-[0_10px_24px_-10px_rgba(13,92,58,0.35)]"
                      style={{
                        width: ICON_BOX,
                        height: ICON_BOX,
                        marginLeft: ICON_OFFSET,
                        marginTop: ICON_OFFSET,
                      }}
                      initial={{ x: 0, y: ORBIT_CY, opacity: 0, scale: 0.25 }}
                      animate={
                        orbiting
                          ? {
                              x: arc.x,
                              y: arc.y,
                              opacity: 1,
                              scale: 1,
                            }
                          : {
                              x: row.x,
                              y: row.y,
                              opacity: row.opacity,
                              scale: row.scale,
                            }
                      }
                      transition={
                        orbiting
                          ? {
                              delay,
                              duration: 0.95,
                              times: [0, 0.22, 0.45, 0.7, 0.88, 1],
                              ease: "easeInOut",
                            }
                          : {
                              type: "spring",
                              stiffness: 95,
                              damping: 16,
                              delay: index * 0.03,
                            }
                      }
                    >
                      <Icon className="h-8 w-8" style={{ color: BRAND_GREEN }} strokeWidth={1.75} aria-hidden />
                    </motion.div>
                  );
                })}
            </AnimatePresence>

            {/* Mascot — orbit center */}
            <motion.div
              className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-[58%]"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, type: "spring", stiffness: 120, damping: 16 }}
            >
              <img
                src={mascotImg}
                alt={MASCOT_NAME}
                draggable={false}
                className="h-[clamp(8.5rem,28vw,11.5rem)] w-[clamp(8.5rem,28vw,11.5rem)] object-contain select-none"
              />
            </motion.div>

            <AnimatePresence>
              {showTitle && (
                <motion.h1
                  initial={{ opacity: 0, y: 14, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, type: "spring", stiffness: 120, damping: 18 }}
                  className="absolute left-1/2 top-1/2 z-30 max-w-[96vw] -translate-x-1/2 -translate-y-[calc(50%+9.6rem)] text-center text-[clamp(2.5rem,13vw,4.25rem)] leading-none"
                >
                  <EvoriosWordmark variant="splash-light" reveal />
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
                <p className="text-[clamp(0.95rem,4.2vw,1.75rem)] font-medium leading-snug text-[#0D5C3A]/90">
                  {messages.tagline}
                </p>
                <p className="mt-2 text-[clamp(0.78rem,3.2vw,1rem)] font-semibold tracking-wide text-[#0D5C3A]/55">
                  {messages.taglineShort}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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

    // Handoff: drop native launch splash once branded React splash is on screen.
    void hideNativeSplash();
    void dismissNativeKeyboard();

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
