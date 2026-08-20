import { useEffect, useState } from "react";
import { X } from "lucide-react";
import QRCode from "qrcode";
import { getListingDisplayTitle, getListingPublicUrl } from "../../lib/listingQr";
import { useMessages } from "../../lib/i18n/react";

const GREEN = "#0D5C3A";

type ShowListingQrOverlayProps = {
  open: boolean;
  listing: { id: string; title?: string; qrToken?: string };
  onClose: () => void;
  hint?: string;
};

/** Full-screen listing QR for handoff — no printer required. */
export function ShowListingQrOverlay({
  open,
  listing,
  onClose,
  hint,
}: ShowListingQrOverlayProps) {
  const { listingQr: t } = useMessages();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const publicUrl = getListingPublicUrl(listing);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void QRCode.toDataURL(publicUrl, {
      width: 512,
      margin: 2,
      color: { dark: GREEN, light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [open, publicUrl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = getListingDisplayTitle(listing.title ?? "");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.showOnScreen}
      className="fixed inset-0 z-[95] flex flex-col bg-white"
    >
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label={t.showOnScreenClose}
        >
          <X className="h-6 w-6" />
        </button>
        <p className="text-sm font-bold" style={{ color: GREEN }}>
          {t.showOnScreen}
        </p>
        <span className="w-10" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="mb-1 max-w-sm text-center text-lg font-bold text-gray-900">{title}</p>
        <p className="mb-4 text-sm text-gray-500">#{listing.id.substring(0, 8).toUpperCase()}</p>

        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={t.qrAlt}
            width={280}
            height={280}
            className="h-[min(70vw,280px)] w-[min(70vw,280px)] rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
          />
        ) : (
          <div
            className="h-[min(70vw,280px)] w-[min(70vw,280px)] animate-pulse rounded-2xl bg-gray-100"
            aria-hidden
          />
        )}

        <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-gray-600">
          {hint ?? t.showOnScreenHint}
        </p>
        <p className="mt-2 max-w-sm text-center text-xs text-gray-500">{t.multiItemHint}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full max-w-sm rounded-2xl py-3.5 text-base font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {t.showOnScreenClose}
        </button>
      </div>
    </div>
  );
}
