"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"objects" | "converge" | "logo" | "done">("objects");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("converge"), 800),
      setTimeout(() => setPhase("logo"), 1800),
      setTimeout(() => setPhase("done"), 3000),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const objects = [
    { icon: "🔧", delay: 0, x: -120, y: -80 },
    { icon: "📷", delay: 0.1, x: 100, y: -100 },
    { icon: "🚲", delay: 0.2, x: -80, y: 90 },
    { icon: "⛺", delay: 0.15, x: 110, y: 70 },
    { icon: "🎸", delay: 0.25, x: -130, y: 0 },
    { icon: "🛴", delay: 0.05, x: 120, y: -20 },
  ];

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Floating Objects */}
            {objects.map((obj, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl"
                initial={{ 
                  x: obj.x * 2, 
                  y: obj.y * 2, 
                  opacity: 0,
                  scale: 0.5 
                }}
                animate={
                  phase === "objects"
                    ? { 
                        x: obj.x, 
                        y: obj.y, 
                        opacity: 1,
                        scale: 1,
                      }
                    : phase === "converge" || phase === "logo"
                    ? { 
                        x: 0, 
                        y: 0, 
                        opacity: 0,
                        scale: 0.3,
                      }
                    : {}
                }
                transition={{
                  delay: obj.delay,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                <span className="drop-shadow-lg">{obj.icon}</span>
              </motion.div>
            ))}

            {/* Logo */}
            <motion.div
              className="absolute flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                phase === "logo"
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.8 }
              }
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src="/mr-rentano.png"
                alt="Mr. Rentano"
                width={100}
                height={100}
                className="mb-4"
              />
              <h1 className="text-3xl font-bold text-primary">AllByRent</h1>
              <motion.p
                className="text-muted-foreground mt-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Everything rents. Everyone earns.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
