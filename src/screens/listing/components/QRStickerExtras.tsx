import { useState } from "react";
import { generateQRStickerSheet } from "../../../lib/generateQRSticker";
import { getListingDisplayTitle, getListingQrUrl } from "../../../lib/listingQr";
import type { ListingDraft } from "../types";

const GREEN = "#0D5C3A";

function VinylStickersComingSoon() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#F3F4F6] px-4 py-3.5">
      <p className="text-sm font-medium text-gray-500">
        📦 Order professional vinyl stickers — coming soon
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Waterproof · Full color · Delivered to your door
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-gray-400">
        StickerMule integration — coming soon
      </p>
    </div>
  );
}

export function QRStickerDownloadButton({ draft }: { draft: ListingDraft }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      await generateQRStickerSheet([
        {
          id: draft.id,
          title: getListingDisplayTitle(draft.title),
          qrUrl: getListingQrUrl(draft.id),
        },
      ]);
    } catch {
      setError("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={downloading}
        className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: GREEN }}
      >
        {downloading ? "Preparing PDF…" : "🖨️ Download sticker sheet (PDF)"}
      </button>
      <p className="text-center text-xs text-gray-500">
        Print on Avery #94107 — available at Walmart
      </p>
      {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
      <VinylStickersComingSoon />
    </div>
  );
}

export function QRStickerComingSoonOnly() {
  return <VinylStickersComingSoon />;
}
