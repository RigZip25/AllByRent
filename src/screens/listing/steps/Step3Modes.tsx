import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { ListingDraft, MinimumRentalPeriod, StepProps } from "../types";
import { RentanoHint } from "../../../components/RentanoHint";
import { DEPOSIT_PROTECTION_LABEL, LISTING_MODE_LABELS } from "../../../lib/brand";
import {
  calculateRentalPrices,
  categoryHasRestrictedModes,
  getCategoryModeRules,
  type CategoryModeKey,
} from "../listingItemCategories";

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
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <motion.div className="relative" layout="position">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        $
      </span>
      <input
        type="number"
        min={0}
        value={value}
        placeholder={placeholder}
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

const MODE_CARD_CONFIG: {
  key: CategoryModeKey;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  { key: "rent", icon: "🔑", title: LISTING_MODE_LABELS.rent, subtitle: "Earn daily, weekly or monthly" },
  { key: "sell", icon: "🏷️", title: LISTING_MODE_LABELS.sell, subtitle: "One-time sale, item leaves your hands" },
  { key: "gift", icon: "🎁", title: LISTING_MODE_LABELS.gift, subtitle: "Give it away for free" },
];

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
  const minimumPeriodCategoryRef = useRef<string | null>(null);
  const [showLongTermPricingHelp, setShowLongTermPricingHelp] = useState(false);

  const categoryRules = getCategoryModeRules(draft.category);
  const showRestrictedModesNote = categoryHasRestrictedModes(draft.category);

  const periodRateFields = getRateFieldsForMinimumPeriod(draft.pricing.minimumPeriod);
  const showDailyRate = categoryRules.showDailyRate && periodRateFields.showDaily;
  const showWeeklyRate = categoryRules.showDailyRate && periodRateFields.showWeekly;
  const showMonthlyRate = categoryRules.showMonthlyRate && periodRateFields.showMonthly;

  const rentSubtitle = showDailyRate && showMonthlyRate
    ? "Earn daily, weekly or monthly"
    : showMonthlyRate && showWeeklyRate
      ? "Earn weekly or monthly"
      : showMonthlyRate
        ? "Earn monthly"
        : "Earn daily or weekly";

  const visibleModeCards = MODE_CARD_CONFIG.filter((card) => categoryRules[card.key]);

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

      const hasActiveMode = nextModes.rent || nextModes.sell || nextModes.gift;
      if (!hasActiveMode && rules.rent) {
        nextModes.rent = true;
        changed = true;
      }

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

  useEffect(() => {
    const value = parseFloat(draft.replacementValue);
    if (!draft.category || Number.isNaN(value) || value <= 0) return;

    const prices = calculateRentalPrices(
      draft.category,
      value,
      draft.pricing.minimumPeriod,
    );

    setDraft((current) => ({
      ...current,
      pricing: {
        ...current.pricing,
        dailyRate: prices.daily.toString(),
        weeklyRate: prices.weekly.toString(),
        monthlyRate: prices.monthly.toString(),
        securityDeposit: prices.deposit.toString(),
      },
    }));
  }, [draft.category, draft.replacementValue, draft.pricing.minimumPeriod, setDraft]);

  const toggleMode = (key: CategoryModeKey) => {
    setDraft((current) => {
      const nextModes = { ...current.modes, [key]: !current.modes[key] };
      const rules = getCategoryModeRules(current.category);
      const hasActiveMode = nextModes.rent || nextModes.sell || nextModes.gift;
      if (!hasActiveMode && rules.rent) {
        nextModes.rent = true;
      }
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

  const pricingTipMessage = showRoiTip
    ? `Prices based on current market — 15% below rental stores. Rent it ${rentalsToBreakEven} times and it pays for itself.`
    : "Prices based on current market — 15% below rental stores.";

  return (
    <motion.div
      className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: GREEN }}>
          How do you want to offer it?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose one or more. You can change this anytime.
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
                      MINIMUM RENTAL PERIOD
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
                          {option}
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
                        <FieldLabel label="Daily rate" required />
                        <MoneyInput
                          value={draft.pricing.dailyRate}
                          onChange={(value) => updatePricing("dailyRate", value)}
                          placeholder="25"
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
                        <FieldLabel label="Weekly rate" required />
                        <MoneyInput
                          value={draft.pricing.weeklyRate}
                          onChange={(value) => updatePricing("weeklyRate", value)}
                          placeholder="100"
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
                          label="Monthly rate"
                          required={!showDailyRate && !showWeeklyRate}
                        />
                        <MoneyInput
                          value={draft.pricing.monthlyRate}
                          onChange={(value) => updatePricing("monthlyRate", value)}
                          placeholder={
                            draft.category === "Real Estate" ? "800" : "350"
                          }
                        />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <motion.div layout="position" className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Allow long-term rentals</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Optional monthly pricing for bookings 30+ days.
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
                        aria-label="Toggle long-term rentals"
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
                            <FieldLabel label="Monthly rate (30+ days)" required />
                            <MoneyInput
                              value={draft.pricing.longTermMonthlyRate ?? ""}
                              onChange={(value) => updatePricing("longTermMonthlyRate", value)}
                              placeholder="450"
                            />
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <p className="text-xs text-gray-500">
                                Renters will see monthly pricing for long bookings.
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowLongTermPricingHelp((s) => !s)}
                                className="text-xs font-semibold underline"
                                style={{ color: GREEN }}
                              >
                                How to price?
                              </button>
                            </div>

                            {showLongTermPricingHelp ? (
                              <div className="mt-2 rounded-xl bg-[#F0FDF4] px-3 py-2 text-xs text-gray-700">
                                Example only: some hosts start around{" "}
                                <span className="font-semibold">
                                  {suggestedLongTermMonthly ? `$${suggestedLongTermMonthly}/mo` : "daily × 30 × 0.65"}
                                </span>{" "}
                                for long stays, then adjust based on demand and wear.
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div layout="position">
                    <FieldLabel label="Security deposit" />
                    <MoneyInput
                      value={draft.pricing.securityDeposit}
                      onChange={(value) => updatePricing("securityDeposit", value)}
                      placeholder="200"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      Held via Stripe, released on return
                    </p>
                  </motion.div>
                </motion.div>
                <ModeNote>
                  💡 {DEPOSIT_PROTECTION_LABEL} via Stripe hold — released when the item is returned.
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
                  <FieldLabel label="Sale price" required />
                  <MoneyInput
                    value={draft.pricing.salePrice}
                    onChange={(value) => updatePricing("salePrice", value)}
                    placeholder="500"
                  />
                </motion.div>
                <ModeNote>💡 Platform commission applies. No deposit on buys.</ModeNote>
              </ModeCard>
            );
          }

          return (
            <ModeCard
              key="gift"
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              active={draft.modes.gift}
              onToggle={() => toggleMode("gift")}
            >
              <motion.div
                layout="position"
                className="rounded-xl px-4 py-3 text-center text-sm font-semibold"
                style={{ backgroundColor: "#F0FDF4", color: GREEN }}
              >
                This item will be offered completely free
              </motion.div>
              <ModeNote>💡 Free giveaway — no deposit, no commission.</ModeNote>
            </ModeCard>
          );
        })}
      </div>

      <RentanoHint className="mt-6" hint={pricingTipMessage} showTapLabel />

      {showRestrictedModesNote ? (
        <p className="mt-4 text-center text-xs italic text-gray-400">
          Some transaction modes are not available for this category.
        </p>
      ) : null}
    </motion.div>
  );
}
