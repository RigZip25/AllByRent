import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { ListingDraft, MinimumRentalPeriod, StepProps } from "../types";
import { RentanoHint } from "../../../components/RentanoHint";
import {
  calculateRentalPrices,
  categoryHasRestrictedModes,
  type CategoryModeKey,
  getCategoryModeRules,
} from "../listingItemCategories";
import { isYardSaleListingActive } from "../../../lib/yardSaleListing";
import { getRateFieldsForMinimumPeriod } from "../../../lib/listingRateFields";
import {
  depositAdviceKind,
  suggestLongTermMonthlyFromDaily,
  suggestSaleFromReplacement,
} from "../../../lib/listingPricingAdvice";
import {
  categoryRequiresInsuranceProof,
  isValidInsuranceOwnerProofEmail,
} from "../../../lib/listingInsurance";
import {
  isCommercialEquipmentCategory,
  listingIsCommercialTransport,
  listingRequiresPhysicalDamage,
  listingVehicleWeightLbs,
  physicalDamageIsMandatory,
  VEHICLE_PHYSICAL_DAMAGE_WEIGHT_KG,
  VEHICLE_PHYSICAL_DAMAGE_WEIGHT_LBS,
} from "../../../lib/listingRentRules";
import {
  defaultWheelCountForListing,
  listingRequiresHostWheelCount,
} from "../../../lib/preTripInspection";
import {
  emptyVehicleExtras,
  type VehicleExtraKey,
  type VehicleExtrasConfig,
} from "../../../lib/vehicleExtras";
import {
  categorySupportsTravelOutsideRule,
  resolveHomeTerritory,
} from "../../../lib/vehicleHomeTerritory";
import { defaultLateReturnFeePolicyForCategory } from "../../../lib/lateReturnFee";
import { listingRequiresFuelTracking } from "../../../lib/rentalFuelPolicy";
import { getHomeLocation } from "../../../lib/listingStorage";
import { getSearchCountryCode } from "../../../lib/locationCountry";
import { useMessages } from "../../../lib/i18n/react";
import { currencySymbol, formatMoney, roundMoneyForSuggestion } from "../../../lib/regionalDisplay";

const GREEN = "#0D5C3A";

const AVG_RENTAL_DAYS: Record<string, number> = {
  "Tools & DIY": 1,
  "Photo & Video": 2,
  "Party & Events": 1,
  "Outdoor & Camping": 3,
  "Sports & Recreation": 2,
  "Bikes & Scooters": 2,
};

const MINIMUM_PERIOD_OPTIONS: MinimumRentalPeriod[] = [
  "1 day",
  "3 days",
  "1 week",
  "2 weeks",
  "1 month",
];

const SHORT_TERM_CATEGORIES = new Set([
  "Tools & DIY",
  "Photo & Video",
  "Party & Events",
  "Outdoor & Camping",
  "Sports & Recreation",
  "Costume & Cosplay",
  "Construction",
  "Heavy Equipment",
]);

const LONG_TERM_CATEGORIES = new Set([
  "Electronics & Tech",
  "Home & Kitchen",
  "Furniture",
  "Gym & Fitness",
  "Baby & Kids",
  "Office & Business",
]);

const MIXED_CATEGORIES = new Set([
  "Bikes & Scooters",
  "Vehicles",
  "Boats & Water",
  "Music & Audio",
  "Garden & Yard",
]);

const MONTHLY_MINIMUM_CATEGORIES = new Set(["Real Estate"]);

function getDefaultMinimumPeriod(category: string): MinimumRentalPeriod {
  if (LONG_TERM_CATEGORIES.has(category)) return "1 month";
  if (SHORT_TERM_CATEGORIES.has(category)) return "1 day";
  if (MIXED_CATEGORIES.has(category)) return "1 day";
  if (MONTHLY_MINIMUM_CATEGORIES.has(category)) return "1 month";
  return "1 day";
}

const selectClassName =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition-colors focus:border-green-700";

function FieldLabel({
  label,
  required = false,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </label>
  );
}

