import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion } from "motion/react";
import { Loader2, Plus, X } from "lucide-react";
import type { StepProps } from "../types";
import { RentanoHint } from "../../../components/RentanoHint";
import { processPhotoWithPhotoRoom } from "../photoroomApi";
import { MAX_LISTING_PHOTOS, MAX_LISTING_VIDEOS } from "../photoUtils";
import { putMediaBlob, deleteMedia, type MediaRef } from "../../../lib/mediaStore";
import { useMediaUrl } from "../../../lib/useMediaUrl";

const PRIMARY_GREEN = "#0D5C3A";
const DEFAULT_TIP =
  "Optional: tap Analyze to let Rentano fill in Step 2. You can also skip and enter details manually.";
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

export function Step1Photos({
  draft,
  setDraft,
  onAnalyzePhotos,
}: StepProps & { onAnalyzePhotos?: () => void }) {
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reorderSourceRef = useRef<number | null>(null);

  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [visibleSlots, setVisibleSlots] = useState(4);

  const atMax = draft.photos.length >= MAX_LISTING_PHOTOS;
  const atMaxVideos = draft.videos.length >= MAX_LISTING_VIDEOS;
  const rentanoMessage = draft.aiSuggestions ? AI_TIP : DEFAULT_TIP;

  const clampToMaxSlots = (value: number) => Math.max(4, Math.min(MAX_LISTING_PHOTOS, value));
  const ceilToBatchOf4 = (value: number) => Math.ceil(value / 4) * 4;

  const openLibraryPicker = useCallback(() => {
    if (atMax) return;
    libraryInputRef.current?.click();
  }, [atMax]);

  const openCameraPicker = useCallback(() => {
    if (atMax) return;
    cameraInputRef.current?.click();
  }, [atMax]);

  const createThumbnail = async (blob: Blob): Promise<Blob> => {
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
    const thumb = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.78);
    });
    return thumb ?? blob;
  };

  const appendPhotoBlob = async (blob: Blob) => {
    const put = await putMediaBlob(blob, { kind: "image" });
    if (!put.ok) {
      setStorageWarning(put.message);
      throw new Error(put.message);
    }
    if (put.warning) setStorageWarning(put.warning);

    let ref: MediaRef = put.ref;
    try {
      const thumbBlob = await createThumbnail(blob);
      const thumbPut = await putMediaBlob(thumbBlob, { kind: "image", thumbForId: ref.id });
      if (thumbPut.ok) {
        ref = { ...ref, thumbId: thumbPut.ref.id };
      }
    } catch {
      // Best-effort thumbnail generation; full-size still works.
    }

    setDraft((current) => ({
      ...current,
      photos: [...current.photos, ref],
      aiSuggestions: null,
    }));
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setStorageWarning(null);

    let nextIndex = draft.photos.length;

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (nextIndex >= MAX_LISTING_PHOTOS) break;

      const targetIndex = nextIndex;
      setProcessingIndex(targetIndex);
      setErrorIndex(null);
      setDraft((current) => ({ ...current, photoEnhancementPending: true }));

      try {
        const blob = await processPhotoWithPhotoRoom(file);
        await appendPhotoBlob(blob);
        nextIndex += 1;
      } catch {
        setErrorIndex(targetIndex);
        break;
      } finally {
        setProcessingIndex(null);
        setDraft((current) => ({ ...current, photoEnhancementPending: false }));
      }
    }

    if (libraryInputRef.current) libraryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";

    setVisibleSlots((current) => {
      if (nextIndex <= current) return current;
      return clampToMaxSlots(Math.max(current, ceilToBatchOf4(nextIndex)));
    });
  };

  const handleVideoSelected = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("video/")) return;
    if (draft.videos.length >= MAX_LISTING_VIDEOS) return;
    setStorageWarning(null);

    const put = await putMediaBlob(file, { kind: "video" });
    if (!put.ok) {
      setStorageWarning(put.message);
      return;
    }
    if (put.warning) setStorageWarning(put.warning);

    setDraft((current) => ({
      ...current,
      videos: [...current.videos, put.ref],
    }));

    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    const media = draft.photos[index];
    if (!media) return;

    void deleteMedia(media.id).catch(() => undefined);
    if (media.thumbId) {
      void deleteMedia(media.thumbId).catch(() => undefined);
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
      return;
    }

    const lastRenderedIndex = Math.min(visibleSlots, MAX_LISTING_PHOTOS) - 1;
    const lastNode = slotRefs.current[lastRenderedIndex];
    if (!lastNode) return;
    const rect = lastNode.getBoundingClientRect();
    if (event.clientY > rect.bottom + 24 && visibleSlots < MAX_LISTING_PHOTOS) {
      setVisibleSlots((current) => clampToMaxSlots(current + 4));
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
    // Default to Photos/library (iOS PWA: `capture` would force camera-only).
    openLibraryPicker();
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

  function PhotoTile({ media }: { media: MediaRef }) {
    const thumb = media.thumbId ? { id: media.thumbId, mimeType: "image/jpeg" } : media;
    const { url } = useMediaUrl(thumb);
    return (
      <div
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: url ? `url(${url})` : undefined }}
        role="img"
        aria-label="Listing photo"
      />
    );
  }

  const renderFilledSlot = (index: number, className: string) => {
    const media = draft.photos[index];
    const isCover = index === 0;
    const isDragTarget = dragOverIndex === index && draggingIndex !== null;
    const isDragging = draggingIndex === index;

    return (
      <motion.div
        key={`photo-${media.id}`}
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
        <PhotoTile media={media} />
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

  useEffect(() => {
    if (draft.photos.length <= visibleSlots) return;
    setVisibleSlots((current) =>
      clampToMaxSlots(Math.max(current, ceilToBatchOf4(draft.photos.length))),
    );
  }, [draft.photos.length, visibleSlots]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[390px] flex-col bg-[#F9FAFB] px-4 pb-4 pt-5">
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFilesSelected(Array.from(event.target.files ?? []))}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => void handleFilesSelected(event.target.files?.[0] ? [event.target.files[0]] : [])}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => void handleVideoSelected(event.target.files?.[0])}
      />

      <div className="mb-4">
        <h2 className="text-xl font-bold" style={{ color: PRIMARY_GREEN }}>
          Add photos
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Up to {MAX_LISTING_PHOTOS} photos and {MAX_LISTING_VIDEOS} videos. Long-press to reorder photos.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openLibraryPicker}
            disabled={atMax}
            className="w-full rounded-xl border-2 py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ borderColor: PRIMARY_GREEN, color: PRIMARY_GREEN }}
          >
            Choose from library
          </button>
          <button
            type="button"
            onClick={openCameraPicker}
            disabled={atMax}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: PRIMARY_GREEN }}
          >
            Take photo
          </button>
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={atMaxVideos}
            className="w-full rounded-xl border-2 py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ borderColor: PRIMARY_GREEN, color: PRIMARY_GREEN }}
          >
            Add video
          </button>
          {storageWarning ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">{storageWarning}</p>
          ) : null}
        </div>
      </div>

      <motion.div layout className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: Math.min(visibleSlots, MAX_LISTING_PHOTOS) }).map((_, index) =>
            renderSlot(index, "aspect-square w-full"),
          )}
        </div>
        {visibleSlots < MAX_LISTING_PHOTOS ? (
          <button
            type="button"
            onClick={() => setVisibleSlots((current) => clampToMaxSlots(current + 4))}
            className="w-full rounded-xl border-2 py-2.5 text-sm font-semibold"
            style={{ borderColor: PRIMARY_GREEN, color: PRIMARY_GREEN }}
          >
            Add more photos (+4)
          </button>
        ) : null}
        {draft.videos.length > 0 ? (
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Videos ({draft.videos.length}/{MAX_LISTING_VIDEOS})
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3">
              {draft.videos.map((video) => (
                <VideoPreview
                  key={video.id}
                  video={video}
                  onRemove={() => {
                    void deleteMedia(video.id).catch(() => undefined);
                    setDraft((current) => ({
                      ...current,
                      videos: current.videos.filter((v) => v.id !== video.id),
                    }));
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>

      {onAnalyzePhotos ? (
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Analyze photos (optional)</p>
              <p className="mt-1 text-xs text-gray-500">
                Uses AI to suggest title, category, description, and replacement value. This can
                take 10–30 seconds.
              </p>
            </div>
            <button
              type="button"
              onClick={onAnalyzePhotos}
              disabled={
                draft.photos.length === 0 || draft.aiAnalysisPending || draft.photoEnhancementPending
              }
              className="btn-primary shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: PRIMARY_GREEN }}
            >
              {draft.aiAnalysisPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Analyzing…
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </div>
      ) : null}

      <RentanoHint key={rentanoMessage} hint={rentanoMessage} className="mt-5" showTapLabel />
    </div>
  );
}

function VideoPreview({ video, onRemove }: { video: MediaRef; onRemove: () => void }) {
  const { url, status } = useMediaUrl(video);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
      {status === "ready" && url ? (
        <video src={url} controls className="h-[180px] w-full object-cover" />
      ) : (
        <div className="flex h-[180px] w-full items-center justify-center text-sm text-gray-400">
          Loading video…
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
        aria-label="Remove video"
      >
        <X className="h-4 w-4 text-gray-600" strokeWidth={2.5} />
      </button>
    </div>
  );
}
