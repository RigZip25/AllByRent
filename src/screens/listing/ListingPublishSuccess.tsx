import { motion } from "motion/react";
import { Check, Share2 } from "lucide-react";
import { AppBrandMark } from "../../components/AppBrandHeader";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

type ListingPublishSuccessProps = {
  title: string;
  /** Status line under the title — e.g. active vs pending QR. */
  statusLine?: string;
  onShare?: () => void;
  onDone: () => void;
};

export function ListingPublishSuccess({
  title,
  statusLine,
  onShare,
  onDone,
}: ListingPublishSuccessProps) {
  return (
    <motion.div
      className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col items-center justify-center bg-[#F9FAFB] px-6 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: GREEN }}
      >
        <Check className="h-8 w-8 text-white" strokeWidth={3} />
      </span>
      <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
        You&apos;re live!
      </h2>
      <p className="mt-2 text-base text-gray-500">
        <span className="font-semibold text-gray-800">{title}</span> is on{" "}
        <AppBrandMark size="sm" className="inline-flex align-baseline" />.
      </p>
      <p className="mt-3 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: GREEN }}>
        {statusLine ?? "Listing active"}
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="btn-primary flex w-full items-center justify-center gap-2 text-white"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            <Share2 className="h-5 w-5" strokeWidth={2.25} />
            Share listing
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDone}
          className={
            onShare
              ? "w-full rounded-xl border-2 py-3.5 text-base font-bold"
              : "btn-primary w-full text-white"
          }
          style={
            onShare
              ? { borderColor: GREEN, color: GREEN }
              : { backgroundColor: GREEN }
          }
        >
          Back to my listings
        </button>
      </div>
    </motion.div>
  );
}
