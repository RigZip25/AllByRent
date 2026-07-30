import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { StepProps } from "../types";
import { RentanoHint } from "../../../components/RentanoHint";
import { MASCOT_NAME } from "../../../lib/brand";
import { improveListingDescription } from "../listingDescriptionImprove";
import { isYardSaleListingActive } from "../../../lib/yardSaleListing";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabels";
import { useMessages } from "../../../lib/i18n/react";
import {
  CATEGORIES,
  CATEGORY_NAMES,
  getCategoryModeRules,
  getSubcategories,
  matchListingCategory,
  type CategoryGrade,
} from "../listingItemCategories";

function matchAiSubcategory(
  matchedCategory: string,
  grade: CategoryGrade,
  aiSubcategory: string,
): string {
  const categoryData = CATEGORIES[matchedCategory];
  if (!categoryData) return "Other";

  const subs = categoryData[grade] ?? categoryData.personal;
  const labels = subs.map((item) => item.label);
  const normalizedAi = aiSubcategory.trim().toLowerCase();
  if (!normalizedAi) return "Other";

  const exact = labels.find((label) => label.toLowerCase() === normalizedAi);
  if (exact) return exact;

  const partial = labels.find(
    (label) =>
      label.toLowerCase().includes(normalizedAi) ||
      normalizedAi.includes(label.toLowerCase()),
  );
  if (partial) return partial;

  const aiWords = normalizedAi.split(/[^a-z0-9]+/).filter((word) => word.length >= 2);
  const wordMatch = labels.find((label) => {
    const labelLower = label.toLowerCase();
    return aiWords.some(
      (word) => labelLower.includes(word) || word.includes(labelLower),
    );
  });
  if (wordMatch) return wordMatch;

  return "Other";
}

const GREEN = "#0D5C3A";


function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="mb-2">
      <span className="text-label text-sm font-semibold uppercase tracking-wide text-gray-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
    </div>
  );
}

function inputClassName(extra = "") {
  return `text-body w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition-colors focus:border-green-700 ${extra}`;
}

