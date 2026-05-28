import { useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import { RentanoTip } from "../RentanoTip";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export function ReviewPromptModal({
  open,
  title,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const canSubmit = useMemo(() => rating >= 1 && rating <= 5, [rating]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-3xl border bg-white p-5 shadow-2xl"
        style={{ borderColor: BORDER }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[18px] font-extrabold" style={{ color: GREEN }}>
              Leave a review
            </h2>
            <p className="mt-0.5 text-[13px] text-gray-500">{title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mt-4">
          <RentanoTip message="How was it? Takes 30 seconds" />
        </div>

        <div className="mt-4">
          <p className="text-[13px] font-semibold text-gray-700">Rating</p>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="rounded-full p-2"
                aria-label={`${n} stars`}
              >
                <Star
                  className="h-6 w-6"
                  style={{ color: n <= rating ? "#F59E0B" : "#D1D5DB" }}
                  fill={n <= rating ? "#F59E0B" : "transparent"}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[13px] font-semibold text-gray-700">Comment</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Quick note (optional)…"
            className="mt-2 w-full resize-none rounded-2xl border bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C3A]/20"
            style={{ borderColor: BORDER }}
          />
          <p className="mt-2 text-[11px] text-gray-400">
            Blind review: neither side sees the other’s review until both are submitted.
          </p>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(rating, comment.trim())}
          className="mt-4 w-full rounded-2xl px-4 py-3 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          Submit review
        </button>
      </div>
    </div>
  );
}

