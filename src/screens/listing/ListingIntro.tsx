import { useState } from "react";
import { motion } from "motion/react";
import { RentanoTip } from "../../components/RentanoTip";
import listingSnap from "../../imports/listing_snap.png";
import listingMagic from "../../imports/listing_magic.png";
import listingShare from "../../imports/listing_share.png";

const PRIMARY_GREEN = "#0D5C3A";
const SWIPE_THRESHOLD = 60;

const SLIDES = [
  {
    image: listingSnap,
    title: "Snap a photo",
    tip: "Snap a photo — I'll take it from there.",
  },
  {
    image: listingMagic,
    title: "Your listing, ready in seconds",
    tip: "I filled everything in. Just check if I got it right.",
  },
  {
    image: listingShare,
    title: "Go live. Your neighbors are already looking.",
    tip: "Built-in tools help you reach more people — share, boost, or just let the platform work for you.",
  },
] as const;

export function ListingIntro({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  const goNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide((current) => current + 1);
      return;
    }
    onStart();
  };

  const goPrev = () => {
    if (activeSlide > 0) {
      setActiveSlide((current) => current - 1);
    }
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      goNext();
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      goPrev();
    }
  };

  const slideWidthPercent = 100 / SLIDES.length;

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden bg-white">
      <header
        className="flex shrink-0 justify-end border-b px-4 py-2"
        style={{ borderColor: `${PRIMARY_GREEN}33` }}
      >
        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-medium text-[#9CA3AF] transition-colors hover:text-[#374151]"
        >
          Skip
        </button>
      </header>

      <motion.div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
          className="relative min-h-0 flex-1 overflow-hidden"
        >
          <motion.div
            className="flex h-full"
            style={{ width: `${SLIDES.length * 100}%` }}
            animate={{ x: `-${activeSlide * slideWidthPercent}%` }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {SLIDES.map((slide) => (
              <div
                key={slide.title}
                className="flex h-full shrink-0 items-center justify-center"
                style={{ width: `${slideWidthPercent}%` }}
              >
                <img
                  src={slide.image}
                  alt=""
                  className="max-h-[42vh] w-full max-w-[320px] object-contain"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>

        <h2
          className="mt-4 shrink-0 text-center text-[26px] font-bold leading-tight"
          style={{ color: PRIMARY_GREEN }}
        >
          {SLIDES[activeSlide].title}
        </h2>

        <div className="mt-5 flex items-center justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              className="h-2 rounded-full transition-all"
              style={{
                width: index === activeSlide ? 20 : 8,
                backgroundColor:
                  index === activeSlide ? PRIMARY_GREEN : "#D1D5DB",
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <RentanoTip
          key={`tip-${activeSlide}`}
          message={SLIDES[activeSlide].tip}
          className="mt-4"
        />

        <button
          type="button"
          onClick={goNext}
          className="btn-primary mt-4 w-full text-white"
          style={{ backgroundColor: PRIMARY_GREEN }}
        >
          {activeSlide === SLIDES.length - 1 ? "Continue" : "Next"}
        </button>
      </motion.div>
    </div>
  );
}
