import { getMediaBlob, type MediaRef } from "./mediaStore";
import { RENTAL_DOCUMENT_BUCKET } from "./privateDocumentUrl";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

/**
 * The photo of how the item looked at a handoff.
 *
 * It goes to the same private bucket as the rental's documents, under
 * `{uploader}/{rental}/condition_{stage}_{ts}.jpg`: migration 052 makes that
 * readable by whoever uploaded it and by the other side of that rental, which
 * is the whole audience for a photo of a scratch.
 */
export type ConditionPhotoStage = "pickup" | "return";

export type ConditionPhotoUpload =
  | { ok: true; media: MediaRef; path: string }
  | { ok: false; reason: "unconfigured" | "missing_blob" | "failed" };

export async function uploadRentalConditionPhoto(params: {
  uploaderId: string;
  rentalId: string;
  stage: ConditionPhotoStage;
  media: MediaRef;
}): Promise<ConditionPhotoUpload> {
  const uploaderId = params.uploaderId.trim();
  const rentalId = params.rentalId.trim();
  if (!uploaderId || !rentalId) return { ok: false, reason: "unconfigured" };
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };

  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, reason: "unconfigured" };

  // Already stripped of metadata on capture (putPhotoWithThumbnail).
  const blob = await getMediaBlob(params.media.id);
  if (!blob || blob.size <= 0) return { ok: false, reason: "missing_blob" };

  const path = `${uploaderId}/${rentalId}/condition_${params.stage}_${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(RENTAL_DOCUMENT_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
  });
  if (error) {
    console.warn("condition photo upload failed:", error.message);
    return { ok: false, reason: "failed" };
  }

  return {
    ok: true,
    path,
    media: { ...params.media, storagePath: path, storageBucket: RENTAL_DOCUMENT_BUCKET },
  };
}

/** The remote copy is what the other side can open; keep whichever ref has one. */
export function mergeConditionPhoto(
  local: MediaRef | null | undefined,
  remote: MediaRef | null | undefined,
): MediaRef | null {
  if (!local) return remote ?? null;
  if (!remote) return local;
  return {
    ...local,
    storagePath: local.storagePath ?? remote.storagePath,
    storageBucket: local.storageBucket ?? remote.storageBucket,
  };
}

/** A rental row's stored path, as a ref the photo components can resolve. */
export function conditionPhotoFromPath(path: string | null | undefined): MediaRef | undefined {
  const trimmed = path?.trim();
  if (!trimmed) return undefined;
  return {
    id: trimmed,
    kind: "image",
    mimeType: "image/jpeg",
    createdAt: Date.now(),
    sizeBytes: 0,
    storagePath: trimmed,
    storageBucket: RENTAL_DOCUMENT_BUCKET,
  };
}
