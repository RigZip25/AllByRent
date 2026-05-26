import { motion } from "motion/react";
import qrStory1 from "../../imports/qr_story_1.png";
import qrStory2 from "../../imports/qr_story_2.png";
import qrStory3 from "../../imports/qr_story_3.png";
import { RentanoTip } from "../../components/RentanoTip";

const GREEN = "#0D5C3A";

const STORY_STEPS = [
  {
    image: qrStory1,
    title: "Attach your QR sticker",
    tip: "Print on any paper, cut out and cover with clear tape. Or order waterproof vinyl stickers. Then take a verification photo.",
  },
  {
    image: qrStory2,
    title: "Renter scans on pickup",
    tip: "Timer starts the moment they scan. Both sides have a timestamped record.",
  },
  {
    image: qrStory3,
    title: "Scan on return. Get paid.",
    tip: "Return confirmed. Timer stops. Payment released. Every handoff on record.",
  },
] as const;

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
    <section className="border-b border-gray-100 pb-8">
      <img
        src={image}
        alt=""
        className="mx-auto max-h-[200px] w-full object-contain"
        draggable={false}
      />
      <h3 className="mt-4 text-center text-xl font-bold" style={{ color: GREEN }}>
        {title}
      </h3>
      <RentanoTip className="mt-4" message={tip} />
    </section>
  );
}

export function QRStoryScreen({ onGotIt }: QRStoryScreenProps) {
  return (
    <motion.div
      className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <h2 className="mb-6 text-center text-2xl font-bold" style={{ color: GREEN }}>
          How your QR works
        </h2>

        {STORY_STEPS.map((step) => (
          <StoryBlock
            key={step.title}
            image={step.image}
            title={step.title}
            tip={step.tip}
          />
        ))}
      </div>

      <footer className="shrink-0 border-t border-gray-100 bg-white px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={onGotIt}
          className="btn-primary w-full py-3.5 text-base font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          I got it
        </button>
      </footer>
    </motion.div>
  );
}
