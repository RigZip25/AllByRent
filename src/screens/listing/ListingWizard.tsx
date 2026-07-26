import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { MASCOT_NAME } from "../../lib/brand";
import { useAuth } from "../../hooks/AuthProvider";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import { getProfileCity, savePublishedListingRemote, savePublishedListing, saveListingDraftProgress, stampListingDraftProgress, removePublishedListing, removePublishedListingRemote, fetchListingByIdRemote, getPublishedListingById } from "../../lib/listingStorage";
import { syncAgentPrefsRemote, ensureBrowserTimeZoneCaptured } from "../../lib/agentPrefs";
import { notifyGarageFollowersOfNewListing } from "../../lib/garageFollowNotify";
import { loadUserProfile } from "../../lib/userProfileStorage";
import { getListingDisplayTitle, listingRequiresQrSticker } from "../../lib/listingQr";
import { loadManageableListings } from "../../lib/hostAccess";
import {
  clearGoPublicPending,
  listingWizardReturnPath,
  loadSellerGoPublicStatus,
  markGoPublicPending,
  peekGoPublicPending,
  startConnectForListing,
  startIdentityVerificationForListing,
  type SellerGoPublicStatus,
} from "../../lib/sellerGoPublic";
import { analyzeListingMediaPhotos } from "./listingAnalysis";
import { ListingPublishSuccess } from "./ListingPublishSuccess";
import { ListingShareScreen } from "./ListingShareScreen";
import { QRStoryScreen } from "./QRStoryScreen";
import { QRStickerScreen } from "./QRStickerScreen";
import { GoPublicChecklist } from "./GoPublicChecklist";
import { applyFrictionlessDefaults } from "./frictionlessDefaults";
import {
  Step1Photos,
  Step2Details,
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
import {
  applyYardSaleListingDefaults,
  clearYardSaleListingActive,
  isYardSaleListingActive,
} from "../../lib/yardSaleListing";
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
type WizardPhase = "steps" | "goPublic" | "qrStory" | "qrSticker" | "share" | "success";
type GoPublicBusy = null | "identity" | "stripe" | "refresh";

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
  const { sell, gift } = draft.modes;
  return (gift || sell) && !listingRequiresQrSticker(draft.modes);
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
  editingListingId,
  onExit,
  onRequireAuth,
}: {
  initialPrefill?: ShelfPrefill | null;
  initialDraft?: ListingDraft | null;
  editingListingId?: string | null;
  onExit: () => void;
  /** Open AuthGate and resume this listing after sign-in. */
  onRequireAuth?: (listingId: string) => void;
}) {
  const auth = useAuth();
  const isEditing = (() => {
    const status =
      initialDraft?.listingStatus ??
      (editingListingId ? getPublishedListingById(editingListingId)?.listingStatus : undefined);
    return Boolean(status && status !== "draft");
  })();
  const [step, setStep] = useState(() => {
    const cached =
      initialDraft ??
      (editingListingId ? getPublishedListingById(editingListingId) : null);
    const resume = cached?.wizardStep;
    return typeof resume === "number" && resume >= 1 && resume <= TOTAL_LISTING_STEPS
      ? resume
      : 1;
  });
  const [direction, setDirection] = useState<SlideDirection>(1);
  const [draft, setDraft] = useState<ListingDraft>(() => {
    const cached =
      initialDraft ??
      (editingListingId ? getPublishedListingById(editingListingId) : null);
    const base = cached ?? createPrefilledListingDraft(initialPrefill);
    return isYardSaleListingActive() ? applyYardSaleListingDefaults(base) : base;
  });
  const [loadingEdit, setLoadingEdit] = useState(
    () => Boolean(editingListingId && !initialDraft && !getPublishedListingById(editingListingId)),
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [phase, setPhase] = useState<WizardPhase>(() => {
    const cached =
      initialDraft ??
      (editingListingId ? getPublishedListingById(editingListingId) : null);
    const pending = peekGoPublicPending();
    if (
      cached &&
      cached.listingStatus === "draft" &&
      pending &&
      pending === cached.id
    ) {
      return "goPublic";
    }
    return "steps";
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [goPublicStatus, setGoPublicStatus] = useState<SellerGoPublicStatus | null>(null);
  const [goPublicLoading, setGoPublicLoading] = useState(false);
  const [goPublicBusy, setGoPublicBusy] = useState<GoPublicBusy>(null);
  const [goPublicError, setGoPublicError] = useState<string | null>(null);
  const profileCity = getProfileCity();
  const [wizardStack, setWizardStack] = useState<
    { step: number; draft: ListingDraft; phase: WizardPhase }[]
  >([]);

  useEffect(() => {
    if (!editingListingId || initialDraft) return;
    let mounted = true;
    void fetchListingByIdRemote(editingListingId).then((remote) => {
      if (!mounted) return;
      if (remote) {
        setDraft(isYardSaleListingActive() ? applyYardSaleListingDefaults(remote) : remote);
      }
      setLoadingEdit(false);
    });
    return () => {
      mounted = false;
    };
  }, [editingListingId, initialDraft]);

  // Autosave unfinished drafts so Mr. Evorios can nudge if the host abandons mid-flow.
  useEffect(() => {
    if ((phase !== "steps" && phase !== "goPublic") || isPublishing || loadingEdit) return;
    const meaningful =
      (draft.photos?.length ?? 0) > 0 ||
      draft.title.trim().length > 0 ||
      step > 1;
    if (!meaningful) return;

    ensureBrowserTimeZoneCaptured();
    const timer = window.setTimeout(() => {
      void saveListingDraftProgress(
        {
          ...draft,
          hostId: draft.hostId ?? resolveHostAccountId(auth.userId),
        },
        auth.userId,
        step,
      ).then(() => {
        if (auth.userId) void syncAgentPrefsRemote(auth.userId);
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [auth.userId, draft, isPublishing, loadingEdit, phase, step]);

  const refreshGoPublicStatus = useCallback(async () => {
    setGoPublicLoading(true);
    setGoPublicError(null);
    try {
      const status = await loadSellerGoPublicStatus(auth.userId);
      setGoPublicStatus(status);
      return status;
    } catch (error) {
      setGoPublicError(
        error instanceof Error ? error.message : "Could not check seller setup.",
      );
      return null;
    } finally {
      setGoPublicLoading(false);
      setGoPublicBusy(null);
    }
  }, [auth.userId]);

  useEffect(() => {
    if (phase !== "goPublic") return;
    void refreshGoPublicStatus();
  }, [phase, auth.userId, refreshGoPublicStatus]);

  const persistDraftForGoPublic = useCallback(
    async (opts?: { syncRemote?: boolean }) => {
      const nextDraft = stampListingDraftProgress(
        {
          ...draft,
          hostId: draft.hostId ?? resolveHostAccountId(auth.userId),
        },
        auth.userId,
        TOTAL_LISTING_STEPS,
      );
      setDraft(nextDraft);
      markGoPublicPending(nextDraft.id);
      // Never block Stripe redirect on photo upload to Supabase.
      const syncRemote = opts?.syncRemote === true;
      if (syncRemote) {
        await saveListingDraftProgress(nextDraft, auth.userId, TOTAL_LISTING_STEPS, {
          syncRemote: true,
        });
      } else {
        savePublishedListing(nextDraft);
        void saveListingDraftProgress(nextDraft, auth.userId, TOTAL_LISTING_STEPS, {
          syncRemote: true,
        });
      }
      if (auth.userId) void syncAgentPrefsRemote(auth.userId);
      return nextDraft;
    },
    [auth.userId, draft],
  );

  const canContinue = isListingStepValid(step, draft);
  const progress = (step / TOTAL_LISTING_STEPS) * 100;
  const isLastStep = step === TOTAL_LISTING_STEPS;

  const canReturnToPrevious = wizardStack.length > 0;

  const headerTitle = useMemo(() => {
    if (phase === "goPublic") return "Go public";
    if (phase === "qrStory") return "How your QR works";
    if (phase === "qrSticker") return "QR setup";
    if (phase === "success") return isEditing ? "Saved" : "Published";
    return isEditing ? "Edit listing" : `Step ${step} of ${TOTAL_LISTING_STEPS}`;
  }, [isEditing, phase, step]);

  const stepLabel = phase === "goPublic" ? "Seller setup" : (STEPS[step - 1]?.name ?? "");

  const goToStep = (nextStep: number, nextDirection: SlideDirection) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  const handleBack = () => {
    if (phase !== "steps") {
      if (phase === "goPublic") {
        setPhase("steps");
        setStep(TOTAL_LISTING_STEPS);
        return;
      }
      // Within the same listing's publish flow, treat Back as returning to the prior phase.
      if (phase === "share") {
        setPhase("success");
        return;
      }
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

  const finalizePublish = (sourceDraft: ListingDraft = draft) => {
    setIsPublishing(true);

    window.setTimeout(() => {
      const hostId = sourceDraft.hostId ?? resolveHostAccountId(auth.userId);
      const normalizedDraft = applyFrictionlessDefaults(sourceDraft);

      if (isEditing && sourceDraft.id) {
        const savedDraft: ListingDraft = {
          ...normalizedDraft,
          hostId,
          id: sourceDraft.id,
          listingStatus: sourceDraft.listingStatus === "draft" ? "active" : sourceDraft.listingStatus,
          qrToken: sourceDraft.qrToken,
          qrReady: sourceDraft.qrReady,
          qrPrintedConfirmed: sourceDraft.qrPrintedConfirmed,
          generateQR: sourceDraft.generateQR,
          verificationPhoto: sourceDraft.verificationPhoto,
        };

        setDraft(savedDraft);
        clearGoPublicPending();
        if (auth.userId) {
          void savePublishedListingRemote(savedDraft, auth.userId);
        } else {
          savePublishedListing(savedDraft);
        }
        setIsPublishing(false);
        onExit();
        return;
      }

      const needsQr = listingRequiresQrSticker(normalizedDraft.modes);
      const publishedDraft: ListingDraft = {
        ...normalizedDraft,
        hostId,
        generateQR: needsQr,
        qrReady: !needsQr,
        listingStatus: needsQr ? "pending_qr" : "active",
        nudgeCount: 0,
        lastNudgedAt: null,
        updatedAt: new Date().toISOString(),
      };

      setDraft(publishedDraft);
      clearGoPublicPending();
      // Prefer Supabase when configured; fall back to localStorage.
      if (auth.userId) {
        void savePublishedListingRemote(publishedDraft, auth.userId);
      } else {
        savePublishedListing(publishedDraft);
      }
      const profile = loadUserProfile();
      notifyGarageFollowersOfNewListing({
        hostId,
        hostName: profile.displayName,
        listingTitle: publishedDraft.title || "New listing",
      });
      firePublishConfetti();
      setIsPublishing(false);

      // QR stickers are rental handoff only — sell/gift go straight to live success.
      if (needsQr) {
        setPhase("qrStory");
      } else {
        setPhase("success");
      }
    }, 900);
  };

  const publishStatusLine = isGiftOrSellOnly(draft)
    ? "Listing active"
    : draft.listingStatus === "active"
      ? "Listing active"
      : "Saved — finish QR to show renters";

  const handlePublish = () => {
    // Edits to already-live listings skip the first-time seller checklist.
    if (isEditing) {
      finalizePublish();
      return;
    }

    void (async () => {
      setIsPublishing(true);
      setGoPublicError(null);
      try {
        const saved = await persistDraftForGoPublic();
        const status = await loadSellerGoPublicStatus(auth.userId);
        setGoPublicStatus(status);
        if (status.ready) {
          finalizePublish(saved);
          return;
        }
        setIsPublishing(false);
        setPhase("goPublic");
      } catch (error) {
        setIsPublishing(false);
        setGoPublicError(
          error instanceof Error ? error.message : "Could not prepare go-public checklist.",
        );
        setPhase("goPublic");
      }
    })();
  };

  const handleGoLiveFromChecklist = () => {
    void (async () => {
      setGoPublicBusy("refresh");
      const status = await refreshGoPublicStatus();
      if (!status?.ready) {
        setGoPublicError("Finish sign-in and Stripe (ID + bank) before going live.");
        return;
      }
      const saved = await persistDraftForGoPublic();
      finalizePublish(saved);
    })();
  };

  const handleChecklistSignIn = () => {
    void (async () => {
      const saved = await persistDraftForGoPublic({ syncRemote: false });
      if (onRequireAuth) {
        onRequireAuth(saved.id);
        return;
      }
      setGoPublicError("Sign in from More → Profile, then return here.");
    })();
  };

  const handleChecklistIdentity = () => {
    void (async () => {
      setGoPublicBusy("identity");
      setGoPublicError(null);
      try {
        const saved = await persistDraftForGoPublic({ syncRemote: false });
        const result = await startIdentityVerificationForListing(
          listingWizardReturnPath(saved.id),
        );
        if (!result.ok) {
          setGoPublicError(result.reason);
          return;
        }
        window.location.assign(result.url);
      } catch (error) {
        setGoPublicError(error instanceof Error ? error.message : "Verification failed.");
      } finally {
        setGoPublicBusy(null);
      }
    })();
  };

  const handleChecklistConnect = () => {
    void (async () => {
      setGoPublicBusy("stripe");
      setGoPublicError(null);
      try {
        // Local draft only — awaiting remote photo upload was blocking Stripe redirect.
        const saved = await persistDraftForGoPublic({ syncRemote: false });
        const result = await startConnectForListing(listingWizardReturnPath(saved.id));
        if (!result.ok) {
          setGoPublicError(result.reason);
          return;
        }
        window.location.assign(result.url);
      } catch (error) {
        setGoPublicError(error instanceof Error ? error.message : "Stripe Connect failed.");
      } finally {
        setGoPublicBusy(null);
      }
    })();
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (draft.photos.length === 0 || draft.aiAnalysisPending || draft.photoEnhancementPending) {
        return;
      }
      if (!draft.aiSuggestions) {
        await handleAnalyzePhotos();
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
        {MASCOT_NAME} is analyzing your photos...
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

    if (draft.listingStatus === "draft" && draft.id) {
      if (auth.userId) {
        void removePublishedListingRemote(draft.id, auth.userId);
      } else {
        removePublishedListing(draft.id);
      }
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

  if (loadingEdit) {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col items-center justify-center overflow-hidden px-6"
        style={{ backgroundColor: BACKGROUND }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: PRIMARY_GREEN }} aria-hidden />
        <p className="mt-3 text-sm font-medium text-[#6B7280]">Loading listing…</p>
      </div>
    );
  }

  if (phase === "goPublic") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <header className="shrink-0 bg-white px-4 pb-3 pt-4">
          <div className="relative mb-1 flex items-center justify-center">
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
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <GoPublicChecklist
            status={goPublicStatus}
            loading={goPublicLoading}
            busy={goPublicBusy}
            error={goPublicError}
            onSignIn={handleChecklistSignIn}
            onVerifyIdentity={handleChecklistIdentity}
            onConnectBank={handleChecklistConnect}
            onRefresh={() => {
              setGoPublicBusy("refresh");
              void refreshGoPublicStatus();
            }}
            onGoLive={handleGoLiveFromChecklist}
            onBack={handleBack}
            isPublishing={isPublishing}
          />
        </main>
      </div>
    );
  }

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
          onComplete={() => setPhase("success")}
          onListAnother={handleStartAnotherListing}
          onBackToStory={() => setPhase("qrStory")}
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
          statusLine={publishStatusLine}
          onShare={() => setPhase("share")}
          onDone={onExit}
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
            {step === 3 ? (
              <Step7Review
                draft={draft}
                setDraft={setDraft}
                profileCity={profileCity}
                isPublishing={isPublishing}
                isEditing={isEditing}
                onPublish={handlePublish}
                onGoToStep={(target) => goToStep(target, -1)}
              />
            ) : step === 1 ? (
              <Step1Photos
                draft={draft}
                setDraft={setDraft}
                onAnalyzePhotos={() => void handleAnalyzePhotos()}
              />
            ) : (
              <Step2Details draft={draft} setDraft={setDraft} />
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
            onClick={() => setShowDiscardDialog(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="discard-listing-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
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
