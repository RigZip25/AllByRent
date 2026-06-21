import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, Trash2, X } from "lucide-react";
import { ONBOARDING } from "../../lib/brand";
import { deleteMedia, putMediaBlob, type MediaRef } from "../../lib/mediaStore";
import { useMediaUrl } from "../../lib/useMediaUrl";
import {
  garageShelfHasActivity,
  getGarageShelfEditBlockReason,
  removeGarageShelfItem,
  updateGarageShelfItem,
} from "../../lib/garageShelfManage";
import { getGarageSaleOfferPrefs } from "../../lib/garageSaleOfferStorage";
import type { GarageListingSaleMode } from "../../lib/garageSaleOfferStorage";
import type { ListingDraft } from "../../screens/listing/types";

const GREEN = "#0D5C3A";
const AMBER = "#F59E0B";
const BORDER = "#E8E6E0";
const copy = ONBOARDING.garageShelfEdit;

type GarageShelfEditSheetProps = {
  listing: ListingDraft;
  onClose: () => void;
  onSaved: () => void;
  onRemoved: () => void;
};

async function createThumbnail(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const maxSize = 420;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return blob;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((thumb) => {
      if (!thumb) reject(new Error("Thumbnail failed"));
      else resolve(thumb);
    }, "image/jpeg", 0.82);
  });
}

export function GarageShelfEditSheet({
  listing,
  onClose,
  onSaved,
  onRemoved,
}: GarageShelfEditSheetProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const prefs = getGarageSaleOfferPrefs(listing.id);
  const blockReason = getGarageShelfEditBlockReason(listing.id);
  const hasActivity = garageShelfHasActivity(listing.id);

  const [photo, setPhoto] = useState<MediaRef>(listing.photos[0]!);
  const [title, setTitle] = useState(listing.title || "");
  const [note, setNote] = useState(listing.description || "");
  const [price, setPrice] = useState(listing.pricing.salePrice.replace(/[^0-9.]/g, ""));
  const [saleMode, setSaleMode] = useState<GarageListingSaleMode>(prefs?.saleMode ?? "open");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const thumb = photo.thumbId ? { ...photo, id: photo.thumbId } : photo;
  const { url } = useMediaUrl(thumb);

  const ingestFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        const main = await putMediaBlob(file, { kind: "image" });
        if (!main.ok) {
          setError(main.message);
          return;
        }
        const thumbBlob = await createThumbnail(file);
        const thumbResult = await putMediaBlob(thumbBlob, { kind: "image", thumbForId: main.ref.id });
        const next: MediaRef = { ...main.ref, thumbId: thumbResult.ok ? thumbResult.ref.id : undefined };
        if (photo.id !== listing.photos[0]?.id) {
          await deleteMedia(photo.id);
          if (photo.thumbId) await deleteMedia(photo.thumbId);
        }
        setPhoto(next);
      } catch {
        setError("Could not load photo");
      } finally {
        setBusy(false);
      }
    },
    [listing.photos, photo],
  );

  const save = () => {
    const priceUsd = Number.parseFloat(price);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
      setError("Enter a valid price");
      return;
    }
    const result = updateGarageShelfItem({
      listing,
      title,
      description: note,
      photo,
      priceUsd,
      saleMode,
    });
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onSaved();
    onClose();
  };

  const remove = () => {
    if (!window.confirm(hasActivity ? copy.removeConfirmActive : copy.removeConfirm)) return;
    const result = removeGarageShelfItem(listing.id);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onRemoved();
    onClose();
  };

  const readOnly = Boolean(blockReason);

  return (
    <div className="garage-shelf-edit fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div
        className="relative max-h-[90dvh] w-full max-w-[390px] overflow-y-auto rounded-t-3xl border bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4"
        style={{ borderColor: BORDER }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>
              {copy.eyebrow}
            </p>
            <h2 className="text-lg font-bold text-gray-900">{copy.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: BORDER }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {blockReason ? (
          <p className="mb-3 rounded-xl px-3 py-2 text-xs font-medium text-amber-900" style={{ backgroundColor: `${AMBER}22` }}>
            {blockReason}
          </p>
        ) : null}

        <button
          type="button"
          disabled={busy || readOnly}
          onClick={() => cameraRef.current?.click()}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-gray-50 disabled:opacity-60"
          style={{ borderColor: BORDER }}
        >
          {url ? (
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">📷</div>
          )}
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
            {copy.changePhoto}
          </span>
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void ingestFile(file);
          }}
        />

        <label className="mt-3 block text-sm font-semibold text-gray-700">
          {copy.tagLabel}
          <input
            type="text"
            maxLength={80}
            value={title}
            disabled={readOnly}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 disabled:bg-gray-50"
            style={{ borderColor: BORDER }}
          />
        </label>

        <label className="mt-3 block text-sm font-semibold text-gray-700">
          {copy.noteLabel}
          <input
            type="text"
            maxLength={80}
            value={note}
            disabled={readOnly}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 w-full rounded-xl border px-3 py-2.5 disabled:bg-gray-50"
            style={{ borderColor: BORDER }}
          />
        </label>

        <label className="mt-3 block text-sm font-semibold text-gray-700">
          {copy.priceLabel}
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              disabled={readOnly}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-xl border py-2.5 pl-7 pr-3 text-lg font-bold disabled:bg-gray-50"
              style={{ borderColor: BORDER, color: GREEN }}
            />
          </div>
        </label>

        <p className="mt-1 text-xs text-gray-500">{copy.noStartingBidHint}</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["quick", "open"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={readOnly}
              onClick={() => setSaleMode(mode)}
              className="rounded-xl border py-2 text-[12px] font-bold disabled:opacity-50"
              style={{
                borderColor: saleMode === mode ? AMBER : BORDER,
                backgroundColor: saleMode === mode ? `${AMBER}18` : "#fff",
                color: saleMode === mode ? "#92400E" : "#374151",
              }}
            >
              {mode === "quick" ? copy.modeQuick : copy.modeOpen}
            </button>
          ))}
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        {!readOnly ? (
          <button
            type="button"
            onClick={save}
            className="mt-4 w-full rounded-xl py-3.5 text-base font-bold"
            style={{ backgroundColor: AMBER, color: GREEN }}
          >
            {copy.save}
          </button>
        ) : null}

        <button
          type="button"
          onClick={remove}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold text-red-600"
          style={{ borderColor: "#FECACA" }}
        >
          <Trash2 className="h-4 w-4" />
          {copy.remove}
        </button>
      </div>
    </div>
  );
}
