import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import rentanoImg from "../imports/No_back_rentano.png";
import type { ListingDraft } from "../screens/listing/types";

const PRIMARY_GREEN = "#0D5C3A";

export type RentanoChatContext = {
  step?: number;
  totalSteps?: number;
  draft?: ListingDraft;
};

export function RentanoChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform active:scale-95"
      style={{
        border: `2px solid ${PRIMARY_GREEN}`,
        boxShadow: "0 4px 14px rgba(13, 92, 58, 0.25)",
      }}
      aria-label="Chat with Rentano"
    >
      <img
        src={rentanoImg}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </button>
  );
}

export function RentanoChatSheet({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context?: RentanoChatContext;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close chat"
            className="fixed inset-0 z-[70] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rentano-chat-title"
            className="fixed bottom-0 left-1/2 z-[71] w-full max-w-[390px] -translate-x-1/2 rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E5E7EB]" />
            <div className="mb-4 flex items-center gap-3">
              <div
                className="h-12 w-12 shrink-0 overflow-hidden rounded-full"
                style={{ border: `2px solid ${PRIMARY_GREEN}` }}
              >
                <img
                  src={rentanoImg}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
              <div>
                <h2
                  id="rentano-chat-title"
                  className="text-lg font-bold"
                  style={{ color: PRIMARY_GREEN }}
                >
                  Rentano
                </h2>
                {context?.step !== undefined && context.totalSteps !== undefined ? (
                  <p className="text-xs text-[#9CA3AF]">
                    Listing · Step {context.step} of {context.totalSteps}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[15px] leading-relaxed text-[#374151]">
              Rentano is here to help
            </p>
            {context?.draft && context.step !== undefined ? (
              <p className="mt-2 text-xs text-[#9CA3AF]">
                I can see your progress on this listing and will answer based on
                where you are in the flow.
              </p>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: PRIMARY_GREEN }}
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
