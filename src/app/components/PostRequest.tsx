import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { hasPostRequestContext, type ShelfPrefill } from "../../lib/shelfListings";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { MrRentano } from "./MrRentano";
import { useAuth } from "../../hooks/AuthProvider";
import { SignInPrompt } from "../../components/SignInPrompt";
import { getActiveRentLocationLabel } from "../../lib/listingStorage";
import { createRequestRemote } from "../../lib/requestsStorage";
import { SocialShareButtons } from "../../components/share/SocialShareButtons";
import { APP_NAME, MARKETING_URL } from "../../lib/brand";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabels";
import { useMessages } from "../../lib/i18n/react";
import type { AppMessages } from "../../lib/i18n/types";
import {
  getCategoryCatalog,
  type CategoryCatalogEntry,
} from "../../lib/homeCategoryPicks";
import type { SubcategoryItem } from "../../screens/listing/listingItemCategories";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";
const radiusOptions = ["5mi", "10mi", "25mi", "50mi"];

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
  const catalog = useMemo(() => getCategoryCatalog(), []);
  const prefillDescription = useMemo(
    () => buildPrefillDescription(prefill, t.postRequest),
    [prefill, t.postRequest],
  );
  const lockedContext = hasPostRequestContext(prefill);
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
  const [selectedRadius, setSelectedRadius] = useState("10mi");
  const [budget, setBudget] = useState(25);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const sharePayload = useMemo(() => {
    const city = (prefill?.city ?? getActiveRentLocationLabel()).trim();
    const text =
      description.trim() ||
      t.postRequest.shareDefaultText(APP_NAME, city || t.postRequest.yourArea);
    return {
      title: t.postRequest.shareTitleApp(APP_NAME),
      text,
      url: MARKETING_URL,
    };
  }, [description, prefill?.city, t.postRequest]);

  const formatDateRange = () => {
    if (!startDate && !endDate) return t.postRequest.selectDates;
    if (!endDate) return t.postRequest.fromDate(new Date(startDate).toLocaleDateString());
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
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
    if (selectedCategory) {
      setDescription(
        `${t.postRequest.lookingForSubInCat(
          localizeCategoryLabel(label),
          localizeCategoryLabel(selectedCategory),
        )}.`,
      );
    }
  };

  if (posted) {
    return (
      <div className="screen bg-background flex flex-col">
        <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
          <h1 className="font-semibold flex-1">{t.postRequest.postedTitle}</h1>
        </div>
        <div className="screen-scroll flex-1 min-h-0 p-4 space-y-5 pb-24">
          <div className="flex items-start gap-3">
            <MrRentano size={48} className="flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg mb-1">{t.postRequest.shareNowTitle}</h2>
              <p className="text-sm text-muted-foreground">{t.postRequest.shareNowBody}</p>
            </div>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <SocialShareButtons payload={sharePayload} shareKind="request" />
          </div>
        </div>
        <div className="screen-footer bg-card/95 backdrop-blur-sm border-t border-border p-3 sm:p-4">
          <button
            type="button"
            onClick={onPost}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl transition-colors font-medium"
          >
            {t.postRequest.done}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen bg-background flex flex-col">
      <div className="shrink-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border px-3 sm:px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold flex-1">{t.postRequest.title}</h1>
      </div>

      <div className="screen-scroll flex-1 min-h-0 space-y-5 p-3 pb-24 sm:space-y-6 sm:p-4">
        <div className="flex items-start gap-3">
          <MrRentano size={40} className="flex-shrink-0" />
          <div className="flex-1">
            <h2 className="mb-1 text-lg font-semibold">
              {lockedContext ? t.postRequest.headlineLocked : t.postRequest.headline}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lockedContext ? t.postRequest.subtitleLocked : t.postRequest.subtitle}
            </p>
          </div>
        </div>

        {lockedContext && prefill ? (
          <div
            className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm"
            aria-live="polite"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t.postRequest.requestFor}
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {localizeCategoryLabel(prefill.subcategory ?? "")} ·{" "}
              {localizeCategoryLabel(prefill.category ?? "")}
              {prefill.city ? (
                <>
                  {" "}
                  <span className="font-normal text-muted-foreground">· {prefill.city}</span>
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        {!lockedContext ? (
          <CategoryPicker
            catalog={catalog}
            openCategory={openCategory}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onToggleCategory={handleToggleCategory}
            onSelectSubcategory={handlePickSubcategory}
            householdLabel={t.catalog.household}
            proLabel={t.catalog.pro}
            selectCategoryLabel={t.postRequest.selectCategory}
            selectSubcategoryLabel={t.postRequest.selectSubcategory}
            hint={t.postRequest.pickSubcategoryHint}
          />
        ) : null}

        <div>
          <label className="mb-3 block text-sm font-medium">{t.postRequest.describeLabel}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.postRequest.describePlaceholder}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium">{t.postRequest.locationRadius}</label>
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
          <label className="mb-3 block text-sm font-medium">{t.postRequest.dateRange}</label>
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/50"
          >
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className={`text-sm ${startDate ? "text-foreground" : "text-muted-foreground"}`}>
              {formatDateRange()}
            </span>
          </button>
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
                <h3 className="text-lg font-semibold">{t.postRequest.selectDateRange}</h3>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(false)}
                  className="rounded-full p-2 transition-colors hover:bg-muted"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t.postRequest.startDate}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">{t.postRequest.endDate}</label>
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
                onClick={() => setShowDatePicker(false)}
                className="w-full rounded-xl bg-primary py-3 font-medium text-white transition-colors hover:bg-primary/90"
              >
                {t.postRequest.confirm}
              </button>
            </div>
          </div>
        ) : null}

        <div>
          <label className="mb-3 block text-sm font-medium">{t.postRequest.budgetPerDay}</label>
          <div className="space-y-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.postRequest.idPayUpTo}</span>
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

        <div className="rounded-xl bg-muted/50 p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold">
            <Share2 className="h-4 w-4" />
            {t.postRequest.shareTitle}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">{t.postRequest.shareBody}</p>
          <SocialShareButtons payload={sharePayload} shareKind="request" compact />
        </div>
      </div>

      <div className="screen-footer border-t border-border bg-card/95 p-3 backdrop-blur-sm sm:p-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (busy) return;
            const category = lockedContext
              ? (prefill?.category ?? "").trim()
              : (selectedCategory ?? "").trim();
            const subcategory = lockedContext
              ? (prefill?.subcategory ?? "").trim()
              : (selectedSubcategory ?? "").trim();
            const locationLabel = (prefill?.city ?? getActiveRentLocationLabel()).trim();
            const desc = description.trim();
            if (!category) {
              setSubmitError(
                lockedContext
                  ? t.postRequest.errorMissingCategoryLocked
                  : t.postRequest.errorPickCategory,
              );
              return;
            }
            if (!subcategory) {
              setSubmitError(t.postRequest.errorMissingSubcategory);
              return;
            }
            if (!desc) {
              setSubmitError(t.postRequest.errorDescription);
              return;
            }
            if (!auth.userId) {
              setSubmitError(t.postRequest.errorSignIn);
              return;
            }
            const budgetNote = t.postRequest.budgetNote(budget, selectedRadius);
            const fullDescription = desc.includes("$") ? desc : `${desc}\n\n${budgetNote}`;
            setSubmitError(null);
            setBusy(true);
            void createRequestRemote({
              renterId: auth.userId,
              category,
              subcategory,
              description: fullDescription,
              locationLabel: locationLabel || t.postRequest.yourArea,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            })
              .then(() => setPosted(true))
              .finally(() => setBusy(false));
          }}
          className="w-full rounded-xl bg-primary py-3.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? t.postRequest.posting : t.postRequest.postCta}
        </button>
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
