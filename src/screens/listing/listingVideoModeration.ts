import type { MediaRef } from "../../lib/mediaStore";
import { getMediaBlob } from "../../lib/mediaStore";
import {
  messageForPhotoModeration,
  moderateListingPhotoBlob,
  type ListingPhotoModerationContext,
  type ListingPhotoModerationCopy,
  type ListingPhotoModerationReason,
  type ListingPhotoModerationResult,
} from "./listingPhotoModeration";

export type ListingVideoModerationCopy = ListingPhotoModerationCopy & {
  /** Bad / unusable video take. */
  moderationBadVideo: string;
  moderationVideoNotListable: string;
};

/**
 * Sample 1–3 frames from a video blob via HTMLVideoElement + canvas.
 * Times: near start, middle, near end (when duration is known).
 */
export async function extractVideoModerationFrames(
  blob: Blob,
  maxFrames = 3,
): Promise<Blob[]> {
  if (typeof document === "undefined") {
    throw new Error("Video frame extraction requires a browser");
  }

  const objectUrl = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("playsinline", "true");
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => resolve();
      const onError = () => reject(new Error("Could not load video for moderation"));
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      video.addEventListener("error", onError, { once: true });
    });

    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    const seekTimes =
      duration > 0.4
        ? [0.05 * duration, 0.5 * duration, Math.max(0, duration - 0.15)].slice(
            0,
            maxFrames,
          )
        : [0];

    const frames: Blob[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create canvas for video frames");
    }

    for (const time of seekTimes) {
      const target = Math.max(0, Math.min(time, Math.max(0, duration - 0.01)));
      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => resolve();
        const onError = () => reject(new Error("Video seek failed"));
        video.addEventListener("seeked", onSeeked, { once: true });
        video.addEventListener("error", onError, { once: true });
        try {
          video.currentTime = target;
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Video seek failed"));
        }
      });

      const width = Math.max(1, video.videoWidth || 640);
      const height = Math.max(1, video.videoHeight || 360);
      // Cap longest edge for vision payload size.
      const maxEdge = 1280;
      const scale = Math.min(1, maxEdge / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.85);
      });
      if (frame && frame.size > 0) frames.push(frame);
    }

    if (frames.length === 0) {
      throw new Error("No video frames extracted");
    }
    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

const verificationFailed = (): ListingPhotoModerationResult => ({
  ok: false,
  reasonCode: "verification_failed",
  safe: false,
  isListableItem: false,
  matchesCategory: null,
});

/**
 * Moderate a listing video by sampling frames and running the same vision schema
 * as photos. Fail-closed if frames cannot be extracted or vision fails.
 */
export async function moderateListingVideoBlob(
  blob: Blob,
  ctx: ListingPhotoModerationContext = {},
): Promise<ListingPhotoModerationResult> {
  let frames: Blob[];
  try {
    frames = await extractVideoModerationFrames(blob, 3);
  } catch {
    return verificationFailed();
  }

  // Strongest rejection wins across frames (NSFW / not item / mismatch / bad angle).
  let strongest: ListingPhotoModerationResult | null = null;
  const severity: Record<ListingPhotoModerationReason, number> = {
    ok: 0,
    bad_angle: 1,
    unusable_photo: 1,
    category_mismatch: 2,
    not_an_item: 3,
    prohibited_item: 4,
    nsfw: 5,
    verification_failed: 6,
  };

  for (const frame of frames) {
    const result = await moderateListingPhotoBlob(frame, ctx);
    if (!strongest || severity[result.reasonCode] > severity[strongest.reasonCode]) {
      strongest = result;
    }
    // Early exit on clear unsafe.
    if (result.reasonCode === "nsfw" || result.reasonCode === "verification_failed") {
      return result;
    }
  }

  return (
    strongest ?? {
      ok: true,
      reasonCode: "ok",
      safe: true,
      isListableItem: true,
      matchesCategory: (ctx.category ?? "").trim() ? true : null,
    }
  );
}

export async function moderateListingMediaVideos(
  videos: MediaRef[],
  ctx: ListingPhotoModerationContext = {},
): Promise<ListingPhotoModerationResult> {
  if (videos.length === 0) {
    return {
      ok: true,
      reasonCode: "ok",
      safe: true,
      isListableItem: true,
      matchesCategory: (ctx.category ?? "").trim() ? true : null,
    };
  }

  for (const ref of videos) {
    const blob = await getMediaBlob(ref.id);
    if (!blob) return verificationFailed();
    const result = await moderateListingVideoBlob(blob, ctx);
    if (!result.ok) return result;
  }

  return {
    ok: true,
    reasonCode: "ok",
    safe: true,
    isListableItem: true,
    matchesCategory: (ctx.category ?? "").trim() ? true : null,
  };
}

export function messageForVideoModeration(
  reasonCode: ListingPhotoModerationReason,
  copy: ListingVideoModerationCopy,
): string {
  switch (reasonCode) {
    case "category_mismatch":
      return copy.moderationCategoryMismatch;
    case "prohibited_item":
      return copy.moderationProhibitedItem;
    case "bad_angle":
    case "unusable_photo":
      return copy.moderationBadVideo;
    case "verification_failed":
      return copy.moderationVerifyFailed;
    case "nsfw":
    case "not_an_item":
    default:
      return copy.moderationVideoNotListable;
  }
}

/** Fallback when video-specific copy keys are missing — reuse photo copy. */
export function messageForVideoModerationFallback(
  reasonCode: ListingPhotoModerationReason,
  copy: ListingPhotoModerationCopy,
): string {
  return messageForPhotoModeration(reasonCode, copy);
}
