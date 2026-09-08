import { useEffect, useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import { RentanoTip } from "../RentanoTip";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function ReviewPromptModal({
  open,
  title,
  onClose,
  onSubmit,
  maxRating = 5,
  disputeHint,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  /** Cap stars while an open dispute is active (Stage 18 / V9). */
  maxRating?: number;
  disputeHint?: string;
}) {
  const { reviewPrompt: copy, common } = useMessages();
  const cappedMax = Math.min(5, Math.max(1, maxRating));
  const [rating, setRating] = useState(cappedMax);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) return;
    setRating((current) => Math.min(current, cappedMax));
  }, [open, cappedMax]);

  const canSubmit = useMemo(
    () => rating >= 1 && rating <= cappedMax,
    [rating, cappedMax],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl"
        style={{ borderColor: BORDER }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[18px] font-extrabold" style={{ color: GREEN }}>
              {copy.title}
            </h2>
            <p className="mt-0.5 text-[13px] text-gray-500">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={common.close}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <X className="h-5 w-5 text-red-600" />
          </button>
        </div>

        <div className="mt-4">
          <RentanoTip message={copy.tip} />
        </div>

        <div className="mt-4">
          <p className="text-[13px] font-semibold text-gray-700">{copy.rating}</p>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const disabled = n > cappedMax;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={disabled}
                  onClick={() => setRating(n)}
                  className="rounded-full p-2 disabled:opacity-35"
                  aria-label={copy.starsAria(n)}
                >
                  <Star
                    className="h-6 w-6"
                    style={{ color: n <= rating ? "#F59E0B" : "#D1D5DB" }}
                    fill={n <= rating ? "#F59E0B" : "transparent"}
                  />
                </button>
              );
            })}
          </div>
          {cappedMax < 5 && disputeHint ? (
            <p className="mt-2 text-[12px] leading-snug text-amber-900">{disputeHint}</p>
          ) : null}
        </div>

        <div className="mt-3">
          <p className="text-[13px] font-semibold text-gray-700">{copy.comment}</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={copy.placeholder}
            className="mt-2 w-full resize-none rounded-2xl border bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            style={{ borderColor: BORDER }}
          />
          <p className="mt-2 text-[11px] text-gray-500">{copy.blindHint}</p>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(rating, comment.trim())}
          className="mt-4 w-full rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          {copy.submit}
        </button>
      </div>
    </div>
  );
}
