import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Camera, ImageIcon, Loader2 } from "lucide-react";
import type { StepProps } from "../types";
import { RentanoHint } from "../../../components/RentanoHint";
import { MASCOT_NAME } from "../../../lib/brand";
import { improveListingDescription } from "../listingDescriptionImprove";
import { isYardSaleListingActive } from "../../../lib/yardSaleListing";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabels";
import { useMessages } from "../../../lib/i18n/react";
import {
  currencySymbol,
  listingPricingMarket,
} from "../../../lib/regionalDisplay";
import { CategorySpecsFields } from "./CategorySpecsFields";
import { CategoryFactCard } from "../../../components/CategoryFactCard";
import {
  getCategoryModeRules,
  requiresAssetIdentity,
  requiresAssetSerialNumber,
  requiresAssetVin,
} from "../listingItemCategories";
import { isPlantListingSubcategory } from "../categorySpecs";
import {
  decodeVinRemote,
  normalizeVinInput,
  validateVinFormat,
  type NhtsaVinDecode,
} from "../../../lib/vinValidate";
import {
  compareVinToKnownIdentity,
  identityFromVinDecode,
  resolvePriorVehicleIdentity,
  type VinIdentityComparison,
} from "../../../lib/vinVehicleIdentity";
import { extractVinFromImage } from "../../../lib/vinOcr";
import { applyAiSuggestionsToDraft } from "../applyAiSuggestions";
import { listingTitleExample } from "../listingTitlePlaceholders";

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

