import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import qrStory1 from "../../imports/qr_story_1.png";
import qrStory2 from "../../imports/qr_story_2.png";
import qrStory3 from "../../imports/qr_story_3.png";
import { MASCOT_NAME, QR_PDF_FILENAMES } from "../../lib/brand";
import { RentanoHint } from "../../components/RentanoHint";
import { generateQRStickerPdf } from "../../lib/generateQRSticker";

const GREEN = "#0D5C3A";

const STORY_STEPS = [
  {
    image: qrStory1,
    title: "Your item is now a smart asset",
    tip: "This QR links the physical item to a single listing. Scans create a timestamped trail: pickup, return, and any issues.",
  },
  {
    image: qrStory2,
    title: "Renter scans on pickup",
    tip: "The scan confirms they received the item. The rental timer starts and both sides see the same record.",
  },
  {
    image: qrStory3,
    title: "Renter scans on return",
    tip: "The scan confirms the item is returned. It closes out the rental and keeps everyone protected.",
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

export function QRStoryScreen({ onGotIt }: QRStoryScreenProps) {
  const [step, setStep] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const active = STORY_STEPS[step]!;

  const handleDownload = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      // Generic sheet — host will also get per-listing PDF on the next screen.
      const generated = await generateQRStickerPdf([], { filename: QR_PDF_FILENAMES.stickers });
      if (!generated) throw new Error("No PDF generated");
      window.open(generated.objectUrl, "_blank", "noopener,noreferrer");
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <motion.div
      className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <h2 className="mb-2 text-center text-2xl font-bold" style={{ color: GREEN }}>
          How your QR works
        </h2>
        <p className="mb-5 text-center text-[13px] text-gray-500">
          {MASCOT_NAME} will guide you through 3 quick slides.
        </p>

        <StoryBlock image={active.image} title={active.title} tip={active.tip} />

        <div className="mt-5 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
          <p className="text-sm font-semibold text-gray-900">Printable sticker PDF</p>
          <p className="mt-1 text-xs text-gray-500">
            Download a printable QR sticker sheet (Avery-compatible). You’ll also be able to download
            your item’s QR on the next step.
          </p>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={pdfLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ borderColor: `${GREEN}33`, color: GREEN }}
          >
            <Download className="h-4 w-4" />
            {pdfLoading ? "Preparing PDF…" : "Download PDF"}
          </button>
          {pdfError ? (
            <p className="mt-2 text-xs text-amber-700">{pdfError}</p>
          ) : null}
        </div>
      </div>

      <footer className="shrink-0 border-t border-gray-100 bg-white px-4 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between text-xs font-semibold text-gray-400">
          <span>Slide {step + 1} of 3</span>
          <span className="rounded-full bg-gray-100 px-2 py-1">{MASCOT_NAME} guided</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex min-h-[48px] w-12 items-center justify-center rounded-2xl border bg-white disabled:opacity-50"
            style={{ borderColor: "#E8E6E0" }}
            aria-label="Previous slide"
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
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onGotIt}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl px-4 text-base font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              Continue
            </button>
          )}
        </div>
      </footer>
    </motion.div>
  );
}
