import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Calendar, ChevronDown, Share2 } from "lucide-react";
import { hasPostRequestContext, type ShelfPrefill } from "../../lib/shelfListings";
import { MrRentano } from "./MrRentano";
import { RentanoTip } from "../../components/RentanoTip";
import { useAuth } from "../../hooks/AuthProvider";
import { SignInPrompt } from "../../components/SignInPrompt";
import { getActiveRentLocationLabel } from "../../lib/listingStorage";
import { createRequestRemote } from "../../lib/requestsStorage";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { APP_NAME, MARKETING_URL, MASCOT_NAME } from "../../lib/brand";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import type { AppMessages } from "../../lib/i18n/types";
import {
  getCategoryCatalog,
  type CategoryCatalogEntry,
} from "../../lib/homeCategoryPicks";
import type { SubcategoryItem } from "../../screens/listing/listingItemCategories";

const GREEN = "#0D5C3A";
const GREEN_LIGHT = "#1A9E6E";
const BORDER = "#E8E6E0";
const radiusOptions = ["5mi", "10mi", "25mi", "50mi"] as const;

type RequestIntent = "rent" | "buy" | "either";
type StepId = "category" | "need" | "timing" | "review";

type SlideDirection = 1 | -1;

const slideVariants = {
  enter: (direction: SlideDirection) => ({
    x: direction > 0 ? "28%" : "-28%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: SlideDirection) => ({
    x: direction > 0 ? "-18%" : "18%",
    opacity: 0,
  }),
};

function buildPrefillDescription(
  prefill: ShelfPrefill | null | undefined,
  copy: AppMessages["postRequest"],
): string {
  const query = (prefill?.query ?? "").trim();
  if (!prefill?.subcategory && !prefill?.category) {
    if (query) {
      const city = prefill?.city?.trim();
      return city ? copy.lookingForQueryNear(query, city) : copy.lookingForQuery(query);
    }
    return "";
  }
  const parts: string[] = [];
  if (prefill.subcategory) {
    parts.push(
      copy.lookingForSubInCat(
        localizeCategoryLabel(prefill.subcategory),
        localizeCategoryLabel(prefill.category ?? ""),
      ),
    );
  } else if (prefill.category) {
    parts.push(copy.lookingForItemsInCat(localizeCategoryLabel(prefill.category)));
  }
  if (query) parts.push(`“${query}”`);
  if (prefill.city) parts.push(copy.nearCity(prefill.city));
  return `${parts.join(" ")}.`;
}

function intentLabel(intent: RequestIntent, copy: AppMessages["postRequest"]): string {
  if (intent === "rent") return copy.intentRent;
  if (intent === "buy") return copy.intentBuy;
  return copy.intentEither;
}

function budgetLine(
  intent: RequestIntent,
  budget: number,
  radius: string,
  copy: AppMessages["postRequest"],
): string {
  if (intent === "buy") return copy.budgetNoteBuy(budget, radius);
  if (intent === "either") return copy.budgetNoteEither(budget, radius);
  return copy.budgetNote(budget, radius);
}

function whenLine(
  flexible: boolean,
  startDate: string,
  endDate: string,
  copy: AppMessages["postRequest"],
): string {
  if (flexible || (!startDate && !endDate)) return copy.whenFlexible;
  if (startDate && endDate) {
    return copy.whenRange(
      new Date(startDate).toLocaleDateString(),
      new Date(endDate).toLocaleDateString(),
    );
  }
  if (startDate) return copy.whenFrom(new Date(startDate).toLocaleDateString());
  return copy.whenFlexible;
}

