import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { generateQRStickerPdf } from "../../lib/generateQRSticker";
import { getListingDisplayTitle, getListingQrUrl, listingDraftToStickerRow } from "../../lib/listingQr";
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
import { loadUserProfile, saveUserProfile } from "../../lib/userProfileStorage";
import type { ListingDraft } from "./types";
import type { Dispatch, SetStateAction } from "react";
import { useAuth } from "../../hooks/AuthProvider";

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
  const auth = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>("AllByRent-QR-Stickers.pdf");
  const [actionsOpen, setActionsOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(() => loadUserProfile().email ?? "");
  const [bulkCount, setBulkCount] = useState(() => loadQrBulkQueueListingIds().length);
  const emptySpotsLeft = Math.max(0, QR_SHEET_CAPACITY - bulkCount);

  const eligibleListings = useMemo(() => {
    const stored = loadStickerEligibleListings();
    if (stored.some((l) => l.id === draft.id)) return stored;
    return [draft, ...stored];
  }, [draft]);

  const queuedForBulk = useMemo(() => isListingQueuedForBulk(draft.id), [draft.id]);

  useEffect(() => {
    void QRCode.toDataURL(getListingQrUrl(draft.qrToken ?? draft.id), {
      width: 180,
      margin: 1,
      color: { dark: "#0D5C3A", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [draft.id, draft.qrToken]);

  const otherListings = eligibleListings.filter((l) => l.id !== draft.id);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const generatePdf = async (
    ids: string[],
    options?: { paper?: "letter" | "a4"; layout?: "sheet" | "single"; labelIn?: number; filename?: string },
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
        (ids.length > 1 ? "AllByRent-QR-Stickers-Bulk.pdf" : "AllByRent-QR-Sticker.pdf"),
      paper: options?.paper,
      layout: options?.layout,
      labelIn: options?.labelIn,
    });
    if (!generated) throw new Error("No PDF generated");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(generated.objectUrl);
    setPdfFilename(generated.filename);
    setActionsOpen(true);
    return generated.objectUrl;
  };

  const handlePrintNow = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const url = await generatePdf([draft.id], { paper: "letter", layout: "sheet", labelIn: 2, filename: "AllByRent-QR-Sticker-Letter.pdf" });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
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
        setPdfError("No items in bulk queue yet.");
        return;
      }
      const url = await generatePdf(ids, { paper: "letter", layout: "sheet", labelIn: 2, filename: "AllByRent-QR-Stickers-Bulk-Letter.pdf" });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownload = async (kind: "a4" | "label") => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      if (kind === "a4") {
        await generatePdf([draft.id], { paper: "a4", layout: "sheet", labelIn: 2, filename: "AllByRent-QR-Sticker-A4.pdf" });
      } else {
        await generatePdf([draft.id], { paper: "a4", layout: "single", labelIn: 3, filename: "AllByRent-QR-Sticker-3x3.pdf" });
      }
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEmail = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await generatePdf([draft.id], { paper: "a4", layout: "single", labelIn: 3, filename: "AllByRent-QR-Sticker-3x3.pdf" });
      const trimmedEmail = email.trim();
      if (trimmedEmail) {
        const profile = loadUserProfile();
        if (profile.email !== trimmedEmail) {
          saveUserProfile({ ...profile, email: trimmedEmail });
        }
      }
      const to = encodeURIComponent(email.trim());
      const subject = encodeURIComponent("AllByRent QR sticker PDF");
      const listingUrl = getListingQrUrl(draft.qrToken ?? draft.id);
      const body = encodeURIComponent(
        `Here’s your AllByRent QR sticker.\n\nListing link:\n${listingUrl}\n\nPDF tip:\nMost email clients can’t attach a PDF from the browser automatically. Use the Download button in the app, then attach the PDF from your files (desktop is easiest).`,
      );
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    } catch {
      setPdfError("Could not generate email. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleVerificationPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Camera-only: owner confirms QR is printed and attached.
    if (auth.userId) {
      setPdfLoading(true);
      setPdfError(null);
      void uploadQrVerificationPhotoRemote({
        listingId: draft.id,
        ownerId: auth.userId,
        file,
      })
        .then(() => {
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
        })
        .catch(() => {
          setPdfError("Could not upload verification photo. Please try again.");
        })
        .finally(() => {
          setPdfLoading(false);
        });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photo = typeof reader.result === "string" ? reader.result : null;
      if (!photo) return;

      setDraft((current) => {
        const updated: ListingDraft = {
          ...current,
          verificationPhoto: photo,
          qrReady: true,
          listingStatus: "active",
        };
        updateStoredListing(updated);
        return updated;
      });
      onComplete();
    };
    reader.readAsDataURL(file);
    event.target.value = "";
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
          How it works
        </button>
        <h2 className="text-center text-2xl font-bold" style={{ color: GREEN }}>
          Your sticker is ready
        </h2>
        <p className="mt-1 text-center text-base text-gray-500">
          Publish first, then set up QR to go live.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
        <div className="flex flex-col items-center text-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Listing QR code"
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
            {pdfLoading ? "Preparing PDF…" : "🖨️ Print this QR"}
          </button>

          <p className="text-center text-sm leading-relaxed text-gray-600">
            You can download the PDF to print later (desktop is easiest). Print on an Avery-compatible label sheet, or use regular paper + clear tape on top to protect it.
          </p>

          {email.trim() ? null : (
            <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
              <p className="text-sm font-semibold text-gray-900">Email (optional)</p>
              <p className="mt-1 text-xs text-gray-500">
                Add an email to prefill the “Email PDF” action.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-700"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleDownload("a4")}
              disabled={pdfLoading}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              ⬇️ A4 sheet PDF
            </button>
            <button
              type="button"
              onClick={() => void handleDownload("label")}
              disabled={pdfLoading}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              ⬇️ 3×3 label PDF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleEmail()}
              disabled={pdfLoading || !email.trim()}
              className="w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              ✉️ Email link
            </button>
            <div />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">Bulk printing</p>
              <p className="text-xs text-gray-500">{bulkCount} queued</p>
            </div>

            <div className="mt-2 rounded-2xl bg-[#F0FDF4] px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">
                You have {emptySpotsLeft} empty spot{emptySpotsLeft === 1 ? "" : "s"} left on this sheet
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Fill the page now so you can print once, stick once, and get more items live faster.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-600">
                <li>Popular: ladders, pressure washers, party tables, cameras, bike racks</li>
                <li>High-value items (over $200) tend to get attention quickly</li>
                <li>If it’s seasonal, list it now — your neighborhood searches early</li>
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
                {queuedForBulk ? "Remove from bulk" : "Add to bulk"}
              </button>
              <button
                type="button"
                onClick={() => void handleBulkPrint()}
                disabled={pdfLoading || bulkCount === 0}
                className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                🖨️ Print bulk
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
                Clear bulk queue
              </button>
            ) : null}
          </div>
        </div>

        {otherListings.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
            <h3 className="text-base font-bold text-gray-900">More items?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add each item to the bulk queue from its QR screen, then use “Print bulk” when ready.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onListAnother}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-700"
        >
          + Add another item
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          You’ll be able to come right back here to email/print/verify this QR.
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
              📸 Take verification photo
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
            Your listing won’t be visible to renters until this verification step is done. Gift and Sell listings are active immediately.
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
              PDF ready
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              You can download, print, or email yourself a link/instructions.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={pdfUrl}
                download={pdfFilename}
                className="w-full rounded-xl border-2 py-3 text-center text-sm font-bold"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                ⬇️ Download
              </a>
              <button
                type="button"
                onClick={() => window.open(pdfUrl, "_blank", "noopener,noreferrer")}
                className="w-full rounded-xl py-3 text-sm font-bold text-white"
                style={{ backgroundColor: GREEN }}
              >
                🖨️ Print
              </button>
              <button
                type="button"
                onClick={() => void handleEmail()}
                disabled={!email.trim()}
                className="col-span-2 w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
                style={{ borderColor: GREEN, color: GREEN }}
              >
                ✉️ Email link/instructions
              </button>
            </div>
            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="mt-3 w-full text-center text-xs font-semibold underline"
              style={{ color: "#6B7280" }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
