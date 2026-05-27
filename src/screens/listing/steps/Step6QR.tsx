import { AnimatePresence, motion } from "motion/react";
import qrItemImg from "../../../imports/qr_item.png";
import { RentanoHint } from "../../../components/RentanoHint";
import type { StepProps } from "../types";

const GREEN = "#0D5C3A";

export function Step6QR({ draft, setDraft }: StepProps) {
  // QR is required for security + traceability; keep the draft locked on.
  const generateQR = true;
  if (!draft.generateQR) {
    setDraft((current) => ({ ...current, generateQR: true }));
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-[390px] bg-[#F9FAFB] px-4 pb-8 pt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-6 flex justify-center px-2">
        <img
          src={qrItemImg}
          alt=""
          className="max-h-[200px] w-full object-contain"
          draggable={false}
        />
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold" style={{ color: GREEN }}>
          Make it trackable
        </h2>
        <p className="mt-2 text-base text-gray-500">
          A unique QR code identifies your item and confirms every handoff.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="font-semibold text-gray-900">QR code is required</p>
        <p className="mt-1 text-sm text-gray-400">
          It keeps every handoff traceable, improves security, and makes insurance coverage more transparent if an item is lost or damaged.
        </p>
      </div>

      <AnimatePresence initial={false}>
        {generateQR ? (
          <motion.div
            key="qr-on"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-4"
          >
            <div
              className="rounded-2xl px-4 py-4 text-sm leading-relaxed text-gray-600"
              style={{ backgroundColor: "#F0FDF4" }}
            >
              <p className="mb-2 font-medium text-gray-800">After publishing you can:</p>
              <ul className="space-y-1.5">
                <li>📧 Email it to yourself and print later</li>
                <li>
                  🖨️ Print on an Avery-compatible self-adhesive label sheet — or
                  regular paper + clear tape on top
                </li>
                <li>📄 Print single now, or print in bulk once all items are ready</li>
              </ul>
              <p className="mt-3 border-t border-[#BBF7D0] pt-3 text-gray-600">
                You can publish before printing — but renters won’t see your listing until your QR is set up.
              </p>
            </div>

            <RentanoHint
              className="mt-4"
              hint="The QR improves security and traceability: every pickup/return scan creates a timestamped record for both sides."
              showTapLabel
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
