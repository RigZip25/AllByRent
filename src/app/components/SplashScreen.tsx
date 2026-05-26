import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Bike,
  Camera,
  Car,
  Guitar,
  Monitor,
  QrCode,
  Shield,
  Sparkles,
  Tent,
} from "lucide-react";
import rentanoSplashImg from "../../imports/rentano_splash_transparent.png";
import {
  BRAND_AMBER,
  BRAND_GREEN,
  BRAND_GREEN_LIGHT,
  SPLASH_BG_DARK,
  SPLASH_GRADIENT,
} from "../../lib/brand";

/** pulse → fly-in circle → Rentano + 1 spin → title + row → meta */
const T_PULSE_END = 800;
const T_FLYIN_END = 2000;
const T_SPIN_END = 3200;
const T_REVEAL_END = 3800;
const T_META_END = 4200;
const T_AUTO_ADVANCE = 5200;

/** Global size tweak (−15% from previous large layout) */
const S = 0.85;

const ORBIT_RADIUS = Math.round(184 * S);
const ICON_ROW_GAP = Math.round(58 * S);
const ICON_ROW_Y = Math.round(168 * S);
const ICON_BOX = `${5.5 * S}rem`;
const ICON_OFFSET = `${-2.75 * S}rem`;
const FLY_OFFSET = Math.round(640 * S);
const PULSE_START = Math.round(80 * S);
const PULSE_END_BASE = Math.round(280 * S);
const PULSE_END_STEP = Math.round(80 * S);

type Phase = "pulse" | "flyIn" | "spin" | "reveal" | "ready";

const orbitItems: {
  Icon: typeof Camera;
  delay: number;
  from: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}[] = [
  { Icon: Camera, delay: 0, from: "top-left" },
  { Icon: Bike, delay: 0.05, from: "top-right" },
  { Icon: Tent, delay: 0.1, from: "bottom-left" },
  { Icon: Car, delay: 0.14, from: "bottom-right" },
  { Icon: Guitar, delay: 0.18, from: "top-left" },
  { Icon: Monitor, delay: 0.22, from: "top-right" },
];

const getCornerStart = (from: string) => {
  switch (from) {
    case "top-left":
      return { x: -FLY_OFFSET, y: -FLY_OFFSET, opacity: 0, scale: 0.3 };
    case "top-right":
      return { x: FLY_OFFSET, y: -FLY_OFFSET, opacity: 0, scale: 0.3 };
    case "bottom-left":
      return { x: -FLY_OFFSET, y: FLY_OFFSET, opacity: 0, scale: 0.3 };
    case "bottom-right":
      return { x: FLY_OFFSET, y: FLY_OFFSET, opacity: 0, scale: 0.3 };
    default:
      return { x: 0, y: 0, opacity: 0, scale: 0.3 };
  }
};

const getOrbitSlot = (index: number) => {
  const angle = ((index * 360) / orbitItems.length - 90) * (Math.PI / 180);
  return {
    x: Math.cos(angle) * ORBIT_RADIUS,
    y: Math.sin(angle) * ORBIT_RADIUS,
  };
};

const getRowPos = (index: number) => {
  const totalSpan = (orbitItems.length - 1) * ICON_ROW_GAP;
  return {
    x: -totalSpan / 2 + index * ICON_ROW_GAP,
    y: ICON_ROW_Y,
    opacity: 1,
    scale: 0.9,
  };
};

function TrustChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[clamp(0.85rem,3.6vw,1.6rem)] text-white/85">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

