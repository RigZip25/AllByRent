import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import qrStory1 from "../../imports/qr_story_1.png";
import qrStory2 from "../../imports/qr_story_2.png";
import qrStory3 from "../../imports/qr_story_3.png";
import { MASCOT_NAME } from "../../lib/brand";
import { RentanoHint } from "../../components/RentanoHint";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";

type QRStoryScreenProps = {
  onGotIt: () => void;
};

function StoryBlock({
  image,
  title,
  tip,
}: {
  image: string;
  title: string;
  tip: string;
}) {
  return (
    <section className="pb-2">
      <img
        src={image}
        alt=""
        className="mx-auto max-h-[200px] w-full object-contain"
        draggable={false}
      />
      <h3 className="mt-4 text-center text-xl font-bold" style={{ color: GREEN }}>
        {title}
      </h3>
      <RentanoHint className="mt-4" hint={tip} showTapLabel />
    </section>
  );
}

/** Educational slides only — printable PDF is on the next QR sticker screen. */
export function QRStoryScreen({ onGotIt }: QRStoryScreenProps) {
  const { listingQr: t } = useMessages();
  const [step, setStep] = useState(0);
  const storySteps = useMemo(
    () =>
      [
        { image: qrStory1, title: t.stepSmartTitle, tip: t.stepSmartTip },
        { image: qrStory2, title: t.stepPickupTitle, tip: t.stepPickupTip },
        { image: qrStory3, title: t.stepReturnTitle, tip: t.stepReturnTip },
      ] as const,
    [t],
  );
  const active = storySteps[step]!;

  return (
    <motion.div
      className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <h2 className="mb-2 text-center text-2xl font-bold" style={{ color: GREEN }}>
          {t.storyTitle}
        </h2>
        <p className="mb-5 text-center text-[13px] text-gray-500">
          {t.storySubtitle(MASCOT_NAME)}
        </p>

        <StoryBlock image={active.image} title={active.title} tip={active.tip} />
      </div>

      <footer className="shrink-0 border-t border-gray-100 bg-white px-4 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>{t.slideOf(step + 1, 3)}</span>
          <span className="rounded-full bg-gray-100 px-2 py-1">{t.mascotGuided(MASCOT_NAME)}</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex min-h-[48px] w-12 items-center justify-center rounded-2xl border bg-white disabled:opacity-50"
            style={{ borderColor: "#E8E6E0" }}
            aria-label={t.prevSlideAria}
          >
            <ChevronLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 text-base font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t.next}
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onGotIt}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl px-4 text-base font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {t.continueToSticker}
            </button>
          )}
        </div>
      </footer>
    </motion.div>
  );
}
