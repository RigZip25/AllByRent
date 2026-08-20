import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaRef } from "../../lib/mediaStore";
import { useMediaUrl } from "../../lib/useMediaUrl";
import { useMessages } from "../../lib/i18n/react";

const SWIPE_DISTANCE = 56;
const CLOSE_DISTANCE = 90;

type ListingPhotoGalleryProps = {
  photos: MediaRef[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

function GalleryImage({ media }: { media: MediaRef }) {
  const { url } = useMediaUrl(media);
  const { common } = useMessages();
  return url ? (
    <img
      src={url}
      alt=""
      className="max-h-full max-w-full select-none object-contain"
      draggable={false}
    />
  ) : (
    <p className="text-sm text-white/70">{common.loading}</p>
  );
}

/**
 * Full-screen listing photo viewer: swipe left/right between photos,
 * swipe down or tap X to return to the listing description.
 */
export function ListingPhotoGallery({
  photos,
  index,
  onClose,
  onIndexChange,
}: ListingPhotoGalleryProps) {
  const { listing } = useMessages();
  const copy = listing.photos;
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const axisRef = useRef<"x" | "y" | null>(null);

  const safeIndex = Math.max(0, Math.min(index, Math.max(0, photos.length - 1)));
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < photos.length - 1;

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= photos.length) return;
      onIndexChange(next);
    },
    [onIndexChange, photos.length],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) goTo(safeIndex - 1);
      if (event.key === "ArrowRight" && hasNext) goTo(safeIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, hasNext, hasPrev, onClose, safeIndex]);

  if (photos.length === 0) return null;

  const onPointerDown = (event: ReactPointerEvent) => {
    startRef.current = { x: event.clientX, y: event.clientY };
    axisRef.current = null;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    if (!startRef.current) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    if (!axisRef.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axisRef.current = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
    }
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    if (!startRef.current) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    const axis = axisRef.current;
    startRef.current = null;
    axisRef.current = null;

    if (axis === "y" && dy > CLOSE_DISTANCE) {
      onClose();
      return;
    }
    if (axis === "x" || (axis == null && Math.abs(dx) > Math.abs(dy))) {
      if (dx <= -SWIPE_DISTANCE && hasNext) {
        goTo(safeIndex + 1);
        return;
      }
      if (dx >= SWIPE_DISTANCE && hasPrev) {
        goTo(safeIndex - 1);
      }
    }
  };

  const neighborIndexes = [safeIndex - 1, safeIndex, safeIndex + 1].filter(
    (i) => i >= 0 && i < photos.length,
  );

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={copy.previewAria}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] text-white">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-white/10"
          aria-label={copy.closePreviewAria}
        >
          <X className="h-6 w-6" />
        </button>
        <span className="text-sm font-medium tabular-nums">
          {safeIndex + 1} / {photos.length}
        </span>
        <span className="w-10" aria-hidden />
      </div>

      <div
        className="relative min-h-0 flex-1 touch-pan-y overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startRef.current = null;
          axisRef.current = null;
        }}
      >
        {hasPrev ? (
          <button
            type="button"
            onClick={() => goTo(safeIndex - 1)}
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white sm:flex"
            aria-label={copy.previousPhotoAria}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        ) : null}
        {hasNext ? (
          <button
            type="button"
            onClick={() => goTo(safeIndex + 1)}
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 text-white sm:flex"
            aria-label={copy.nextPhotoAria}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        ) : null}

        {/* Keep neighbors mounted so next/prev images are warm */}
        {neighborIndexes.map((i) => (
          <div
            key={photos[i].id}
            className={`absolute inset-0 flex items-center justify-center px-3 ${
              i === safeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== safeIndex}
          >
            <GalleryImage media={photos[i]} />
          </div>
        ))}
      </div>

      {photos.length > 1 ? (
        <div className="flex shrink-0 justify-center gap-1.5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === safeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`${i + 1} / ${photos.length}`}
            />
          ))}
        </div>
      ) : (
        <div className="pb-[max(1rem,env(safe-area-inset-bottom))]" />
      )}
    </div>
  );
}
