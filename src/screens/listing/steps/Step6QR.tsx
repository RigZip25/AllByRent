import { AnimatePresence, motion } from "motion/react";
import qrItemImg from "../../../imports/qr_item.png";
import { RentanoHint } from "../../../components/RentanoHint";
import type { StepProps } from "../types";
import { useMessages } from "../../../lib/i18n/react";

const GREEN = "#0D5C3A";

export function Step6QR({ draft, setDraft }: StepProps) {
  const { listing } = useMessages();
  const qr = listing.qr;

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
          {qr.title}
        </h2>
        <p className="mt-2 text-base text-gray-500">
          {qr.subtitle}
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="font-semibold text-gray-900">{qr.requiredTitle}</p>
        <p className="mt-1 text-sm text-gray-400">
          {qr.requiredBody}
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
              <p className="mb-2 font-medium text-gray-800">{qr.afterPublishing}</p>
              <ul className="space-y-1.5">
                <li>{qr.emailPrint}</li>
                <li>{qr.printLabel}</li>
                <li>{qr.printBulk}</li>
              </ul>
              <p className="mt-3 border-t border-[#BBF7D0] pt-3 text-gray-600">
                {qr.publishBeforePrint}
              </p>
            </div>

            <RentanoHint
              className="mt-4"
              hint={qr.tip}
              showTapLabel
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