function SubPickList({
  items,
  selected,
  onPick,
}: {
  items: SubcategoryItem[];
  selected: string | null;
  onPick: (label: string) => void;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
      {items.map((item) => {
        const active = selected === item.label;
        return (
          <li key={item.label}>
            <button
              type="button"
              onClick={() => onPick(item.label)}
              className={`flex w-full min-w-0 items-start gap-1.5 rounded-lg px-2 py-1.5 text-left text-[12.5px] leading-snug transition-colors ${
                active ? "bg-primary/10 font-semibold text-primary" : "text-gray-700 hover:bg-muted/60"
              }`}
            >
              <span className="mt-px w-4 shrink-0 text-center text-[13px]" aria-hidden>
                {item.emoji}
              </span>
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {localizeCategoryLabel(item.label)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CategoryPicker({
  catalog,
  openCategory,
  selectedCategory,
  selectedSubcategory,
  onToggleCategory,
  onSelectSubcategory,
  householdLabel,
  proLabel,
  selectCategoryLabel,
  selectSubcategoryLabel,
  hint,
}: {
  catalog: CategoryCatalogEntry[];
  openCategory: string | null;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onToggleCategory: (name: string) => void;
  onSelectSubcategory: (label: string) => void;
  householdLabel: string;
  proLabel: string;
  selectCategoryLabel: string;
  selectSubcategoryLabel: string;
  hint: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{selectCategoryLabel}</label>
      <p className="mb-3 text-[12px] leading-snug text-muted-foreground">{hint}</p>
      <div className="flex flex-col gap-2">
        {catalog.map((entry) => {
          const open = openCategory === entry.name;
          const picked =
            selectedCategory === entry.name && Boolean(selectedSubcategory);
          return (
            <div
              key={entry.name}
              className="overflow-hidden rounded-2xl border bg-card"
              style={{ borderColor: open || picked ? GREEN : BORDER }}
            >
              <button
                type="button"
                onClick={() => onToggleCategory(entry.name)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left active:bg-[#F7FBF8]"
              >
                <span className="text-[18px]" aria-hidden>
                  {entry.icon}
                </span>
                <span className="min-w-0 flex-1 text-[13px] font-bold text-gray-900">
                  {localizeCategoryLabel(entry.name)}
                  {picked ? (
                    <span className="mt-0.5 block text-[11px] font-medium text-primary">
                      {localizeCategoryLabel(selectedSubcategory!)}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[11px] font-medium text-gray-400">
                  {entry.personal.length + entry.professional.length}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  style={{ color: GREEN }}
                />
              </button>
              {open ? (
                <div className="space-y-3 border-t px-3 pb-3 pt-2.5" style={{ borderColor: BORDER }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {selectSubcategoryLabel}
                  </p>
                  {entry.personal.length > 0 ? (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {householdLabel}
                      </p>
                      <SubPickList
                        items={entry.personal}
                        selected={selectedSubcategory}
                        onPick={onSelectSubcategory}
                      />
                    </div>
                  ) : null}
                  {entry.professional.length > 0 ? (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                        {proLabel}
                      </p>
                      <SubPickList
                        items={entry.professional}
                        selected={selectedSubcategory}
                        onPick={onSelectSubcategory}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequestPreviewCard({
  category,
  subcategory,
  description,
  intent,
  when,
  budgetMeta,
  locationLabel,
  copy,
}: {
  category: string;
  subcategory: string;
  description: string;
  intent: RequestIntent;
  when: string;
  budgetMeta: string;
  locationLabel: string;
  copy: AppMessages["postRequest"];
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border"
      style={{
        borderColor: `${GREEN_LIGHT}44`,
        background:
          "linear-gradient(165deg, rgba(26,158,110,0.14) 0%, rgba(255,255,255,0.95) 42%, #fff 100%)",
      }}
    >
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-30" style={{ background: GREEN_LIGHT }} />
      <div className="relative space-y-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <MrRentano size={56} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: GREEN }}>
              {copy.wantedBadge} · {MASCOT_NAME}
            </p>
            <h3 className="mt-1 text-[17px] font-bold leading-snug text-gray-900">
              {localizeCategoryLabel(subcategory)}
            </h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {localizeCategoryLabel(category)}
              {locationLabel ? ` · ${locationLabel}` : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-[12px] font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            {intentLabel(intent, copy)}
          </span>
          <span
            className="rounded-full border bg-white/80 px-3 py-1 text-[12px] font-medium"
            style={{ borderColor: BORDER, color: GREEN }}
          >
            {when}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-gray-800">
          {description}
        </p>

        <p className="text-[12px] leading-snug text-muted-foreground">{budgetMeta}</p>
      </div>
    </div>
  );
}

export function PostRequest({
  prefill,
  onBack,
  onPost,
}: {
  prefill?: ShelfPrefill | null;
  onBack: () => void;
  onPost: () => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const copy = t.postRequest;
  const catalog = useMemo(() => getCategoryCatalog(), []);
  const prefillDescription = useMemo(
    () => buildPrefillDescription(prefill, copy),
    [prefill, copy],
  );
  const lockedContext = hasPostRequestContext(prefill);
  const steps = useMemo<StepId[]>(
    () => (lockedContext ? ["need", "timing", "review"] : ["category", "need", "timing", "review"]),
    [lockedContext],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => prefill?.category?.trim() || null,
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    () => prefill?.subcategory?.trim() || null,
  );
  const [openCategory, setOpenCategory] = useState<string | null>(
    () => prefill?.category?.trim() || null,
  );
  const [description, setDescription] = useState(prefillDescription);
  const [intent, setIntent] = useState<RequestIntent | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<string>("10mi");
  const [budget, setBudget] = useState(25);
  const [datesFlexible, setDatesFlexible] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stepId = steps[stepIndex] ?? "category";
  const locationLabel = (prefill?.city ?? getActiveRentLocationLabel()).trim();
  const category = lockedContext
    ? (prefill?.category ?? "").trim()
    : (selectedCategory ?? "").trim();
  const subcategory = lockedContext
    ? (prefill?.subcategory ?? "").trim()
    : (selectedSubcategory ?? "").trim();

  const whenText = whenLine(datesFlexible, startDate, endDate, copy);
  const activeIntent: RequestIntent = intent ?? "rent";
  const budgetMeta = budgetLine(activeIntent, budget, selectedRadius, copy);

  const sharePayload = useMemo(() => {
    const city = locationLabel || copy.yourArea;
    const text =
      description.trim() || copy.shareDefaultText(APP_NAME, city);
    return {
      title: copy.shareTitleApp(APP_NAME),
      text,
      url: MARKETING_URL,
    };
  }, [copy, description, locationLabel]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const goToStep = (nextIndex: number) => {
    setDirection(nextIndex > stepIndex ? 1 : -1);
    setStepIndex(nextIndex);
    setSubmitError(null);
  };

  const handleHeaderBack = () => {
    if (posted) {
      onPost();
      return;
    }
    if (stepIndex > 0) {
      goToStep(stepIndex - 1);
      return;
    }
    onBack();
  };

  const handleToggleCategory = (name: string) => {
    if (openCategory === name) {
      setOpenCategory(null);
      return;
    }
    setOpenCategory(name);
    if (selectedCategory !== name) {
      setSelectedCategory(name);
      setSelectedSubcategory(null);
    }
  };

  const handlePickSubcategory = (label: string) => {
    setSelectedSubcategory(label);
    setOpenCategory(null);
    if (selectedCategory && !description.trim()) {
      setDescription(
        `${copy.lookingForSubInCat(
          localizeCategoryLabel(label),
          localizeCategoryLabel(selectedCategory),
        )}.`,
      );
    }
  };

  const validateCurrentStep = (): boolean => {
    if (stepId === "category") {
      if (!category) {
        setSubmitError(copy.errorPickCategory);
        return false;
      }
      if (!subcategory) {
        setSubmitError(copy.errorMissingSubcategory);
        return false;
      }
      return true;
    }
    if (stepId === "need") {
      if (!description.trim()) {
        setSubmitError(copy.errorDescription);
        return false;
      }
      if (!intent) {
        setSubmitError(copy.errorPickIntent);
        return false;
      }
      return true;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) return;
    if (stepIndex < steps.length - 1) {
      goToStep(stepIndex + 1);
    }
  };

  const handlePostRequest = () => {
    if (busy) return;
    if (!category || !subcategory) {
      setSubmitError(
        lockedContext ? copy.errorMissingCategoryLocked : copy.errorPickCategory,
      );
      return;
    }
    if (!description.trim()) {
      setSubmitError(copy.errorDescription);
      return;
    }
    if (!intent) {
      setSubmitError(copy.errorPickIntent);
      return;
    }
    if (!auth.userId) {
      setSubmitError(copy.errorSignIn);
      return;
    }

    const meta = [
      intentLabel(intent, copy),
      budgetLine(intent, budget, selectedRadius, copy),
      whenText,
    ].join(" · ");
    const fullDescription = `${description.trim()}\n\n${meta}`;

    setSubmitError(null);
    setBusy(true);
    void createRequestRemote({
      renterId: auth.userId,
      category,
      subcategory,
      description: fullDescription,
      locationLabel: locationLabel || copy.yourArea,
      startDate: datesFlexible ? undefined : startDate || undefined,
      endDate: datesFlexible ? undefined : endDate || undefined,
    })
      .then(() => setPosted(true))
      .finally(() => setBusy(false));
  };

  const tipForStep =
    stepId === "category"
      ? copy.tipCategory
      : stepId === "need"
        ? copy.tipNeed
        : stepId === "timing"
          ? copy.tipTiming
          : copy.tipReview;

  const stepTitle =
    stepId === "category"
      ? copy.stepCategory
      : stepId === "need"
        ? copy.stepNeed
        : stepId === "timing"
          ? copy.stepTiming
          : copy.stepReview;

  if (posted) {
    return (
      <div className="screen flex flex-col bg-background">
        <div className="z-10 flex shrink-0 items-center gap-3 border-b border-border bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4">
          <h1 className="flex-1 font-semibold">{copy.postedTitle}</h1>
        </div>
        <div className="screen-scroll min-h-0 flex-1 space-y-5 p-4 pb-24">
          <RentanoTip message={copy.shareNowBody} />
          <RequestPreviewCard
            category={category}
            subcategory={subcategory}
            description={description.trim()}
            intent={activeIntent}
            when={whenText}
            budgetMeta={budgetMeta}
            locationLabel={locationLabel || copy.yourArea}
            copy={copy}
          />
          <div className="rounded-xl bg-muted/50 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Share2 className="h-4 w-4" />
              {copy.shareNowTitle}
            </h3>
            <SocialShareButtons payload={sharePayload} shareKind="request" />
          </div>
        </div>
        <div className="screen-footer border-t border-border bg-card/95 p-3 backdrop-blur-sm sm:p-4">
          <button
            type="button"
            onClick={onPost}
            className="w-full rounded-xl bg-primary py-3.5 font-medium text-white transition-colors hover:bg-primary/90"
          >
            {copy.done}
          </button>
        </div>
      </div>
    );
  }

  const footerPrimary =
    stepId === "review" ? (
      <button
        type="button"
        disabled={busy}
        onClick={handlePostRequest}
        className="w-full rounded-xl bg-primary py-3.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? copy.posting : copy.postCta}
      </button>
    ) : (
      <button
        type="button"
        onClick={handleContinue}
        className="w-full rounded-xl bg-primary py-3.5 font-medium text-white transition-colors hover:bg-primary/90"
      >
        {copy.continueCta}
      </button>
    );

  return (
    <div className="screen flex flex-col bg-background">
      <div className="z-10 shrink-0 border-b border-border bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold">{copy.title}</h1>
            <p className="text-[12px] text-muted-foreground">
              {copy.stepOf(stepIndex + 1, steps.length)} · {stepTitle}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {steps.map((id, index) => (
            <div
              key={id}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: index <= stepIndex ? GREEN : BORDER,
              }}
            />
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="screen-scroll min-h-0 flex-1 space-y-4 p-3 pb-28 sm:p-4">
        <RentanoTip message={tipForStep} />

        {(category && subcategory && stepId !== "category") || lockedContext ? (
          <div
            className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5"
            style={{ borderColor: `${GREEN}33`, backgroundColor: `${GREEN}08` }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: GREEN }}>
                {copy.requestFor}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {localizeCategoryLabel(subcategory)} · {localizeCategoryLabel(category)}
              </p>
            </div>
            {!lockedContext && stepId !== "category" ? (
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="shrink-0 text-[12px] font-semibold"
                style={{ color: GREEN }}
              >
                {copy.changeCategory}
              </button>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepId}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {stepId === "category" ? (
              <CategoryPicker
                catalog={catalog}
                openCategory={openCategory}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onToggleCategory={handleToggleCategory}
                onSelectSubcategory={handlePickSubcategory}
                householdLabel={t.catalog.household}
                proLabel={t.catalog.pro}
                selectCategoryLabel={copy.selectCategory}
                selectSubcategoryLabel={copy.selectSubcategory}
                hint={copy.pickSubcategoryHint}
              />
            ) : null}

            {stepId === "need" ? (
              <>
                <div>
                  <label className="mb-3 block text-sm font-medium">{copy.describeLabel}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={copy.describePlaceholder}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">{copy.intentLabel}</label>
                  <p className="mb-3 text-[12px] text-muted-foreground">{copy.intentHint}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["rent", copy.intentRent],
                        ["buy", copy.intentBuy],
                        ["either", copy.intentEither],
                      ] as const
                    ).map(([value, label]) => {
                      const active = intent === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setIntent(value)}
                          className="rounded-2xl border-2 px-2 py-3 text-sm font-semibold transition-all"
                          style={{
                            borderColor: active ? GREEN : BORDER,
                            backgroundColor: active ? `${GREEN}10` : "#fff",
                            color: active ? GREEN : "#374151",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}

            {stepId === "timing" ? (
              <>
                <div>
                  <label className="mb-3 block text-sm font-medium">{copy.dateRange}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDatesFlexible(true);
                        setShowDatePicker(false);
                      }}
                      className="rounded-2xl border-2 px-3 py-3 text-left transition-all"
                      style={{
                        borderColor: datesFlexible ? GREEN : BORDER,
                        backgroundColor: datesFlexible ? `${GREEN}10` : "#fff",
                      }}
                    >
                      <span className="block text-sm font-semibold" style={{ color: GREEN }}>
                        {copy.datesFlexible}
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                        {copy.datesFlexibleHint}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDatesFlexible(false);
                        setShowDatePicker(true);
                      }}
                      className="rounded-2xl border-2 px-3 py-3 text-left transition-all"
                      style={{
                        borderColor: !datesFlexible ? GREEN : BORDER,
                        backgroundColor: !datesFlexible ? `${GREEN}10` : "#fff",
                      }}
                    >
                      <span className="block text-sm font-semibold" style={{ color: GREEN }}>
                        {copy.datesSpecific}
                      </span>
                      <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                        {!datesFlexible && (startDate || endDate)
                          ? whenText
                          : copy.selectDates}
                      </span>
                    </button>
                  </div>

                  {!datesFlexible ? (
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(true)}
                      className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
                    >
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span
                        className={`text-sm ${startDate ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {whenText}
                      </span>
                    </button>
                  ) : null}
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium">{copy.locationRadius}</label>
                  <div className="flex gap-2">
                    {radiusOptions.map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setSelectedRadius(radius)}
                        className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                          selectedRadius === radius
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        {radius}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium">
                    {intent === "buy" ? copy.budgetTotal : copy.budgetPerDay}
                  </label>
                  <div className="space-y-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{copy.idPayUpTo}</span>
                      <span className="text-xl font-bold text-primary">${budget}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$5</span>
                      <span>$100+</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {stepId === "review" ? (
              <div className="space-y-4">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {copy.reviewEyebrow} · {copy.reviewNeighborPreview}
                </p>
                <RequestPreviewCard
                  category={category}
                  subcategory={subcategory}
                  description={description.trim()}
                  intent={activeIntent}
                  when={whenText}
                  budgetMeta={budgetMeta}
                  locationLabel={locationLabel || copy.yourArea}
                  copy={copy}
                />
                <div className="rounded-xl bg-muted/50 p-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <Share2 className="h-4 w-4" />
                    {copy.shareTitle}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">{copy.shareBody}</p>
                  <SocialShareButtons payload={sharePayload} shareKind="request" compact />
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {showDatePicker ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDatePicker(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{copy.selectDateRange}</h3>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="rounded-full p-2 transition-colors hover:bg-muted"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{copy.startDate}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">{copy.endDate}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setDatesFlexible(false);
                setShowDatePicker(false);
              }}
              className="w-full rounded-xl bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90"
            >
              {copy.confirm}
            </button>
          </div>
        </div>
      ) : null}

      <div className="screen-footer border-t border-border bg-card/95 p-3 backdrop-blur-sm sm:p-4">
        {footerPrimary}
        {submitError ? (
          /sign in|přihlaste/i.test(submitError) ? (
            <div className="mt-3">
              <SignInPrompt message={submitError} intent="generic" />
            </div>
          ) : (
            <p className="mt-3 text-center text-[15px] font-medium text-red-600">{submitError}</p>
          )
        ) : null}
      </div>
    </div>
  );
}
