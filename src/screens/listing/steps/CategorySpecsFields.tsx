import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getCategorySpecFields,
  isSpecFieldRequired,
  type SpecFieldDef,
} from "../categorySpecs";
import { softFillEmptyCategorySpecs } from "../applyAiSuggestions";
import { BRAND_OTHER, BRAND_UNBRANDED } from "../listingBrands";
import type { ListingDraft } from "../types";
import { useMessages } from "../../../lib/i18n/react";
import { listingRequiresBoatIdentity } from "../../../lib/categoryTrustRules";
import {
  listingIsElectricBike,
  listingIsElectricMicromobility,
  listingIsKidsBike,
} from "../../../lib/categoryTrustRules";

const MICROMOBILITY_ONLY_KEYS = new Set([
  "minRiderAge",
  "batteryRangeBand",
  "chargerIncluded",
  "batteryChargeBand",
]);
const EBIKE_CLASS_KEYS = new Set(["eBikeClass"]);

const GREEN = "#0D5C3A";
const AMBER = "#B45309";

const YEAR_MIN = 1950;
function yearMax(): number {
  return new Date().getFullYear() + 1;
}

function clampYear(value: number): number {
  return Math.min(yearMax(), Math.max(YEAR_MIN, Math.round(value)));
}

/** Last-resort UI label if i18n map misses a schema key (avoids raw CAMELCASE dumps). */
function humanizeSpecKey(key: string): string {
  const spaced = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bBand\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function inputClassName(extra = "") {
  return `text-body w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition-colors focus:border-green-700 ${extra}`;
}

function FieldLabel({
  label,
  required,
  recommended,
  recommendedLabel,
}: {
  label: string;
  required: boolean;
  recommended?: boolean;
  recommendedLabel: string;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="text-label text-sm font-semibold uppercase tracking-wide text-gray-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {!required && recommended ? (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: `${AMBER}18`, color: AMBER }}
        >
          {recommendedLabel}
        </span>
      ) : null}
    </div>
  );
}

function YearStepperField({
  field,
  value,
  onChange,
  label,
  placeholder,
  hint,
  recommendedLabel,
  stepUpLabel,
  stepDownLabel,
  required,
}: {
  field: SpecFieldDef;
  value: string;
  onChange: (next: string) => void;
  label: string;
  placeholder: string;
  hint?: string;
  recommendedLabel: string;
  stepUpLabel: string;
  stepDownLabel: string;
  required: boolean;
}) {
  const parsed = Number(value);
  const hasYear = value.trim() !== "" && Number.isFinite(parsed);
  const current = hasYear ? clampYear(parsed) : null;
  const max = yearMax();

  const nudge = (delta: number) => {
    if (current == null) {
      onChange(String(clampYear(new Date().getFullYear())));
      return;
    }
    onChange(String(clampYear(current + delta)));
  };

  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
        recommended={field.recommended}
        recommendedLabel={recommendedLabel}
      />
      <div className="flex items-stretch gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={YEAR_MIN}
          max={max}
          value={value}
          placeholder={placeholder}
          className={inputClassName("min-w-0 flex-1")}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <button
            type="button"
            aria-label={stepUpLabel}
            disabled={current != null && current >= max}
            className="flex h-1/2 min-h-[22px] items-center justify-center px-3 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            onClick={() => nudge(1)}
          >
            <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="h-px bg-gray-200" />
          <button
            type="button"
            aria-label={stepDownLabel}
            disabled={current != null && current <= YEAR_MIN}
            className="flex h-1/2 min-h-[22px] items-center justify-center px-3 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
            onClick={() => nudge(-1)}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      {hint ? <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p> : null}
    </div>
  );
}