export function Step2ItemInfo({ draft, setDraft }: StepProps) {
  const { listing } = useMessages();
  const item = listing.itemInfo;
  const gradeOptions = [
    { value: "personal" as const, label: item.personal },
    { value: "professional" as const, label: item.professional },
  ];
  const conditionOptions = [
    { value: "new" as const, label: item.conditionNew },
    { value: "like_new" as const, label: item.conditionLikeNew },
    { value: "good" as const, label: item.conditionGood },
    { value: "fair" as const, label: item.conditionFair },
  ];
  const appliedSuggestionsKey = useRef<string | null>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
  const [, setDescriptionImproveTip] = useState<string | null>(null);
  const [isAnimatingDescription, setIsAnimatingDescription] = useState(false);
  const [isDescriptionUserEdited, setIsDescriptionUserEdited] = useState(false);

  const yardSaleListing = isYardSaleListingActive();
  const categoryModeRules = getCategoryModeRules(draft.category);
  const replacementValueLabel =
    categoryModeRules.replacementValueLabel ?? item.replacementValue;
  const replacementValueHelper =
    categoryModeRules.replacementValueHelper ?? item.replacementValueHelper;

  const clearTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
  }, []);

  const animateDescriptionText = useCallback(
    (text: string, onComplete?: () => void) => {
      clearTypewriter();
      setIsAnimatingDescription(true);
      let index = 0;

      typewriterRef.current = setInterval(() => {
        index += 2;
        const next = text.slice(0, index);
        setDraft((current) => ({ ...current, description: next }));

        if (index >= text.length) {
          clearTypewriter();
          setDraft((current) => ({ ...current, description: text }));
          setIsAnimatingDescription(false);
          onComplete?.();
        }
      }, 12);
    },
    [clearTypewriter, setDraft],
  );

  useEffect(() => () => clearTypewriter(), [clearTypewriter]);

  const handleImproveDescription = async () => {
    if (isImprovingDescription || isAnimatingDescription) return;

    setIsImprovingDescription(true);
    setDescriptionImproveTip(null);

    try {
      const improved = await improveListingDescription(draft);
      setIsImprovingDescription(false);
      animateDescriptionText(improved, () => {
        setDescriptionImproveTip("Here's a sharper version. Feel free to edit.");
      });
    } catch {
      setIsImprovingDescription(false);
    }
  };

  const category = draft.category;
  const grade = draft.grade;
  const subcategoryOptions =
    category && grade ? getSubcategories(category, grade) : [];
  const canPickSubcategory = Boolean(category && grade);

  useEffect(() => {
    if (!draft.aiSuggestions) {
      appliedSuggestionsKey.current = null;
      return;
    }

    const suggestions = draft.aiSuggestions;
    const suggestionKey = JSON.stringify(suggestions);
    if (appliedSuggestionsKey.current === suggestionKey) return;
    appliedSuggestionsKey.current = suggestionKey;

    const matchedCategory = matchListingCategory(suggestions.category);
    const aiGrade = suggestions.grade || "personal";
    const matchedSubcategory = matchedCategory
      ? matchAiSubcategory(matchedCategory, aiGrade, suggestions.subcategory)
      : "";

    const steps: (() => void)[] = [
      () =>
        setDraft((current) => ({ ...current, title: suggestions.title ?? current.title })),
      () =>
        setDraft((current) => ({
          ...current,
          grade: suggestions.grade || current.grade,
        })),
      () =>
        setDraft((current) => ({
          ...current,
          ...(matchedCategory
            ? {
                category: matchedCategory,
                subcategory: matchedSubcategory,
              }
            : {}),
        })),
      () => {
        if (!matchedSubcategory) return;
        setDraft((current) => ({
          ...current,
          subcategory: matchedSubcategory,
        }));
      },
      () =>
        setDraft((current) => ({
          ...current,
          condition: suggestions.condition || current.condition,
        })),
      () =>
        setDraft((current) => ({
          ...current,
          description: suggestions.description || current.description,
        })),
      () =>
        setDraft((current) => ({
          ...current,
          replacementValue:
            suggestions.estimatedValue != null
              ? String(suggestions.estimatedValue)
              : current.replacementValue,
        })),
    ];

    steps.forEach((apply, index) => {
      setTimeout(apply, index * 150);
    });
  }, [draft.aiSuggestions, setDraft]);

  const marketValueLinkTitle =
    draft.title.length > 30 ? `${draft.title.substring(0, 30)}...` : draft.title;

  const aiDescription = draft.aiSuggestions?.description ?? "";
  const aiDescriptionUnchanged =
    Boolean(aiDescription) && draft.description === aiDescription;

  const showImproveButton =
    draft.description.length > 20 &&
    !aiDescriptionUnchanged &&
    (isDescriptionUserEdited || !draft.aiSuggestions);

  return (
    <div className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold" style={{ color: GREEN }}>
            {yardSaleListing ? item.titleYardSale : item.title}
          </h2>
          <p className="text-label mt-1 text-base text-gray-500">
            {yardSaleListing ? item.subtitleYardSale : item.subtitle}
          </p>
        </div>

        {yardSaleListing ? (
          <div
            className="mb-6 rounded-xl border px-3 py-2.5 text-sm font-medium"
            style={{ borderColor: `${GREEN}33`, backgroundColor: `${GREEN}08`, color: GREEN }}
          >
            {item.yardSaleBadge}
          </div>
        ) : null}

        <div className="mb-6">
          <FieldLabel label={item.fieldTitle} required />
          <div className="relative">
            <input
              type="text"
              maxLength={80}
              value={draft.title}
              placeholder={item.titlePlaceholder}
              className={inputClassName("pr-14")}
              onChange={(event) => {
                setDraft((current) => ({ ...current, title: event.target.value }));
              }}
            />
            <span className="text-label pointer-events-none absolute bottom-3 right-4 text-gray-400">
              {draft.title.length}/80
            </span>
          </div>
        </div>

        {!yardSaleListing ? (
        <>
        <div className="mb-6">
          <FieldLabel label={item.category} required />
          <select
            value={draft.category}
            className={inputClassName()}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                category: event.target.value,
                subcategory: "",
              }));
            }}
          >
            <option value="">{item.selectCategory}</option>
            {CATEGORY_NAMES.map((name) => (
              <option key={name} value={name}>
                {localizeCategoryLabel(name)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <FieldLabel label={item.grade} required />
          <div className="flex gap-2">
            {gradeOptions.map((option) => {
              const selected = draft.grade === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      grade: option.value,
                      subcategory: "",
                    }));
                  }}
                  className="btn-secondary-card flex-1 rounded-2xl border px-4 py-3 text-base font-semibold transition-colors"
                  style={{
                    backgroundColor: selected ? GREEN : "#FFFFFF",
                    borderColor: GREEN,
                    color: selected ? "#FFFFFF" : GREEN,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-label mt-2 text-sm text-gray-500">
            {item.gradeHint}
          </p>
        </div>

        <div className="mb-6">
          <FieldLabel label={item.subcategory} required />
          {!canPickSubcategory && category ? (
            <p className="text-label mb-2 text-sm text-amber-700">
              {item.selectGradeForSubs}
            </p>
          ) : null}
          <select
            value={draft.subcategory}
            disabled={!canPickSubcategory}
            className={inputClassName("disabled:cursor-not-allowed disabled:opacity-50")}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                subcategory: event.target.value,
              }));
            }}
          >
            <option value="">
              {canPickSubcategory ? item.selectSubcategory : item.selectGradeFirst}
            </option>
            {subcategoryOptions.map((sub) => (
              <option key={sub.label} value={sub.label}>
                {sub.emoji} {localizeCategoryLabel(sub.label)}
              </option>
            ))}
          </select>
        </div>
        </>
        ) : null}

        <div className="mb-6">
          <FieldLabel label={item.condition} required />
          <div className="grid grid-cols-2 gap-2">
            {conditionOptions.map((option) => {
              const selected = draft.condition === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      condition: option.value,
                    }));
                  }}
                  className="btn-secondary-card rounded-2xl border px-4 py-3 text-base font-semibold transition-colors"
                  style={{
                    backgroundColor: selected ? GREEN : "#FFFFFF",
                    borderColor: GREEN,
                    color: selected ? "#FFFFFF" : GREEN,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mb-6"
          animate={
            isAnimatingDescription
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(13,92,58,0)",
                    "0 0 0 3px rgba(13,92,58,0.15)",
                    "0 0 0 0 rgba(13,92,58,0)",
                  ],
                }
              : { boxShadow: "0 0 0 0 rgba(13,92,58,0)" }
          }
          transition={
            isAnimatingDescription
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          <FieldLabel label={item.description} />
          <motion.div className="relative" initial={false} animate={{ opacity: 1 }}>
            <textarea
              maxLength={1000}
              value={draft.description}
              placeholder={item.descriptionPlaceholder}
              className={inputClassName("min-h-[120px] resize-none pr-16")}
              onChange={(event) => {
                const value = event.target.value;
                setDescriptionImproveTip(null);
                setIsDescriptionUserEdited(value.length > 0);
                setDraft((current) => ({
                  ...current,
                  description: value,
                }));
              }}
            />
            <span className="text-label pointer-events-none absolute bottom-3 right-4 text-gray-400">
              {draft.description.length}/1000
            </span>
          </motion.div>
          {showImproveButton ? (
            isImprovingDescription ? (
              <div
                className="mt-2 flex items-center gap-2 text-sm"
                style={{ color: GREEN }}
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {item.rewriting(MASCOT_NAME)}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImproveDescription}
                disabled={isAnimatingDescription}
                className="mt-2 text-sm underline disabled:opacity-50"
                style={{ color: GREEN }}
              >
                {item.askImprove(MASCOT_NAME)}
              </button>
            )
          ) : null}
        </motion.div>

        <div className="mb-6">
          <FieldLabel label={replacementValueLabel} required />
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              min={0}
              value={draft.replacementValue}
              placeholder="1200"
              className={inputClassName("pl-8")}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  replacementValue: event.target.value,
                }));
              }}
            />
          </div>
          <p className="text-label mt-2 text-sm text-gray-500">{replacementValueHelper}</p>
          {draft.title.length > 0 ? (
            <RentanoHint
              className="mt-3"
              hint={item.notSureValue}
              linkText={item.searchPriceLink(marketValueLinkTitle)}
              linkUrl={`https://www.google.com/search?q=${encodeURIComponent(
                `${draft.title} price new`,
              )}`}
            />
          ) : null}
        </div>

        <div className="mb-6">
          <FieldLabel label={item.instructionsUrl} />
          <input
            type="url"
            value={draft.instructionsUrl}
            placeholder={item.instructionsPlaceholder}
            className={inputClassName()}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                instructionsUrl: event.target.value,
              }))
            }
          />
          <p className="text-label mt-2 text-sm text-gray-500">
            {item.instructionsHelper}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
