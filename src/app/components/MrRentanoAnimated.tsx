import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import frame1 from "../../imports/image-7.png";
import frame2 from "../../imports/image-8.png";
import frame3 from "../../imports/image-9.png";
import frame4 from "../../imports/image-10.png";

interface MrRentanoAnimatedProps {
  size?: number;
  animate?: boolean;
}

export function MrRentanoAnimated({ size = 140, animate = true }: MrRentanoAnimatedProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  const frames = [frame1, frame2, frame3, frame4];

  useEffect(() => {
    if (!animate) return;

    // Sequence with timing: wave -> tip -> off -> (hold) -> tip -> wave -> (hold)
    const sequence = [
      { frame: 0, duration: 1000 },  // Wave - hold
      { frame: 1, duration: 800 },   // Start tipping
      { frame: 2, duration: 800 },   // Hat off
      { frame: 3, duration: 1500 },  // Normal - hold longer
      { frame: 2, duration: 800 },   // Hat off again
      { frame: 1, duration: 800 },   // Tip back
      { frame: 0, duration: 2000 },  // Wave - hold longest
    ];

    let currentIndex = 0;

    const scheduleNext = () => {
      const current = sequence[currentIndex];
      setFrameIndex(current.frame);

      currentIndex = (currentIndex + 1) % sequence.length;

      return setTimeout(scheduleNext, current.duration);
    };

    const timeout = scheduleNext();

    return () => clearTimeout(timeout);
  }, [animate]);

  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={frameIndex}
        src={frames[frameIndex]}
        alt="Mr. Rentano"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "contain",
        }}
      />
    </AnimatePresence>
  );
}
