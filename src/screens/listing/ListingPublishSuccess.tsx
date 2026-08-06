import { motion } from "motion/react";
import { useEffect } from "react";
import { Check, Eye, Loader2, Share2 } from "lucide-react";
import { AppBrandMark } from "../../components/AppBrandHeader";
import { useMessages } from "../../lib/i18n/react";
import { requestStoreReview } from "../../lib/storeReview";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";

type ListingPublishSuccessProps = {
  title: string;
  statusLine?: string;
  payoutNudge?: boolean;
  payoutBusy?: boolean;
  onSetupPayouts?: () => void;
  onPreviewShop?: () => void;
  onShare?: () => void;
  onDone: () => void;
};

export function ListingPublishSuccess({
  title,
  statusLine,
  payoutNudge,
  payoutBusy,
  onSetupPayouts,
  onPreviewShop,
  onShare,
  onDone,
}: ListingPublishSuccessProps) {
  const { listing } = useMessages();
  const success = listing.success;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void requestStoreReview();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

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
        {success.title}
      </h2>
      <p className="mt-2 text-base text-gray-500">
        <span className="font-semibold text-gray-800">{title}</span> {success.isOn}{" "}
        <AppBrandMark size="sm" className="inline-flex align-baseline" />.
      </p>
      <p className="mt-3 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: GREEN }}>
        {statusLine ?? listing.listingActive}
      </p>

      {payoutNudge ? (
        <div
          className="mt-5 w-full max-w-sm rounded-2xl border px-4 py-3.5 text-left"
          style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}
        >
          <p className="text-sm font-bold text-amber-950">{success.payoutNudgeTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-900/90">
            {success.payoutNudgeBody}
          </p>
          {onSetupPayouts ? (
            <button
              type="button"
              onClick={onSetupPayouts}
              disabled={payoutBusy}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: GREEN }}
            >
              {payoutBusy ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {listing.goPublic.openingStripe}
                </span>
              ) : (
                success.payoutNudgeCta
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        {onPreviewShop ? (
          <button
            type="button"
            onClick={onPreviewShop}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-base font-bold"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            <Eye className="h-5 w-5" strokeWidth={2.25} />
            {success.previewAsNeighbor}
          </button>
        ) : null}
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="btn-primary flex w-full items-center justify-center gap-2 text-white"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            <Share2 className="h-5 w-5" strokeWidth={2.25} />
            {success.shareListing}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDone}
          className={
            onShare || onPreviewShop
              ? "w-full rounded-xl border-2 py-3.5 text-base font-bold"
              : "btn-primary w-full text-white"
          }
          style={
            onShare || onPreviewShop
              ? { borderColor: GREEN, color: GREEN }
              : { backgroundColor: GREEN }
          }
        >
          {success.backToListings}
        </button>
      </div>
    </motion.div>
  );
}
