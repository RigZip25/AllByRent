import { Loader2, Sparkles } from "lucide-react";
import { APP_NAME } from "../../../lib/brand";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabels";
import { useMessages } from "../../../lib/i18n/react";
import type { CategoryCandidate, ManualFallbackReason } from "../ai/listingClassifier";

const GREEN = "#0D5C3A";
const GREEN_SOFT = "#1A9E6E";
const BORDER = "#E8E6E0";

function Breadcrumb({ candidate }: { candidate: CategoryCandidate }) {
  return (
    <p className="text-[13px] font-semibold text-gray-500">
      {localizeCategoryLabel(candidate.categoryName)}
      <span className="mx-1.5 text-gray-300">→</span>
      <span style={{ color: GREEN }}>{localizeCategoryLabel(candidate.subcategoryLabel)}</span>
    </p>
  );
}

export function AiAnalyzingCard() {
  const { listing } = useMessages();
  const copy = listing.aiCategory;
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl border bg-white px-5 py-9 text-center"
      style={{ borderColor: `${GREEN}33` }}
    >
      <Loader2 className="h-7 w-7 animate-spin" style={{ color: GREEN }} />
      <h3 className="text-[17px] font-bold text-gray-900">{copy.analyzingTitle(APP_NAME)}</h3>
      <p className="text-[13px] text-gray-500">{copy.analyzingBody}</p>
    </div>
  );
}

/** Single high-confidence suggestion: confirm it or open the manual selector. */
export function AiMatchCard({
  candidate,
  itemName,
  onConfirm,
  onChange,
}: {
  candidate: CategoryCandidate;
  itemName: string;
  onConfirm: () => void;
  onChange: () => void;
}) {
  const { listing } = useMessages();
  const copy = listing.aiCategory;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: `${GREEN}44` }}>
      <div
        className="flex flex-col items-center gap-2 px-5 py-7 text-center"
        style={{ background: `linear-gradient(180deg, ${GREEN}14 0%, #FFFFFF 75%)` }}
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: `${GREEN_SOFT}1A`, color: GREEN_SOFT }}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {copy.matchTitle(APP_NAME)}
        </span>
        <h3 className="mt-1 text-xl font-bold text-gray-900">
          {itemName || localizeCategoryLabel(candidate.subcategoryLabel)}
        </h3>
        <Breadcrumb candidate={candidate} />
      </div>
      <div className="space-y-2 border-t px-4 py-4" style={{ borderColor: BORDER }}>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-xl py-3 text-[15px] font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {copy.confirm}
        </button>
        <button
          type="button"
          onClick={onChange}
          className="w-full rounded-xl border py-3 text-[14px] font-semibold text-gray-700"
          style={{ borderColor: BORDER }}
        >
          {copy.change}
        </button>
      </div>
    </div>
  );
}

/** Medium confidence: up to three compact options, plus the manual escape. */
export function AiChoicesCard({
  candidates,
  itemName,
  onPick,
  onChange,
}: {
  candidates: CategoryCandidate[];
  itemName: string;
  onPick: (candidate: CategoryCandidate) => void;
  onChange: () => void;
}) {
  const { listing } = useMessages();
  const copy = listing.aiCategory;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-white px-4 py-4" style={{ borderColor: `${GREEN}33` }}>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: `${GREEN_SOFT}1A`, color: GREEN_SOFT }}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {itemName || copy.choicesTitle}
        </span>
        <h3 className="mt-2 text-[17px] font-bold text-gray-900">{copy.choicesTitle}</h3>
      </div>

      <div className="space-y-2">
        {candidates.map((candidate) => (
          <button
            key={`${candidate.categoryId}/${candidate.subcategoryId}`}
            type="button"
            onClick={() => onPick(candidate)}
            className="flex w-full flex-col items-start gap-1 rounded-2xl border bg-white px-4 py-3 text-left transition-all active:scale-[0.99]"
            style={{ borderColor: BORDER }}
          >
            <span className="text-[15px] font-bold text-gray-900">
              {localizeCategoryLabel(candidate.subcategoryLabel)}
            </span>
            <span className="text-[12px] font-semibold text-gray-500">
              {localizeCategoryLabel(candidate.categoryName)}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onChange}
        className="w-full rounded-xl border bg-white py-3 text-[14px] font-semibold text-gray-700"
        style={{ borderColor: BORDER }}
      >
        {copy.chooseAnother}
      </button>
    </div>
  );
}

/** Explains why the manual selector opened, and offers a retry. */
export function AiFallbackNotice({
  reason,
  onRetry,
  onBackToPhotos,
}: {
  reason: ManualFallbackReason;
  onRetry?: () => void;
  onBackToPhotos?: () => void;
}) {
  const { listing } = useMessages();
  const copy = listing.aiCategory;

  const message =
    reason === "timeout"
      ? copy.reasonTimeout
      : reason === "network"
        ? copy.reasonNetwork
        : reason === "invalid_response"
          ? copy.reasonInvalid(APP_NAME)
          : reason === "unsupported_image"
            ? copy.reasonUnsupported
            : reason === "unavailable"
              ? copy.reasonUnavailable(APP_NAME)
              : reason === "no_photos"
                ? copy.reasonNoPhotos
                : copy.reasonLowConfidence(APP_NAME);

  const canRetry = reason !== "no_photos" && reason !== "unsupported_image";

  return (
    <div className="mb-4 rounded-2xl border bg-amber-50 px-4 py-3" style={{ borderColor: "#FCD34D" }}>
      <p className="text-[13px] font-semibold text-amber-900">{message}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {canRetry && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-[13px] font-bold underline"
            style={{ color: GREEN }}
          >
            {copy.tryAgain}
          </button>
        ) : null}
        {onBackToPhotos ? (
          <button
            type="button"
            onClick={onBackToPhotos}
            className="text-[13px] font-bold text-gray-600 underline"
          >
            {copy.backToPhotos}
          </button>
        ) : null}
      </div>
    </div>
  );
}
