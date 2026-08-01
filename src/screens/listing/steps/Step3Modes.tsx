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
import { useMessages } from "../../../lib/i18n/react";
import { currencySymbol, formatMoney } from "../../../lib/regionalDisplay";

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
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const symbol = currencySymbol();
  return (
    <motion.div className="relative" layout="position">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        {symbol}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        placeholder=""
        inputMode="decimal"
        onChange={(event) => onChange(event.target.value)}
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
  active,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  active: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
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
          <motion.div layout="position">
            <p className="text-base font-bold text-gray-900">{title}</p>
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

function getRateFieldsForMinimumPeriod(minimumPeriod: MinimumRentalPeriod) {
  if (minimumPeriod === "1 day") {
    return { showDaily: true, showWeekly: false, showMonthly: false };
  }
  if (minimumPeriod === "3 days" || minimumPeriod === "1 week") {
    return { showDaily: false, showWeekly: true, showMonthly: true };
  }
  return { showDaily: false, showWeekly: false, showMonthly: true };
}

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

  const categoryRules = getCategoryModeRules(draft.category);
  const showRestrictedModesNote = categoryHasRestrictedModes(draft.category);

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

  const MODE_CARDS_PUBLIC = modeCardConfig.filter((card) => card.key !== "gift");

  const visibleModeCards = yardSaleListing
    ? MODE_CARDS_PUBLIC.filter((card) => card.key === "sell")
    : MODE_CARDS_PUBLIC.filter((card) => categoryRules[card.key as "rent" | "sell"]);

  useEffect(() => {
    setDraft((current) => {
      if (!current.modes.gift && !current.modes.rentToOwn) return current;
      return {
        ...current,
        modes: { ...current.modes, gift: false, rentToOwn: false },
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
    if (!Number.isFinite(daily) || daily <= 0) return null;
    const suggested = daily * 30 * 0.65;
    if (!Number.isFinite(suggested) || suggested <= 0) return null;
    return Math.round(suggested);
  }, [draft.pricing.dailyRate]);

  useEffect(() => {
    setDraft((current) => {
      const rules = getCategoryModeRules(current.category);
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
  }, [draft.category, setDraft]);

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

  /** Suggestions only — never auto-write into the price fields. */
  const priceSuggestion = useMemo(() => {
    const value = parseFloat(draft.replacementValue);
    if (!draft.category || !Number.isFinite(value) || value <= 0) return null;
    const rental = calculateRentalPrices(
      draft.category,
      value,
      draft.pricing.minimumPeriod,
    );
    // Used-sale starting ask ~45% of replace-new estimate (host can ignore).
    const sale = Math.max(1, Math.round(value * 0.45));
    return { rental, sale };
  }, [draft.category, draft.replacementValue, draft.pricing.minimumPeriod]);

  const toggleMode = (key: CategoryModeKey) => {
    setDraft((current) => {
      const nextModes = { ...current.modes, [key]: !current.modes[key] };
      // Allow turning the last mode off — Continue stays disabled until one is chosen.
      return { ...current, modes: nextModes };
    });
  };

  const updatePricing = (key: keyof ListingDraft["pricing"], value: string) => {
    setDraft((current) => ({
      ...current,
      pricing: { ...current.pricing, [key]: value },
    }));
  };

  const longTermEnabled = Boolean(draft.pricing.longTermEnabled);

  const replacementValue = parseFloat(draft.replacementValue);
  const dailyRate = parseFloat(draft.pricing.dailyRate);
  const avg = AVG_RENTAL_DAYS[draft.category] ?? 3;
  const revenuePerRental = dailyRate * avg;
  const showRoiTip = replacementValue > 0 && dailyRate > 0 && revenuePerRental > 0;
  const rentalsToBreakEven = showRoiTip
    ? Math.ceil(replacementValue / revenuePerRental)
    : 0;

  const wantRent = draft.modes.rent;
  const wantSell = draft.modes.sell;
  const canSuggestRent = Boolean(priceSuggestion && wantRent && priceSuggestion.rental.daily > 0);
  const canSuggestSell = Boolean(priceSuggestion && wantSell && priceSuggestion.sale > 0);
  const showApplySuggestion = canSuggestRent || canSuggestSell;

  const pricingTipMessage = (() => {
    if (showRoiTip) return modesCopy.pricingTipRoi(rentalsToBreakEven);
    if (priceSuggestion && (canSuggestRent || canSuggestSell)) {
      const dailyLabel = formatMoney(priceSuggestion.rental.daily);
      const saleLabel = formatMoney(priceSuggestion.sale);
      if (canSuggestRent && canSuggestSell) {
        return modesCopy.pricingTipSuggestBoth(dailyLabel, saleLabel);
      }
      if (canSuggestRent) return modesCopy.pricingTipSuggestRent(dailyLabel);
      return modesCopy.pricingTipSuggestSell(saleLabel);
    }
    return modesCopy.pricingTipDefault;
  })();

  const applySuggestedPrices = () => {
    if (!priceSuggestion) return;
    setDraft((current) => {
      const next = { ...current.pricing };
      if (current.modes.rent) {
        const { daily, weekly, monthly, deposit } = priceSuggestion.rental;
        if (daily > 0) next.dailyRate = String(daily);
        if (weekly > 0) next.weeklyRate = String(weekly);
        if (monthly > 0) next.monthlyRate = String(monthly);
        if (deposit > 0) next.securityDeposit = String(deposit);
      }
      if (current.modes.sell && priceSuggestion.sale > 0) {
        next.salePrice = String(priceSuggestion.sale);
      }
      return { ...current, pricing: next };
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
                        <FieldLabel label={modesCopy.dailyRate} required />
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
                        <FieldLabel label={modesCopy.weeklyRate} required />
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
                          required={!showDailyRate && !showWeeklyRate}
                        />
                        <MoneyInput
                          value={draft.pricing.monthlyRate}
                          onChange={(value) => updatePricing("monthlyRate", value)}
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

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
                                    : "daily × 30 × 0.65",
                                )}
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div layout="position">
                    <FieldLabel label={modesCopy.securityDeposit} />
                    <MoneyInput
                      value={draft.pricing.securityDeposit}
                      onChange={(value) => updatePricing("securityDeposit", value)}
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      {modesCopy.securityDepositHint}
                    </p>
                  </motion.div>
                </motion.div>
                <ModeNote>
                  {modesCopy.depositProtectionNote(item.depositProtection)}
                </ModeNote>
              </ModeCard>
            );
          }

          if (card.key === "sell") {
            return (
              <ModeCard
                key="sell"
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
                active={draft.modes.sell}
                onToggle={() => toggleMode("sell")}
              >
                <motion.div layout="position">
                  <FieldLabel label={modesCopy.salePrice} required />
                  <MoneyInput
                    value={draft.pricing.salePrice}
                    onChange={(value) => updatePricing("salePrice", value)}
                  />
                </motion.div>
                <ModeNote>
                  {modesCopy.sellNote}
                </ModeNote>
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
