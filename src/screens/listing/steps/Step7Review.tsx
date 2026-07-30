import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { RentanoHint } from "../../../components/RentanoHint";
import { ListingFeedCard, offerTypeFromModes } from "../../../app/components/ListingFeedCard";
import type { Step7ReviewProps } from "../types";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabels";
import { useMessages } from "../../../lib/i18n/react";

const GREEN = "#0D5C3A";
const AMBER = "#F0B429";

const CONDITION_STYLE_CLASSES: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-800",
  like_new: "bg-teal-100 text-teal-800",
  good: "bg-amber-100 text-amber-800",
  fair: "bg-orange-100 text-orange-800",
};

function EditLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }
      }}
      className="text-xs font-semibold"
      style={{ color: GREEN }}
    >
      {label}
    </span>
  );
}

function formatMoney(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "0") return null;
  return `$${trimmed}`;
}

export function Step7Review({
  draft,
  profileCity,
  isPublishing,
  isEditing = false,
  onPublish,
  onGoToStep,
}: Step7ReviewProps) {
  const t = useMessages();
  const review = t.listing.review;
  const itemInfo = t.listing.itemInfo;

  const conditionLabel =
    draft.condition === "new"
      ? itemInfo.conditionNew
      : draft.condition === "like_new"
        ? itemInfo.conditionLikeNew
        : draft.condition === "good"
          ? itemInfo.conditionGood
          : draft.condition === "fair"
            ? itemInfo.conditionFair
            : null;
  const conditionClassName = draft.condition
    ? CONDITION_STYLE_CLASSES[draft.condition]
    : null;

  const gradeLabel =
    draft.grade === "professional"
      ? itemInfo.professional
      : draft.grade === "personal"
        ? itemInfo.personal
        : null;

  const handoffSummary = (() => {
    const parts: string[] = [];
    if (draft.handoff.inPerson) parts.push(review.handoffInPerson);
    if (draft.handoff.contactless) parts.push(review.handoffContactless);
    if (draft.handoff.itemHeavy) parts.push(review.handoffHeavy);
    if (draft.handoff.delivery) {
      const miles = draft.handoff.deliveryMaxMiles ?? 20;
      const fee = draft.handoff.deliveryRoundTripFee?.trim();
      const weight =
        typeof draft.handoff.itemWeightLbs === "number" &&
        draft.handoff.itemWeightLbs > 0
          ? ` · ${draft.handoff.itemWeightLbs} lbs`
          : "";
      parts.push(
        fee
          ? review.handoffDelivery(miles, fee, weight)
          : review.handoffDeliveryNoFee(miles, weight),
      );
    }
    return parts.length > 0 ? parts.join(" · ") : review.handoffNotSet;
  })();

  const modeRows: { icon: string; label: string; detail: string }[] = [];
  if (draft.modes.rent) {
    const rate = formatMoney(draft.pricing.dailyRate);
    modeRows.push({
      icon: "🔑",
      label: review.rent,
      detail: rate ? review.ratePerDay(rate) : review.rateSet,
    });
  }
  if (draft.modes.sell) {
    const sale = Number.parseFloat((draft.pricing.salePrice || "").replace(/[^0-9.]/g, ""));
    const free = Number.isFinite(sale) && sale <= 0;
    const price = formatMoney(draft.pricing.salePrice);
    modeRows.push({
      icon: free ? "🎁" : "🏷️",
      label: free ? review.freeGiveaway : review.sell,
      detail: free ? "$0" : price ?? review.priceSet,
    });
  } else if (draft.modes.gift) {
    modeRows.push({ icon: "🎁", label: review.freeGiveaway, detail: review.free });
  }

  const previewTitle = draft.title.trim() || review.untitled;
  const previewPrice = draft.pricing.dailyRate?.trim() || "—";
  const previewOfferType = offerTypeFromModes(draft.modes, draft.pricing.salePrice);

  return (
    <motion.div
      className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-28 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-5">
        <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
          {review.title}
        </h2>
        <p className="mt-1 text-base text-gray-500">
          {review.subtitle}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <button
          type="button"
          onClick={() => onGoToStep(1)}
          className="relative block w-full text-left"
        >
          <span className="absolute right-3 top-3 z-10">
            <EditLink label={t.common.edit} onClick={() => onGoToStep(1)} />
          </span>
          <div className="p-3">
            <ListingFeedCard
              title={previewTitle}
              price={previewPrice}
              rating={0}
              reviews={0}
              distance={review.nearby}
              cover={draft.photos?.[0] ?? null}
              offerType={previewOfferType}
              itemHeavy={draft.handoff.itemHeavy}
              onSelect={() => onGoToStep(1)}
              showFavoriteAction={false}
            />
          </div>
        </button>

        <div className="p-4">
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="w-full text-left"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="flex-1 text-lg font-bold text-gray-900">
                {previewTitle}
              </h3>
              <EditLink label={t.common.edit} onClick={() => onGoToStep(2)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.category ? (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {localizeCategoryLabel(draft.category)}
                </span>
              ) : null}
              {gradeLabel ? (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {gradeLabel}
                </span>
              ) : null}
              {conditionLabel && conditionClassName ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${conditionClassName}`}
                >
                  {conditionLabel}
                </span>
              ) : null}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="mt-4 w-full border-t border-gray-100 pt-4 text-left"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {review.modes}
              </p>
              <EditLink label={t.common.edit} onClick={() => onGoToStep(2)} />
            </div>
            <ul className="space-y-2">
              {modeRows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {row.icon} {row.label}
                  </span>
                  <span className="font-semibold text-gray-900">{row.detail}</span>
                </li>
              ))}
            </ul>
          </button>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">{handoffSummary}</p>
            <p className="mt-1 text-xs text-gray-400">
              {review.handoffAdjustHint}
            </p>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
              {profileCity}
            </p>
          </div>

          <div className="mt-3 w-full border-t border-gray-100 pt-3">
            <p className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: draft.paused ? AMBER : GREEN }}
              />
              {draft.paused ? (
                <span style={{ color: AMBER }}>{review.paused}</span>
              ) : (
                <span style={{ color: GREEN }}>{review.availableDefault}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <RentanoHint
        className="mt-5"
        hint={isEditing ? review.tipEditing : review.tipNew}
        showTapLabel
      />

      <button
        type="button"
        onClick={onPublish}
        disabled={isPublishing}
        className="btn-primary mt-6 flex h-14 w-full items-center justify-center text-lg font-bold text-white disabled:opacity-70"
        style={{ backgroundColor: GREEN }}
      >
        {isPublishing
          ? isEditing
            ? review.saving
            : review.opening
          : isEditing
            ? review.saveChanges
            : review.goPublicCta}
      </button>
    </motion.div>
  );
}
