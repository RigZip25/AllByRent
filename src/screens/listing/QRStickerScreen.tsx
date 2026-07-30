import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { generateQRStickerPdf, presentGeneratedPdf } from "../../lib/generateQRSticker";
import { getListingDisplayTitle, getListingPublicUrl, listingDraftToStickerRow } from "../../lib/listingQr";
import {
  addListingToQrBulkQueue,
  clearQrBulkQueue,
  isListingQueuedForBulk,
  loadQrBulkQueueListingIds,
  loadStickerEligibleListings,
  removeListingFromQrBulkQueue,
  uploadQrVerificationPhotoRemote,
  updateStoredListing,
} from "../../lib/listingStorage";
import type { ListingDraft } from "./types";
import type { Dispatch, SetStateAction } from "react";
import { QR_PDF_FILENAMES } from "../../lib/brand";
import { useAuth } from "../../hooks/AuthProvider";
import { putMediaBlob } from "../../lib/mediaStore";
import { verifyListingQrInPhoto } from "../../lib/verifyListingQrPhoto";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";
const QR_SHEET_CAPACITY = 12;

type QRStickerScreenProps = {
  draft: ListingDraft;
  setDraft: Dispatch<SetStateAction<ListingDraft>>;
  onComplete: () => void;
  onListAnother: () => void;
  onBackToStory: () => void;
};

