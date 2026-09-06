import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, Search } from "lucide-react";
import type { ListingCategoryDecision, StepProps } from "../types";
import { Emoji } from "../../../app/components/Emoji";
import { ShelfIcon } from "../../../components/ShelfIcon";
import { trackEvent } from "../../../lib/analytics";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabels";
import { useMessages } from "../../../lib/i18n/react";
import { getAllCategoryChips } from "../../../lib/homeCategoryPicks";
import {
  getMergedSubcategories,
  type CategoryGrade,
  type SubcategoryItem,
} from "../listingItemCategories";
import {
  LISTING_TAXONOMY,
  resolveTaxonomySelection,
  taxonomyIdsForNames,
} from "../taxonomyCatalog";
import type { CategoryCandidate, ClassificationOutcome } from "../ai/listingClassifier";
import {
  applyCategoryDecision,
  applyListingType,
  candidateFromNames,
  clearCategoryDecision,
  clearListingType,
  clearSubcategory,
  isCorrectionOfSuggestion,
  selectCategoryOnly,
  suggestionsFromOutcome,
} from "../ai/categoryDecision";
import {
  loadPreferredListingType,
  savePreferredListingType,
} from "../ai/listingTypePreference";
import { loadRecentCategories, rememberRecentCategory } from "../ai/recentCategories";
import { effectiveListingType } from "../validation";
import { AiAnalyzingCard, AiChoicesCard, AiFallbackNotice, AiMatchCard } from "./AiCategoryPanel";

const GREEN = "#0D5C3A";
const GREEN_SOFT = "#1A9E6E";
const BORDER = "#E8E6E0";

type Phase =
  | "analyzing"
  | "match"
  | "choices"
  | "category"
  | "subcategory"
  | "listingType"
  | "confirm";

type StepCategoriesProps = StepProps & {
  /** Register header-back handler for inner phases. Return true if back was handled. */
  registerPhaseBack?: (handler: (() => boolean) | null) => void;
  /** Latest photo classification, owned by the wizard. */
  classification?: ClassificationOutcome | null;
  classifyPending?: boolean;
  onRetryClassification?: () => void;
  onBackToPhotos?: () => void;
};

function TileButton({
  emoji,
  icon,
  label,
  hint,
  selected,
  /** Highlighted as a likely answer without claiming the host chose it. */
  suggested,
  onClick,
}: {
  emoji?: string;
  icon?: SubcategoryItem;
  label: string;
  hint?: string;
  selected?: boolean;
  suggested?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1.5 border bg-white text-center transition-all active:scale-[0.98]"
      style={{
        minHeight: hint ? 120 : 112,
        padding: 14,
        borderRadius: 16,
        borderColor: selected ? GREEN : suggested ? GREEN_SOFT : BORDER,
        borderWidth: selected || suggested ? 2 : 1,
        backgroundColor: selected ? `${GREEN}0D` : "#FFFFFF",
        boxShadow: selected ? `0 0 0 3px ${GREEN}22` : "none",
      }}
    >
      {selected ? (
        <span
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: GREEN }}
        >
          <Check className="h-3 w-3 shrink-0" strokeWidth={3} />
        </span>
      ) : null}
      {icon ? (
        <ShelfIcon source={icon} size={48} />
      ) : emoji ? (
        <Emoji emoji={emoji} size={48} />
      ) : null}
      <span
        className="line-clamp-2 w-full px-0.5 text-[13px] font-semibold leading-snug"
        style={{ color: selected ? GREEN : "#374151" }}
      >
        {label}
      </span>
      {hint ? (
        <span className="line-clamp-2 w-full px-0.5 text-[11px] leading-snug text-gray-500">
          {hint}
        </span>
      ) : null}
    </button>
  );
}

function SubGrid({
  items,
  selected,
  onPick,
}: {
  items: SubcategoryItem[];
  selected?: string;
  onPick: (label: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((sub) => (
        <TileButton
          key={sub.label}
          icon={sub}
          label={localizeCategoryLabel(sub.label)}
          selected={selected === sub.label}
          onClick={() => onPick(sub.label)}
        />
      ))}
    </div>
  );
}