type SplashScreenProps = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>("pulse");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("flyIn"), T_PULSE_END);
    const t2 = setTimeout(() => setPhase("spin"), T_FLYIN_END);
    const t3 = setTimeout(() => setPhase("reveal"), T_SPIN_END);
    const t4 = setTimeout(() => setPhase("ready"), T_REVEAL_END);
    const t5 = setTimeout(() => onDone(), T_AUTO_ADVANCE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onDone]);

  /** Full-screen on iOS/PWA: paint under safe-area; only while this screen is mounted */
  useEffect(() => {
    const root = document.documentElement;
    const prevHtmlBg = root.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;

    root.classList.add("splash-v2-active");
    root.style.backgroundColor = SPLASH_BG_DARK;
    document.body.style.backgroundColor = SPLASH_BG_DARK;
    document.body.style.overflow = "hidden";

    return () => {
      root.classList.remove("splash-v2-active");
      root.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const showOrbitRing = phase === "flyIn" || phase === "spin";
  const iconsInRow = phase === "reveal" || phase === "ready";
  const showRentano = phase === "spin" || phase === "reveal" || phase === "ready";
  const showTitle = phase === "reveal" || phase === "ready";
  const showMeta = phase === "ready";

  const flyDuration = (T_FLYIN_END - T_PULSE_END) / 1000;

  return createPortal(
    <div
      className="splash-v2-overlay flex flex-col overflow-hidden text-white"
      style={{ background: SPLASH_GRADIENT }}
    >
      <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-2">
        <div className="relative flex h-[clamp(18.75rem,49dvh,30.5rem)] w-full max-w-[390px] items-center justify-center">
          {phase === "pulse" &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-white/20"
                initial={{ width: PULSE_START, height: PULSE_START, opacity: 0.5 }}
                animate={{
                  width: [PULSE_START, PULSE_END_BASE + i * PULSE_END_STEP],
                  height: [PULSE_START, PULSE_END_BASE + i * PULSE_END_STEP],
                  opacity: [0.35, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}

          <AnimatePresence>
            {showRentano && (
              <motion.img
                src={rentanoSplashImg}
                alt=""
                draggable={false}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 14 }}
                className="absolute left-1/2 top-1/2 z-20 h-[clamp(8.5rem,29vmin,12.35rem)] w-auto max-w-[min(340px,75vw)] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_14px_34px_rgba(0,0,0,0.45)]"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showOrbitRing && (
              <motion.div
                key="orbit-ring"
                className="absolute left-1/2 top-1/2 z-10"
                style={{ width: 0, height: 0 }}
                initial={{ rotate: 0 }}
                animate={{ rotate: phase === "spin" ? 360 : 0 }}
                transition={{
                  duration: phase === "spin" ? (T_SPIN_END - T_FLYIN_END) / 1000 : 0,
                  ease: [0.45, 0, 0.55, 1],
                }}
              >
                {orbitItems.map(({ Icon, delay, from }, index) => {
                  const slot = getOrbitSlot(index);
                  const start = getCornerStart(from);
                  return (
                    <motion.div
                      key={`orbit-${index}`}
                      className="absolute flex items-center justify-center rounded-3xl border-2 border-white/15 bg-white/10 shadow-xl backdrop-blur-sm"
                      style={{
                        width: ICON_BOX,
                        height: ICON_BOX,
                        marginLeft: ICON_OFFSET,
                        marginTop: ICON_OFFSET,
                      }}
                      initial={{ x: start.x, y: start.y, opacity: 0, scale: 0.35, rotate: 0 }}
                      animate={{
                        x: slot.x,
                        y: slot.y,
                        opacity: 1,
                        scale: 1,
                        rotate: phase === "spin" ? -360 : 0,
                      }}
                      transition={{
                        delay,
                        duration:
                          phase === "spin"
                            ? (T_SPIN_END - T_FLYIN_END) / 1000
                            : Math.max(0.55, flyDuration - delay),
                        ease: phase === "spin" ? [0.45, 0, 0.55, 1] : undefined,
                        type: phase === "spin" ? "tween" : "spring",
                        stiffness: 88,
                        damping: 14,
                      }}
                    >
                      <Icon className="h-9 w-9 text-white" strokeWidth={1.75} aria-hidden />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {iconsInRow &&
              orbitItems.map(({ Icon }, index) => (
                <motion.div
                  key={`row-${index}`}
                  className="absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-3xl border-2 border-white/15 bg-white/10 shadow-xl backdrop-blur-sm"
                  style={{
                    width: ICON_BOX,
                    height: ICON_BOX,
                    marginLeft: ICON_OFFSET,
                    marginTop: ICON_OFFSET,
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={getRowPos(index)}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.7,
                    type: "spring",
                    stiffness: 75,
                    damping: 16,
                  }}
                >
                  <Icon className="h-9 w-9 text-white" strokeWidth={1.75} aria-hidden />
                </motion.div>
              ))}
          </AnimatePresence>

          <AnimatePresence>
            {showTitle && (
              <motion.h1
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, type: "spring", stiffness: 110, damping: 16 }}
                className="absolute left-1/2 top-1/2 z-30 max-w-[96vw] -translate-x-1/2 -translate-y-[calc(50%+9.75rem)] text-center whitespace-nowrap text-[clamp(2.35rem,12vw,4rem)] font-extrabold leading-none tracking-tight"
              >
                <span style={{ color: BRAND_GREEN_LIGHT }}>All</span>{" "}
                <span style={{ color: BRAND_AMBER }}>By</span>{" "}
                <span style={{ color: "#fff" }}>
                  Rent<sup className="ml-0.5 text-[0.45em] font-bold text-white/90">™</sup>
                </span>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showMeta && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mt-2 w-full max-w-[390px] px-2 text-center"
            >
              <p className="text-[clamp(1.06rem,4.7vw,2rem)] font-medium leading-snug text-white/90">
                The Social Rental Network
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5">
                <TrustChip icon={<Shield className="h-7 w-7" />} label="Insured" />
                <span className="text-xl text-white/30">·</span>
                <TrustChip icon={<QrCode className="h-7 w-7" />} label="QR Track" />
                <span className="text-xl text-white/30">·</span>
                <TrustChip icon={<Sparkles className="h-7 w-7" />} label="AI Match" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-20 shrink-0 px-5 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="min-h-[3.2rem]" />
      </footer>

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(245, 158, 11, 0.22) 0%, transparent 55%)",
        }}
      />
      </div>
    </div>,
    document.body,
  );
};
