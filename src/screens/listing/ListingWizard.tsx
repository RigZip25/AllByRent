import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { MASCOT_NAME } from "../../lib/brand";
import { useAuth } from "../../hooks/AuthProvider";
import { resolveGarageHostId } from "../../lib/hostAccess";
import { getProfileCity, savePublishedListingRemote, savePublishedListing, saveListingDraftProgress, stampListingDraftProgress, removePublishedListing, removePublishedListingRemote, fetchListingByIdRemote, getPublishedListingById } from "../../lib/listingStorage";
import { syncAgentPrefsRemote, ensureBrowserTimeZoneCaptured } from "../../lib/agentPrefs";
import { notifyGarageFollowersOfNewListing } from "../../lib/garageFollowNotify";
import { notifyRequestAuthorOfListing } from "../../lib/requestNotifications";
import { fetchRequestByIdRemote } from "../../lib/requestsStorage";
import { getLocalStoreLive } from "../../lib/garageStoreLive";
import { loadUserProfile, saveUserProfile } from "../../lib/userProfileStorage";
import { getListingDisplayTitle, listingRequiresQrSticker } from "../../lib/listingQr";
import {
  clearGoPublicPending,
  listingRequiresPhoneKyc,
  listingWizardReturnPath,
  loadSellerGoPublicStatus,
  markGoPublicPending,
  shouldResumeGoPublicChecklist,
  startConnectForListing,
  type SellerGoPublicStatus,
} from "../../lib/sellerGoPublic";
import { onConnectOnboardingDone } from "../../lib/connectOnboardingBus";
import { isFreeGiveaway } from "../../lib/listingGift";
import { PhoneVerifySheet } from "../../components/profile/PhoneVerifySheet";
import { analyzeListingMediaPhotos } from "./listingAnalysis";
import {
  messageForGalleryModeration,
  moderateListingMediaPhotos,
} from "./listingPhotoModeration";
import {
  messageForTextModeration,
  moderateListingText,
} from "./listingTextModeration";
import {
  messageForVideoModeration,
  moderateListingMediaVideos,
} from "./listingVideoModeration";
import { sanitizeUserText } from "../../lib/textSanitize";
import { setEditingListingReturn } from "../../lib/authReturn";
import {
  formatCooldownHours,
  getModerationCooldownRemaining,
  isInModerationCooldown,
  recordModerationStrike,
} from "../../lib/softModerationStrikes";
import {
  checkNewAccountPublishFriction,
  recordDevicePublish,
} from "../../lib/newAccountPublishFriction";
import { assertOwnerOnlyPublish } from "../../lib/borrowedItemGuard";
import { checkPublishLocationCoherence } from "../../lib/publishLocationCoherence";
import { ListingPublishSuccess } from "./ListingPublishSuccess";
import { ListingShareScreen } from "./ListingShareScreen";
import { QRStoryScreen } from "./QRStoryScreen";
import { QRStickerScreen } from "./QRStickerScreen";
import { GoPublicChecklist } from "./GoPublicChecklist";
import { applyFrictionlessDefaults } from "./frictionlessDefaults";
import {
  StepCategories,
  Step1Photos,
  Step2Details,
  Step7Review,
} from "./steps";
import { gradeForSubcategory } from "./listingItemCategories";
import type { ShelfPrefill } from "../../lib/shelfListings";
import {
  createInitialListingDraft,
  getSteps,
  initialListingWizardStep,
  LISTING_STEP,
  TOTAL_LISTING_STEPS,
  normalizeWizardResumeStep,
  type ListingDraft,
} from "./types";
import {
  applyYardSaleListingDefaults,
  isYardSaleListingActive,
} from "../../lib/yardSaleListing";
import { applyAiSuggestionsToDraft } from "./applyAiSuggestions";
import {
  getFirstListingStepFailure,
  scrollToListingFieldAnchor,
} from "./validation";
import { pinMedia, unpinMedia } from "../../lib/mediaStore";
import { pushOverlay, removeOverlay } from "../../lib/overlayBackStack";
import { useMessages } from "../../lib/i18n/react";

function createPrefilledListingDraft(prefill?: ShelfPrefill | null): ListingDraft {
  const draft = createInitialListingDraft();
  if (!prefill?.category) return draft;
  const subcategory = prefill.subcategory?.trim() ?? "";
  // What the neighbor actually asked for. Carrying only category and shelf made
  // the host retype the need they had just read.
  const need = prefill.requestId ? (prefill.query?.trim() ?? "") : "";
  return {
    ...draft,
    category: prefill.category,
    subcategory,
    description: need || draft.description,
    grade: subcategory ? gradeForSubcategory(prefill.category, subcategory) : draft.grade,
  };
}

const PRIMARY_GREEN = "#0D5C3A";
const BACKGROUND = "#F9FAFB";

type SlideDirection = 1 | -1;
type WizardPhase = "steps" | "goPublic" | "qrStory" | "qrSticker" | "share" | "success";
type GoPublicBusy = null | "stripe" | "refresh" | "phone";

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

export type ListingWizardHandle = {
  /** @returns true when the wizard consumed the back press */
  handleBack: () => boolean;
};

export const ListingWizard = forwardRef<
  ListingWizardHandle,
  {
    initialPrefill?: ShelfPrefill | null;
    initialDraft?: ListingDraft | null;
    editingListingId?: string | null;
    /** finished = published/saved; discarded = user cancelled the wizard. */
    onExit: (reason?: "finished" | "discarded") => void;
    /** Open AuthGate and resume this listing after sign-in. */
    onRequireAuth?: (listingId: string) => void;
    /** Open own garage in neighbor-preview mode (optionally focus a listing). */
    onPreviewShop?: (listingId?: string) => void;
    /** After sell publish — jump into Open Sale path choice. */
    onPlanOpenSale?: (listingId: string) => void;
  }
