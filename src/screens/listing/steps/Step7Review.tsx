import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { RentanoHint } from "../../../components/RentanoHint";
import type { Step7ReviewProps } from "../types";
import { useMediaUrl } from "../../../lib/useMediaUrl";

const GREEN = "#0D5C3A";
const AMBER = "#F0B429";

const CONDITION_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  new: { label: "New", className: "bg-emerald-100 text-emerald-800" },
  like_new: { label: "Like New", className: "bg-teal-100 text-teal-800" },
  good: { label: "Good", className: "bg-amber-100 text-amber-800" },
  fair: { label: "Fair", className: "bg-orange-100 text-orange-800" },
};

function EditLink({ onClick }: { onClick: () => void }) {
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
      Edit
    </span>
  );
}

function formatMoney(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "0") return null;
  return `$${trimmed}`;
}

function handoffSummary(draft: Step7ReviewProps["draft"]): string {
  const parts: string[] = [];
  if (draft.handoff.inPerson) parts.push("In-person");
  if (draft.handoff.contactless) parts.push("Contactless");
  if (draft.handoff.itemHeavy) parts.push("Heavy item");
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
        ? `Delivery ≤${miles} mi · $${fee} round trip${weight}`
        : `Delivery ≤${miles} mi${weight}`,
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "Not set";
}

export function Step7Review({
  draft,
  profileCity,
  isPublishing,
  onPublish,
  onGoToStep,
}: Step7ReviewProps) {
  const coverPhoto = draft.photos[0] ?? null;
  const coverThumb = coverPhoto?.thumbId ? { ...coverPhoto, id: coverPhoto.thumbId } : coverPhoto;
  const coverUrl = useMediaUrl(coverThumb).url;
  const conditionStyle = draft.condition
    ? CONDITION_STYLES[draft.condition]
    : null;
  const gradeLabel =
    draft.grade === "professional"
      ? "Professional"
      : draft.grade === "personal"
        ? "Personal"
        : null;

  const modeRows: { icon: string; label: string; detail: string }[] = [];
  if (draft.modes.rent) {
    const rate = formatMoney(draft.pricing.dailyRate);
    modeRows.push({
      icon: "🔑",
      label: "Rent",
      detail: rate ? `${rate}/day` : "Rate set",
    });
  }
  if (draft.modes.sell) {
    const price = formatMoney(draft.pricing.salePrice);
    modeRows.push({
      icon: "🏷️",
      label: "Sell",
      detail: price ?? "Price set",
    });
  }
  if (draft.modes.rentToOwn) {
    const monthly = formatMoney(draft.pricing.rtoTotalPrice);
    modeRows.push({
      icon: "🤝",
      label: "RTO",
      detail: monthly ? `${monthly} total` : "Terms set",
    });
  }
  if (draft.modes.gift) {
    modeRows.push({ icon: "🎁", label: "Gift", detail: "Free" });
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-28 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-5">
        <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
          Ready to go live?
        </h2>
        <p className="mt-1 text-base text-gray-500">
          This is how renters will see your listing.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <button
          type="button"
          onClick={() => onGoToStep(1)}
          className="relative block w-full text-left"
        >
          <span className="absolute right-3 top-3 z-10">
            <EditLink onClick={() => onGoToStep(1)} />
          </span>
          {coverPhoto && coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="h-[200px] w-full rounded-t-2xl object-cover"
            />
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-t-2xl bg-[#F0F4F2] text-sm text-gray-400">
              No photo yet
            </div>
          )}
        </button>

        <div className="p-4">
          <button
            type="button"
            onClick={() => onGoToStep(2)}
            className="w-full text-left"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="flex-1 text-lg font-bold text-gray-900">
                {draft.title.trim() || "Untitled item"}
              </h3>
              <EditLink onClick={() => onGoToStep(2)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.category ? (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {draft.category}
                </span>
              ) : null}
              {gradeLabel ? (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {gradeLabel}
                </span>
              ) : null}
              {conditionStyle ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${conditionStyle.className}`}
                >
                  {conditionStyle.label}
                </span>
              ) : null}
            </div>
          </button>

          <button
            type="button"
            onClick={() => onGoToStep(3)}
            className="mt-4 w-full border-t border-gray-100 pt-4 text-left"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Modes
              </p>
              <EditLink onClick={() => onGoToStep(3)} />
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

          <button
            type="button"
            onClick={() => onGoToStep(4)}
            className="mt-4 w-full border-t border-gray-100 pt-4 text-left"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{handoffSummary(draft)}</p>
              <EditLink onClick={() => onGoToStep(4)} />
            </div>
          </button>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" style={{ color: GREEN }} />
              {profileCity}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onGoToStep(5)}
            className="mt-3 w-full border-t border-gray-100 pt-3 text-left"
          >
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: draft.paused ? AMBER : GREEN }}
                />
                {draft.paused ? (
                  <span style={{ color: AMBER }}>Paused</span>
                ) : (
                  <span style={{ color: GREEN }}>Available</span>
                )}
              </p>
              <EditLink onClick={() => onGoToStep(5)} />
            </div>
          </button>
        </div>
      </div>

      <RentanoHint
        className="mt-5"
        hint="Looking good. Once you publish I'll create your share content — ready to post in one tap."
        showTapLabel
      />

      <button
        type="button"
        onClick={onPublish}
        disabled={isPublishing}
        className="btn-primary mt-6 flex h-14 w-full items-center justify-center text-lg font-bold text-white disabled:opacity-70"
        style={{ backgroundColor: GREEN }}
      >
        {isPublishing ? "Publishing..." : "Publish listing 🚀"}
      </button>
    </motion.div>
  );
}
