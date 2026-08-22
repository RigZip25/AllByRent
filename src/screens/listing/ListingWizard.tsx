import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import confetti from "canvas-confetti";
import { MASCOT_NAME } from "../../lib/brand";
import { useAuth } from "../../hooks/AuthProvider";
import { resolveHostAccountId } from "../../lib/hostIdentity";
import { getProfileCity, savePublishedListingRemote, savePublishedListing, saveListingDraftProgress, stampListingDraftProgress, removePublishedListing, removePublishedListingRemote, fetchListingByIdRemote, getPublishedListingById } from "../../lib/listingStorage";
import { syncAgentPrefsRemote, ensureBrowserTimeZoneCaptured } from "../../lib/agentPrefs";
import { notifyGarageFollowersOfNewListing } from "../../lib/garageFollowNotify";
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
  startIdentityVerificationForListing,
  type SellerGoPublicStatus,
} from "../../lib/sellerGoPublic";
import { isFreeGiveaway, listingChargesMoney } from "../../lib/listingGift";
import { PhoneVerifySheet } from "../../components/profile/PhoneVerifySheet";
import { analyzeListingMediaPhotos } from "./listingAnalysis";
import {
  messageForPhotoModeration,
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
import { isListingStepValid } from "./validation";
import { useMessages } from "../../lib/i18n/react";

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
type GoPublicBusy = null | "identity" | "stripe" | "refresh" | "phone";

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
  onPreviewShop,
  onPlanOpenSale,
}: {
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
}) {
  const auth = useAuth();
  const t = useMessages();
  const listing = t.listing;
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
  const [textGateMessage, setTextGateMessage] = useState<string | null>(null);
  const [textModerationPending, setTextModerationPending] = useState(false);
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
      const ownerId = resolveHostAccountId(auth.userId) || auth.userId;
      void saveListingDraftProgress(
        {
          ...draft,
          // Prefer signed-in id so guest drafts reclaim when the host signs in mid-wizard.
          hostId: ownerId || draft.hostId || undefined,
        },
        ownerId,
        step,
      ).then(() => {
        if (ownerId) void syncAgentPrefsRemote(ownerId);
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [auth.userId, draft, isPublishing, loadingEdit, phase, step]);

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
        error instanceof Error ? error.message : "Could not check seller setup.",
      );
      return null;
    } finally {
      setGoPublicLoading(false);
      setGoPublicBusy(null);
    }
  }, [auth.userId, draft.modes, draft.pricing]);

  useEffect(() => {
    if (phase !== "goPublic") return;
    void refreshGoPublicStatus();
  }, [phase, auth.userId, refreshGoPublicStatus]);

  const persistDraftForGoPublic = useCallback(
    async (opts?: { syncRemote?: boolean }) => {
      // Prefer signed-in auth id so drafts started as guest/local reclaim correctly.
      const hostId = resolveHostAccountId(auth.userId) || draft.hostId;
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

  const canContinue = isListingStepValid(step, draft);
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
      // Success screen: back means return to listings (same as Done).
      onExit("finished");
      return;
    }

    if (step === 1) {
      if (categoryPhaseBackRef.current?.()) return;
      discardDialogOpenedAtRef.current = Date.now();
      setShowDiscardDialog(true);
      return;
    }

    goToStep(step - 1, -1);
  };

  const finalizePublish = (sourceDraft: ListingDraft = draft) => {
    setIsPublishing(true);

    window.setTimeout(() => {
      // Signed-in auth id wins so guest/local draft hostIds do not block publish.
      const hostId = resolveHostAccountId(auth.userId) || sourceDraft.hostId || "";
      const ownerGate = assertOwnerOnlyPublish({
        userId: auth.userId ?? hostId,
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
          void savePublishedListingRemote(savedDraft, hostId);
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
        void savePublishedListingRemote(publishedDraft, hostId);
        recordDevicePublish(hostId);
      }
      const profile = loadUserProfile();
      notifyGarageFollowersOfNewListing({
        hostId,
        hostName: profile.displayName,
        listingTitle: getListingDisplayTitle(publishedDraft.title) || publishedDraft.title || "New listing",
      });
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

          const ownerGate = assertOwnerOnlyPublish({
            userId: auth.userId ?? "",
            listingHostId: draft.hostId,
            listingId: draft.id,
          });
          if (!ownerGate.ok) {
            setTextGateMessage(ownerGate.reason);
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
            setTextGateMessage(
              strike.hasCooldown
                ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
                : messageForTextModeration(moderation.reasonCode, listing.itemInfo),
            );
            goToStep(LISTING_STEP.details, -1);
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
          setTextGateMessage(listing.itemInfo.moderationTextVerifyFailed);
          goToStep(LISTING_STEP.details, -1);
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
          listingHostId: resolveHostAccountId(auth.userId) || draft.hostId,
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
        // Signed in (+ phone if paid). Open checklist for soft Connect nudge on paid listings.
        const needsPayouts = listingChargesMoney(withCleanText);
        if (status.ready && (!needsPayouts || status.payoutsReady)) {
          finalizePublish(withCleanText);
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
              : "Sign in to publish your listing.",
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

        const claimedHostId = resolveHostAccountId(auth.userId) || auth.userId || "";
        const ownerGate = assertOwnerOnlyPublish({
          userId: claimedHostId,
          // Claim draft under the signed-in host before ownership check.
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
          error instanceof Error ? error.message : "Could not publish your listing.",
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
      setGoPublicError("Sign in from More → Profile, then return here.");
    })();
  };

  const handleChecklistPhone = () => {
    setGoPublicError(null);
    setPhoneSheetOpen(true);
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
        window.location.assign(result.url);
      } catch (error) {
        setGoPublicError(error instanceof Error ? error.message : "Stripe Connect failed.");
        setGoPublicErrorCode(null);
      } finally {
        setGoPublicBusy(null);
      }
    })();
  };

  const handleContinue = async () => {
    if (step === LISTING_STEP.photos) {
      if (
        draft.photos.length === 0 ||
        draft.aiAnalysisPending ||
        draft.photoEnhancementPending ||
        photoModerationPending
      ) {
        return;
      }

      setPhotoGateMessage(null);
      if (isInModerationCooldown(auth.userId)) {
        setPhotoGateMessage(
          listing.moderationCooldownWait(
            formatCooldownHours(getModerationCooldownRemaining(auth.userId)),
          ),
        );
        return;
      }

      setPhotoModerationPending(true);
      try {
        // Always re-moderate on Continue (including already-enhanced photos).
        const moderation = await moderateListingMediaPhotos(draft.photos, {
          category: draft.category,
          subcategory: draft.subcategory,
        });
        if (!moderation.ok) {
          const strike = recordModerationStrike({
            userId: auth.userId,
            severe:
              moderation.reasonCode === "nsfw" ||
              moderation.reasonCode === "prohibited_item",
          });
              setPhotoGateMessage(
            strike.hasCooldown
              ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
              : `${messageForPhotoModeration(moderation.reasonCode, listing.photos)} ${listing.moderationSoftNudgeListing}`,
          );
          return;
        }

        if (draft.videos.length > 0) {
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
            return;
          }
        }

        if (!draft.aiSuggestions) {
          await runListingPhotoAnalysis();
        }
        goToStep(LISTING_STEP.details, 1);
      } finally {
        setPhotoModerationPending(false);
      }
      return;
    }

    if (step === LISTING_STEP.details) {
      if (!canContinue || textModerationPending) return;

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

    if (!canContinue) return;
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
  const runListingPhotoAnalysis = async () => {
    setDraft((current) => ({ ...current, aiAnalysisPending: true }));
    try {
      const suggestions = await analyzeListingMediaPhotos(draft.photos);
      setDraft((current) => applyAiSuggestionsToDraft(current, suggestions));
    } catch (error) {
      setDraft((current) => ({ ...current, aiAnalysisPending: false }));
      if (import.meta.env.DEV) {
        console.warn("AI photo analysis failed:", error);
      }
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

    setPhotoGateMessage(null);
    if (isInModerationCooldown(auth.userId)) {
      setPhotoGateMessage(
        listing.moderationCooldownWait(
          formatCooldownHours(getModerationCooldownRemaining(auth.userId)),
        ),
      );
      return;
    }

    setPhotoModerationPending(true);
    let allowed = false;
    try {
      const moderation = await moderateListingMediaPhotos(draft.photos, {
        category: draft.category,
        subcategory: draft.subcategory,
      });
      if (!moderation.ok) {
        const strike = recordModerationStrike({
          userId: auth.userId,
          severe:
            moderation.reasonCode === "nsfw" ||
            moderation.reasonCode === "prohibited_item",
        });
        setPhotoGateMessage(
          strike.hasCooldown
            ? listing.moderationCooldownWait(formatCooldownHours(strike.cooldownMs))
            : messageForPhotoModeration(moderation.reasonCode, listing.photos),
        );
        return;
      }
      if (draft.videos.length > 0) {
        const videoModeration = await moderateListingMediaVideos(draft.videos, {
          category: draft.category,
          subcategory: draft.subcategory,
        });
        if (!videoModeration.ok) {
          setPhotoGateMessage(
            messageForVideoModeration(videoModeration.reasonCode, {
              ...listing.photos,
              moderationBadVideo: listing.photos.moderationBadVideo,
              moderationVideoNotListable: listing.photos.moderationVideoNotListable,
            }),
          );
          return;
        }
      }
      allowed = true;
    } finally {
      setPhotoModerationPending(false);
    }

    if (!allowed) return;
    await runListingPhotoAnalysis();
  };

  const continueLabel =
    step === LISTING_STEP.photos && (draft.aiAnalysisPending || photoModerationPending) ? (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        {photoModerationPending && !draft.aiAnalysisPending
          ? listing.photos.verifyingPhotos(MASCOT_NAME)
          : listing.analyzingPhotos(MASCOT_NAME)}
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
      ? draft.photos.length === 0 ||
        draft.aiAnalysisPending ||
        draft.photoEnhancementPending ||
        photoModerationPending
      : step === LISTING_STEP.details
        ? !canContinue || textModerationPending
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
      const ownerId = resolveHostAccountId(auth.userId) || auth.userId;
      if (ownerId) {
        void removePublishedListingRemote(draft.id, ownerId);
      } else {
        removePublishedListing(draft.id);
      }
    }

    onExit("discarded");
  };

  const handleDeleteListing = () => {
    if (deleteInFlightRef.current) return;
    deleteInFlightRef.current = true;
    setShowDeleteDialog(false);
    setShowDiscardDialog(false);
    setWizardStack([]);

    if (draft.id) {
      const ownerId = resolveHostAccountId(auth.userId) || auth.userId;
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
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col items-center justify-center overflow-hidden px-6"
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
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
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
            showPayouts={listingChargesMoney(draft)}
            onSignIn={handleChecklistSignIn}
            onVerifyIdentity={handleChecklistIdentity}
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
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
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
          payoutNudge={Boolean(
            goPublicStatus &&
              !goPublicStatus.payoutsReady &&
              listingChargesMoney(draft),
          )}
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
        className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
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
      className="relative mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col overflow-hidden"
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
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isLastStep ? (
        <footer className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-4">
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
}

export type { ListingDraft } from "./types";
