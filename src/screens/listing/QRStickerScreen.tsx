import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { RentanoTip } from "../../components/RentanoTip";
import { generateQRStickerSheet } from "../../lib/generateQRSticker";
import { getListingDisplayTitle, getListingQrUrl, listingDraftToStickerRow } from "../../lib/listingQr";
import { loadStickerEligibleListings, updateStoredListing } from "../../lib/listingStorage";
import type { ListingDraft } from "./types";
import type { Dispatch, SetStateAction } from "react";

const GREEN = "#0D5C3A";

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
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const eligibleListings = useMemo(() => {
    const stored = loadStickerEligibleListings();
    if (stored.some((l) => l.id === draft.id)) return stored;
    return [draft, ...stored];
  }, [draft]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    eligibleListings.map((l) => l.id),
  );

  useEffect(() => {
    void QRCode.toDataURL(getListingQrUrl(draft.id), {
      width: 180,
      margin: 1,
      color: { dark: "#0D5C3A", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [draft.id]);

  const selectedCount = selectedIds.length;
  const otherListings = eligibleListings.filter((l) => l.id !== draft.id);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.length > 1
          ? current.filter((itemId) => itemId !== id)
          : current
        : [...current, id],
    );
  };

  const runPdfDownload = async (ids: string[]) => {
    let rows = eligibleListings
      .filter((l) => ids.includes(l.id))
      .map(listingDraftToStickerRow);
    if (rows.length === 0) {
      rows = [listingDraftToStickerRow(draft)];
    }
    await generateQRStickerSheet(rows);
  };

  const handlePrintNow = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await runPdfDownload([draft.id]);
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrintSheet = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      await runPdfDownload(selectedIds);
    } catch {
      setPdfError("Could not generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleVerificationPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photo = typeof reader.result === "string" ? reader.result : null;
      if (!photo) return;

      setDraft((current) => {
        const updated: ListingDraft = {
          ...current,
          verificationPhoto: photo,
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
          Print it, attach it, go live.
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
            {pdfLoading ? "Preparing PDF…" : "🖨️ Print this sticker now"}
          </button>

          <RentanoTip
            message={
              <>
                No special paper needed — regular paper + clear tape works great.
                Pick up Avery #94107 at Walmart for professional waterproof stickers.
              </>
            }
          />
        </div>

        {otherListings.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4">
            <h3 className="text-base font-bold text-gray-900">
              More items to rent?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add more listings, then print up to 12 stickers on one Avery sheet.
            </p>

            <ul className="mt-3 space-y-2">
              {eligibleListings.map((listing) => (
                <li key={listing.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(listing.id)}
                      onChange={() => toggleSelection(listing.id)}
                      className="h-4 w-4 accent-[#0D5C3A]"
                    />
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-semibold text-gray-900">
                        {getListingDisplayTitle(listing.title)}
                        {listing.id === draft.id ? (
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            (this item)
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{listing.id.substring(0, 8).toUpperCase()}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => void handlePrintSheet()}
              disabled={pdfLoading || selectedCount === 0}
              className="mt-4 w-full rounded-xl border-2 py-3 text-sm font-bold disabled:opacity-50"
              style={{ borderColor: GREEN, color: GREEN }}
            >
              🖨️ Download sticker sheet ({selectedCount}{" "}
              {selectedCount === 1 ? "item" : "items"})
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onListAnother}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-600"
        >
          + List another item first
        </button>

        {pdfError ? (
          <p className="mt-3 text-center text-xs text-red-600">{pdfError}</p>
        ) : null}

        <div className="mt-8 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full rounded-xl border-2 py-3.5 text-base font-bold"
            style={{ borderColor: GREEN, color: GREEN }}
          >
            📸 Sticker is on — take verification photo
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleVerificationPhoto}
          />
          <p className="mt-3 text-center text-xs text-gray-500">
            Gift and Sell listings are active immediately.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
