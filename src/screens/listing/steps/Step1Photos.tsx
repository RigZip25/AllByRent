import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion } from "motion/react";
import { Plus, X } from "lucide-react";
import type { StepProps } from "../types";
import { RentanoTip } from "../../../components/RentanoTip";
import { processPhotoWithPhotoRoom } from "../photoroomApi";
import { MAX_LISTING_PHOTOS } from "../photoUtils";

const PRIMARY_GREEN = "#0D5C3A";
const DEFAULT_TIP =
  "Add all your photos, then tap Continue — Rentano will analyze them for Step 2.";
const AI_TIP = "I analyzed your photos — check Step 2, I filled everything in for you! 🎩";

function reorderArray<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function Step1Photos({ draft, setDraft }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reorderSourceRef = useRef<number | null>(null);

  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const atMax = draft.photos.length >= MAX_LISTING_PHOTOS;
  const rentanoMessage = draft.aiSuggestions ? AI_TIP : DEFAULT_TIP;

  const openFilePicker = useCallback(() => {
    if (atMax) return;
    fileInputRef.current?.click();
  }, [atMax]);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (draft.photos.length >= MAX_LISTING_PHOTOS) return;

    const targetIndex = draft.photos.length;
    setProcessingIndex(targetIndex);
    setErrorIndex(null);
    setDraft((current) => ({ ...current, photoEnhancementPending: true }));

    try {
      const blob = await processPhotoWithPhotoRoom(file);
      const url = URL.createObjectURL(blob);

      setDraft((current) => ({
        ...current,
        photos: [...current.photos, url],
        aiSuggestions: null,
      }));
    } catch {
      setErrorIndex(targetIndex);
    } finally {
      setProcessingIndex(null);
      setDraft((current) => ({ ...current, photoEnhancementPending: false }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    const url = draft.photos[index];
    if (url) {
      URL.revokeObjectURL(url);
    }

    setDraft((current) => {
      const nextPhotos = current.photos.filter((_, i) => i !== index);
      return {
        ...current,
        photos: nextPhotos,
        aiSuggestions: null,
      };
    });

    if (errorIndex !== null && errorIndex > index) {
      setErrorIndex(errorIndex - 1);
    } else if (errorIndex === index) {
      setErrorIndex(null);
    }
  };

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const findSlotIndexFromPoint = (clientX: number, clientY: number) => {
    for (let i = 0; i < slotRefs.current.length; i += 1) {
      const node = slotRefs.current[i];
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return i;
      }
    }
    return null;
  };

  const finishReorder = (from: number, to: number) => {
    if (from === to || draft.photos[from] === undefined) return;
    setDraft((current) => ({
      ...current,
      photos: reorderArray(current.photos, from, to),
    }));
  };

  const handleFilledPointerDown = (
    index: number,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (processingIndex !== null || index >= draft.photos.length) return;
    clearLongPressTimer();
    reorderSourceRef.current = null;

    longPressTimerRef.current = setTimeout(() => {
      reorderSourceRef.current = index;
      setDraggingIndex(index);
      event.currentTarget.setPointerCapture(event.pointerId);
    }, 450);
  };

  const handleFilledPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reorderSourceRef.current === null) return;
    const over = findSlotIndexFromPoint(event.clientX, event.clientY);
    if (over !== null && over < draft.photos.length) {
      setDragOverIndex(over);
    }
  };

  const handleFilledPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    clearLongPressTimer();
    const from = reorderSourceRef.current;
    if (from !== null) {
      const over =
        findSlotIndexFromPoint(event.clientX, event.clientY) ?? dragOverIndex;
      if (over !== null && over < draft.photos.length) {
        finishReorder(from, over);
      }
    }
    reorderSourceRef.current = null;
    setDraggingIndex(null);
    setDragOverIndex(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleEmptySlotClick = (index: number) => {
    if (atMax || draft.photos[index]) return;
    if (processingIndex !== null && processingIndex !== index) return;
    openFilePicker();
  };

  const renderEmptySlot = (index: number, className: string) => {
    const isLoading = processingIndex === index;
    const isError = errorIndex === index;
    const canInteract =
      !atMax &&
      !draft.photos[index] &&
      (processingIndex === null || isLoading || isError);

    return (
      <div
        key={`slot-${index}`}
        ref={(node) => {
          slotRefs.current[index] = node;
        }}
        className={className}
      >
        <button
          type="button"
          disabled={!canInteract || (isLoading && !isError)}
          onClick={() => handleEmptySlotClick(index)}
          className={`flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white transition-colors ${
            isError
              ? "border-red-400"
              : "border-gray-300 enabled:hover:border-[#0D5C3A]"
          } disabled:cursor-default disabled:opacity-50`}
          aria-label={isError ? "Tap to retry" : "Add photo"}
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ opacity: [0.45, 0.85, 0.45] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mb-2 h-10 w-10 rounded-xl bg-gray-200"
              />
              <span className="text-xs text-gray-400">Enhancing...</span>
            </>
          ) : isError ? (
            <span className="text-xs text-red-500">Tap to retry</span>
          ) : (
            <Plus className="h-7 w-7 text-gray-400" strokeWidth={1.75} />
          )}
        </button>
      </div>
    );
  };

  const renderFilledSlot = (index: number, className: string) => {
    const url = draft.photos[index];
    const isCover = index === 0;
    const isDragTarget = dragOverIndex === index && draggingIndex !== null;
    const isDragging = draggingIndex === index;

    return (
      <motion.div
        key={`photo-${url}`}
        layout
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        ref={(node) => {
          slotRefs.current[index] = node;
        }}
        onPointerDown={(event) => handleFilledPointerDown(index, event)}
        onPointerMove={handleFilledPointerMove}
        onPointerUp={handleFilledPointerUp}
        onPointerCancel={handleFilledPointerUp}
        className={`relative overflow-hidden rounded-2xl ${className} ${
          isDragging ? "z-10 scale-[0.98] opacity-80" : ""
        } ${isDragTarget ? "ring-2 ring-[#0D5C3A] ring-offset-2" : ""}`}
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${url})` }}
          role="img"
          aria-label={`Listing photo ${index + 1}`}
        />
        {isCover && (
          <span
            className="absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: PRIMARY_GREEN }}
          >
            Cover
          </span>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            removePhoto(index);
          }}
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Remove photo"
        >
          <X className="h-3 w-3 text-gray-500" strokeWidth={2.5} />
        </button>
      </motion.div>
    );
  };

  const renderSlot = (index: number, className: string) => {
    if (draft.photos[index]) {
      return renderFilledSlot(index, className);
    }
    return renderEmptySlot(index, className);
  };

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[390px] flex-col bg-[#F9FAFB] px-4 pb-4 pt-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => void handleFileSelected(event.target.files?.[0])}
      />

      <div className="mb-4">
        <h2 className="text-xl font-bold" style={{ color: PRIMARY_GREEN }}>
          Add photos
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Up to {MAX_LISTING_PHOTOS} photos. Long-press to reorder.
        </p>
      </div>

      <motion.div layout className="space-y-3">
        {renderSlot(0, "h-[200px] w-full")}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((index) => renderSlot(index, "h-[160px] w-full"))}
        </div>
      </motion.div>

      <RentanoTip key={rentanoMessage} message={rentanoMessage} className="mt-5" />
    </div>
  );
}