function ShelfRow({
  category,
  subcategory,
  onClick,
}: {
  category: string;
  subcategory: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-all active:scale-[0.99]"
      style={{ borderColor: BORDER }}
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-bold text-gray-900">
          {localizeCategoryLabel(subcategory)}
        </span>
        <span className="block truncate text-[12px] font-semibold text-gray-500">
          {localizeCategoryLabel(category)}
        </span>
      </span>
      <ChevronLeft className="h-4 w-4 shrink-0 rotate-180 text-gray-300" />
    </button>
  );
}

function resolveInitialPhase(
  draft: StepProps["draft"],
  classification: ClassificationOutcome | null | undefined,
  pending: boolean,
): Phase {
  if (pending) return "analyzing";
  if (draft.category && draft.subcategory && effectiveListingType(draft)) return "confirm";
  if (draft.category && draft.subcategory) return "listingType";
  if (draft.category) return "subcategory";
  if (classification?.status === "match") return "match";
  if (classification?.status === "choices") return "choices";
  return "category";
}

/**
 * Category step: AI suggestion first, manual browse always available.
 *
 * Phases: analyzing → match/choices → (confirm or manual category → subcategory)
 * → listing type → confirm. Nothing advances without a host action.
 */
export function StepCategories({
  draft,
  setDraft,
  registerPhaseBack,
  classification,
  classifyPending = false,
  onRetryClassification,
  onBackToPhotos,
}: StepCategoriesProps) {
  const { listing, common } = useMessages();
  const item = listing.itemInfo;
  const copy = listing.aiCategory;

  const [phase, setPhase] = useState<Phase>(() =>
    resolveInitialPhase(draft, classification, classifyPending),
  );
  const [query, setQuery] = useState("");
  const [manualNotice, setManualNotice] = useState(false);
  const appliedClassificationRef = useRef<ClassificationOutcome | null>(null);

  const categoryChips = useMemo(() => getAllCategoryChips(), []);
  const mergedSubs = useMemo(
    () => (draft.category ? getMergedSubcategories(draft.category) : []),
    [draft.category],
  );
  const recents = useMemo(() => loadRecentCategories(), []);
  const suggestions = useMemo(
    () => suggestionsFromOutcome(classification).slice(0, 3),
    [classification],
  );
  const preferredListingType = useMemo(() => loadPreferredListingType(), []);
  const listingType = effectiveListingType(draft);

  const selectedCategoryIcon =
    categoryChips.find((chip) => chip.name === draft.category)?.icon ?? "📦";

  const selectedSubIcon = ((): SubcategoryItem => {
    if (!draft.subcategory) return { label: "", emoji: selectedCategoryIcon };
    return (
      mergedSubs.find((sub) => sub.label === draft.subcategory) ?? {
        label: "",
        emoji: selectedCategoryIcon,
      }
    );
  })();

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const results: { category: string; subcategory: string }[] = [];
    for (const category of LISTING_TAXONOMY) {
      const categoryMatches =
        category.name.toLowerCase().includes(needle) ||
        localizeCategoryLabel(category.name).toLowerCase().includes(needle);
      for (const sub of category.subcategories) {
        const labelMatches =
          sub.label.toLowerCase().includes(needle) ||
          localizeCategoryLabel(sub.label).toLowerCase().includes(needle);
        if (!labelMatches && !categoryMatches) continue;
        results.push({ category: category.name, subcategory: sub.label });
        if (results.length >= 24) return results;
      }
    }
    return results;
  }, [query]);

  /** Records the decision without touching the listing type. */
  const applySelection = (
    candidate: CategoryCandidate,
    source: ListingCategoryDecision["source"],
    itemName: string,
  ) => {
    setDraft((current) => applyCategoryDecision(current, candidate, source, itemName));
    setQuery("");
    setManualNotice(false);
    setPhase("listingType");
  };

  const confirmAiCandidate = (candidate: CategoryCandidate, itemName: string) => {
    const selection = resolveTaxonomySelection(candidate.categoryId, candidate.subcategoryId);
    if (!selection) {
      openManualSelector("invalid_suggestion");
      return;
    }
    trackEvent("ai_category_confirmed", {
      categoryId: selection.categoryId,
      subcategoryId: selection.subcategoryId,
      mode: classification?.status ?? "match",
      pickedPrimary:
        classification?.status === "match"
          ? classification.primary.subcategoryId === selection.subcategoryId
          : null,
    });
    applySelection(candidate, "ai_confirmed", itemName);
  };

  const openManualSelector = (from: string) => {
    trackEvent("manual_category_opened", {
      from,
      hadSuggestion: suggestions.length > 0,
    });
    setPhase("category");
    setManualNotice(false);
  };

  const pickManualPair = (categoryName: string, subcategoryLabel: string) => {
    const candidate = candidateFromNames(categoryName, subcategoryLabel);
    if (!candidate) return;

    if (isCorrectionOfSuggestion(classification, candidate)) {
      const aiPrimary = suggestionsFromOutcome(classification)[0]!;
      trackEvent("ai_category_changed", {
        fromCategoryId: aiPrimary.categoryId,
        fromSubcategoryId: aiPrimary.subcategoryId,
        toCategoryId: candidate.categoryId,
        toSubcategoryId: candidate.subcategoryId,
      });
    }

    applySelection(candidate, "manual", draft.categoryDecision?.itemName ?? "");
  };

  const pickCategory = (name: string) => {
    setDraft((current) => selectCategoryOnly(current, name));
    setQuery("");
    setPhase("subcategory");
  };

  const pickListingType = (next: CategoryGrade) => {
    savePreferredListingType(next);
    const ids = taxonomyIdsForNames(draft.category, draft.subcategory);
    trackEvent("listing_type_selected", {
      listingType: next,
      categoryId: ids?.categoryId ?? null,
      subcategoryId: ids?.subcategoryId ?? null,
      source: draft.categoryDecision?.source ?? "manual",
    });
    setDraft((current) => applyListingType(current, next));
    rememberRecentCategory(draft.category, draft.subcategory);
    setPhase("confirm");
  };

  const startFreshCategoryPick = () => {
    setDraft((current) => clearCategoryDecision(current));
    setPhase("category");
  };

  const backToSuggestions = (): boolean => {
    if (classification?.status === "match") {
      setPhase("match");
      return true;
    }
    if (classification?.status === "choices") {
      setPhase("choices");
      return true;
    }
    return false;
  };

  const goBackPhase = (): boolean => {
    if (phase === "confirm") {
      setDraft((current) => clearListingType(current));
      setPhase("listingType");
      return true;
    }
    if (phase === "listingType") {
      if (draft.categoryDecision?.source === "ai_confirmed" && backToSuggestions()) {
        return true;
      }
      setDraft((current) => clearSubcategory(current));
      setPhase("subcategory");
      return true;
    }
    if (phase === "subcategory") {
      setDraft((current) => clearCategoryDecision(current));
      setPhase("category");
      return true;
    }
    if (phase === "category") {
      return backToSuggestions();
    }
    return false;
  };

  const goBackRef = useRef(goBackPhase);
  goBackRef.current = goBackPhase;

  useEffect(() => {
    if (!registerPhaseBack) return;
    registerPhaseBack(() => goBackRef.current());
    return () => registerPhaseBack(null);
  }, [registerPhaseBack]);

  // Move to the analyzing / suggestion phase as the wizard reports progress.
  useEffect(() => {
    if (classifyPending) {
      setPhase("analyzing");
      appliedClassificationRef.current = null;
    }
  }, [classifyPending]);

  useEffect(() => {
    if (classifyPending || !classification) return;
    if (appliedClassificationRef.current === classification) return;
    appliedClassificationRef.current = classification;
    if (draft.subcategory) return; // Host already decided; don't yank them back.

    if (classification.status === "match") {
      setPhase("match");
      setManualNotice(false);
      return;
    }
    if (classification.status === "choices") {
      setPhase("choices");
      setManualNotice(false);
      return;
    }
    setPhase(draft.category ? "subcategory" : "category");
    setManualNotice(true);
  }, [classification, classifyPending, draft.category, draft.subcategory]);

  const phaseTitle =
    phase === "category"
      ? item.categoryStepTitle
      : phase === "subcategory"
        ? item.subcategoryStepTitle
        : phase === "listingType"
          ? copy.listingTypeTitle
          : phase === "confirm"
            ? item.confirmCategoryTitle
            : "";

  const phaseSubtitle =
    phase === "category"
      ? item.categoryStepSubtitle
      : phase === "subcategory"
        ? item.subcategoryStepSubtitle
        : phase === "listingType"
          ? copy.listingTypeSubtitle
          : phase === "confirm"
            ? item.confirmCategorySubtitle
            : "";

  const showHeader = phase !== "analyzing" && phase !== "match" && phase !== "choices";
  const showBreadcrumbs = Boolean(draft.category) && showHeader;

  return (
    <div className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5">
      {showHeader ? (
        <div className="mb-4 flex items-start gap-2">
          {phase !== "category" || classification ? (
            <button
              type="button"
              onClick={() => goBackPhase()}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white"
              style={{ borderColor: BORDER, color: GREEN }}
              aria-label={common.back}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold" style={{ color: GREEN }}>
              {phaseTitle}
            </h2>
            {phaseSubtitle ? (
              <p className="text-label mt-1 text-base text-gray-500">{phaseSubtitle}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {manualNotice && classification?.status === "manual" ? (
        <AiFallbackNotice
          reason={classification.reason}
          onRetry={onRetryClassification}
          onBackToPhotos={onBackToPhotos}
        />
      ) : null}

      {showBreadcrumbs ? (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={startFreshCategoryPick}
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[12px] font-semibold"
            style={{ borderColor: phase === "category" ? GREEN : BORDER, color: GREEN }}
          >
            <Emoji emoji={selectedCategoryIcon} size={16} />
            {localizeCategoryLabel(draft.category)}
          </button>
          {draft.subcategory ? (
            <>
              <span className="text-gray-300">›</span>
              <button
                type="button"
                onClick={() => {
                  setDraft((current) => clearSubcategory(current));
                  setPhase("subcategory");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[12px] font-semibold"
                style={{ borderColor: phase === "subcategory" ? GREEN : BORDER, color: GREEN }}
              >
                <ShelfIcon source={selectedSubIcon} size={20} />
                {localizeCategoryLabel(draft.subcategory)}
              </button>
            </>
          ) : null}
          {listingType ? (
            <>
              <span className="text-gray-300">›</span>
              <button
                type="button"
                onClick={() => {
                  setDraft((current) => clearListingType(current));
                  setPhase("listingType");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[12px] font-semibold"
                style={{ borderColor: phase === "listingType" ? GREEN : BORDER, color: GREEN }}
              >
                {listingType === "professional" ? item.professional : item.personal}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {phase === "analyzing" ? <AiAnalyzingCard /> : null}

          {phase === "match" && classification?.status === "match" ? (
            <AiMatchCard
              candidate={classification.primary}
              itemName={classification.itemName}
              onConfirm={() =>
                confirmAiCandidate(classification.primary, classification.itemName)
              }
              onChange={() => openManualSelector("match")}
            />
          ) : null}

          {phase === "choices" && classification?.status === "choices" ? (
            <AiChoicesCard
              candidates={classification.candidates}
              itemName={classification.itemName}
              onPick={(candidate) => confirmAiCandidate(candidate, classification.itemName)}
              onChange={() => openManualSelector("choices")}
            />
          ) : null}

          {phase === "category" ? (
            <>
              <div
                className="mb-4 flex items-center gap-2 rounded-2xl border bg-white px-3 py-2.5"
                style={{ borderColor: BORDER }}
              >
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full bg-transparent text-[14px] outline-none"
                  aria-label={copy.searchPlaceholder}
                />
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <ShelfRow
                      key={`${result.category}/${result.subcategory}`}
                      category={result.category}
                      subcategory={result.subcategory}
                      onClick={() => pickManualPair(result.category, result.subcategory)}
                    />
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                <p className="py-6 text-center text-[13px] text-gray-500">{copy.noResults}</p>
              ) : (
                <>
                  {suggestions.length > 0 ? (
                    <div className="mb-5">
                      <h3
                        className="mb-2 text-[12px] font-bold uppercase tracking-wide"
                        style={{ color: GREEN_SOFT }}
                      >
                        {copy.suggested}
                      </h3>
                      <div className="space-y-2">
                        {suggestions.map((candidate) => (
                          <ShelfRow
                            key={`sug-${candidate.categoryId}/${candidate.subcategoryId}`}
                            category={candidate.categoryName}
                            subcategory={candidate.subcategoryLabel}
                            onClick={() =>
                              pickManualPair(candidate.categoryName, candidate.subcategoryLabel)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {recents.length > 0 ? (
                    <div className="mb-5">
                      <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-400">
                        {copy.recent}
                      </h3>
                      <div className="space-y-2">
                        {recents.map((entry) => (
                          <ShelfRow
                            key={`recent-${entry.category}/${entry.subcategory}`}
                            category={entry.category}
                            subcategory={entry.subcategory}
                            onClick={() => pickManualPair(entry.category, entry.subcategory)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-gray-400">
                    {copy.allCategories}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryChips.map((chip) => (
                      <TileButton
                        key={chip.name}
                        emoji={chip.icon}
                        label={localizeCategoryLabel(chip.name)}
                        selected={draft.category === chip.name}
                        onClick={() => pickCategory(chip.name)}
                      />
                    ))}
                  </div>

                  {onBackToPhotos ? (
                    <button
                      type="button"
                      onClick={onBackToPhotos}
                      className="mt-6 w-full rounded-xl border bg-white py-3 text-[14px] font-semibold text-gray-700"
                      style={{ borderColor: BORDER }}
                    >
                      {copy.backToPhotos}
                    </button>
                  ) : null}
                </>
              )}
            </>
          ) : null}

          {phase === "subcategory" ? (
            <SubGrid
              items={mergedSubs}
              selected={draft.subcategory}
              onPick={(label) => pickManualPair(draft.category, label)}
            />
          ) : null}

          {phase === "listingType" ? (
            <div className="grid grid-cols-1 gap-3">
              <TileButton
                emoji="🏠"
                label={item.personal}
                hint={item.personalGradeHint}
                selected={listingType === "personal"}
                suggested={!listingType && preferredListingType === "personal"}
                onClick={() => pickListingType("personal")}
              />
              <TileButton
                emoji="🛠️"
                label={item.professional}
                hint={item.professionalGradeHint}
                selected={listingType === "professional"}
                suggested={!listingType && preferredListingType === "professional"}
                onClick={() => pickListingType("professional")}
              />
              {preferredListingType && !listingType ? (
                <p className="text-center text-[12px] text-gray-500">
                  {copy.lastUsed(
                    preferredListingType === "professional" ? item.professional : item.personal,
                  )}
                </p>
              ) : null}
            </div>
          ) : null}

          {phase === "confirm" && draft.category && draft.subcategory && listingType ? (
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{ borderColor: `${GREEN}44` }}
            >
              <div
                className="flex flex-col items-center gap-3 px-5 py-8 text-center"
                style={{ background: `linear-gradient(180deg, ${GREEN}14 0%, #FFFFFF 70%)` }}
              >
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-3xl border bg-white shadow-sm"
                  style={{ borderColor: `${GREEN}33` }}
                >
                  <ShelfIcon source={selectedSubIcon} size={52} />
                </div>
                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: GREEN_SOFT }}
                  >
                    {item.selectionConfirmed}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">
                    {localizeCategoryLabel(draft.subcategory)}
                  </h3>
                  <p className="mt-1 text-[14px] text-gray-500">
                    {localizeCategoryLabel(draft.category)}
                    {` · ${listingType === "professional" ? item.professional : item.personal}`}
                  </p>
                </div>
              </div>
              <div className="space-y-2 border-t px-4 py-4" style={{ borderColor: BORDER }}>
                <button
                  type="button"
                  onClick={() => openManualSelector("confirm")}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.changeCategory}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft((current) => clearSubcategory(current));
                    setPhase("subcategory");
                  }}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.changeSubcategory}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft((current) => clearListingType(current));
                    setPhase("listingType");
                  }}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {copy.changeListingType}
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
