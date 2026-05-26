import { AnimatePresence, motion } from "motion/react";
import qrItemImg from "../../../imports/qr_item.png";
import { RentanoTip } from "../../../components/RentanoTip";
import { QRStickerComingSoonOnly } from "../components/QRStickerExtras";
import type { StepProps } from "../types";

const GREEN = "#0D5C3A";

export function Step6QR({ draft, setDraft }: StepProps) {
  const generateQR = draft.generateQR;

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
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-gray-900">Generate QR Code</p>
            <p className="text-sm text-gray-400">Free · Ready after publishing</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={generateQR}
            onClick={() =>
              setDraft((current) => ({
                ...current,
                generateQR: !current.generateQR,
              }))
            }
            className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
            style={{ backgroundColor: generateQR ? GREEN : "#D1D5DB" }}
          >
            <motion.span
              layout
              className="absolute top-0.5 block h-6 w-6 rounded-full bg-white shadow"
              style={{ left: generateQR ? "22px" : "2px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
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
                <li>📱 Show on screen — renter scans at pickup</li>
                <li>💾 Save to photos — use anytime</li>
                <li>🖨️ Print — attach to item permanently</li>
              </ul>
            </div>

            <QRStickerComingSoonOnly />

            <RentanoTip message="Tap me after publishing — I'll walk you through attaching it to your item." />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