function MoneyInput({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  const symbol = currencySymbol();
  return (
    <motion.div className="relative" layout="position">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        {symbol}
      </span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder=""
        onChange={(event) => {
          // Keep only digits + one decimal point while typing (no type=number empty/0 quirks).
          const raw = event.target.value.replace(/,/g, ".").replace(/[^\d.]/g, "");
          const parts = raw.split(".");
          const next =
            parts.length <= 1 ? raw : `${parts[0]}.${parts.slice(1).join("")}`;
          onChange(next);
        }}
        onBlur={onBlur}
        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-8 pr-4 text-gray-800 outline-none transition-colors focus:border-green-700"
      />
    </motion.div>
  );
}

function ModeNote({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs leading-relaxed text-gray-500">{children}</p>;
}

function ModeCard({
  icon,
  title,
  subtitle,
  badge,
  badgeTone = "accent",
  active,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeTone?: "accent" | "primary" | "blue";
  active: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  const badgeClass =
    badgeTone === "primary"
      ? "bg-primary text-white"
      : badgeTone === "blue"
        ? "bg-blue-500 text-white"
        : "bg-accent text-white";

  return (
    <motion.div
      layout
      className="overflow-hidden rounded-2xl border-2 bg-white"
      style={{ borderColor: active ? GREEN : "#E5E7EB" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="relative w-full px-4 py-4 text-left"
      >
        {active ? (
          <span
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: GREEN }}
          >
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </span>
        ) : null}
        <div className="flex items-start gap-3 pr-8">
          <span className="text-2xl leading-none" aria-hidden>
            {icon}
          </span>
          <motion.div layout="position" className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-bold text-gray-900">{title}</p>
              {badge ? (
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold leading-none ${badgeClass}`}
                >
                  {badge}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {active && children ? (
          <motion.div
            key="fields"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div className="border-t border-gray-100 px-4 pb-4 pt-3">{children}</motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

const MODE_CARD_ICONS: Record<"rent" | "sell" | "gift", string> = {
  rent: "🔑",
  sell: "🏷️",
  gift: "🎁",
};

const rateFieldMotion = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: "auto", marginTop: 0 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export function Step3Modes({ draft, setDraft }: StepProps) {
  const { listing, item } = useMessages();
  const modesCopy = listing.modes;
  const yardSaleListing = isYardSaleListingActive();
  const minimumPeriodCategoryRef = useRef<string | null>(null);
  const [showLongTermPricingHelp, setShowLongTermPricingHelp] = useState(false);

  const categoryRules = getCategoryModeRules(draft.category, draft.subcategory);
  const showRestrictedModesNote = categoryHasRestrictedModes(
    draft.category,
    draft.subcategory,
  );

  const periodRateFields = getRateFieldsForMinimumPeriod(draft.pricing.minimumPeriod);
  const showDailyRate = categoryRules.showDailyRate && periodRateFields.showDaily;
  const showWeeklyRate = categoryRules.showDailyRate && periodRateFields.showWeekly;
  const showMonthlyRate = categoryRules.showMonthlyRate && periodRateFields.showMonthly;

  const rentSubtitle = showDailyRate && showMonthlyRate
    ? modesCopy.rentSubtitleDailyWeeklyMonthly
    : showMonthlyRate && showWeeklyRate
      ? modesCopy.rentSubtitleWeeklyMonthly
      : showMonthlyRate
        ? modesCopy.rentSubtitleMonthly
        : modesCopy.rentSubtitleDailyWeekly;

  const modeCardConfig: {
    key: CategoryModeKey;
    icon: string;
    title: string;
    subtitle: string;
  }[] = [
    {
      key: "rent",
      icon: MODE_CARD_ICONS.rent,
      title: modesCopy.rent,
      subtitle: modesCopy.rentSubtitleDailyWeeklyMonthly,
    },
    {
      key: "sell",
      icon: MODE_CARD_ICONS.sell,
      title: modesCopy.sell,
      subtitle: modesCopy.sellSubtitle,
    },
    {
      key: "gift",
      icon: MODE_CARD_ICONS.gift,
      title: modesCopy.gift,
      subtitle: modesCopy.giftSubtitle,
    },
  ];

  // Gift = Sell at $0: show Free whenever Sell is allowed for the category.
  const visibleModeCards = yardSaleListing
    ? modeCardConfig.filter((card) => card.key === "sell")
    : modeCardConfig.filter((card) => {
        if (card.key === "gift") return Boolean(categoryRules.sell || categoryRules.gift);
        return Boolean(categoryRules[card.key as "rent" | "sell" | "gift"]);
      });

  useEffect(() => {
    if (!draft.modes.rent || draft.category.trim() !== "Vehicles") return;
    setDraft((current) => {
      const specs = current.categorySpecs ?? {};
      if ((specs.includedMilesPerDay ?? "").trim()) return current;
      return {
        ...current,
        categorySpecs: { ...specs, includedMilesPerDay: "250" },
      };
    });
  }, [draft.modes.rent, draft.category, setDraft]);

  // Soft-fill tire/wheel count: 4 for light vehicles; 10/18 when commercial/semi and unset.
  useEffect(() => {
    if (!draft.modes.rent || draft.category.trim() !== "Vehicles") return;
    setDraft((current) => {
      if (!current.modes.rent || current.category.trim() !== "Vehicles") return current;
      const specs = current.categorySpecs ?? {};
      if ((specs.wheelCount ?? "").trim()) return current;
      const suggested = String(defaultWheelCountForListing(current));
      return {
        ...current,
        categorySpecs: { ...specs, wheelCount: suggested },
      };
    });
  }, [
    draft.modes.rent,
    draft.category,
    draft.subcategory,
    draft.categorySpecs?.vehicleWeightLbs,
    draft.categorySpecs?.wheelCount,
    draft.handoff.itemWeightLbs,
    setDraft,
  ]);

  // When a listing becomes commercial and still has the light default (4), bump to 10/18.
  useEffect(() => {
    if (!draft.modes.rent || draft.category.trim() !== "Vehicles") return;
    if (!listingRequiresHostWheelCount(draft)) return;
    setDraft((current) => {
      if (!listingRequiresHostWheelCount(current)) return current;
      const specs = current.categorySpecs ?? {};
      const raw = (specs.wheelCount ?? "").trim();
      const n = Number(raw);
      const suggested = defaultWheelCountForListing(current);
      // Only auto-bump the passenger default — don't overwrite a host-chosen 6/8/etc.
      if (raw && Number.isFinite(n) && n !== 4) return current;
      if (raw && Number.isFinite(n) && n === suggested) return current;
      return {
        ...current,
        categorySpecs: { ...specs, wheelCount: String(suggested) },
      };
    });
  }, [
    draft.modes.rent,
    draft.category,
    draft.subcategory,
    draft.categorySpecs?.vehicleWeightLbs,
    draft.categorySpecs?.wheelCount,
    draft.handoff.itemWeightLbs,
    setDraft,
  ]);

  // Commercial shelves + heavy vehicles (≥26,000 lb): force PD + insurance; default pro-only.
  useEffect(() => {
    if (!draft.modes.rent) return;
    const commercial = isCommercialEquipmentCategory(draft.category);
    const heavyVehicle =
      draft.category.trim() === "Vehicles" &&
      (listingVehicleWeightLbs(draft) ?? 0) >= VEHICLE_PHYSICAL_DAMAGE_WEIGHT_LBS;
    if (!commercial && !heavyVehicle) return;
    setDraft((current) => {
      if (!current.modes.rent) return current;
      const isCommercial = isCommercialEquipmentCategory(current.category);
      const isHeavy =
        current.category.trim() === "Vehicles" &&
        (listingVehicleWeightLbs(current) ?? 0) >= VEHICLE_PHYSICAL_DAMAGE_WEIGHT_LBS;
      if (!isCommercial && !isHeavy) return current;
      const nextHandoff = { ...current.handoff };
      let changed = false;
      if (nextHandoff.requirePhysicalDamage !== true) {
        nextHandoff.requirePhysicalDamage = true;
        changed = true;
      }
      if (nextHandoff.requireInsuranceProof !== true) {
        nextHandoff.requireInsuranceProof = true;
        changed = true;
      }
      if (isCommercial && nextHandoff.proRentersOnly === undefined) {
        nextHandoff.proRentersOnly = true;
        changed = true;
      }
      const specs = { ...(current.categorySpecs ?? {}) };
      let specsChanged = false;
      if (
        (isCommercial || isHeavy) &&
        specs.insuranceMaxDeductible !== "full_coverage_required"
      ) {
        // Nudge toward PD band when mandate applies (host can still see full_coverage label).
        if (!specs.insuranceMaxDeductible || isHeavy) {
          specs.insuranceMaxDeductible = "full_coverage_required";
          specsChanged = true;
        }
      }
      if (!changed && !specsChanged) return current;
      return {
        ...current,
        handoff: nextHandoff,
        categorySpecs: specsChanged ? specs : current.categorySpecs,
      };
    });
  }, [
    draft.modes.rent,
    draft.category,
    draft.categorySpecs?.vehicleWeightLbs,
    draft.handoff.itemWeightLbs,
    setDraft,
  ]);

  useEffect(() => {
    if (!draft.modes.rent || !categorySupportsTravelOutsideRule(draft.category)) return;
    setDraft((current) => {
      if (!categorySupportsTravelOutsideRule(current.category) || !current.modes.rent) {
        return current;
      }
      const territory =
        current.handoff.homeTerritory ??
        resolveHomeTerritory({
          location: getHomeLocation(),
          countryHint: getSearchCountryCode(),
        });
      const travel = current.handoff.travelOutsideHomeArea ?? "forbidden";
      if (
        current.handoff.homeTerritory?.label === territory.label &&
        current.handoff.homeTerritory?.kind === territory.kind &&
        current.handoff.travelOutsideHomeArea === travel
      ) {
        return current;
      }
      return {
        ...current,
        handoff: {
          ...current.handoff,
          travelOutsideHomeArea: travel,
          homeTerritory: territory,
        },
      };
    });
  }, [draft.modes.rent, draft.category, setDraft]);

  useEffect(() => {
    if (!draft.modes.rent) return;
    const cat = draft.category.trim();
    if (cat !== "Vehicles" && !isCommercialEquipmentCategory(cat)) return;
    if (draft.handoff.lateReturnFeeEnabled != null) return;
    const defaults = defaultLateReturnFeePolicyForCategory(cat);
    setDraft((current) => ({
      ...current,
      handoff: {
        ...current.handoff,
        lateReturnFeeEnabled: defaults.enabled,
        lateReturnGraceMinutes: defaults.graceMinutes,
        lateReturnFlatFeeUsd: defaults.flatFeeUsd,
        lateReturnPerHourFeeUsd: defaults.perHourFeeUsd,
      },
    }));
  }, [draft.modes.rent, draft.category, draft.handoff.lateReturnFeeEnabled, setDraft]);

  useEffect(() => {
    setDraft((current) => {
      if (!current.modes.rentToOwn) return current;
      return {
        ...current,
        modes: { ...current.modes, rentToOwn: false },
      };
    });
  }, [setDraft]);

  useEffect(() => {
    if (!yardSaleListing) return;
    setDraft((current) => ({
      ...current,
      modes: {
        rent: false,
        sell: true,
        rentToOwn: false,
        gift: false,
      },
    }));
  }, [yardSaleListing, setDraft]);

  const suggestedLongTermMonthly = useMemo(() => {
    const daily = Number.parseFloat(draft.pricing.dailyRate);
    const replacement = Number.parseFloat(draft.replacementValue);
    return suggestLongTermMonthlyFromDaily(
      daily,
      Number.isFinite(replacement) && replacement > 0 ? replacement : undefined,
    );
  }, [draft.pricing.dailyRate, draft.replacementValue]);

  useEffect(() => {
    setDraft((current) => {
      const rules = getCategoryModeRules(current.category, current.subcategory);
      const nextModes = { ...current.modes };
      let changed = false;

      (["rent", "sell", "gift"] as const).forEach((key) => {
        if (!rules[key] && nextModes[key]) {
          nextModes[key] = false;
          changed = true;
        }
      });

      if (nextModes.rentToOwn) {
        nextModes.rentToOwn = false;
        changed = true;
      }

      // Do not auto-enable Rent — that forced QR stickers onto hosts who only wanted Sell.
      // Validation on Continue requires at least one allowed mode.

      return changed ? { ...current, modes: nextModes } : current;
    });
  }, [draft.category, draft.subcategory, setDraft]);

  useEffect(() => {
    const category = draft.category;
    if (minimumPeriodCategoryRef.current === category) return;
    minimumPeriodCategoryRef.current = category;

    const defaultPeriod = getDefaultMinimumPeriod(category);
    setDraft((current) => ({
      ...current,
      pricing: { ...current.pricing, minimumPeriod: defaultPeriod },
    }));
  }, [draft.category, setDraft]);

  const insuranceMaxDeductibleBand =
    draft.categorySpecs?.insuranceMaxDeductible?.trim() ||
    draft.handoff.insuranceMaxDeductible?.trim() ||
    "";

  /** Suggestions only — never auto-write into the price fields. */
  const priceSuggestion = useMemo(() => {
    const value = parseFloat(draft.replacementValue);
    if (!draft.category || !Number.isFinite(value) || value <= 0) return null;
    const rentalRaw = calculateRentalPrices(
      draft.category,
      value,
      draft.pricing.minimumPeriod,
      { insuranceMaxDeductible: insuranceMaxDeductibleBand || null },
    );
    const rental = {
      daily: roundMoneyForSuggestion(rentalRaw.daily),
      weekly: roundMoneyForSuggestion(rentalRaw.weekly),
      monthly: roundMoneyForSuggestion(rentalRaw.monthly),
      deposit: roundMoneyForSuggestion(rentalRaw.deposit),
    };
    const sale = Math.max(1, roundMoneyForSuggestion(suggestSaleFromReplacement(value)));
    return { rental, sale };
  }, [
    draft.category,
    draft.replacementValue,
    draft.pricing.minimumPeriod,
    insuranceMaxDeductibleBand,
  ]);

  // Keep insurance-backed holds aligned with the host’s max deductible band.
  useEffect(() => {
    if (depositAdviceKind(draft.category) !== "insurance_backed") return;
    if (!priceSuggestion || priceSuggestion.rental.deposit <= 0) return;
    const target = String(priceSuggestion.rental.deposit);
    const current = (draft.pricing.securityDeposit ?? "").trim();
    const replaceValue = Number.parseFloat(draft.replacementValue);
    const looksLikeFullCar =
      Number.isFinite(replaceValue) &&
      replaceValue > 0 &&
      Math.abs(Number.parseFloat(current) - replaceValue) < 1;
    const empty = !current;
    if (!empty && !looksLikeFullCar && insuranceMaxDeductibleBand) {
      // Host typed a custom hold — only overwrite when band is set and current
      // matches a prior deductible band value (500/1000/2500) or was empty/full-car.
      const priorBands = new Set(["500", "1000", "2500"]);
      if (!priorBands.has(current) && current !== target) return;
    }
    if (current === target) return;
    if (!empty && !looksLikeFullCar && !insuranceMaxDeductibleBand) return;
    setDraft((c) => {
      if ((c.pricing.securityDeposit ?? "").trim() === target) return c;
      return { ...c, pricing: { ...c.pricing, securityDeposit: target } };
    });
  }, [
    draft.category,
    draft.pricing.securityDeposit,
    draft.replacementValue,
    insuranceMaxDeductibleBand,
    priceSuggestion,
    setDraft,
  ]);

  const toggleMode = (key: CategoryModeKey) => {
    setDraft((current) => {
      if (key === "gift") {
        const nextGift = !current.modes.gift;
        if (nextGift) {
          // Free wraps sell@$0; Rent can stay on. Paid sale price is replaced by 0.
          return {
            ...current,
            modes: { ...current.modes, gift: true, sell: true, rentToOwn: false },
            pricing: { ...current.pricing, salePrice: "0" },
          };
        }
        return {
          ...current,
          modes: { ...current.modes, gift: false, sell: false },
          pricing: {
            ...current.pricing,
            salePrice: "",
          },
        };
      }

      if (key === "sell") {
        const nextSell = !current.modes.sell;
        if (!nextSell) {
          return {
            ...current,
            modes: { ...current.modes, sell: false, gift: false },
          };
        }
        // Paid sell — clears Free. Start with empty price (never force "0" into the field).
        const prevSale = current.pricing.salePrice.trim();
        const prevPaid =
          !current.modes.gift &&
          prevSale !== "" &&
          prevSale !== "0" &&
          Number.parseFloat(prevSale.replace(/[^0-9.]/g, "")) > 0;
        return {
          ...current,
          modes: { ...current.modes, sell: true, gift: false },
          pricing: {
            ...current.pricing,
            salePrice: prevPaid ? current.pricing.salePrice : "",
          },
        };
      }

      // Rent (and any other mode) toggles independently — allows Rent+Sell or Rent+Free.
      const nextModes = { ...current.modes, [key]: !current.modes[key] };
      return { ...current, modes: nextModes };
    });
  };

  const updatePricing = (key: keyof ListingDraft["pricing"], value: string) => {
    setDraft((current) => {
      const nextPricing = { ...current.pricing, [key]: value };
      if (key !== "salePrice") {
        return { ...current, pricing: nextPricing };
      }
      // While typing: keep Sell open. Free is applied only on blur (commitSalePrice) or Free card.
      return {
        ...current,
        modes: { ...current.modes, gift: false, sell: true },
        pricing: nextPricing,
      };
    });
  };

  /** Free only when the host leaves an explicit 0 after editing — not while clearing/typing. */
  const commitSalePrice = () => {
    setDraft((current) => {
      const raw = (current.pricing.salePrice || "").trim();
      if (!current.modes.sell || current.modes.gift) return current;
      if (raw === "") return current;
      const sale = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(sale) && sale <= 0) {
        return {
          ...current,
          modes: { ...current.modes, gift: true, sell: true },
          pricing: { ...current.pricing, salePrice: "0" },
        };
      }
      return current;
    });
  };

  const longTermEnabled = Boolean(draft.pricing.longTermEnabled);
  // Min period already monthly — no second "monthly (30+ days)" field.
  const showLongTermOption = draft.pricing.minimumPeriod !== "1 month";

  useEffect(() => {
    if (showLongTermOption || !draft.pricing.longTermEnabled) return;
    setDraft((current) => ({
      ...current,
      pricing: { ...current.pricing, longTermEnabled: false },
    }));
  }, [draft.pricing.longTermEnabled, draft.pricing.minimumPeriod, setDraft, showLongTermOption]);

  const replacementValue = parseFloat(draft.replacementValue);
  const dailyRate = parseFloat(draft.pricing.dailyRate);
  const avg = AVG_RENTAL_DAYS[draft.category] ?? 3;
  const revenuePerRental = dailyRate * avg;
  const showRoiTip = replacementValue > 0 && dailyRate > 0 && revenuePerRental > 0;
  const rentalsToBreakEven = showRoiTip
    ? Math.ceil(replacementValue / revenuePerRental)
    : 0;

  const wantRent = draft.modes.rent;
  const wantSell = draft.modes.sell && !draft.modes.gift;
  const canSuggestRent = Boolean(priceSuggestion && wantRent && priceSuggestion.rental.daily > 0);
  const canSuggestSell = Boolean(priceSuggestion && wantSell && priceSuggestion.sale > 0);
  const showApplySuggestion = canSuggestRent || canSuggestSell;

  const pricingTipMessage = (() => {
    if (showRoiTip) return modesCopy.pricingTipRoi(rentalsToBreakEven);
    if (priceSuggestion && (canSuggestRent || canSuggestSell)) {
      const dailyLabel = formatMoney(priceSuggestion.rental.daily);
      const saleLabel = formatMoney(priceSuggestion.sale);
      const depositLabel = formatMoney(priceSuggestion.rental.deposit);
      const depositKind = depositAdviceKind(draft.category);
      if (canSuggestRent && canSuggestSell) {
        if (depositKind === "insurance_backed") {
          return modesCopy.pricingTipSuggestBothInsurance(dailyLabel, saleLabel, depositLabel);
        }
        if (depositKind === "monthly_rent") {
          return modesCopy.pricingTipSuggestBothMonthlyDeposit(dailyLabel, saleLabel, depositLabel);
        }
        return modesCopy.pricingTipSuggestBoth(dailyLabel, saleLabel, depositLabel);
      }
      if (canSuggestRent) {
        if (depositKind === "insurance_backed") {
          return modesCopy.pricingTipSuggestRentInsurance(dailyLabel, depositLabel);
        }
        if (depositKind === "monthly_rent") {
          return modesCopy.pricingTipSuggestRentMonthlyDeposit(dailyLabel, depositLabel);
        }
        return modesCopy.pricingTipSuggestRent(dailyLabel, depositLabel);
      }
      return modesCopy.pricingTipSuggestSell(saleLabel);
    }
    return modesCopy.pricingTipDefault;
  })();

  const applySuggestedPrices = () => {
    if (!priceSuggestion) return;
    setDraft((current) => {
      const next = { ...current.pricing };
      let nextHandoff = current.handoff;
      if (current.modes.rent) {
        const { daily, weekly, monthly, deposit } = priceSuggestion.rental;
        if (daily > 0) next.dailyRate = String(daily);
        if (weekly > 0) next.weeklyRate = String(weekly);
        if (monthly > 0) next.monthlyRate = String(monthly);
        if (deposit > 0) {
          const kind = depositAdviceKind(current.category);
          const existing = (next.securityDeposit ?? "").trim();
          // Insurance-backed: always apply deductible-sized hold (never leave full car value).
          if (kind === "insurance_backed" || !existing) {
            next.securityDeposit = String(deposit);
          }
        }
        if (current.pricing.longTermEnabled) {
          const longTerm = suggestLongTermMonthlyFromDaily(
            daily,
            Number.parseFloat(draft.replacementValue) || undefined,
          );
          if (longTerm != null) next.longTermMonthlyRate = String(longTerm);
        }
        if (categoryRequiresInsuranceProof(current.category)) {
          nextHandoff = {
            ...current.handoff,
            requireInsuranceProof: current.handoff.requireInsuranceProof ?? true,
          };
        }
      }
      if (current.modes.sell && !current.modes.gift && priceSuggestion.sale > 0) {
        next.salePrice = String(priceSuggestion.sale);
      }
      return { ...current, pricing: next, handoff: nextHandoff };
    });
  };

  const periodLabels: Record<MinimumRentalPeriod, string> = {
    "1 day": modesCopy.period1Day,
    "3 days": modesCopy.period3Days,
    "1 week": modesCopy.period1Week,
    "2 weeks": modesCopy.period2Weeks,
    "1 month": modesCopy.period1Month,
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: GREEN }}>
          {modesCopy.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {modesCopy.subtitle}
        </p>
        {!yardSaleListing && (categoryRules.sell || categoryRules.gift) ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-bold text-white">
              {modesCopy.gift}
            </span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900">
              {modesCopy.giftBadge}
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {visibleModeCards.map((card) => {
          if (card.key === "rent") {
            return (
              <ModeCard
                key="rent"
                icon={card.icon}
                title={card.title}
                subtitle={rentSubtitle}
                active={draft.modes.rent}
                onToggle={() => toggleMode("rent")}
              >
                <motion.div layout className="space-y-3">
                  <motion.div layout="position">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700">
                      {modesCopy.minimumPeriod}
                    </label>
                    <select
                      value={draft.pricing.minimumPeriod}
                      onChange={(event) =>
                        updatePricing(
                          "minimumPeriod",
                          event.target.value as MinimumRentalPeriod,
                        )
                      }
                      className={selectClassName}
                    >
                      {MINIMUM_PERIOD_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {periodLabels[option]}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                  <AnimatePresence initial={false} mode="popLayout">
                    {showDailyRate ? (
                      <motion.div
                        key="daily-rate"
                        layout
                        className="overflow-hidden"
                        {...rateFieldMotion}
                      >
                        <FieldLabel
                          label={modesCopy.dailyRate}
                          required={periodRateFields.required === "daily"}
                        />
                        <MoneyInput
                          value={draft.pricing.dailyRate}
                          onChange={(value) => updatePricing("dailyRate", value)}
                        />
                      </motion.div>
                    ) : null}
                    {showWeeklyRate ? (
                      <motion.div
                        key="weekly-rate"
                        layout
                        className="overflow-hidden"
                        {...rateFieldMotion}
                      >
                        <FieldLabel
                          label={modesCopy.weeklyRate}
                          required={periodRateFields.required === "weekly"}
                        />
                        <MoneyInput
                          value={draft.pricing.weeklyRate}
                          onChange={(value) => updatePricing("weeklyRate", value)}
                        />
                      </motion.div>
                    ) : null}
                    {showMonthlyRate ? (
                      <motion.div
                        key="monthly-rate"
                        layout
                        className="overflow-hidden"
                        {...rateFieldMotion}
                      >
                        <FieldLabel
                          label={modesCopy.monthlyRate}
                          required={periodRateFields.required === "monthly"}
                        />
                        <MoneyInput
                          value={draft.pricing.monthlyRate}
                          onChange={(value) => updatePricing("monthlyRate", value)}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {showLongTermOption ? (
                  <motion.div layout="position" className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{modesCopy.longTermTitle}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {modesCopy.longTermBody}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((current) => ({
                            ...current,
                            pricing: {
                              ...current.pricing,
                              longTermEnabled: !Boolean(current.pricing.longTermEnabled),
                            },
                          }));
                        }}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          longTermEnabled ? "bg-green-700" : "bg-gray-200"
                        }`}
                        aria-label={modesCopy.longTermToggleAria}
                        aria-pressed={longTermEnabled}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            longTermEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {longTermEnabled ? (
                        <motion.div
                          key="long-term-fields"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3">
                            <FieldLabel label={modesCopy.longTermMonthlyRate} required />
                            <MoneyInput
                              value={draft.pricing.longTermMonthlyRate ?? ""}
                              onChange={(value) => updatePricing("longTermMonthlyRate", value)}
                            />
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <p className="text-xs text-gray-500">
                                {modesCopy.longTermRentersNote}
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowLongTermPricingHelp((s) => !s)}
                                className="text-xs font-semibold underline"
                                style={{ color: GREEN }}
                              >
                                {modesCopy.howToPrice}
                              </button>
                            </div>

                            {showLongTermPricingHelp ? (
                              <div className="mt-2 rounded-xl bg-[#F0FDF4] px-3 py-2 text-xs text-gray-700">
                                {modesCopy.longTermHelp(
                                  suggestedLongTermMonthly
                                    ? `${formatMoney(suggestedLongTermMonthly)}/mo`
                                    : formatMoney(0),
                                )}
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                  ) : null}

                  <motion.div layout="position">
                    <FieldLabel label={modesCopy.securityDeposit} required />
                    <MoneyInput
                      value={draft.pricing.securityDeposit}
                      onChange={(value) => updatePricing("securityDeposit", value)}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      {depositAdviceKind(draft.category) === "insurance_backed"
                        ? modesCopy.securityDepositHintInsurance
                        : depositAdviceKind(draft.category) === "monthly_rent"
                          ? modesCopy.securityDepositHintMonthly
                          : modesCopy.securityDepositHint}
                    </p>
                  </motion.div>
                  {draft.modes.rent &&
                  (categoryRequiresInsuranceProof(draft.category) ||
                    listingRequiresPhysicalDamage(draft) ||
                    isCommercialEquipmentCategory(draft.category)) ? (
                    <motion.div
                      layout="position"
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5"
                    >
                      <p className="text-[13px] font-semibold text-amber-950">
                        {modesCopy.insuranceRequirementTitle}
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/90">
                        {modesCopy.insuranceRequirementBody}
                      </p>
                      <label className="mt-3 flex items-start gap-2 text-[13px] text-amber-950">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={
                            listingRequiresPhysicalDamage(draft) ||
                            draft.handoff.requireInsuranceProof !== false
                          }
                          disabled={listingRequiresPhysicalDamage(draft)}
                          onChange={(e) => {
                            const on = e.target.checked;
                            setDraft((c) => ({
                              ...c,
                              handoff: { ...c.handoff, requireInsuranceProof: on },
                            }));
                          }}
                        />
                        <span>{modesCopy.insuranceRequirementToggle}</span>
                      </label>
                      {listingRequiresPhysicalDamage(draft) ||
                      draft.handoff.requireInsuranceProof !== false ? (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-amber-950">
                            {modesCopy.insuranceCoverageLead}
                          </label>
                          <select
                            className={selectClassName}
                            value={String(draft.handoff.insuranceCoverageLeadDays ?? 1)}
                            onChange={(e) => {
                              const days = Number.parseInt(e.target.value, 10);
                              setDraft((c) => ({
                                ...c,
                                handoff: {
                                  ...c.handoff,
                                  insuranceCoverageLeadDays: Number.isFinite(days) ? days : 1,
                                },
                              }));
                            }}
                          >
                            <option value="0">{modesCopy.insuranceCoverageLead0}</option>
                            <option value="1">{modesCopy.insuranceCoverageLead1}</option>
                            <option value="3">{modesCopy.insuranceCoverageLead3}</option>
                            <option value="7">{modesCopy.insuranceCoverageLead7}</option>
                          </select>
                          <p className="mt-1.5 text-[12px] text-amber-900/80">
                            {modesCopy.insuranceCoverageLeadHint}
                          </p>
                        </div>
                      ) : null}

                      {(isCommercialEquipmentCategory(draft.category) ||
                        listingRequiresPhysicalDamage(draft) ||
                        draft.handoff.requirePhysicalDamage) && (
                        <div className="mt-3 rounded-xl border border-amber-300/80 bg-white/70 p-3">
                          <label className="flex items-start gap-2 text-[13px] text-amber-950">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={listingRequiresPhysicalDamage(draft)}
                              disabled={physicalDamageIsMandatory(draft)}
                              onChange={(e) => {
                                if (physicalDamageIsMandatory(draft)) return;
                                const on = e.target.checked;
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    requirePhysicalDamage: on,
                                    ...(on ? { requireInsuranceProof: true } : {}),
                                  },
                                }));
                              }}
                            />
                            <span>
                              <span className="font-semibold">
                                {modesCopy.physicalDamageTitle}
                              </span>
                              <span className="mt-0.5 block text-[12px] font-normal text-amber-900/85">
                                {modesCopy.physicalDamageBody(
                                  VEHICLE_PHYSICAL_DAMAGE_WEIGHT_LBS,
                                  VEHICLE_PHYSICAL_DAMAGE_WEIGHT_KG,
                                )}
                              </span>
                            </span>
                          </label>
                        </div>
                      )}

                      {isCommercialEquipmentCategory(draft.category) ? (
                        <div className="mt-3 rounded-xl border border-amber-300/80 bg-white/70 p-3">
                          <label className="flex items-start gap-2 text-[13px] text-amber-950">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={draft.handoff.proRentersOnly !== false}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setDraft((c) => ({
                                  ...c,
                                  handoff: { ...c.handoff, proRentersOnly: on },
                                }));
                              }}
                            />
                            <span>
                              <span className="font-semibold">{modesCopy.proRentersTitle}</span>
                              <span className="mt-0.5 block text-[12px] font-normal text-amber-900/85">
                                {modesCopy.proRentersBody}
                              </span>
                            </span>
                          </label>
                        </div>
                      ) : null}

                      {isCommercialEquipmentCategory(draft.category) &&
                      (listingRequiresPhysicalDamage(draft) ||
                        draft.handoff.requireInsuranceProof !== false) ? (
                        <div className="mt-3 space-y-3 rounded-xl border border-orange-300/80 bg-white/80 p-3">
                          <div>
                            <p className="text-[13px] font-semibold text-orange-950">
                              {modesCopy.coiStructuredTitle}
                            </p>
                            <p className="mt-1 text-[12px] text-orange-900/85">
                              {modesCopy.coiStructuredBody}
                            </p>
                          </div>
                          <label className="flex items-start gap-2 text-[13px] text-orange-950">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={draft.handoff.coiAdditionalInsuredRequired === true}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    coiAdditionalInsuredRequired: on,
                                  },
                                }));
                              }}
                            />
                            <span>
                              <span className="font-semibold">
                                {modesCopy.coiAdditionalInsuredTitle}
                              </span>
                              <span className="mt-0.5 block text-[12px] font-normal text-orange-900/85">
                                {modesCopy.coiAdditionalInsuredBody}
                              </span>
                            </span>
                          </label>
                          <label className="block text-xs font-semibold uppercase tracking-wide text-orange-950">
                            {modesCopy.insuranceRequirementsNotes}
                            <textarea
                              className={`${selectClassName} mt-1.5`}
                              rows={3}
                              value={draft.handoff.insuranceRequirementsNotes ?? ""}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    insuranceRequirementsNotes: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                          <p className="text-[12px] text-orange-900/80">
                            {modesCopy.insuranceRequirementsNotesHint}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block text-xs font-semibold text-orange-950">
                              {modesCopy.insurancePdMinUsd}
                              <input
                                type="text"
                                inputMode="decimal"
                                className={`${selectClassName} mt-1`}
                                value={draft.handoff.insurancePdMinUsd ?? ""}
                                onChange={(e) =>
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      insurancePdMinUsd: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label className="block text-xs font-semibold text-orange-950">
                              {modesCopy.insuranceLiabilityMinUsd}
                              <input
                                type="text"
                                inputMode="decimal"
                                className={`${selectClassName} mt-1`}
                                value={draft.handoff.insuranceLiabilityMinUsd ?? ""}
                                onChange={(e) =>
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      insuranceLiabilityMinUsd: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          </div>
                        </div>
                      ) : null}

                      {listingIsCommercialTransport(draft) ? (
                        <div className="mt-3 space-y-3 rounded-xl border border-violet-300/80 bg-white/80 p-3">
                          <div>
                            <p className="text-[13px] font-semibold text-violet-950">
                              {modesCopy.commercialTransportTitle}
                            </p>
                          <p className="mt-1 text-[12px] text-violet-900/85">
                            {modesCopy.commercialTransportBody}
                          </p>
                          </div>
                          <label className="block text-xs font-semibold uppercase tracking-wide text-violet-950">
                            {modesCopy.wheelCountLabel}
                            <input
                              type="number"
                              inputMode="numeric"
                              min={2}
                              max={26}
                              className={`${selectClassName} mt-1.5`}
                              value={draft.categorySpecs?.wheelCount ?? ""}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  categorySpecs: {
                                    ...(c.categorySpecs ?? {}),
                                    wheelCount: e.target.value,
                                  },
                                }))
                              }
                              placeholder={modesCopy.wheelCountPlaceholder}
                            />
                          </label>
                          <p className="text-[12px] text-violet-900/80">
                            {modesCopy.wheelCountHint}
                          </p>
                          <label className="block text-xs font-semibold uppercase tracking-wide text-violet-950">
                            {modesCopy.insuranceOwnerProofEmail}
                            <input
                              type="email"
                              className={`${selectClassName} mt-1.5`}
                              value={draft.handoff.insuranceOwnerProofEmail ?? ""}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    insuranceOwnerProofEmail: e.target.value,
                                  },
                                }))
                              }
                              placeholder="owner@example.com"
                            />
                          </label>
                          <p className="text-[12px] text-violet-900/80">
                            {modesCopy.insuranceOwnerProofEmailHint}
                          </p>
                          {draft.handoff.insuranceOwnerProofEmail &&
                          !isValidInsuranceOwnerProofEmail(
                            draft.handoff.insuranceOwnerProofEmail,
                          ) ? (
                            <p className="text-[12px] font-semibold text-red-600">
                              {modesCopy.insuranceOwnerProofEmailHint}
                            </p>
                          ) : null}
                          <label className="block text-xs font-semibold uppercase tracking-wide text-violet-950">
                            {modesCopy.insuranceRequirementsNotes}
                            <textarea
                              className={`${selectClassName} mt-1.5`}
                              rows={3}
                              value={draft.handoff.insuranceRequirementsNotes ?? ""}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    insuranceRequirementsNotes: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                          <p className="text-[12px] text-violet-900/80">
                            {modesCopy.insuranceRequirementsNotesHint}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block text-xs font-semibold text-violet-950">
                              {modesCopy.insurancePdMinUsd}
                              <input
                                type="text"
                                inputMode="decimal"
                                className={`${selectClassName} mt-1`}
                                value={draft.handoff.insurancePdMinUsd ?? ""}
                                onChange={(e) =>
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      insurancePdMinUsd: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                            <label className="block text-xs font-semibold text-violet-950">
                              {modesCopy.insuranceLiabilityMinUsd}
                              <input
                                type="text"
                                inputMode="decimal"
                                className={`${selectClassName} mt-1`}
                                value={draft.handoff.insuranceLiabilityMinUsd ?? ""}
                                onChange={(e) =>
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      insuranceLiabilityMinUsd: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <label className="block text-xs font-semibold text-violet-950">
                            {modesCopy.insuranceRenterFeeUsd}
                            <input
                              type="text"
                              inputMode="decimal"
                              className={`${selectClassName} mt-1`}
                              value={draft.handoff.insuranceRenterFeeUsd ?? ""}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    insuranceRenterFeeUsd: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                        </div>
                      ) : null}

                      {draft.modes.rent &&
                      (draft.category.trim() === "Vehicles" ||
                        isCommercialEquipmentCategory(draft.category)) ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white/80 p-3">
                          <p className="text-[13px] font-semibold text-gray-900">
                            {modesCopy.noShowFeeTitle}
                          </p>
                          <p className="mt-1 text-[12px] text-gray-600">{modesCopy.noShowFeeBody}</p>
                          <label className="mt-2 flex items-start gap-2 text-[13px] text-gray-900">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={draft.handoff.noShowFeeEnabled === true}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    noShowFeeEnabled: e.target.checked,
                                  },
                                }))
                              }
                            />
                            <span>{modesCopy.noShowFeeToggle}</span>
                          </label>
                          {draft.handoff.noShowFeeEnabled ? (
                            <label className="mt-2 block text-xs font-semibold text-gray-700">
                              {modesCopy.noShowFeeAmount}
                              <input
                                type="text"
                                inputMode="decimal"
                                className={`${selectClassName} mt-1`}
                                value={draft.handoff.noShowFeeUsd ?? ""}
                                onChange={(e) =>
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      noShowFeeUsd: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </label>
                          ) : null}
                        </div>
                      ) : null}

                      {draft.modes.rent &&
                      (draft.category.trim() === "Vehicles" ||
                        isCommercialEquipmentCategory(draft.category)) ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white/80 p-3">
                          <p className="text-[13px] font-semibold text-gray-900">
                            {modesCopy.lateReturnFeeTitle}
                          </p>
                          <p className="mt-1 text-[12px] text-gray-600">{modesCopy.lateReturnFeeBody}</p>
                          <label className="mt-2 flex items-start gap-2 text-[13px] text-gray-900">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={draft.handoff.lateReturnFeeEnabled === true}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    lateReturnFeeEnabled: e.target.checked,
                                  },
                                }))
                              }
                            />
                            <span>{modesCopy.lateReturnFeeToggle}</span>
                          </label>
                          {draft.handoff.lateReturnFeeEnabled ? (
                            <div className="mt-2 grid gap-2 sm:grid-cols-3">
                              <label className="block text-xs font-semibold text-gray-700">
                                {modesCopy.lateReturnGraceMinutes}
                                <input
                                  type="number"
                                  min={0}
                                  max={1440}
                                  inputMode="numeric"
                                  className={`${selectClassName} mt-1`}
                                  value={draft.handoff.lateReturnGraceMinutes ?? 30}
                                  onChange={(e) =>
                                    setDraft((c) => ({
                                      ...c,
                                      handoff: {
                                        ...c.handoff,
                                        lateReturnGraceMinutes: Number.parseInt(
                                          e.target.value,
                                          10,
                                        ),
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <label className="block text-xs font-semibold text-gray-700">
                                {modesCopy.lateReturnFlatFee}
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  className={`${selectClassName} mt-1`}
                                  value={draft.handoff.lateReturnFlatFeeUsd ?? "20"}
                                  onChange={(e) =>
                                    setDraft((c) => ({
                                      ...c,
                                      handoff: {
                                        ...c.handoff,
                                        lateReturnFlatFeeUsd: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <label className="block text-xs font-semibold text-gray-700">
                                {modesCopy.lateReturnPerHourFee}
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  className={`${selectClassName} mt-1`}
                                  value={draft.handoff.lateReturnPerHourFeeUsd ?? "15"}
                                  onChange={(e) =>
                                    setDraft((c) => ({
                                      ...c,
                                      handoff: {
                                        ...c.handoff,
                                        lateReturnPerHourFeeUsd: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {draft.modes.rent && listingRequiresFuelTracking(draft) ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white/80 p-3">
                          <p className="text-[13px] font-semibold text-gray-900">
                            {modesCopy.fuelPolicyHostTitle}
                          </p>
                          <p className="mt-1 text-[12px] text-gray-600">
                            {modesCopy.fuelPolicyHostBody}
                          </p>
                          <label className="mt-2 block text-xs font-semibold text-gray-700">
                            {modesCopy.fuelPolicyHostSelect}
                            <select
                              className={`${selectClassName} mt-1`}
                              value={draft.handoff.fuelPolicy ?? "full_to_full"}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    fuelPolicy:
                                      e.target.value === "prepaid_full_tank"
                                        ? "prepaid_full_tank"
                                        : "full_to_full",
                                  },
                                }))
                              }
                            >
                              <option value="full_to_full">
                                {modesCopy.fuelPolicyFullToFull}
                              </option>
                              <option value="prepaid_full_tank">
                                {modesCopy.fuelPolicyPrepaid}
                              </option>
                            </select>
                          </label>
                          <label className="mt-2 block text-xs font-semibold text-gray-700">
                            {modesCopy.fuelPolicyMissingFee}
                            <input
                              type="text"
                              inputMode="decimal"
                              className={`${selectClassName} mt-1`}
                              value={draft.handoff.fuelMissingFeeUsd ?? "20"}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    fuelMissingFeeUsd: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                          <label className="mt-2 block text-xs font-semibold text-gray-700">
                            {modesCopy.fuelPolicyTankGallons}
                            <input
                              type="text"
                              inputMode="decimal"
                              className={`${selectClassName} mt-1`}
                              value={draft.handoff.fuelTankGallons ?? ""}
                              placeholder="15"
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    fuelTankGallons: e.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                        </div>
                      ) : null}

                      {draft.modes.rent &&
                      (draft.category.trim() === "Vehicles" ||
                        draft.category.trim() === "Boats & Water") ? (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-white/80 p-3">
                          <p className="text-[13px] font-semibold text-gray-900">
                            {modesCopy.youngDriverTitle}
                          </p>
                          <p className="mt-1 text-[12px] text-gray-600">
                            {modesCopy.youngDriverBody}
                          </p>
                          <label className="mt-2 flex items-start gap-2 text-[13px] text-gray-900">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={draft.handoff.allowYoungDrivers === true}
                              onChange={(e) =>
                                setDraft((c) => ({
                                  ...c,
                                  handoff: {
                                    ...c.handoff,
                                    allowYoungDrivers: e.target.checked,
                                    youngDriverHoldMultiplier:
                                      c.handoff.youngDriverHoldMultiplier ?? 1.5,
                                  },
                                }))
                              }
                            />
                            <span>{modesCopy.youngDriverToggle}</span>
                          </label>
                          {draft.handoff.allowYoungDrivers ? (
                            <label className="mt-2 block text-xs font-semibold text-gray-700">
                              {modesCopy.youngDriverMultiplier}
                              <select
                                className={`${selectClassName} mt-1`}
                                value={String(draft.handoff.youngDriverHoldMultiplier ?? 1.5)}
                                onChange={(e) =>
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      youngDriverHoldMultiplier: Number.parseFloat(e.target.value) || 1.5,
                                    },
                                  }))
                                }
                              >
                                <option value="1.5">1.5×</option>
                                <option value="2">2×</option>
                              </select>
                            </label>
                          ) : null}
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}

                  {draft.modes.rent && draft.category.trim() === "Vehicles" ? (
                    <motion.div
                      layout="position"
                      className="rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {modesCopy.mileagePolicyTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">{modesCopy.mileagePolicyBody}</p>
                      {!(draft.vehicleExtras?.unlimitedMiles?.enabled) ? (
                        <div className="mt-3 space-y-3">
                          <div>
                            <FieldLabel label={modesCopy.includedMilesPerDay} required />
                            <input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              className={selectClassName}
                              value={draft.categorySpecs?.includedMilesPerDay ?? "250"}
                              placeholder="250"
                              onChange={(e) => {
                                const value = e.target.value;
                                setDraft((c) => ({
                                  ...c,
                                  categorySpecs: {
                                    ...(c.categorySpecs ?? {}),
                                    includedMilesPerDay: value,
                                  },
                                }));
                              }}
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                              {modesCopy.includedMilesPerDayHint}
                            </p>
                          </div>
                          <div>
                            <FieldLabel label={modesCopy.overagePerMile} required />
                            <MoneyInput
                              value={draft.categorySpecs?.overagePerMile ?? ""}
                              onChange={(value) => {
                                setDraft((c) => ({
                                  ...c,
                                  categorySpecs: {
                                    ...(c.categorySpecs ?? {}),
                                    overagePerMile: value,
                                  },
                                }));
                              }}
                            />
                            <p className="mt-1.5 text-xs text-gray-500">
                              {modesCopy.overagePerMileHint}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">
                          {modesCopy.extraUnlimitedMilesHint}
                        </p>
                      )}
                    </motion.div>
                  ) : null}

                  {draft.modes.rent && draft.category.trim() === "Vehicles" ? (
                    <motion.div
                      layout="position"
                      className="rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">{modesCopy.vehicleExtrasTitle}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{modesCopy.vehicleExtrasBody}</p>
                      <div className="mt-3 space-y-3">
                        {(
                          [
                            {
                              key: "unlimitedMiles" as const,
                              label: modesCopy.extraUnlimitedMiles,
                              hint: modesCopy.extraUnlimitedMilesHint,
                              priceLabel: modesCopy.extraPricePerDay,
                            },
                            {
                              key: "childSeat" as const,
                              label: modesCopy.extraChildSeat,
                              hint: modesCopy.extraChildSeatHint,
                              priceLabel: modesCopy.extraPriceFlat,
                            },
                            {
                              key: "roofRack" as const,
                              label: modesCopy.extraRoofRack,
                              hint: modesCopy.extraRoofRackHint,
                              priceLabel: modesCopy.extraPriceFlat,
                            },
                            {
                              key: "vehicleDelivery" as const,
                              label: modesCopy.extraVehicleDelivery,
                              hint: modesCopy.extraVehicleDeliveryHint,
                              priceLabel: modesCopy.extraPriceFlat,
                            },
                          ] as const
                        ).map((row) => {
                          const extras: VehicleExtrasConfig =
                            draft.vehicleExtras ?? emptyVehicleExtras();
                          const offer = extras[row.key] ?? { enabled: false, price: "" };
                          return (
                            <div
                              key={row.key}
                              className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-3"
                            >
                              <label className="flex items-start gap-2 text-[13px] text-gray-900">
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={Boolean(offer.enabled)}
                                  onChange={(e) => {
                                    const enabled = e.target.checked;
                                    setDraft((c) => {
                                      const next = {
                                        ...(c.vehicleExtras ?? emptyVehicleExtras()),
                                      };
                                      next[row.key as VehicleExtraKey] = {
                                        ...next[row.key],
                                        enabled,
                                        price: next[row.key]?.price ?? "",
                                        maxMiles:
                                          row.key === "vehicleDelivery"
                                            ? next.vehicleDelivery?.maxMiles ?? 10
                                            : undefined,
                                      };
                                      return { ...c, vehicleExtras: next };
                                    });
                                  }}
                                />
                                <span>
                                  <span className="font-semibold">{row.label}</span>
                                  <span className="mt-0.5 block text-[12px] text-gray-500">
                                    {row.hint}
                                  </span>
                                </span>
                              </label>
                              {offer.enabled ? (
                                <div className="mt-2 space-y-2 pl-6">
                                  <div>
                                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                      {row.priceLabel}
                                    </label>
                                    <MoneyInput
                                      value={offer.price}
                                      onChange={(value) => {
                                        setDraft((c) => {
                                          const next = {
                                            ...(c.vehicleExtras ?? emptyVehicleExtras()),
                                          };
                                          next[row.key] = {
                                            ...next[row.key],
                                            enabled: true,
                                            price: value,
                                            maxMiles: next[row.key]?.maxMiles,
                                          };
                                          return { ...c, vehicleExtras: next };
                                        });
                                      }}
                                    />
                                  </div>
                                  {row.key === "vehicleDelivery" ? (
                                    <div>
                                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                        {modesCopy.extraDeliveryRadius}
                                      </label>
                                      <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={offer.maxMiles ?? 10}
                                        className={selectClassName}
                                        onChange={(e) => {
                                          const miles = Number.parseInt(e.target.value, 10);
                                          setDraft((c) => {
                                            const next = {
                                              ...(c.vehicleExtras ?? emptyVehicleExtras()),
                                            };
                                            next.vehicleDelivery = {
                                              enabled: true,
                                              price: next.vehicleDelivery?.price ?? "",
                                              maxMiles: Number.isFinite(miles)
                                                ? Math.max(1, miles)
                                                : 10,
                                            };
                                            return { ...c, vehicleExtras: next };
                                          });
                                        }}
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : null}

                  {draft.modes.rent && draft.category.trim() === "Vehicles" ? (
                    <motion.div
                      layout="position"
                      className="rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">{modesCopy.tollHoldTitle}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{modesCopy.tollHoldBody}</p>
                      <label className="mt-3 flex items-start gap-2 text-[13px] text-gray-900">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={Boolean(draft.handoff.tollHoldEnabled)}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            setDraft((c) => ({
                              ...c,
                              handoff: {
                                ...c.handoff,
                                tollHoldEnabled: enabled,
                                tollHoldAmountUsd: c.handoff.tollHoldAmountUsd || "50",
                              },
                            }));
                          }}
                        />
                        <span>{modesCopy.tollHoldToggle}</span>
                      </label>
                      {draft.handoff.tollHoldEnabled ? (
                        <div className="mt-2 pl-6">
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            {modesCopy.tollHoldAmount}
                          </label>
                          <MoneyInput
                            value={draft.handoff.tollHoldAmountUsd || "50"}
                            onChange={(value) => {
                              setDraft((c) => ({
                                ...c,
                                handoff: { ...c.handoff, tollHoldAmountUsd: value },
                              }));
                            }}
                          />
                          <p className="mt-1 text-[12px] text-gray-500">
                            {modesCopy.tollHoldAmountHint}
                          </p>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}

                  {draft.modes.rent &&
                  (draft.category.trim() === "Vehicles" ||
                    draft.category.trim() === "Boats & Water") ? (
                    <motion.div
                      layout="position"
                      className="rounded-2xl border border-gray-100 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {modesCopy.travelOutsideTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {(draft.handoff.homeTerritory?.kind ?? "country") === "state"
                          ? modesCopy.travelOutsideBodyState
                          : modesCopy.travelOutsideBodyCountry}
                      </p>
                      {draft.handoff.homeTerritory?.label ? (
                        <p className="mt-2 text-[12px] font-medium text-gray-700">
                          {modesCopy.travelOutsideHomeLabel(draft.handoff.homeTerritory.label)}
                        </p>
                      ) : null}
                      <div className="mt-3 space-y-2">
                        {(
                          [
                            {
                              value: "forbidden" as const,
                              label: modesCopy.travelOutsideForbidden,
                            },
                            {
                              value: "allowed" as const,
                              label: modesCopy.travelOutsideAllowed,
                            },
                          ] as const
                        ).map((row) => {
                          const selected =
                            (draft.handoff.travelOutsideHomeArea ?? "forbidden") === row.value;
                          return (
                            <label
                              key={row.value}
                              className="flex items-start gap-2 rounded-xl border border-gray-100 bg-[#F9FAFB] px-3 py-2.5 text-[13px] text-gray-900"
                            >
                              <input
                                type="radio"
                                className="mt-0.5"
                                name="travelOutsideHomeArea"
                                checked={selected}
                                onChange={() => {
                                  setDraft((c) => ({
                                    ...c,
                                    handoff: {
                                      ...c.handoff,
                                      travelOutsideHomeArea: row.value,
                                      homeTerritory:
                                        c.handoff.homeTerritory ??
                                        resolveHomeTerritory({
                                          location: getHomeLocation(),
                                          countryHint: getSearchCountryCode(),
                                        }),
                                    },
                                  }));
                                }}
                              />
                              <span>{row.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-[11px] text-gray-500">
                        {modesCopy.travelOutsideHint}
                      </p>
                    </motion.div>
                  ) : null}
                </motion.div>
                <ModeNote>
                  {modesCopy.depositProtectionNote(item.depositProtection)}
                </ModeNote>
              </ModeCard>
            );
          }

          if (card.key === "sell") {
            const giftActive = draft.modes.gift;
            return (
              <ModeCard
                key="sell"
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
                active={draft.modes.sell && !giftActive}
                onToggle={() => toggleMode("sell")}
              >
                <motion.div layout="position">
                  <FieldLabel label={modesCopy.salePrice} required />
                  <MoneyInput
                    value={draft.pricing.salePrice}
                    onChange={(value) => updatePricing("salePrice", value)}
                    onBlur={commitSalePrice}
                  />
                </motion.div>
                <ModeNote>{modesCopy.sellNote}</ModeNote>
              </ModeCard>
            );
          }

          if (card.key === "gift") {
            return (
              <ModeCard
                key="gift"
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
                badge={modesCopy.giftBadge}
                badgeTone="accent"
                active={draft.modes.gift}
                onToggle={() => toggleMode("gift")}
              >
                <ModeNote>{modesCopy.giftNote}</ModeNote>
              </ModeCard>
            );
          }

          return null;
        })}
      </div>

      <RentanoHint
        className="mt-6"
        showTapLabel
        hint={
          <span className="block space-y-2">
            <span className="block">{pricingTipMessage}</span>
            {showApplySuggestion ? (
              <button
                type="button"
                onClick={applySuggestedPrices}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                {modesCopy.useSuggestedPrices}
              </button>
            ) : null}
          </span>
        }
      />

      {showRestrictedModesNote ? (
        <p className="mt-4 text-center text-xs italic text-gray-400">
          {modesCopy.restrictedModesNote}
        </p>
      ) : null}
    </motion.div>
  );
}
