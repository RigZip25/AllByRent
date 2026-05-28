import { useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { useAuth } from "../../hooks/AuthProvider";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import { getProfileCity, savePublishedListingRemote, savePublishedListing } from "../../lib/listingStorage";
import { getListingDisplayTitle } from "../../lib/listingQr";
import { analyzeListingMediaPhotos } from "./listingAnalysis";
import { ListingPublishSuccess } from "./ListingPublishSuccess";
import { ListingShareScreen } from "./ListingShareScreen";
import { QRStoryScreen } from "./QRStoryScreen";
import { QRStickerScreen } from "./QRStickerScreen";
import {
  Step1Photos,
  Step2ItemInfo,
  Step3Modes,
  Step4PickupDelivery,
  Step5Availability,
  Step6QR,
  Step7Review,
} from "./steps";
import { subcategoriesData } from "../../app/data/subcategories";
import type { ShelfPrefill } from "../../lib/shelfListings";
import {
  createInitialListingDraft,
  STEPS,
  TOTAL_LISTING_STEPS,
  type ListingDraft,
} from "./types";
import { isListingStepValid } from "./validation";

function gradeForSubcategory(
  category: string,
  subcategoryLabel: string,
): ListingDraft["grade"] {
  const data = subcategoriesData[category];
  if (!data) return "";
  if (data.personal.some((sub) => sub.label === subcategoryLabel)) return "personal";
  if (data.professional.some((sub) => sub.label === subcategoryLabel)) return "professional";
  return "";
}

function createPrefilledListingDraft(prefill?: ShelfPrefill | null): ListingDraft {
  const draft = createInitialListingDraft();
  if (!prefill?.category) return draft;
  const subcategory = prefill.subcategory?.trim() ?? "";
  return {
    ...draft,
    category: prefill.category,
    subcategory,
    grade: subcategory ? gradeForSubcategory(prefill.category, subcategory) : draft.grade,
  };
}

const PRIMARY_GREEN = "#0D5C3A";
const BACKGROUND = "#F9FAFB";

type SlideDirection = 1 | -1;
type WizardPhase = "steps" | "qrStory" | "qrSticker" | "share" | "success";

const slideVariants = {
  enter: (direction: SlideDirection) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: SlideDirection) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function isGiftOrSellOnly(draft: ListingDraft): boolean {
  const { rent, sell, rentToOwn, gift } = draft.modes;
  return (gift || sell) && !rent && !rentToOwn;
}

function firePublishConfetti() {
  confetti({
    particleCount: 90,
    spread: 72,
    origin: { y: 0.55 },
    colors: ["#0D5C3A", "#1A9E6E", "#F0B429", "#FFFFFF"],
  });
}

export function ListingWizard({
  initialPrefill,
  initialDraft,
  onExit,
}: {
  initialPrefill?: ShelfPrefill | null;
  initialDraft?: ListingDraft | null;
  onExit: () => void;
}) {
  const auth = useAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<SlideDirection>(1);
  const [draft, setDraft] = useState<ListingDraft>(() =>
    initialDraft ? initialDraft : createPrefilledListingDraft(initialPrefill),
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [phase, setPhase] = useState<WizardPhase>("steps");
  const [isPublishing, setIsPublishing] = useState(false);
  const profileCity = getProfileCity();
  const [wizardStack, setWizardStack] = useState<
    { step: number; draft: ListingDraft; phase: WizardPhase }[]
  >([]);

  const canContinue = isListingStepValid(step, draft);
  const progress = (step / TOTAL_LISTING_STEPS) * 100;
  const isLastStep = step === TOTAL_LISTING_STEPS;
  const stepLabel = STEPS[step - 1]?.name ?? "";
  const showStepChrome = phase === "steps";

  const canReturnToPrevious = wizardStack.length > 0;

  const headerTitle = useMemo(() => {
    if (phase === "qrStory") return "How your QR works";
    if (phase === "qrSticker") return "QR setup";
    if (phase === "success") return "Published";
    return `Step ${step} of ${TOTAL_LISTING_STEPS}`;
  }, [phase, step]);

  const goToStep = (nextStep: number, nextDirection: SlideDirection) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  const handleBack = () => {
    if (phase !== "steps") {
      // Within the same listing's publish flow, treat Back as returning to the prior phase.
      if (phase === "qrSticker") {
        setPhase("qrStory");
        return;
      }
      if (phase === "qrStory") {
        setPhase("steps");
        return;
      }
      // Success screen uses onExit (back to app).
      onExit();
      return;
    }

    if (step === 1) {
      setShowDiscardDialog(true);
      return;
    }

    goToStep(step - 1, -1);
  };

  const handlePublish = () => {
    setIsPublishing(true);

    window.setTimeout(() => {
      const giftOrSellOnly = isGiftOrSellOnly(draft);
      const hostId = draft.hostId ?? resolveHostAccountId(auth.userId);
      const publishedDraft: ListingDraft = {
        ...draft,
        hostId,
        generateQR: true,
        listingStatus: giftOrSellOnly ? "active" : "pending_qr",
      };

      setDraft(publishedDraft);
      // Prefer Supabase when configured; fall back to localStorage.
      if (auth.userId) {
        void savePublishedListingRemote(publishedDraft, auth.userId);
      } else {
        savePublishedListing(publishedDraft);
      }
      firePublishConfetti();
      setIsPublishing(false);

      if (!giftOrSellOnly) {
        setPhase("qrStory");
      } else {
        setPhase("success");
      }
    }, 900);
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (draft.photos.length === 0 || draft.aiAnalysisPending || draft.photoEnhancementPending) {
        return;
      }
      goToStep(2, 1);
      return;
    }

    if (!canContinue) return;
    if (isLastStep) return;
    goToStep(step + 1, 1);
  };

  const handleAnalyzePhotos = async () => {
    if (draft.photos.length === 0 || draft.aiAnalysisPending || draft.photoEnhancementPending) {
      return;
    }

    setDraft((current) => ({ ...current, aiAnalysisPending: true }));

    try {
      const suggestions = await analyzeListingMediaPhotos(draft.photos);
      setDraft((current) => ({
        ...current,
        aiSuggestions: suggestions,
        aiAnalysisPending: false,
      }));
    } catch (error) {
      setDraft((current) => ({ ...current, aiAnalysisPending: false }));
      if (import.meta.env.DEV) {
        console.warn("AI photo analysis failed:", error);
      }
    }
  };

  const continueLabel =
    step === 1 && draft.aiAnalysisPending ? (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Rentano is analyzing your photos...
      </span>
    ) : (
      "Continue"
    );

  const continueDisabled =
    step === 1
      ? draft.photos.length === 0 ||
        draft.aiAnalysisPending ||
        draft.photoEnhancementPending
      : !canContinue;

  const handleDiscard = () => {
    setShowDiscardDialog(false);

    if (wizardStack.length > 0) {
      const previous = wizardStack[wizardStack.length - 1];
      setWizardStack((stack) => stack.slice(0, -1));
      setDraft(previous.draft);
      setPhase(previous.phase);
      setStep(previous.step);
      setDirection(-1);
      return;
    }

    onExit();
  };

  const handleStartAnotherListing = () => {
    setWizardStack((stack) => [...stack, { step, draft, phase }]);
    setDraft(createPrefilledListingDraft(initialPrefill));
    setStep(1);
    setDirection(1);
    setPhase("steps");
    setShowDiscardDialog(false);
  };

  if (phase === "qrStory") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <QRStoryScreen onGotIt={() => setPhase("qrSticker")} />
      </div>
    );
  }

  if (phase === "qrSticker") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <QRStickerScreen
          draft={draft}
          setDraft={setDraft}
          onComplete={() => setPhase("share")}
          onListAnother={handleStartAnotherListing}
          onBackToStory={() => setPhase("qrStory")}
        />
      </div>
    );
  }

  if (phase === "share") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <ListingShareScreen
          draft={draft}
          onDone={() => setPhase("success")}
        />
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <ListingPublishSuccess
          title={getListingDisplayTitle(draft.title)}
          onDone={onExit}
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
      style={{ backgroundColor: BACKGROUND }}
    >
      <header className="shrink-0 bg-white px-4 pb-3 pt-4">
        <div className="relative mb-3 flex items-center justify-center">
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-0 rounded-full p-2 transition-colors hover:bg-[#F3F4F6]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
          </button>
          <div className="text-center">
            <p className="text-xs font-medium text-[#9CA3AF]">{headerTitle}</p>
            <p className="text-sm font-semibold text-[#374151]">{stepLabel}</p>
            {canReturnToPrevious ? (
              <p className="mt-0.5 text-[11px] font-medium text-[#9CA3AF]">
                You can return to your previous QR setup anytime.
              </p>
            ) : null}
          </div>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <motion.div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%`, backgroundColor: PRIMARY_GREEN }}
          />
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col overflow-y-auto"
          >
            {step === 7 ? (
              <Step7Review
                draft={draft}
                setDraft={setDraft}
                profileCity={profileCity}
                isPublishing={isPublishing}
                onPublish={handlePublish}
                onGoToStep={(target) => goToStep(target, -1)}
              />
            ) : step === 1 ? (
              <Step1Photos
                draft={draft}
                setDraft={setDraft}
                onAnalyzePhotos={() => void handleAnalyzePhotos()}
              />
            ) : step === 2 ? (
              <Step2ItemInfo draft={draft} setDraft={setDraft} />
            ) : step === 3 ? (
              <Step3Modes draft={draft} setDraft={setDraft} />
            ) : step === 4 ? (
              <Step4PickupDelivery draft={draft} setDraft={setDraft} />
            ) : step === 5 ? (
              <Step5Availability draft={draft} setDraft={setDraft} />
            ) : (
              <Step6QR draft={draft} setDraft={setDraft} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLastStep ? (
        <footer className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 pb-6 pt-4">
          <button
            type="button"
            onClick={() => void handleContinue()}
            disabled={continueDisabled}
            className="btn-primary w-full text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: continueDisabled ? "#9CA3AF" : PRIMARY_GREEN,
            }}
          >
            {continueLabel}
          </button>
        </footer>
      ) : null}

      <AnimatePresence>
        {showDiscardDialog && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="discard-listing-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2
                id="discard-listing-title"
                className="text-lg font-semibold text-[#111827]"
              >
                Discard listing?
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                Your progress will be lost if you leave now.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDiscardDialog(false)}
                  className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: PRIMARY_GREEN }}
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export type { ListingDraft } from "./types";