export function Step2ItemInfo({
  draft,
  setDraft,
  gateMessage = null,
  onDismissGateMessage,
}: StepProps & {
  gateMessage?: string | null;
  onDismissGateMessage?: () => void;
}) {
  const { listing } = useMessages();
  const item = listing.itemInfo;
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
  const [vinLookup, setVinLookup] = useState<NhtsaVinDecode | null>(null);
  const [vinLookingUp, setVinLookingUp] = useState(false);
  const [vinScanning, setVinScanning] = useState(false);
  const [vinScanNote, setVinScanNote] = useState<string | null>(null);
  const [vinIdentityConflict, setVinIdentityConflict] = useState<
    Extract<VinIdentityComparison, { kind: "mismatch" }> | null
  >(null);
  const vinCameraRef = useRef<HTMLInputElement | null>(null);
  const vinLibraryRef = useRef<HTMLInputElement | null>(null);

  const yardSaleListing = isYardSaleListingActive();
  const plantListing = isPlantListingSubcategory(draft.subcategory);
  const categoryModeRules = getCategoryModeRules(draft.category, draft.subcategory);
  const pricingMarket = listingPricingMarket();
  const moneySymbol = currencySymbol();
  const replacementValueLabel =
    categoryModeRules.replacementValueLabel ?? item.replacementValue;
  const replacementValueHelper =
    categoryModeRules.replacementValueHelper ??
    item.replacementValueHelperLocal(pricingMarket.currencyCode);

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

  // Plants aren't wear-graded like tools — keep a neutral default and skip the picker.
  useEffect(() => {
    if (!plantListing) return;
    setDraft((current) => {
      if (!isPlantListingSubcategory(current.subcategory)) return current;
      const nextCondition = current.condition !== "good" ? "good" : current.condition;
      const nextReplacement =
        current.replacementValue.trim() !== "" ? "" : current.replacementValue;
      if (nextCondition === current.condition && nextReplacement === current.replacementValue) {
        return current;
      }
      return {
        ...current,
        condition: nextCondition,
        replacementValue: nextReplacement,
      };
    });
  }, [plantListing, draft.condition, draft.replacementValue, setDraft]);

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
  const showAssetIdentity = !yardSaleListing && requiresAssetIdentity(category);
  const vinRequired = requiresAssetVin(category);
  const serialRequired = requiresAssetSerialNumber(category);
  const showSerialField = serialRequired;
  const vinFormat = draft.vin.trim() ? validateVinFormat(draft.vin) : null;

  const draftRef = useRef(draft);
  draftRef.current = draft;

  /**
   * Apply VIN decode to make/model/year.
   * On clear conflict with photo AI / already-filled specs: keep prior identity
   * and require explicit “Use VIN vehicle instead” — never silent overwrite.
   */
  const applyDecodedVin = useCallback(
    (result: NhtsaVinDecode, options?: { force?: boolean }): "applied" | "conflict" | "failed" => {
      setVinLookup(result);
      if (!result.ok) {
        setVinIdentityConflict(null);
        return "failed";
      }
      const decoded = identityFromVinDecode(result);
      const prior = resolvePriorVehicleIdentity(draftRef.current);
      const comparison = compareVinToKnownIdentity(prior, decoded);

      if (!options?.force && comparison.kind === "mismatch") {
        setVinIdentityConflict(comparison);
        setDraft((current) => ({ ...current, vin: result.vin }));
        return "conflict";
      }

      setVinIdentityConflict(null);
      const make = decoded.make;
      const model = decoded.model;
      const year = decoded.year;
      setDraft((current) => {
        const specs = { ...(current.categorySpecs ?? {}) };
        if (make) specs.make = make;
        if (model) specs.model = model;
        if (year) specs.year = year;
        return {
          ...current,
          vin: result.vin,
          categorySpecs: specs,
        };
      });
      return "applied";
    },
    [setDraft],
  );

  const runVinLookup = useCallback(async () => {
    const format = validateVinFormat(draft.vin);
    if (!format.ok) {
      setVinLookup(null);
      setVinIdentityConflict(null);
      return;
    }
    setVinLookingUp(true);
    try {
      const result = await decodeVinRemote(format.vin);
      applyDecodedVin(result);
    } finally {
      setVinLookingUp(false);
    }
  }, [applyDecodedVin, draft.vin]);

  const runVinPhotoScan = useCallback(
    async (file: File | null | undefined) => {
      if (!file || vinScanning) return;
      setVinScanning(true);
      setVinScanNote(null);
      try {
        const ocr = await extractVinFromImage(file);
        if (!ocr.ok) {
          setVinScanNote(
            ocr.reason === "no_vin" ? item.vinScanNoVin : item.vinScanFailed,
          );
          return;
        }
        setDraft((current) => ({ ...current, vin: ocr.vin }));
        setVinLookingUp(true);
        try {
          const decoded = await decodeVinRemote(ocr.vin);
          const outcome = applyDecodedVin(decoded);
          setVinScanNote(outcome === "conflict" ? null : item.vinScanFound);
        } finally {
          setVinLookingUp(false);
        }
      } finally {
        setVinScanning(false);
      }
    },
    [
      applyDecodedVin,
      item.vinScanFailed,
      item.vinScanFound,
      item.vinScanNoVin,
      setDraft,
      vinScanning,
    ],
  );

  useEffect(() => {
    if (!showAssetIdentity) {
      setVinLookup(null);
      setVinScanNote(null);
      setVinIdentityConflict(null);
    }
  }, [showAssetIdentity]);

  useEffect(() => {
    if (!draft.aiSuggestions) {
      appliedSuggestionsKey.current = null;
      return;
    }

    const suggestions = draft.aiSuggestions;
    const suggestionKey = JSON.stringify(suggestions);
    if (appliedSuggestionsKey.current === suggestionKey) return;
    appliedSuggestionsKey.current = suggestionKey;

    // Soft-fill only — host already chose category earlier; photos AI may still fill blanks.
    setDraft((current) => applyAiSuggestionsToDraft(current, suggestions));
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
          {gateMessage ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">{gateMessage}</p>
          ) : null}
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
          <input
            type="text"
            maxLength={80}
            value={draft.title}
            placeholder={item.titlePlaceholder(
              listingTitleExample(draft.category, draft.subcategory),
            )}
            className={inputClassName()}
            onChange={(event) => {
              onDismissGateMessage?.();
              setDraft((current) => ({ ...current, title: event.target.value }));
            }}
          />
          {draft.title.length >= 70 ? (
            <p className="text-label mt-1.5 text-right text-gray-400">
              {draft.title.length}/80
            </p>
          ) : null}
        </div>

        {!yardSaleListing && draft.category ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              {localizeCategoryLabel(draft.category)}
            </span>
            {draft.subcategory ? (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                {localizeCategoryLabel(draft.subcategory)}
              </span>
            ) : null}
          </div>
        ) : null}

        {!yardSaleListing ? (
        <>
        {showAssetIdentity ? (
          <div className="mb-6 space-y-4 rounded-2xl border bg-[#F8FAF9] p-4" style={{ borderColor: `${GREEN}33` }}>
            {vinRequired ? (
              <CategoryFactCard category="Vehicles" defaultExpanded />
            ) : draft.category.trim() === "Heavy Equipment" ||
              draft.category.trim() === "Construction" ? (
              <CategoryFactCard category={draft.category.trim()} defaultExpanded />
            ) : draft.category.trim() === "Boats & Water" ? (
              <CategoryFactCard category="Boats & Water" defaultExpanded />
            ) : draft.category.trim() === "Real Estate" ? (
              <CategoryFactCard category="Real Estate" defaultExpanded />
            ) : draft.category.trim() === "Photo & Video" ||
              draft.category.trim() === "Drones" ||
              draft.subcategory.trim() === "Drones" ? (
              <CategoryFactCard category="Photo & Video" defaultExpanded />
            ) : draft.category.trim() === "Baby & Kids" &&
              draft.subcategory.trim() === "Car Seats" ? (
              <CategoryFactCard category="Baby & Kids" defaultExpanded />
            ) : draft.category.trim() === "Electronics & Tech" ? (
              <CategoryFactCard category="Electronics & Tech" defaultExpanded />
            ) : null}
            <p className="text-[13px] leading-snug text-gray-600">
              {vinRequired ? item.assetIdentityHint : item.serialNumberHelper}
            </p>

            {vinRequired ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[13px] font-semibold text-gray-700">{item.vinScanCta}</p>
                  <p className="mt-1 text-[12px] leading-snug text-gray-500">{item.vinScanHelper}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={vinScanning}
                      onClick={() => vinCameraRef.current?.click()}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-700/30 bg-white px-3 py-2.5 text-[13px] font-semibold disabled:opacity-50"
                      style={{ color: GREEN }}
                    >
                      {vinScanning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" strokeWidth={2} />
                      )}
                      {vinScanning ? item.vinScanning : item.vinScanCamera}
                    </button>
                    <button
                      type="button"
                      disabled={vinScanning}
                      onClick={() => vinLibraryRef.current?.click()}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-700/30 bg-white px-3 py-2.5 text-[13px] font-semibold disabled:opacity-50"
                      style={{ color: GREEN }}
                    >
                      <ImageIcon className="h-4 w-4" strokeWidth={2} />
                      {item.vinScanLibrary}
                    </button>
                  </div>
                  <input
                    ref={vinCameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      void runVinPhotoScan(file);
                    }}
                  />
                  <input
                    ref={vinLibraryRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      void runVinPhotoScan(file);
                    }}
                  />
                  {vinScanNote ? (
                    <p
                      className={`mt-2 text-[12px] ${
                        vinScanNote === item.vinScanFound ? "font-medium" : "text-amber-800"
                      }`}
                      style={vinScanNote === item.vinScanFound ? { color: GREEN } : undefined}
                    >
                      {vinScanNote}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {vinRequired || draft.vin.trim() || showSerialField ? (
              <div>
                {vinRequired ? (
                  <p className="mb-2 text-[12px] font-semibold text-gray-600">
                    {item.vinOrTypeManually}
                  </p>
                ) : null}
                {(vinRequired || draft.vin.trim()) ? (
                  <>
                <FieldLabel label={item.vin} required={vinRequired} />
                <input
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={20}
                  value={draft.vin}
                  placeholder={item.vinPlaceholder}
                  className={inputClassName(
                    vinFormat && !vinFormat.ok
                      ? "border-red-300 focus:border-red-500"
                      : vinFormat?.ok
                        ? "border-green-600 focus:border-green-700"
                        : "",
                  )}
                  onChange={(event) => {
                    const next = normalizeVinInput(event.target.value).slice(0, 17);
                    setVinLookup(null);
                    setVinScanNote(null);
                    setVinIdentityConflict(null);
                    setDraft((current) => ({ ...current, vin: next }));
                  }}
                  onBlur={() => {
                    if (draft.vin.trim()) void runVinLookup();
                  }}
                />
                {vinLookingUp || vinScanning ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {vinScanning ? item.vinScanning : item.vinChecking}
                  </p>
                ) : null}
                {!vinLookingUp && !vinScanning && vinFormat && !vinFormat.ok ? (
                  <p className="mt-1.5 text-[12px] text-red-600">
                    {vinFormat.reason === "length"
                      ? item.vinErrorLength
                      : vinFormat.reason === "chars"
                        ? item.vinErrorChars
                        : vinFormat.reason === "checkDigit"
                          ? item.vinErrorCheck
                          : item.vinErrorLength}
                  </p>
                ) : null}
                {!vinLookingUp &&
                !vinScanning &&
                vinFormat?.ok &&
                vinLookup?.ok &&
                vinIdentityConflict ? (
                  <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-[12px] font-medium leading-snug text-amber-950">
                      {item.vinMismatchWarn(
                        vinIdentityConflict.decodedLabel,
                        vinIdentityConflict.priorLabel,
                      )}
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 flex min-h-[40px] w-full items-center justify-center rounded-xl border border-amber-300 bg-white px-3 text-[13px] font-semibold text-amber-950 active:bg-amber-100"
                      onClick={() => {
                        if (!vinLookup?.ok) return;
                        applyDecodedVin(vinLookup, { force: true });
                      }}
                    >
                      {item.vinMismatchUseVinCta}
                    </button>
                  </div>
                ) : null}
                {!vinLookingUp &&
                !vinScanning &&
                vinFormat?.ok &&
                vinLookup?.ok &&
                !vinIdentityConflict ? (
                  <p className="mt-1.5 text-[12px] font-medium" style={{ color: GREEN }}>
                    {item.vinVerified(
                      [vinLookup.modelYear, vinLookup.make, vinLookup.model]
                        .filter(Boolean)
                        .join(" ") || item.vinVerifiedFallback,
                    )}
                  </p>
                ) : null}
                {!vinLookingUp && !vinScanning && vinFormat?.ok && vinLookup && !vinLookup.ok ? (
                  <p className="mt-1.5 text-[12px] text-amber-700">{item.vinLookupWarn}</p>
                ) : null}
                <p className="mt-1.5 text-[12px] text-gray-500">{item.vinHelper}</p>
                  </>
                ) : null}
              </div>
            ) : null}

            {showSerialField ? (
            <div>
              <FieldLabel label={item.serialNumber} required={serialRequired} />
              <input
                type="text"
                autoCorrect="off"
                spellCheck={false}
                maxLength={64}
                value={draft.serialNumber}
                placeholder={item.serialNumberPlaceholder}
                className={inputClassName()}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    serialNumber: event.target.value.trimStart().slice(0, 64),
                  }));
                }}
                onBlur={() => {
                  setDraft((current) => ({
                    ...current,
                    serialNumber: current.serialNumber.trim(),
                  }));
                }}
              />
              <p className="mt-1.5 text-[12px] text-gray-500">{item.serialNumberHelper}</p>
            </div>
            ) : null}
          </div>
        ) : null}
        </>
        ) : null}

        {!yardSaleListing &&
        (draft.category.trim() === "Vehicles" ||
          draft.category.trim() === "Boats & Water" ||
          draft.category.trim() === "Heavy Equipment") &&
        (draft.category.trim() !== "Vehicles" ||
          Boolean(
            ((draft.categorySpecs?.make ?? "").trim() &&
              (draft.categorySpecs?.model ?? "").trim() &&
              (draft.categorySpecs?.year ?? "").trim()) ||
              draft.vin.trim().length >= 11,
          )) ? (
          <div
            className="mb-6 rounded-2xl border bg-white p-4"
            style={{ borderColor: `${GREEN}33` }}
          >
            <p className="text-[14px] font-semibold" style={{ color: GREEN }}>
              {listing.modes.pathChoiceTitle}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-gray-600">
              {listing.modes.pathChoiceBody}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  {
                    key: "rent" as const,
                    label: listing.modes.pathChoiceRent,
                    active: draft.modes.rent && !draft.modes.sell,
                  },
                  {
                    key: "sell" as const,
                    label: listing.modes.pathChoiceSell,
                    active: draft.modes.sell && !draft.modes.rent && !draft.modes.gift,
                  },
                  {
                    key: "both" as const,
                    label: listing.modes.pathChoiceBoth,
                    active: draft.modes.rent && draft.modes.sell && !draft.modes.gift,
                  },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    setDraft((current) => {
                      if (chip.key === "rent") {
                        return {
                          ...current,
                          modes: {
                            ...current.modes,
                            rent: true,
                            sell: false,
                            gift: false,
                            rentToOwn: false,
                          },
                        };
                      }
                      if (chip.key === "sell") {
                        return {
                          ...current,
                          modes: {
                            ...current.modes,
                            rent: false,
                            sell: true,
                            gift: false,
                            rentToOwn: false,
                          },
                        };
                      }
                      return {
                        ...current,
                        modes: {
                          ...current.modes,
                          rent: true,
                          sell: true,
                          gift: false,
                          rentToOwn: false,
                        },
                      };
                    });
                  }}
                  className={`rounded-2xl border px-2 py-2.5 text-center text-[13px] font-semibold transition-colors ${
                    chip.active
                      ? "border-transparent text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                  style={chip.active ? { backgroundColor: GREEN } : undefined}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!yardSaleListing &&
        (draft.category.trim() === "Gym & Fitness" ||
          draft.category.trim() === "Sports & Recreation" ||
          draft.category.trim() === "Outdoor & Camping" ||
          draft.category.trim() === "Bikes & Scooters" ||
          draft.category.trim() === "Party & Events") ? (
          <div className="mb-4">
            <CategoryFactCard category={draft.category.trim()} defaultExpanded />
          </div>
        ) : null}

        {!yardSaleListing ? <CategorySpecsFields draft={draft} setDraft={setDraft} /> : null}

        {!plantListing ? (
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
        ) : null}

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
                onDismissGateMessage?.();
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

        {!plantListing ? (
        <div className="mb-6">
          <FieldLabel label={replacementValueLabel} required />
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              {moneySymbol}
            </span>
            <input
              type="number"
              min={0}
              value={draft.replacementValue}
              placeholder=""
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
              linkText={item.searchPriceLinkLocal(
                marketValueLinkTitle,
                pricingMarket.currencyCode,
                pricingMarket.countryLabel,
              )}
              linkUrl={`https://www.google.com/search?q=${encodeURIComponent(
                `${draft.title} new price ${pricingMarket.countryLabel} ${pricingMarket.currencyCode}`,
              )}`}
            />
          ) : null}
        </div>
        ) : null}

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
