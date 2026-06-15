import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { HandHeart, Home, MapPin } from "lucide-react";
import garageSplashImg from "../../imports/garage.png";
import {
  APP_TAGLINE,
  BRAND_AMBER,
  BRAND_GREEN,
  BRAND_GREEN_LIGHT,
  PRODUCT_METAPHOR,
  SPLASH_BG_DARK,
} from "../../lib/brand";

/** closed → door opens → interior glow → brand → meta (~3.2s) */
const T_DOOR_START = 450;
const T_REVEALED = 1550;
const T_BRAND = 2100;
const T_READY = 2550;
const T_AUTO_ADVANCE = 3200;

const DOOR_PANELS = 4;

type Phase = "closed" | "opening" | "revealed" | "brand" | "ready";

function TrustChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[clamp(0.85rem,3.6vw,1.6rem)] text-white/88">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/12">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function GarageDoor({ open }: { open: boolean }) {
  return (
    <div className="splash-garage-door" aria-hidden>
      {Array.from({ length: DOOR_PANELS }, (_, i) => (
        <motion.div
          key={i}
          className="splash-garage-door-panel"
          initial={false}
          animate={{ y: open ? "-108%" : "0%" }}
          transition={{
            delay: open ? i * 0.07 : 0,
            duration: 0.85,
            ease: [0.33, 0.86, 0.42, 1],
          }}
        />
      ))}
    </div>
  );
}

type SplashScreenProps = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("opening"), T_DOOR_START);
    const t2 = setTimeout(() => setPhase("revealed"), T_REVEALED);
    const t3 = setTimeout(() => setPhase("brand"), T_BRAND);
    const t4 = setTimeout(() => setPhase("ready"), T_READY);
    const t5 = setTimeout(() => onDone(), T_AUTO_ADVANCE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onDone]);

  useEffect(() => {
    const root = document.documentElement;
    const appRoot = document.getElementById("root");
    const prevHtmlBg = root.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyOverflow = document.body.style.overflow;
    const prevAppRootBg = appRoot?.style.backgroundColor ?? "";

    root.classList.add("splash-v2-active");
    root.style.backgroundColor = SPLASH_BG_DARK;
    document.body.style.backgroundColor = SPLASH_BG_DARK;
    document.body.style.overflow = "hidden";
    if (appRoot) appRoot.style.backgroundColor = SPLASH_BG_DARK;

    return () => {
      root.classList.remove("splash-v2-active");
      root.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.overflow = prevBodyOverflow;
      if (appRoot) appRoot.style.backgroundColor = prevAppRootBg;
    };
  }, []);

  const doorOpen = phase !== "closed";
  const showBrand = phase === "brand" || phase === "ready";
  const showMeta = phase === "ready";
  const interiorLit = phase === "revealed" || phase === "brand" || phase === "ready";

  return createPortal(
    <div className="splash-v2-overlay splash-garage-overlay flex flex-col overflow-hidden text-white">
      <div className="splash-v2-safe relative flex min-h-0 flex-1 flex-col">
        <div className="splash-garage-sky" aria-hidden />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-2">
          <div className="splash-garage-stage">
            <motion.div
              className="splash-garage-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: interiorLit ? 1 : 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              aria-hidden
            />

            <motion.img
              src={garageSplashImg}
              alt=""
              draggable={false}
              className="splash-garage-scene"
              initial={{ filter: "brightness(0.62) saturate(0.85)" }}
              animate={{
                filter: interiorLit
                  ? "brightness(1) saturate(1.05)"
                  : "brightness(0.62) saturate(0.85)",
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            <div className="splash-garage-door-frame">
              <GarageDoor open={doorOpen} />
            </div>

            <motion.div
              className="splash-garage-lintel"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: doorOpen ? 0.55 : 0.9 }}
              transition={{ duration: 0.6 }}
              aria-hidden
            />
          </div>

          <AnimatePresence>
            {showBrand && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, type: "spring", stiffness: 110, damping: 18 }}
                className="mt-3 w-full max-w-[390px] text-center"
              >
                <h1 className="whitespace-nowrap text-[clamp(2.35rem,12vw,4rem)] font-extrabold leading-none tracking-tight">
                  <span style={{ color: BRAND_GREEN_LIGHT }}>Evo</span>
                  <span style={{ color: BRAND_AMBER }}>rios</span>
                </h1>
                <p
                  className="mt-1.5 text-[clamp(0.82rem,3.4vw,1.15rem)] font-medium tracking-wide text-white/70"
                  style={{ color: BRAND_GREEN_LIGHT }}
                >
                  {PRODUCT_METAPHOR}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showMeta && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.06 }}
                className="mt-3 w-full max-w-[390px] px-2 text-center"
              >
                <p className="text-[clamp(1.02rem,4.5vw,1.85rem)] font-medium leading-snug text-white/90">
                  {APP_TAGLINE}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5">
                  <TrustChip icon={<Home className="h-7 w-7" />} label="Your garage" />
                  <span className="text-xl text-white/30">·</span>
                  <TrustChip icon={<MapPin className="h-7 w-7" />} label="On the block" />
                  <span className="text-xl text-white/30">·</span>
                  <TrustChip icon={<HandHeart className="h-7 w-7" />} label="Borrow nearby" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="relative z-20 shrink-0 px-5 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))]">
          <div className="min-h-[2.4rem]" />
        </footer>
      </div>
    </div>,
    document.body,
  );
}