export function QRStickerScreen({
  draft,
  setDraft,
  onComplete,
  onListAnother,
  onBackToStory,
}: QRStickerScreenProps) {
  const { listingQr: t } = useMessages();
  const auth = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>(QR_PDF_FILENAMES.stickers);
  const [actionsOpen, setActionsOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [bulkCount, setBulkCount] = useState(() => loadQrBulkQueueListingIds().length);
  const emptySpotsLeft = Math.max(0, QR_SHEET_CAPACITY - bulkCount);

  const eligibleListings = useMemo(() => {
    const stored = loadStickerEligibleListings();
    if (stored.some((l) => l.id === draft.id)) return stored;
    return [draft, ...stored];
  }, [draft]);

  const queuedForBulk = useMemo(() => isListingQueuedForBulk(draft.id), [draft.id]);

  const publicQrUrl = getListingPublicUrl(draft);
  useEffect(() => {
    void QRCode.toDataURL(publicQrUrl, {
      width: 180,
      margin: 1,
      color: { dark: "#0D5C3A", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [publicQrUrl]);

  const otherListings = eligibleListings.filter((l) => l.id !== draft.id);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const generatePdf = async (
    ids: string[],
    options?: {
      paper?: "letter" | "a4";
      layout?: "sheet" | "single";
      labelIn?: number;
      filename?: string;
      preferOpen?: boolean;
    },
  ) => {
    let rows = eligibleListings
      .filter((l) => ids.includes(l.id))
      .map(listingDraftToStickerRow);
    if (rows.length === 0) {
      rows = [listingDraftToStickerRow(draft)];
    }
    const generated = await generateQRStickerPdf(rows, {
      filename:
        options?.filename ??
        (ids.length > 1 ? QR_PDF_FILENAMES.stickersBulk : QR_PDF_FILENAMES.sticker),
      paper: options?.paper,
      layout: options?.layout,
      labelIn: options?.labelIn,
    });
    if (!generated) throw new Error("No PDF generated");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(generated.objectUrl);
    setPdfFilename(generated.filename);
    await presentGeneratedPdf(generated, { preferOpen: options?.preferOpen });
    setActionsOpen(true);
    return generated.objectUrl;
  };

  const handlePrintNow = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await generatePdf([draft.id], {
        paper: "letter",
        layout: "sheet",
        labelIn: 2,
        filename: QR_PDF_FILENAMES.stickerLetter,
        preferOpen: true,
      });
    } catch {
      setPdfError(t.errorPdfGenerate);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleBulkPrint = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const ids = loadQrBulkQueueListingIds();
      if (ids.length === 0) {
        setPdfError(t.errorNoBulkItems);
        return;
      }
      await generatePdf(ids, {
        paper: "letter",
        layout: "sheet",
        labelIn: 2,
        filename: QR_PDF_FILENAMES.stickersBulkLetter,
        preferOpen: true,
      });
    } catch {
      setPdfError(t.errorPdfGenerate);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async (kind: "a4" | "label") => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      if (kind === "a4") {
        await generatePdf([draft.id], {
          paper: "a4",
          layout: "sheet",
          labelIn: 2,
          filename: QR_PDF_FILENAMES.stickerA4,
        });
      } else {
        await generatePdf([draft.id], {
          paper: "a4",
          layout: "single",
          labelIn: 3,
          filename: QR_PDF_FILENAMES.sticker3x3,
        });
      }
    } catch {
      setPdfError(t.errorPdfGenerate);
    } finally {
      setPdfLoading(false);
    }
  };

  /** Share/download the PDF file itself — never a web URL (those open the app, not a PDF). */
  const handleSharePdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await generatePdf([draft.id], {
        paper: "a4",
        layout: "single",
        labelIn: 3,
        filename: QR_PDF_FILENAMES.sticker3x3,
      });
    } catch {
      setPdfError(t.errorPdfPrepare);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleVerificationPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfLoading(true);
    setPdfError(null);

    void (async () => {
      const verified = await verifyListingQrInPhoto(file, {
        listingId: draft.id,
        qrToken: draft.qrToken,
        publicUrl: publicQrUrl,
      });
      if (!verified.ok) {
        setPdfError(verified.reason);
        return;
      }

      // Camera photo must contain this listing's QR sticker before going live.
      if (auth.userId) {
        await uploadQrVerificationPhotoRemote({
          listingId: draft.id,
          ownerId: auth.userId,
          file,
        });
        setDraft((current) => {
          const updated: ListingDraft = {
            ...current,
            qrReady: true,
            listingStatus: "active",
          };
          updateStoredListing(updated);
          return updated;
        });
        onComplete();
        return;
      }

      const put = await putMediaBlob(file, { kind: "image" });
      if (!put.ok) {
        setPdfError(put.message);
        return;
      }

      setDraft((current) => {
        const updated: ListingDraft = {
          ...current,
          verificationPhoto: put.ref,
          qrReady: true,
          listingStatus: "active",
        };
        updateStoredListing(updated);
        return updated;
      });
      onComplete();
    })()
      .catch(() => {
        setPdfError(t.errorVerifyFailed);
      })
      .finally(() => {
        setPdfLoading(false);
        event.target.value = "";
      });
  };

  return (
    <motion.div
      className="mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col bg-white"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="shrink-0 border-b border-gray-100 px-4 pb-3 pt-4">
        <button
          type="button"
          onClick={onBackToStory}
          className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-600"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: GREEN }} />
          {t.howItWorksBack}
        </button>
        <h2 className="text-center text-2xl font-bold" style={{ color: GREEN }}>
          {t.stickerReadyTitle}
        </h2>
        <p className="mt-1 text-center text-base text-gray-500">
          {t.stickerReadySubtitle}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <div className="flex flex-col items-center text-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={t.qrAlt}
              width={180}
              height={180}
              className="rounded-lg"
            />
          ) : (
            <div
              className="h-[180px] w-[180px] animate-pulse rounded-lg bg-gray-100"
              aria-hidden
            />
          )}
          <p className="mt-3 text-base font-bold text-gray-900">
            {getListingDisplayTitle(draft.title)}
          </p>
          <p className="text-sm text-gray-500">
            #{draft.id.substring(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => void handlePrintNow()}
            disabled={pdfLoading}
            className="w-full rounded-xl py-3.5 text-base font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: GREEN }}
          >
            {pdfLoading ? t.preparingPdf : t.printThisQr}
          </button>

          <p className="text-center text-sm leading-relaxed text-gray-600">
            {t.printHint}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleDownload("a4")}
              disabled={pdfLoading}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {t.a4SheetPdf}
            </button>
            <button
              type="button"
              onClick={() => void handleDownload("label")}
              disabled={pdfLoading}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              {t.label3x3Pdf}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void handleSharePdf()}
            disabled={pdfLoading}
            className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            {t.shareSavePdf}
          </button>
          <p className="text-center text-xs text-gray-500">
            {t.sharePdfHint}
          </p>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{t.bulkPrinting}</p>
              <p className="text-xs text-gray-500">{t.queuedCount(bulkCount)}</p>
            </div>

            <div className="mt-2 rounded-2xl bg-[#F0FDF4] px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">
                {t.emptySpotsLeft(emptySpotsLeft)}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {t.fillPageHint}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
                <li>{t.bulkTipPopular}</li>
                <li>{t.bulkTipHighValue}</li>
                <li>{t.bulkTipSeasonal}</li>
              </ul>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = queuedForBulk
                    ? removeListingFromQrBulkQueue(draft.id)
                    : addListingToQrBulkQueue(draft.id);
                  setBulkCount(next);
                }}
                className="w-full rounded-xl border-2 py-3 text-sm font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {queuedForBulk ? t.removeFromBulk : t.addToBulk}
              </button>
              <button
                type="button"
                onClick={() => void handleBulkPrint()}
                disabled={pdfLoading || bulkCount === 0}
                className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                {t.printBulk}
              </button>
            </div>
            {bulkCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  clearQrBulkQueue();
                  setBulkCount(0);
                }}
                className="mt-2 w-full text-center text-xs font-semibold underline"
                style={{ color: "#6B7280" }}
              >
                {t.clearBulkQueue}
              </button>
            ) : null}
          </div>
        </div>

        {otherListings.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
            <h3 className="text-base font-bold text-gray-900">{t.moreItems}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t.moreItemsBody}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onListAnother}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-700"
        >
          {t.addAnotherItem}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          {t.comeBackHint}
        </p>

        {pdfError ? (
          <p className="mt-3 text-center text-xs text-red-600">{pdfError}</p>
        ) : null}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <div>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
            {pdfLoading ? t.verifyingQr : t.takeVerificationPhoto}
            </button>
          </div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleVerificationPhoto}
          />
          {/* Camera-only to ensure sticker is attached to the physical item. */}
          <p className="mt-3 text-center text-xs text-gray-500">
            {t.verificationHint}
          </p>
        </div>
      </div>

      {actionsOpen && pdfUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-10"
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold" style={{ color: GREEN }}>
              {t.pdfReady}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {t.pdfReadyBody}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={pdfUrl}
                download={pdfFilename}
                className="w-full rounded-xl border-2 py-3 text-center text-sm font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {t.download}
              </a>
              <button
                type="button"
                onClick={() => window.open(pdfUrl, "_blank", "noopener,noreferrer")}
                className="w-full rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                {t.print}
              </button>
              <button
                type="button"
                onClick={() => void handleSharePdf()}
                disabled={pdfLoading}
                className="col-span-2 w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                {t.sharePdfFile}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="mt-3 w-full text-center text-xs font-semibold underline"
              style={{ color: "#6B7280" }}
            >
              {t.close}
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