>(function ListingWizard(
  {
    initialPrefill,
    initialDraft,
    editingListingId,
    onExit,
    onRequireAuth,
    onPreviewShop,
    onPlanOpenSale,
  },
  ref,
) {
  const auth = useAuth();
  const t = useMessages();
  const listing = t.listing;
  const answeredRequestId = initialPrefill?.requestId?.trim() || null;
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
    if (cached && typeof cached.wizardStep === "number") {
      return normalizeWizardResumeStep(cached.wizardStep, cached.wizardFlowVersion);
    }
    return initialListingWizardStep(initialPrefill);
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [photoGateMessage, setPhotoGateMessage] = useState<string | null>(null);
  const [photoModerationPending, setPhotoModerationPending] = useState(false);
  const [photoProgressTick, setPhotoProgressTick] = useState(0);
  const [textGateMessage, setTextGateMessage] = useState<string | null>(null);
  const [textModerationPending, setTextModerationPending] = useState(false);
  const [continueBlockedMessage, setContinueBlockedMessage] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [phase, setPhase] = useState<WizardPhase>(() => {
    const cached =
      initialDraft ??
      (editingListingId ? getPublishedListingById(editingListingId) : null);
    if (
      cached &&
      cached.listingStatus === "draft" &&
      shouldResumeGoPublicChecklist(cached.id)
    ) {
      return "goPublic";
    }
    return "steps";
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [photosPending, setPhotosPending] = useState(0);
  const [photosRetryBusy, setPhotosRetryBusy] = useState(false);
  const [goPublicStatus, setGoPublicStatus] = useState<SellerGoPublicStatus | null>(null);
  const [goPublicLoading, setGoPublicLoading] = useState(false);
  const [goPublicBusy, setGoPublicBusy] = useState<GoPublicBusy>(null);
  const [goPublicError, setGoPublicError] = useState<string | null>(null);
  const [goPublicErrorCode, setGoPublicErrorCode] = useState<string | null>(null);
  const [phoneSheetOpen, setPhoneSheetOpen] = useState(false);
  const profileCity = getProfileCity();
  const [wizardStack, setWizardStack] = useState<
    { step: number; draft: ListingDraft; phase: WizardPhase }[]
  >([]);
  /** Category step internal back (grade → category, etc.). Returns true if handled. */
  const categoryPhaseBackRef = useRef<(() => boolean) | null>(null);
  /** Ignore backdrop dismiss from the same tap that opened the dialog (iOS ghost click). */
  const deleteDialogOpenedAtRef = useRef(0);
  const discardDialogOpenedAtRef = useRef(0);
  const deleteInFlightRef = useRef(false);
  const prevPhotoCountRef = useRef(draft.photos?.length ?? 0);
  const draftRef = useRef(draft);
  const stepRef = useRef(step);
  draftRef.current = draft;
  stepRef.current = step;

  const openDeleteDialog = () => {
    deleteDialogOpenedAtRef.current = Date.now();
    deleteInFlightRef.current = false;
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    // Opening tap can hit the newly-mounted backdrop on mobile — ignore briefly.
    if (Date.now() - deleteDialogOpenedAtRef.current < 450) return;
    setShowDeleteDialog(false);
  };

  useEffect(() => {
    if (!editingListingId) return;
    const local = initialDraft ?? getPublishedListingById(editingListingId);
    if (local) {
      const next = isYardSaleListingActive() ? applyYardSaleListingDefaults(local) : local;
      setDraft(next);
      if (typeof next.wizardStep === "number") {
        setStep(normalizeWizardResumeStep(next.wizardStep, next.wizardFlowVersion));
      }
      if (next.listingStatus === "draft" && shouldResumeGoPublicChecklist(next.id)) {
        setPhase("goPublic");
        markGoPublicPending(next.id);
      }
      setLoadingEdit(false);
      if (initialDraft) return;
    }

    let mounted = true;
    void fetchListingByIdRemote(editingListingId).then((remote) => {
      if (!mounted || !remote) {
        if (mounted) setLoadingEdit(false);
        return;
      }
      const next = isYardSaleListingActive() ? applyYardSaleListingDefaults(remote) : remote;
      setDraft(next);
      if (typeof next.wizardStep === "number") {
        setStep(normalizeWizardResumeStep(next.wizardStep, next.wizardFlowVersion));
      }
      if (next.listingStatus === "draft" && shouldResumeGoPublicChecklist(next.id)) {
        setPhase("goPublic");
        markGoPublicPending(next.id);
      }
      setLoadingEdit(false);
    });
    return () => {
      mounted = false;
    };
  }, [editingListingId, initialDraft]);

  // A shelf mismatch is about the shelf that was picked; picking another one
  // makes the warning stale before the next check has anything to say.
  useEffect(() => {
    setPhotoGateMessage(null);
  }, [draft.category, draft.subcategory]);

  // The gallery under construction is not eviction material: adding the twelfth
  // photo used to be able to free space by dropping the first.
  const draftMediaIds = useMemo(
    () => [
      ...draft.photos.flatMap((photo) => [photo.id, photo.thumbId]),
      ...draft.videos.map((video) => video.id),
    ],
    [draft.photos, draft.videos],
  );

  useEffect(() => {
    pinMedia(draftMediaIds);
    return () => unpinMedia(draftMediaIds);
  }, [draftMediaIds]);

  useEffect(() => {
    const busy =
      (step === LISTING_STEP.photos || step === LISTING_STEP.category) &&
      (photoModerationPending || draft.aiAnalysisPending);
    if (!busy) {
      setPhotoProgressTick(0);
      return;
    }
    setPhotoProgressTick(0);
    const id = window.setInterval(() => {
      setPhotoProgressTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [step, photoModerationPending, draft.aiAnalysisPending]);

  // Autosave unfinished drafts so Mr. Evorios can nudge if the host abandons mid-flow.
  // Local save is immediate on first photo + flush on hide; remote stays debounced.
  useEffect(() => {
    if ((phase !== "steps" && phase !== "goPublic") || isPublishing || loadingEdit) return;
    const meaningful =
      (draft.photos?.length ?? 0) > 0 ||
      draft.title.trim().length > 0 ||
      step > 1;
    if (!meaningful) return;

    ensureBrowserTimeZoneCaptured();
    const ownerId = resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId;
    const photoCount = draft.photos?.length ?? 0;
    const firstPhotoJustAdded = prevPhotoCountRef.current === 0 && photoCount > 0;
    prevPhotoCountRef.current = photoCount;

    if (firstPhotoJustAdded) {
      void saveListingDraftProgress(
        {
          ...draft,
          hostId: ownerId || draft.hostId || undefined,
        },
        ownerId,
        step,
        { syncRemote: false },
      ).catch(() => undefined);
    }

    const timer = window.setTimeout(() => {
      void saveListingDraftProgress(
        {
          ...draft,
          // Prefer signed-in id so guest drafts reclaim when the host signs in mid-wizard.
          hostId: ownerId || draft.hostId || undefined,
        },
        ownerId,
        step,
      )
        .then(() => {
          if (ownerId) void syncAgentPrefsRemote(ownerId);
        })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [auth.userId, draft, isPublishing, loadingEdit, phase, step]);

  // Flush local draft when the app backgrounds or the tab hides.
  useEffect(() => {
    const flushLocal = () => {
      if ((phase !== "steps" && phase !== "goPublic") || isPublishing || loadingEdit) return;
      const current = draftRef.current;
      const currentStep = stepRef.current;
      const meaningful =
        (current.photos?.length ?? 0) > 0 ||
        current.title.trim().length > 0 ||
        currentStep > 1;
      if (!meaningful) return;
      const ownerId = resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId;
      void saveListingDraftProgress(
        {
          ...current,
          hostId: ownerId || current.hostId || undefined,
        },
        ownerId,
        currentStep,
        { syncRemote: false },
      ).catch(() => undefined);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushLocal();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushLocal);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushLocal);
    };
  }, [auth.userEmail, auth.userId, isPublishing, loadingEdit, phase]);

  const refreshGoPublicStatus = useCallback(async () => {
    setGoPublicLoading(true);
    setGoPublicError(null);
    setGoPublicErrorCode(null);
    try {
      const requiresPhone = listingRequiresPhoneKyc(draft.modes, draft.pricing);
      const status = await loadSellerGoPublicStatus(auth.userId, { requiresPhone });
      setGoPublicStatus(status);
      // Bank already linked — never keep a stale Connect failure banner.
      if (status.payoutsReady) {
        setGoPublicError(null);
        setGoPublicErrorCode(null);
      }
      return status;
    } catch (error) {
      setGoPublicError(
        error instanceof Error ? error.message : t.listing.goPublic.couldNotCheckSellerSetup,
      );
      return null;
    } finally {
      setGoPublicLoading(false);
      setGoPublicBusy(null);
    }
  }, [auth.userId, draft.modes, draft.pricing, t.listing.goPublic.couldNotCheckSellerSetup]);

  useEffect(() => {
    if (phase !== "goPublic") return;
    void refreshGoPublicStatus();
  }, [phase, auth.userId, refreshGoPublicStatus]);

  useEffect(() => {
    if (phase !== "goPublic") return;
    return onConnectOnboardingDone(() => {
      void refreshGoPublicStatus();
    });
  }, [phase, refreshGoPublicStatus]);

  const persistDraftForGoPublic = useCallback(
    async (opts?: { syncRemote?: boolean }) => {
      // Prefer signed-in auth id so drafts started as guest/local reclaim correctly.
      const hostId = resolveGarageHostId(auth.userId, auth.userEmail) || draft.hostId;
      const nextDraft = stampListingDraftProgress(
        {
          ...draft,
          hostId,
        },
        auth.userId,
        TOTAL_LISTING_STEPS,
      );
      setDraft(nextDraft);
      markGoPublicPending(nextDraft.id);
      setEditingListingReturn(nextDraft.id);
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

  const progress = (step / TOTAL_LISTING_STEPS) * 100;
  const isLastStep = step === TOTAL_LISTING_STEPS;

  const canReturnToPrevious = wizardStack.length > 0;

  const wizardSteps = useMemo(() => getSteps(listing), [listing]);

  const headerTitle = useMemo(() => {
    if (phase === "goPublic") return listing.goPublicTitle;
    if (phase === "qrStory") return listing.howQrWorks;
    if (phase === "qrSticker") return listing.qrSetup;
    if (phase === "success") return isEditing ? listing.saved : listing.published;
    return isEditing ? listing.editListing : listing.stepOf(step, TOTAL_LISTING_STEPS);
  }, [isEditing, listing, phase, step]);

  const stepLabel =
    phase === "goPublic" ? listing.sellerSetup : (wizardSteps[step - 1]?.name ?? "");

  const goToStep = (nextStep: number, nextDirection: SlideDirection) => {
    setDirection(nextDirection);
    setStep(nextStep);
    setContinueBlockedMessage(null);
    setPublishError(null);
  };

  const handleBack = (): boolean => {
    if (phase !== "steps") {
      if (phase === "goPublic") {
        setPhase("steps");
        setStep(TOTAL_LISTING_STEPS);
        return true;
      }
      // Within the same listing's publish flow, treat Back as returning to the prior phase.
      if (phase === "share") {
        setPhase("success");
        return true;
      }
      if (phase === "qrSticker") {
        setPhase("qrStory");
        return true;
      }
      if (phase === "qrStory") {
        setPhase("steps");
        return true;
      }
      // Success screen: back means return to listings (same as Done).
      onExit("finished");
      return true;
    }

    if (step === 1) {
      if (categoryPhaseBackRef.current?.()) return true;
      discardDialogOpenedAtRef.current = Date.now();
      setShowDiscardDialog(true);
      return true;
    }

    goToStep(step - 1, -1);
    return true;
  };

  useImperativeHandle(
    ref,
    () => ({
      handleBack: () => handleBack(),
    }),
    // handleBack closes over phase/step; refresh when those change.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- wizard back is intentional
    [phase, step, showDiscardDialog],
  );

  useEffect(() => {
    if (!showDiscardDialog) return;
    pushOverlay("listing-discard", () => setShowDiscardDialog(false));
    return () => removeOverlay("listing-discard");
  }, [showDiscardDialog]);

  useEffect(() => {
    if (!showDeleteDialog) return;
    pushOverlay("listing-delete", () => setShowDeleteDialog(false));
    return () => removeOverlay("listing-delete");
  }, [showDeleteDialog]);

  const finalizePublish = (sourceDraft: ListingDraft = draft) => {
    setIsPublishing(true);

    window.setTimeout(() => {
      // Signed-in auth id wins so guest/local draft hostIds do not block publish.
      const hostId = resolveGarageHostId(auth.userId, auth.userEmail) || sourceDraft.hostId || "";
      const ownerGate = assertOwnerOnlyPublish({
        userId: auth.userId ?? hostId,
        userEmail: auth.userEmail,
        listingHostId: hostId,
        listingId: sourceDraft.id,
      });
      if (!ownerGate.ok) {
        setGoPublicError(ownerGate.reason);
        setTextGateMessage(ownerGate.reason);
        setIsPublishing(false);
        setGoPublicBusy(null);
        setPhase("goPublic");
        return;
      }

      const cleaned: ListingDraft = {
        ...sourceDraft,
        title: sanitizeUserText(sourceDraft.title).trim(),
        description: sanitizeUserText(sourceDraft.description).trim(),
        instructionsUrl: "",
      };
      const normalizedDraft = applyFrictionlessDefaults(cleaned);

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
        // Always persist locally first so My Garage can show the listing immediately.
        savePublishedListing(savedDraft);
        if (hostId) {
          void savePublishedListingRemote(savedDraft, hostId).then((result) => {
            setPhotosPending(result.photosPending);
          });
        }
        setIsPublishing(false);
        onExit("finished");
        return;
      }

      const needsQr = listingRequiresQrSticker(normalizedDraft.modes);
      // Screen QR is enough to go live — print is optional, no sticker photo gate.
      const publishedDraft: ListingDraft = {
        ...normalizedDraft,
        hostId,
        generateQR: needsQr,
        qrReady: true,
        listingStatus: "active",
        nudgeCount: 0,
        lastNudgedAt: null,
        updatedAt: new Date().toISOString(),
      };

      setDraft(publishedDraft);
      clearGoPublicPending();
      // Always persist locally first so My Garage can show the listing immediately.
      savePublishedListing(publishedDraft);
      if (hostId) {
        recordDevicePublish(hostId);
        void savePublishedListingRemote(publishedDraft, hostId).then((result) => {
          setPhotosPending(result.photosPending);
        });
      }
      // Answering an ask: the renter who asked hears about it, and closes their
      // own request — RLS keeps that lifecycle with the author, not the host.
      if (answeredRequestId) {
        void fetchRequestByIdRemote(answeredRequestId).then((request) => {
          if (!request || request.status !== "open") return;
          void notifyRequestAuthorOfListing({
            request,
            listingId: publishedDraft.id,
            actorId: auth.userId,
            title: t.postRequest.authorNotifyTitle,
            body: t.postRequest.authorNotifyBody(
              getListingDisplayTitle(publishedDraft.title) || publishedDraft.title,
            ),
          });
        });
      }
      const profile = loadUserProfile();
      // Neighbors only learn about new shelf items when the store is already Live.
      if (hostId && getLocalStoreLive(hostId)) {
        notifyGarageFollowersOfNewListing({
          hostId,
          hostName: profile.displayName,
          listingTitle: getListingDisplayTitle(publishedDraft.title) || publishedDraft.title || "New listing",
        });
      }
      firePublishConfetti();
      setIsPublishing(false);

      // Optional QR intro + sticker — never a publish wall.
      if (needsQr) {
        setPhase("qrStory");
      } else {
        setPhase("success");
      }
    }, 900);
  };

  const retryPhotoUpload = async () => {
    const hostId = resolveGarageHostId(auth.userId, auth.userEmail) || draft.hostId || "";
    if (!hostId) return;
    setPhotosRetryBusy(true);
    try {
      const result = await savePublishedListingRemote(draft, hostId);
      setPhotosPending(result.photosPending);
    } finally {
      setPhotosRetryBusy(false);
    }
  };

  const publishStatusLine = isGiftOrSellOnly(draft)
    ? listing.listingActive
    : draft.listingStatus === "active"
      ? listing.listingActive
      : listing.savedFinishQr;

  const handlePublish = () => {
    // Edits to already-live listings skip the first-time seller checklist.
    if (isEditing) {
      void (async () => {
        setIsPublishing(true);
        setTextGateMessage(null);
        setPublishError(null);
        try {
          if (isInModerationCooldown(auth.userId)) {
            const message = listing.moderationCooldownWait(
              formatCooldownHours(getModerationCooldownRemaining(auth.userId)),
            );
            setPublishError(message);
            setIsPublishing(false);
            return;
          }

          const ownerGate = assertOwnerOnlyPublish({
            userId: auth.userId ?? "",
            userEmail: auth.userEmail,
            listingHostId: draft.hostId || resolveGarageHostId(auth.userId, auth.userEmail),
            listingId: draft.id,
          });
          if (!ownerGate.ok) {
            setPublishError(ownerGate.reason);
            setIsPublishing(false);
            return;
          }

          const cleanedTitle = sanitizeUserText(draft.title).trim();
          const cleanedDescription = sanitizeUserText(draft.description).trim();
          if (cleanedTitle !== draft.title || cleanedDescription !== draft.description) {
            setDraft((current) => ({
              ...current,
              title: cleanedTitle,
              description: cleanedDescription,
            }));
          }

          const moderation = await moderateListingText({
            title: cleanedTitle,
            description: cleanedDescription,
            category: draft.category,
            subcategory: draft.subcategory,
          });
          if (!moderation.ok) {
            const strike = recordModerationStrike({
              userId: auth.userId,
              severe: moderation.reasonCode === "unsafe",
            });
            setPublishError(
              strike.hasCooldown
                ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
                : messageForTextModeration(moderation.reasonCode, listing.itemInfo),
            );
            setIsPublishing(false);
            return;
          }

          finalizePublish({
            ...draft,
            title: cleanedTitle,
            description: cleanedDescription,
            instructionsUrl: "",
          });
        } catch {
          setPublishError(listing.itemInfo.moderationTextVerifyFailed);
          setIsPublishing(false);
        }
      })();
      return;
    }

    void (async () => {
      setIsPublishing(true);
      setGoPublicError(null);
      setTextGateMessage(null);
      try {
        if (isInModerationCooldown(auth.userId)) {
          setTextGateMessage(
            listing.moderationCooldownWait(
              formatCooldownHours(getModerationCooldownRemaining(auth.userId)),
            ),
          );
          goToStep(LISTING_STEP.details, -1);
          setIsPublishing(false);
          return;
        }

        const locationGate = checkPublishLocationCoherence();
        if (!locationGate.ok) {
          setGoPublicError(locationGate.reason);
          setTextGateMessage(locationGate.reason);
          setIsPublishing(false);
          setPhase("goPublic");
          return;
        }

        if (auth.userId) {
          const friction = await checkNewAccountPublishFriction({
            userId: auth.userId,
            isEdit: false,
          });
          if (!friction.ok) {
            setGoPublicError(friction.reason);
            setIsPublishing(false);
            setPhase("goPublic");
            return;
          }
        }

        const ownerGate = assertOwnerOnlyPublish({
          userId: auth.userId ?? "",
          listingHostId: resolveGarageHostId(auth.userId, auth.userEmail) || draft.hostId,
          userEmail: auth.userEmail,
          listingId: draft.id,
        });
        if (!ownerGate.ok) {
          setGoPublicError(ownerGate.reason);
          setIsPublishing(false);
          setPhase("goPublic");
          return;
        }

        const cleanedTitle = sanitizeUserText(draft.title).trim();
        const cleanedDescription = sanitizeUserText(draft.description).trim();

        const moderation = await moderateListingText({
          title: cleanedTitle,
          description: cleanedDescription,
          category: draft.category,
          subcategory: draft.subcategory,
        });
        if (!moderation.ok) {
          const strike = recordModerationStrike({
            userId: auth.userId,
            severe: moderation.reasonCode === "unsafe",
          });
          setTextGateMessage(
            strike.hasCooldown
              ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
              : `${messageForTextModeration(moderation.reasonCode, listing.itemInfo)} ${listing.moderationSoftNudgeListing}`,
          );
          goToStep(LISTING_STEP.details, -1);
          setIsPublishing(false);
          return;
        }

        const saved = await persistDraftForGoPublic();
        const withCleanText = {
          ...saved,
          title: cleanedTitle,
          description: cleanedDescription,
          instructionsUrl: "",
        };
        setDraft(withCleanText);
        const requiresPhone = listingRequiresPhoneKyc(withCleanText.modes, withCleanText.pricing);
        const status = await loadSellerGoPublicStatus(auth.userId, { requiresPhone });
        setGoPublicStatus(status);
        // Sign-in (+ phone if paid). Stripe Connect is required only when opening the store Live.
        if (status.ready) {
          finalizePublish(withCleanText);
          return;
        }
        setIsPublishing(false);
        setPhase("goPublic");
      } catch (error) {
        setIsPublishing(false);
        setGoPublicError(
          error instanceof Error ? error.message : t.listing.goPublic.couldNotPrepareChecklist,
        );
        setPhase("goPublic");
      }
    })();
  };

  const handleGoLiveFromChecklist = () => {
    void (async () => {
      // Never reuse busy="refresh" here — that makes the secondary refresh link
      // look like a modal/blocker ("Refreshing…") while Go live appears dead.
      setGoPublicError(null);
      setGoPublicErrorCode(null);
      setIsPublishing(true);
      try {
        const requiresPhone = listingRequiresPhoneKyc(draft.modes, draft.pricing);
        const status = await loadSellerGoPublicStatus(auth.userId, { requiresPhone });
        setGoPublicStatus(status);
        if (!status.ready) {
          setGoPublicError(
            status.requiresPhone && !status.phoneVerified
              ? t.listing.goPublic.phoneRequiredPaid
              : t.listing.goPublic.signInToPublish,
          );
          setIsPublishing(false);
          return;
        }

        const locationGate = checkPublishLocationCoherence();
        if (!locationGate.ok) {
          setGoPublicError(locationGate.reason);
          setIsPublishing(false);
          return;
        }

        if (auth.userId) {
          const friction = await checkNewAccountPublishFriction({
            userId: auth.userId,
            isEdit: isEditing,
          });
          if (!friction.ok) {
            setGoPublicError(friction.reason);
            setIsPublishing(false);
            return;
          }
        }

        const claimedHostId = resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId || "";
        const ownerGate = assertOwnerOnlyPublish({
          userId: auth.userId ?? claimedHostId,
          userEmail: auth.userEmail,
          // Claim draft under the household garage host before ownership check.
          listingHostId: claimedHostId,
          listingId: draft.id,
        });
        if (!ownerGate.ok) {
          setGoPublicError(ownerGate.reason);
          setIsPublishing(false);
          return;
        }

        const saved = await persistDraftForGoPublic();
        finalizePublish({ ...saved, hostId: claimedHostId || saved.hostId });
      } catch (error) {
        setIsPublishing(false);
        setGoPublicBusy(null);
        setGoPublicError(
          error instanceof Error ? error.message : t.listing.goPublic.couldNotPublish,
        );
      }
    })();
  };

  const handleChecklistSignIn = () => {
    void (async () => {
      const saved = await persistDraftForGoPublic({ syncRemote: false });
      if (onRequireAuth) {
        onRequireAuth(saved.id);
        return;
      }
      setGoPublicError(t.listing.goPublic.signInFromProfileHint);
    })();
  };

  const handleChecklistPhone = () => {
    setGoPublicError(null);
    setPhoneSheetOpen(true);
  };

  const handleChecklistConnect = () => {
    void (async () => {
      setGoPublicBusy("stripe");
      setGoPublicError(null);
      setGoPublicErrorCode(null);
      try {
        // Local draft only — awaiting remote photo upload was blocking Stripe redirect.
        const saved = await persistDraftForGoPublic({ syncRemote: false });
        const result = await startConnectForListing(listingWizardReturnPath(saved.id));
        if (!result.ok) {
          if (result.code === "already_connected") {
            await refreshGoPublicStatus();
            return;
          }
          setGoPublicError(result.reason || null);
          setGoPublicErrorCode(result.code ?? null);
          // If status already shows bank linked, drop the scary banner.
          const status = await loadSellerGoPublicStatus(auth.userId, {
            requiresPhone: listingRequiresPhoneKyc(draft.modes, draft.pricing),
          });
          setGoPublicStatus(status);
          if (status.payoutsReady) {
            setGoPublicError(null);
            setGoPublicErrorCode(null);
          }
          return;
        }
        if (result.mode === "redirect") {
          window.location.assign(result.url);
        }
      } catch (error) {
        setGoPublicError(error instanceof Error ? error.message : t.listing.goPublic.stripeConnectFailed);
        setGoPublicErrorCode(null);
      } finally {
        setGoPublicBusy(null);
      }
    })();
  };

  /**
   * Vision gate over the whole gallery, not a sample of two.
   *
   * It runs twice on the way to details — on the photos step, and again once a
   * shelf is picked, because "this is not that shelf" is the one verdict the
   * first pass cannot reach. Verdicts are cached per photo and per shelf, so
   * the second pass only pays for what actually changed.
   */
  const runGalleryModerationGate = async (options: {
    softNudge: boolean;
    videos: boolean;
  }): Promise<boolean> => {
    setPhotoGateMessage(null);
    if (isInModerationCooldown(auth.userId)) {
      setPhotoGateMessage(
        listing.moderationCooldownWait(
          formatCooldownHours(getModerationCooldownRemaining(auth.userId)),
        ),
      );
      return false;
    }

    setPhotoModerationPending(true);
    try {
      const moderation = await moderateListingMediaPhotos(draft.photos, {
        category: draft.category,
        subcategory: draft.subcategory,
      });
      if (!moderation.ok) {
        const strike = recordModerationStrike({
          userId: auth.userId,
          severe:
            moderation.reasonCode === "nsfw" || moderation.reasonCode === "prohibited_item",
        });
        const message = messageForGalleryModeration(moderation, listing.photos);
        setPhotoGateMessage(
          strike.hasCooldown
            ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
            : options.softNudge
              ? `${message} ${listing.moderationSoftNudgeListing}`
              : message,
        );
        return false;
      }

      if (options.videos && draft.videos.length > 0) {
        const videoModeration = await moderateListingMediaVideos(draft.videos, {
          category: draft.category,
          subcategory: draft.subcategory,
        });
        if (!videoModeration.ok) {
          const strike = recordModerationStrike({
            userId: auth.userId,
            severe:
              videoModeration.reasonCode === "nsfw" ||
              videoModeration.reasonCode === "prohibited_item",
          });
          setPhotoGateMessage(
            strike.hasCooldown
              ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
              : messageForVideoModeration(videoModeration.reasonCode, {
                  ...listing.photos,
                  moderationBadVideo: listing.photos.moderationBadVideo,
                  moderationVideoNotListable: listing.photos.moderationVideoNotListable,
                }),
          );
          return false;
        }
      }

      return true;
    } finally {
      setPhotoModerationPending(false);
    }
  };

  const handleContinue = async () => {
    setContinueBlockedMessage(null);

    const validationCopy = listing.validation;
    const failure = getFirstListingStepFailure(step, draft, validationCopy);
    const pendingBusy =
      (step === LISTING_STEP.photos &&
        (draft.aiAnalysisPending ||
          draft.photoEnhancementPending ||
          photoModerationPending)) ||
      (step === LISTING_STEP.category && photoModerationPending) ||
      (step === LISTING_STEP.details && textModerationPending);

    if (pendingBusy) return;

    if (failure) {
      setContinueBlockedMessage(failure.message);
      window.requestAnimationFrame(() => {
        scrollToListingFieldAnchor(failure.anchorId);
      });
      return;
    }

    if (step === LISTING_STEP.photos) {
      if (!(await runGalleryModerationGate({ softNudge: true, videos: true }))) return;

      if (!draft.aiSuggestions) {
        await runListingPhotoAnalysis();
      }
      goToStep(
        isYardSaleListingActive() ? LISTING_STEP.details : LISTING_STEP.category,
        1,
      );
      return;
    }

    if (step === LISTING_STEP.category) {
      // The shelf is known only now, so this is the first time the photos can
      // be held against it.
      if (!(await runGalleryModerationGate({ softNudge: true, videos: false }))) return;

      goToStep(step + 1, 1);
      return;
    }

    if (step === LISTING_STEP.details) {
      setTextGateMessage(null);
      if (isInModerationCooldown(auth.userId)) {
        setTextGateMessage(
          listing.moderationCooldownWait(
            formatCooldownHours(getModerationCooldownRemaining(auth.userId)),
          ),
        );
        return;
      }

      setTextModerationPending(true);
      try {
        const cleanedTitle = sanitizeUserText(draft.title).trim();
        const cleanedDescription = sanitizeUserText(draft.description).trim();
        if (cleanedTitle !== draft.title || cleanedDescription !== draft.description) {
          setDraft((current) => ({
            ...current,
            title: cleanedTitle,
            description: cleanedDescription,
          }));
        }

        const moderation = await moderateListingText({
          title: cleanedTitle,
          description: cleanedDescription,
          category: draft.category,
          subcategory: draft.subcategory,
        });
        if (!moderation.ok) {
          const strike = recordModerationStrike({
            userId: auth.userId,
            severe: moderation.reasonCode === "unsafe",
          });
          setTextGateMessage(
            strike.hasCooldown
              ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
              : `${messageForTextModeration(moderation.reasonCode, listing.itemInfo)} ${listing.moderationSoftNudgeListing}`,
          );
          return;
        }

        goToStep(step + 1, 1);
      } finally {
        setTextModerationPending(false);
      }
      return;
    }

    if (isLastStep) return;
    goToStep(step + 1, 1);
  };

  const handleLetAiDecideCategory = () => {
    setDraft((current) => ({
      ...current,
      category: "",
      subcategory: "",
      grade: "",
      categorySpecs: {},
    }));
    goToStep(LISTING_STEP.photos, 1);
  };

  /** Soft-fill details from photos — call only after moderation passed. */
  const runListingPhotoAnalysis = async (): Promise<ListingDraft | null> => {
    setDraft((current) => ({ ...current, aiAnalysisPending: true }));
    try {
      const suggestions = await analyzeListingMediaPhotos(draft.photos);
      let appliedDraft: ListingDraft | null = null;
      setDraft((current) => {
        appliedDraft = applyAiSuggestionsToDraft(current, suggestions);
        return appliedDraft;
      });
      return appliedDraft;
    } catch (error) {
      setDraft((current) => ({ ...current, aiAnalysisPending: false }));
      if (import.meta.env.DEV) {
        console.warn("AI photo analysis failed:", error);
      }
      return null;
    }
  };

  const handleAnalyzePhotos = async () => {
    if (
      draft.photos.length === 0 ||
      draft.aiAnalysisPending ||
      draft.photoEnhancementPending ||
      photoModerationPending
    ) {
      return;
    }

    if (!(await runGalleryModerationGate({ softNudge: false, videos: true }))) return;
    await runListingPhotoAnalysis();
  };

  const continueLabel =
    (step === LISTING_STEP.photos || step === LISTING_STEP.category) &&
    (draft.aiAnalysisPending || photoModerationPending) ? (
      <span className="flex flex-col items-center justify-center gap-0.5">
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {photoModerationPending && !draft.aiAnalysisPending
            ? listing.photos.verifyingPhotos(MASCOT_NAME)
            : listing.analyzingPhotos(MASCOT_NAME)}
        </span>
        {photoProgressTick >= 3 ? (
          <span className="text-[11px] font-medium text-white/90">
            {listing.analyzingPhotosHangHint}
          </span>
        ) : null}
      </span>
    ) : step === LISTING_STEP.details && textModerationPending ? (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        {listing.itemInfo.verifyingText(MASCOT_NAME)}
      </span>
    ) : (
      listing.continue
    );

  const continueDisabled =
    step === LISTING_STEP.photos
      ? draft.aiAnalysisPending ||
        draft.photoEnhancementPending ||
        photoModerationPending
      : step === LISTING_STEP.category
        ? photoModerationPending
        : step === LISTING_STEP.details
          ? textModerationPending
          : false;

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

    // Soft exit — keep the draft in storage. Explicit trash still hard-deletes.
    onExit("discarded");
  };

  const handleDeleteListing = () => {
    if (deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    setShowDeleteDialog(false);
    setShowDiscardDialog(false);
    setWizardStack([]);

    if (draft.id) {
      const ownerId = resolveGarageHostId(auth.userId, auth.userEmail) || auth.userId;
      if (ownerId) {
        void removePublishedListingRemote(draft.id, ownerId);
      } else {
        removePublishedListing(draft.id);
      }
    }

    onExit("discarded");
  };

  /** Trash is available on every create/edit step — not only after a draft id exists. */
  const canDeleteListing = isEditing || draft.listingStatus === "draft" || phase === "steps";

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
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col items-center justify-center overflow-hidden px-6"
        style={{ backgroundColor: BACKGROUND }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: PRIMARY_GREEN }} aria-hidden />
        <p className="mt-3 text-sm font-medium text-[#6B7280]">{listing.loadingListing}</p>
      </div>
    );
  }

  if (phase === "goPublic") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <header className="shrink-0 bg-white px-4 pb-3 pt-4">
          <div className="relative mb-1 flex items-center justify-center">
            <button
              type="button"
              onClick={handleBack}
              className="absolute left-0 rounded-full p-2 transition-colors hover:bg-[#F3F4F6]"
              aria-label={listing.goBackAria}
            >
              <ArrowLeft className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
            </button>
            <div className="text-center">
              <p className="text-xs font-medium text-[#9CA3AF]">{headerTitle}</p>
              <p className="text-sm font-semibold text-[#374151]">{stepLabel}</p>
            </div>
            <button
              type="button"
              onClick={openDeleteDialog}
              className="absolute right-0 rounded-full p-2 text-red-700 transition-colors hover:bg-red-50"
              aria-label={listing.deleteListing}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <GoPublicChecklist
            status={goPublicStatus}
            loading={goPublicLoading}
            busy={goPublicBusy}
            error={goPublicError}
            errorCode={goPublicErrorCode}
            showPayouts={false}
            onSignIn={handleChecklistSignIn}
            onVerifyPhone={handleChecklistPhone}
            onConnectBank={handleChecklistConnect}
            onRefresh={() => {
              setGoPublicBusy("refresh");
              void refreshGoPublicStatus();
            }}
            onGoLive={handleGoLiveFromChecklist}
            onBack={handleBack}
            isPublishing={isPublishing}
          />
          <PhoneVerifySheet
            open={phoneSheetOpen}
            initialPhone={loadUserProfile().phone}
            alreadyVerified={Boolean(goPublicStatus?.phoneVerified)}
            onClose={() => {
              setPhoneSheetOpen(false);
              setGoPublicBusy("refresh");
              void refreshGoPublicStatus();
            }}
            onVerified={(nextPhone) => {
              const current = loadUserProfile();
              saveUserProfile({
                ...current,
                phone: nextPhone,
                verification: { ...current.verification, phone: true },
              });
              setPhoneSheetOpen(false);
              setGoPublicBusy("refresh");
              void refreshGoPublicStatus();
            }}
          />
        </main>
        {showDeleteDialog ? (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) closeDeleteDialog();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-listing-title-gopublic"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <h2
                id="delete-listing-title-gopublic"
                className="text-lg font-semibold text-[#111827]"
              >
                {listing.deleteTitle}
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">{listing.deleteBody}</p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteListing}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white"
                >
                  {listing.deleteConfirmCta}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (phase === "qrStory") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <QRStoryScreen
          onGotIt={() => setPhase("qrSticker")}
          onSkip={() => setPhase("success")}
        />
      </div>
    );
  }

  if (phase === "qrSticker") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden"
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
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <ListingPublishSuccess
          title={getListingDisplayTitle(draft.title)}
          statusLine={publishStatusLine}
          photosPending={photosPending}
          photosRetryBusy={photosRetryBusy}
          onRetryPhotos={() => void retryPhotoUpload()}
          payoutNudge={Boolean(goPublicStatus && !goPublicStatus.payoutsReady)}
          payoutBusy={goPublicBusy === "stripe"}
          onSetupPayouts={handleChecklistConnect}
          onPreviewShop={onPreviewShop ? () => onPreviewShop(draft.id) : undefined}
          onShare={() => setPhase("share")}
          onPlanOpenSale={
            draft.modes.sell && !isFreeGiveaway(draft) && onPlanOpenSale
              ? () => onPlanOpenSale(draft.id)
              : undefined
          }
          onDone={() => onExit("finished")}
        />
      </div>
    );
  }

  if (phase === "share") {
    return (
      <div
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden"
        style={{ backgroundColor: BACKGROUND }}
      >
        <ListingShareScreen
          draft={draft}
          onDone={() => onExit("finished")}
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex h-full min-h-0 w-full max-w-[430px] flex-col overflow-hidden"
      style={{ backgroundColor: BACKGROUND }}
    >
      <header className="shrink-0 bg-white px-4 pb-3 pt-4">
        <div className="relative mb-3 flex items-center justify-center">
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-0 rounded-full p-2 transition-colors hover:bg-[#F3F4F6]"
            aria-label={listing.goBackAria}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
          </button>
          <div className="text-center">
            <p className="text-xs font-medium text-[#9CA3AF]">{headerTitle}</p>
            <p className="text-sm font-semibold text-[#374151]">{stepLabel}</p>
            {canReturnToPrevious ? (
              <p className="mt-0.5 text-[11px] font-medium text-[#9CA3AF]">
                {listing.returnToPreviousQr}
              </p>
            ) : null}
          </div>
          {canDeleteListing ? (
            <button
              type="button"
              onClick={openDeleteDialog}
              className="absolute right-0 rounded-full p-2 text-red-700 transition-colors hover:bg-red-50"
              aria-label={listing.deleteListing}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          ) : null}
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
            {step === LISTING_STEP.review ? (
              <Step7Review
                draft={draft}
                setDraft={setDraft}
                profileCity={profileCity}
                isPublishing={isPublishing}
                isEditing={isEditing}
                publishError={publishError}
                onPublish={handlePublish}
                onGoToStep={(target) => goToStep(target, -1)}
              />
            ) : step === LISTING_STEP.photos ? (
              <Step1Photos
                draft={draft}
                setDraft={setDraft}
                onAnalyzePhotos={() => void handleAnalyzePhotos()}
                gateMessage={photoGateMessage}
                onDismissGateMessage={() => setPhotoGateMessage(null)}
              />
            ) : step === LISTING_STEP.category ? (
              <StepCategories
                key={draft.id || "new-listing"}
                draft={draft}
                setDraft={setDraft}
                onLetAiDecide={handleLetAiDecideCategory}
                registerPhaseBack={(fn) => {
                  categoryPhaseBackRef.current = fn;
                }}
              />
            ) : (
              <Step2Details
                draft={draft}
                setDraft={setDraft}
                gateMessage={textGateMessage}
                onDismissGateMessage={() => setTextGateMessage(null)}
                onEditPhotos={() => goToStep(LISTING_STEP.photos, -1)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLastStep ? (
        <footer className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-4">
          {step === LISTING_STEP.category && photoGateMessage ? (
            <p
              role="status"
              className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
            >
              {photoGateMessage}
            </p>
          ) : null}
          {continueBlockedMessage ? (
            <p
              role="status"
              className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
            >
              {continueBlockedMessage}
            </p>
          ) : null}
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
            onPointerDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (Date.now() - discardDialogOpenedAtRef.current < 450) return;
              setShowDiscardDialog(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="discard-listing-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <h2
                id="discard-listing-title"
                className="text-lg font-semibold text-[#111827]"
              >
                {listing.discardTitle}
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                {listing.discardBody}
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDiscardDialog(false)}
                  className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: PRIMARY_GREEN }}
                >
                  {listing.discard}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) closeDeleteDialog();
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-listing-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <h2
                id="delete-listing-title"
                className="text-lg font-semibold text-[#111827]"
              >
                {listing.deleteTitle}
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">{listing.deleteBody}</p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteListing}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white"
                >
                  {listing.deleteConfirmCta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export type { ListingDraft } from "./types";
