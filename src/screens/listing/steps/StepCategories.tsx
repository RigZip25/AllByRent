import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft } from "lucide-react";
import type { StepProps } from "../types";
import { Emoji } from "../../../app/components/Emoji";
import { ShelfIcon } from "../../../components/ShelfIcon";
import { APP_NAME } from "../../../lib/brand";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabels";
import { useMessages } from "../../../lib/i18n/react";
import { getAllCategoryChips } from "../../../lib/homeCategoryPicks";
import {
  getSubcategories,
  type CategoryGrade,
  type SubcategoryItem,
} from "../listingItemCategories";

const GREEN = "#0D5C3A";
const GREEN_SOFT = "#1A9E6E";
const BORDER = "#E8E6E0";

type Phase = "category" | "grade" | "subcategory" | "confirm";
/** UI pick — "both" shows household + pro shelves; draft.grade stays personal|professional. */
type GradePick = CategoryGrade | "both";

type StepCategoriesProps = StepProps & {
  /** Register header-back handler for inner phases. Return true if back was handled. */
  registerPhaseBack?: (handler: (() => boolean) | null) => void;
  /** Skip shelf pick — advance to photos so AI can fill category/sub/grade. */
  onLetAiDecide?: () => void;
};

function TileButton({
  emoji,
  icon,
  label,
  hint,
  selected,
  onClick,
}: {
  emoji?: string;
  icon?: SubcategoryItem;
  label: string;
  hint?: string;
  selected?: boolean;
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
        borderColor: selected ? GREEN : BORDER,
        borderWidth: selected ? 2 : 1,
        backgroundColor: selected ? `${GREEN}0D` : "#FFFFFF",
        boxShadow: selected ? `0 0 0 3px ${GREEN}22` : "none",
      }}
    >
      {selected ? (
        <span
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: GREEN }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
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

function resolvePhase(draft: StepProps["draft"]): Phase {
  if (draft.category && draft.grade && draft.subcategory) return "confirm";
  if (draft.category && draft.grade) return "subcategory";
  if (draft.category) return "grade";
  return "category";
}

function resolveGradePick(draft: StepProps["draft"]): GradePick | null {
  if (draft.grade === "personal" || draft.grade === "professional") return draft.grade;
  return null;
}

/** Category → Personal / Pro / Both → shelf → confirm. */
export function StepCategories({
  draft,
  setDraft,
  registerPhaseBack,
  onLetAiDecide,
}: StepCategoriesProps) {
  const { listing, common, shelf } = useMessages();
  const item = listing.itemInfo;
  const [phase, setPhase] = useState<Phase>(() => resolvePhase(draft));
  const [gradePick, setGradePick] = useState<GradePick | null>(() => resolveGradePick(draft));

  const categoryChips = useMemo(() => getAllCategoryChips(), []);
  const personalSubs = useMemo(
    () => (draft.category ? getSubcategories(draft.category, "personal") : []),
    [draft.category],
  );
  const professionalSubs = useMemo(
    () => (draft.category ? getSubcategories(draft.category, "professional") : []),
    [draft.category],
  );

  const selectedCategoryIcon =
    categoryChips.find((chip) => chip.name === draft.category)?.icon ?? "📦";

  const selectedSubIcon = ((): SubcategoryItem => {
    if (!draft.subcategory) return { label: "", emoji: selectedCategoryIcon };
    const fromPersonal = personalSubs.find((sub) => sub.label === draft.subcategory);
    if (fromPersonal) return fromPersonal;
    const fromPro = professionalSubs.find((sub) => sub.label === draft.subcategory);
    return fromPro ?? { label: "", emoji: selectedCategoryIcon };
  })();

  const gradeChipLabel =
    draft.grade === "professional"
      ? item.professional
      : draft.grade === "personal"
        ? item.personal
        : null;

  const pickCategory = (name: string) => {
    setDraft((current) => ({
      ...current,
      category: name,
      subcategory: "",
      grade: "",
      categorySpecs: {},
    }));
    setGradePick(null);
    setPhase("grade");
  };

  /** Clear selection so only the next tap shows as active — avoids stale checkmarks. */
  const startFreshCategoryPick = () => {
    setDraft((current) => ({
      ...current,
      category: "",
      subcategory: "",
      grade: "",
      categorySpecs: {},
    }));
    setGradePick(null);
    setPhase("category");
  };

  const pickGrade = (next: GradePick) => {
    setGradePick(next);
    setDraft((current) => ({
      ...current,
      // "both" is a browse mode — clear until they pick a shelf from a section
      grade: next === "both" ? "" : next,
      subcategory: "",
      categorySpecs: {},
    }));
    setPhase("subcategory");
  };

  const pickSubcategory = (label: string, grade: CategoryGrade) => {
    setDraft((current) => ({
      ...current,
      subcategory: label,
      grade,
      categorySpecs: {},
    }));
    setGradePick((prev) => (prev === "both" ? "both" : grade));
    setPhase("confirm");
  };

  const goBackPhase = () => {
    if (phase === "subcategory") {
      setDraft((current) => ({
        ...current,
        grade: "",
        subcategory: "",
        categorySpecs: {},
      }));
      setGradePick(null);
      setPhase("grade");
      return;
    }
    if (phase === "confirm") {
      setDraft((current) => ({
        ...current,
        subcategory: "",
        categorySpecs: {},
      }));
      setPhase("subcategory");
      return;
    }
    if (phase === "grade") {
      startFreshCategoryPick();
    }
  };

  useEffect(() => {
    if (!registerPhaseBack) return;
    registerPhaseBack(() => {
      if (phase === "category") return false;
      if (phase === "grade") {
        startFreshCategoryPick();
        return true;
      }
      if (phase === "subcategory") {
        setDraft((current) => ({
          ...current,
          grade: "",
          subcategory: "",
          categorySpecs: {},
        }));
        setGradePick(null);
        setPhase("grade");
        return true;
      }
      if (phase === "confirm") {
        setDraft((current) => ({
          ...current,
          subcategory: "",
          categorySpecs: {},
        }));
        setPhase("subcategory");
        return true;
      }
      return false;
    });
    return () => registerPhaseBack(null);
  }, [phase, registerPhaseBack, setDraft]);

  // After "let AI decide" clears the shelf, reset inner phases on return.
  useEffect(() => {
    if (!draft.category) {
      setPhase("category");
      setGradePick(null);
    }
  }, [draft.category]);

  const phaseTitle =
    phase === "category"
      ? item.categoryStepTitle
      : phase === "grade"
        ? item.gradeStepTitle
        : phase === "subcategory"
          ? item.subcategoryStepTitle
          : item.confirmCategoryTitle;

  const phaseSubtitle =
    phase === "category"
      ? item.categoryStepSubtitle
      : phase === "grade"
        ? item.gradeStepSubtitle
        : phase === "subcategory"
          ? item.subcategoryStepSubtitle
          : item.confirmCategorySubtitle;

  const showBothShelves = gradePick === "both";

  return (
    <div className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5">
      <div className="mb-4 flex items-start gap-2">
        {phase !== "category" ? (
          <button
            type="button"
            onClick={goBackPhase}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: BORDER, color: GREEN }}
            aria-label={common.back}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold" style={{ color: GREEN }}>
            {phaseTitle}
          </h2>
          <p className="text-label mt-1 text-base text-gray-500">{phaseSubtitle}</p>
        </div>
      </div>

      {draft.category ? (
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
          {gradePick || draft.grade ? (
            <>
              <span className="text-gray-300">›</span>
              <button
                type="button"
                onClick={() => {
                  setDraft((current) => ({
                    ...current,
                    grade: "",
                    subcategory: "",
                    categorySpecs: {},
                  }));
                  setGradePick(null);
                  setPhase("grade");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[12px] font-semibold"
                style={{ borderColor: phase === "grade" ? GREEN : BORDER, color: GREEN }}
              >
                {gradePick === "both"
                  ? item.bothGrades
                  : draft.grade === "professional" || gradePick === "professional"
                    ? item.professional
                    : item.personal}
              </button>
            </>
          ) : null}
          {draft.subcategory ? (
            <>
              <span className="text-gray-300">›</span>
              <button
                type="button"
                onClick={() => {
                  setDraft((current) => ({
                    ...current,
                    subcategory: "",
                    categorySpecs: {},
                  }));
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
          {phase === "category" ? (
            <>
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
              {onLetAiDecide ? (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={onLetAiDecide}
                    className="text-[13px] font-medium text-gray-500 underline-offset-2 transition-colors hover:text-gray-700 hover:underline"
                  >
                    {item.letAiDecideFromPhotos(APP_NAME)}
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          {phase === "grade" ? (
            <div className="grid grid-cols-1 gap-3">
              <TileButton
                emoji="🏠"
                label={item.personal}
                hint={item.personalGradeHint}
                selected={gradePick === "personal"}
                onClick={() => pickGrade("personal")}
              />
              <TileButton
                emoji="🛠️"
                label={item.professional}
                hint={item.professionalGradeHint}
                selected={gradePick === "professional"}
                onClick={() => pickGrade("professional")}
              />
              <TileButton
                emoji="🔀"
                label={item.bothGrades}
                hint={item.bothGradesHint}
                selected={gradePick === "both"}
                onClick={() => pickGrade("both")}
              />
            </div>
          ) : null}

          {phase === "subcategory" ? (
            showBothShelves ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-[15px] font-bold" style={{ color: GREEN }}>
                    {shelf.personalUse}
                  </h3>
                  <SubGrid
                    items={personalSubs}
                    selected={draft.grade === "personal" ? draft.subcategory : undefined}
                    onPick={(label) => pickSubcategory(label, "personal")}
                  />
                </div>
                <div>
                  <h3 className="mb-3 text-[15px] font-bold" style={{ color: GREEN }}>
                    {shelf.professionalUse}
                  </h3>
                  <SubGrid
                    items={professionalSubs}
                    selected={draft.grade === "professional" ? draft.subcategory : undefined}
                    onPick={(label) => pickSubcategory(label, "professional")}
                  />
                </div>
              </div>
            ) : (
              <SubGrid
                items={
                  (gradePick === "professional" || draft.grade === "professional"
                    ? professionalSubs
                    : personalSubs)
                }
                selected={draft.subcategory}
                onPick={(label) =>
                  pickSubcategory(
                    label,
                    gradePick === "professional" || draft.grade === "professional"
                      ? "professional"
                      : "personal",
                  )
                }
              />
            )
          ) : null}

          {phase === "confirm" && draft.category && draft.subcategory && draft.grade ? (
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{ borderColor: `${GREEN}44` }}
            >
              <div
                className="flex flex-col items-center gap-3 px-5 py-8 text-center"
                style={{
                  background: `linear-gradient(180deg, ${GREEN}14 0%, #FFFFFF 70%)`,
                }}
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
                    {gradeChipLabel ? ` · ${gradeChipLabel}` : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-2 border-t px-4 py-4" style={{ borderColor: BORDER }}>
                <button
                  type="button"
                  onClick={startFreshCategoryPick}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.changeCategory}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      grade: "",
                      subcategory: "",
                      categorySpecs: {},
                    }));
                    setGradePick(null);
                    setPhase("grade");
                  }}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.changeGrade}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      subcategory: "",
                      categorySpecs: {},
                    }));
                    setPhase("subcategory");
                  }}
                  className="w-full rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold text-gray-700"
                  style={{ borderColor: BORDER }}
                >
                  {item.changeSubcategory}
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {onLetAiDecide && phase !== "category" ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onLetAiDecide}
            className="text-[13px] font-medium text-gray-500 underline-offset-2 transition-colors hover:text-gray-700 hover:underline"
          >
            {item.letAiDecideFromPhotos(APP_NAME)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
