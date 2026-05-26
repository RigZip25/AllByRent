/**
 * Archived 2026-05 — original emoji fly-in splash (replaced by green Rentano splash).
 * Not imported by the app. Kept for reference only.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const items = [
  { icon: "📷", delay: 0, from: "top-left" },
  { icon: "🖥️", delay: 0.05, from: "top-right" },
  { icon: "🚲", delay: 0.1, from: "bottom-left" },
  { icon: "🎸", delay: 0.15, from: "bottom-right" },
  { icon: "⛺", delay: 0.2, from: "top-left" },
  { icon: "🚤", delay: 0.25, from: "top-right" },
  { icon: "🏋️", delay: 0.08, from: "bottom-left" },
  { icon: "🚚", delay: 0.12, from: "bottom-right" },
  { icon: "🏠", delay: 0.18, from: "top-left" },
  { icon: "🛠️", delay: 0.22, from: "top-right" },
  { icon: "🎉", delay: 0.06, from: "bottom-left" },
  { icon: "🌱", delay: 0.16, from: "bottom-right" },
];

const getInitialPosition = (from: string) => {
  switch (from) {
    case "top-left":
      return { x: -400, y: -400 };
    case "top-right":
      return { x: 400, y: -400 };
    case "bottom-left":
      return { x: -400, y: 400 };
    case "bottom-right":
      return { x: 400, y: 400 };
    default:
      return { x: 0, y: 0 };
  }
};

const getPatternPositions = (index: number, pattern: number) => {
  const patterns = [
    (i: number) => {
      const angle = (i * 360) / 12;
      const radius = 100;
      return {
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
      };
    },
    (i: number) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      return {
        x: (col - 1.5) * 80,
        y: (row - 1.5) * 80,
      };
    },
    (i: number) => {
      const angle = (i * 360) / 12;
      const radius = 60 + (i % 3) * 40;
      return {
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
      };
    },
  ];

  return patterns[pattern](index);
};

export function SplashScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const [pattern, setPattern] = useState(0);
  const [showItems, setShowItems] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showBy, setShowBy] = useState(false);
  const [showRent, setShowRent] = useState(false);
  const [solidColor, setSolidColor] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const pattern1Timer = setTimeout(() => setPattern(1), 1200);
    const pattern2Timer = setTimeout(() => setPattern(2), 2000);
    const hideItemsTimer = setTimeout(() => setShowItems(false), 2800);
    const allTimer = setTimeout(() => setShowAll(true), 3200);
    const byTimer = setTimeout(() => setShowBy(true), 3600);
    const rentTimer = setTimeout(() => setShowRent(true), 4000);
    const solidTimer = setTimeout(() => setSolidColor(true), 4800);
    const taglineTimer = setTimeout(() => setShowTagline(true), 5000);
    const buttonTimer = setTimeout(() => setShowButton(true), 5400);

    return () => {
      clearTimeout(pattern1Timer);
      clearTimeout(pattern2Timer);
      clearTimeout(hideItemsTimer);
      clearTimeout(allTimer);
      clearTimeout(byTimer);
      clearTimeout(rentTimer);
      clearTimeout(solidTimer);
      clearTimeout(taglineTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div className="screen bg-background flex flex-col items-center justify-between card-padding sm:p-6 pb-8 overflow-hidden relative">
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
        <div className="relative w-full h-[clamp(12rem,38dvh,24rem)] flex items-center justify-center">
          <AnimatePresence>
            {showItems &&
              items.map((item, index) => {
                const initial = getInitialPosition(item.from);
                const currentPos = getPatternPositions(index, pattern);

                return (
                  <motion.div
                    key={index}
                    initial={{ x: initial.x, y: initial.y, opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      x: currentPos.x,
                      y: currentPos.y,
                      opacity: 1,
                      scale: 1,
                      rotate: pattern * 120,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                      transition: { duration: 0.4 },
                    }}
                    transition={{
                      delay: item.delay,
                      duration: 0.8,
                      type: "spring",
                      stiffness: 60,
                      damping: 15,
                    }}
                    className="absolute text-4xl"
                  >
                    {item.icon}
                  </motion.div>
                );
              })}
          </AnimatePresence>

          <div className="text-center">
            <motion.div className="mb-4 flex items-center justify-center gap-3 text-[42px] font-extrabold">
              <AnimatePresence>
                {showAll && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0, x: -20 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: 0,
                      color: solidColor ? "#1A9E6E" : ["#1A9E6E", "#F0B429", "#1A9E6E"],
                    }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 120,
                      color: {
                        duration: 2,
                        repeat: solidColor ? 0 : Infinity,
                        ease: "linear",
                      },
                    }}
                  >
                    All
                  </motion.span>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showBy && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0, y: -20 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: 0,
                      color: solidColor ? "#1A9E6E" : ["#F0B429", "#1A9E6E", "#F0B429"],
                    }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 120,
                      color: {
                        duration: 2,
                        repeat: solidColor ? 0 : Infinity,
                        ease: "linear",
                        delay: 0.3,
                      },
                    }}
                  >
                    By
                  </motion.span>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showRent && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0, x: 20 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: 0,
                      color: solidColor ? "#1A9E6E" : ["#1A9E6E", "#F0B429", "#1A9E6E"],
                    }}
                    transition={{
                      duration: 0.5,
                      type: "spring",
                      stiffness: 120,
                      color: {
                        duration: 2,
                        repeat: solidColor ? 0 : Infinity,
                        ease: "linear",
                        delay: 0.6,
                      },
                    }}
                  >
                    Rent
                    <motion.sup
                      className="text-2xl ml-1"
                      animate={{
                        color: solidColor ? "#1A9E6E" : ["#1A9E6E", "#F0B429", "#1A9E6E"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: solidColor ? 0 : Infinity,
                        ease: "linear",
                        delay: 0.8,
                      }}
                    >
                      ™
                    </motion.sup>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {showTagline && (
                <>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 text-[18px] text-muted-foreground sm:mb-8"
                  >
                    The Social Rental Network
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex items-center justify-center gap-4 px-4 py-3 text-[15px] text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] leading-none">🛡</span>
                      <span>Insured</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] leading-none">◻</span>
                      <span>QR Track</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] leading-none">✦</span>
                      <span>AI Match</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onGetStarted}
          className="btn-primary mb-12 w-full shrink-0 bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          Get Started →
        </motion.button>
      )}

      <motion.div
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(26, 158, 110, 0.08) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