function SpecFieldControl({
  field,
  value,
  brandOther,
  onChange,
  onBrandOtherChange,
  label,
  placeholder,
  hint,
  otherLabel,
  otherPlaceholder,
  unbrandedLabel,
  optionLabel,
  recommendedLabel,
  yearStepUpLabel,
  yearStepDownLabel,
  required,
}: {
  field: SpecFieldDef;
  value: string;
  brandOther?: string;
  onChange: (next: string) => void;
  onBrandOtherChange?: (next: string) => void;
  label: string;
  placeholder: string;
  hint?: string;
  otherLabel: string;
  otherPlaceholder: string;
  unbrandedLabel: string;
  optionLabel: (value: string) => string;
  recommendedLabel: string;
  yearStepUpLabel: string;
  yearStepDownLabel: string;
  required: boolean;
}) {
  if (field.key === "year" && field.type === "number") {
    return (
      <YearStepperField
        field={field}
        value={value}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        hint={hint}
        recommendedLabel={recommendedLabel}
        stepUpLabel={yearStepUpLabel}
        stepDownLabel={yearStepDownLabel}
        required={required}
      />
    );
  }

  if (field.type === "brand" && field.options) {
    return (
      <div>
        <FieldLabel
          label={label}
          required={required}
          recommended={field.recommended}
          recommendedLabel={recommendedLabel}
        />
        <select
          value={value}
          className={inputClassName()}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt === BRAND_OTHER
                ? otherLabel
                : opt === BRAND_UNBRANDED
                  ? unbrandedLabel
                  : optionLabel(opt)}
            </option>
          ))}
        </select>
        {value === BRAND_OTHER ? (
          <input
            type="text"
            value={brandOther ?? ""}
            placeholder={otherPlaceholder}
            className={inputClassName("mt-2")}
            onChange={(event) => onBrandOtherChange?.(event.target.value)}
          />
        ) : null}
        {hint ? <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p> : null}
      </div>
    );
  }

  if (field.type === "multiselect" && field.options) {
    const selected = new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const toggle = (opt: string) => {
      const next = new Set(selected);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      onChange(
        field.options!.filter((o) => next.has(o)).join(","),
      );
    };
    return (
      <div>
        <FieldLabel
          label={label}
          required={required}
          recommended={field.recommended}
          recommendedLabel={recommendedLabel}
        />
        <div className="space-y-2 rounded-2xl border border-gray-200 bg-white px-3 py-3">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-start gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={selected.has(opt)}
                onChange={() => toggle(opt)}
              />
              <span>{optionLabel(opt)}</span>
            </label>
          ))}
        </div>
        {hint ? <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p> : null}
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div>
        <FieldLabel
          label={label}
          required={required}
          recommended={field.recommended}
          recommendedLabel={recommendedLabel}
        />
        <select
          value={value}
          className={inputClassName()}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {optionLabel(opt)}
            </option>
          ))}
        </select>
        {hint ? <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <FieldLabel
        label={label}
        required={required}
        recommended={field.recommended}
        recommendedLabel={recommendedLabel}
      />
      <input
        type={field.type === "number" ? "number" : "text"}
        inputMode={field.type === "number" ? "decimal" : "text"}
        min={field.type === "number" ? 0 : undefined}
        value={value}
        placeholder={placeholder}
        className={inputClassName()}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1.5 text-[12px] text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function CategorySpecsFields({
  draft,
  setDraft,
}: {
  draft: ListingDraft;
  setDraft: Dispatch<SetStateAction<ListingDraft>>;
}) {
  const { listing } = useMessages();
  const specsCopy = listing.specs;
  const modes = draft.modes;
  const rawFields = getCategorySpecFields(draft.category, draft.subcategory, modes);
  const needsMicromobility = listingIsElectricMicromobility(draft);
  const needsEBikeClass = listingIsElectricBike(draft);
  const isKidsBike = listingIsKidsBike(draft);
  const fields = useMemo(() => {
    return rawFields
      .filter((field) => {
        if (MICROMOBILITY_ONLY_KEYS.has(field.key) && !needsMicromobility) return false;
        if (EBIKE_CLASS_KEYS.has(field.key) && !needsEBikeClass) return false;
        return true;
      })
      .map((field) => {
        if (
          (field.key === "minRiderAge" && needsMicromobility) ||
          (field.key === "eBikeClass" && needsEBikeClass)
        ) {
          return { ...field, required: true };
        }
        if (field.key === "helmetPolicy" && isKidsBike && field.options) {
          return { ...field, options: field.options.filter((o) => o !== "not_required") };
        }
        return field;
      });
  }, [rawFields, needsMicromobility, needsEBikeClass, isKidsBike]);

  // Drop values that don’t belong on this shelf (e.g. 30 ft+ on a houseplant).
  // Also soft-fill empty required specs from title / AI (e.g. "4-Person" → Sleeps).
  useEffect(() => {
    const shelfFields = getCategorySpecFields(
      draft.category,
      draft.subcategory,
      draft.modes,
    );
    if (shelfFields.length === 0) return;
    setDraft((current) => {
      let nextDraft = softFillEmptyCategorySpecs(current);
      const specs = nextDraft.categorySpecs ?? {};
      let changed = nextDraft !== current;
      const next = { ...specs };
      for (const field of shelfFields) {
        const value = (next[field.key] ?? "").trim();
        if (!value) continue;
        if (
          (field.type === "select" || field.type === "brand") &&
          field.options &&
          !field.options.includes(value)
        ) {
          next[field.key] = "";
          if (field.type === "brand") next.brandOther = "";
          changed = true;
        }
      }
      if (!changed) return current;
      return { ...nextDraft, categorySpecs: next };
    });
  }, [
    draft.category,
    draft.subcategory,
    draft.title,
    draft.aiSuggestions,
    draft.modes.rent,
    draft.modes.sell,
    setDraft,
  ]);

  if (fields.length === 0) return null;

  const setSpec = (key: string, nextValue: string) => {
    setDraft((current) => {
      const specs = { ...(current.categorySpecs ?? {}), [key]: nextValue };
      if (key === "brand" && nextValue !== BRAND_OTHER) {
        specs.brandOther = "";
      }
      return { ...current, categorySpecs: specs };
    });
  };

  return (
    <div className="mb-6 space-y-4 rounded-2xl border bg-[#F8FAF9] p-4" style={{ borderColor: `${GREEN}33` }}>
      <div>
        <p className="text-[14px] font-semibold" style={{ color: GREEN }}>
          {specsCopy.sectionTitle}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-gray-600">{specsCopy.sectionHint}</p>
      </div>
      {fields.map((field) => {
        const labels = specsCopy.fields[field.key];
        const required =
          isSpecFieldRequired(field, modes) ||
          (field.key === "minRiderAge" && needsMicromobility) ||
          (field.key === "eBikeClass" && needsEBikeClass);
        const mileageRentHint =
          field.key === "mileage" && modes.rent && !modes.sell
            ? specsCopy.fields.mileage?.rentOptionalHint
            : undefined;
        return (
          <SpecFieldControl
            key={field.key}
            field={field}
            value={(draft.categorySpecs ?? {})[field.key] ?? ""}
            brandOther={(draft.categorySpecs ?? {}).brandOther ?? ""}
            onChange={(next) => setSpec(field.key, next)}
            onBrandOtherChange={(next) => setSpec("brandOther", next)}
            label={labels?.label ?? humanizeSpecKey(field.key)}
            placeholder={labels?.placeholder ?? specsCopy.selectPlaceholder}
            hint={mileageRentHint ?? labels?.hint}
            otherLabel={specsCopy.options.other ?? "Other"}
            otherPlaceholder={specsCopy.brandOtherPlaceholder}
            unbrandedLabel={specsCopy.unbrandedLabel}
            optionLabel={(value) => specsCopy.options[value] ?? value}
            recommendedLabel={specsCopy.recommendedBadge}
            yearStepUpLabel={specsCopy.yearStepUp}
            yearStepDownLabel={specsCopy.yearStepDown}
            required={required}
          />
        );
      })}
    </div>
  );
}
