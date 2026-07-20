import { getMediaBlob, type MediaRef } from "./mediaStore";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export const LISTING_PHOTOS_BUCKET = "listing-photos";

export type ListingPhotoRef = MediaRef & {
  storagePath?: string;
  thumbStoragePath?: string;
};

function extFromMime(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function safeMediaFileStem(mediaId: string): string {
  return mediaId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "photo";
}

export function buildListingPhotoPath(
  ownerId: string,
  listingId: string,
  mediaId: string,
  mimeType: string,
  variant: "full" | "thumb" = "full",
): string {
  const ext = extFromMime(mimeType);
  const stem = safeMediaFileStem(mediaId);
  const fileName = variant === "thumb" ? `thumb_${stem}.${ext}` : `${stem}.${ext}`;
  return `${ownerId}/${listingId}/${fileName}`;
}

export function collectListingPhotoStoragePaths(photos: ListingPhotoRef[]): string[] {
  const paths = new Set<string>();
  for (const photo of photos) {
    const full = photo.storagePath?.trim();
    const thumb = photo.thumbStoragePath?.trim();
    if (full) paths.add(full);
    if (thumb) paths.add(thumb);
  }
  return Array.from(paths);
}

export function getListingPhotoPublicUrl(storagePath: string | undefined | null): string | null {
  const path = storagePath?.trim();
  if (!path || !isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}

async function uploadBlob(params: {
  path: string;
  blob: Blob;
  mimeType: string;
}): Promise<void> {
  if (params.blob.size <= 0) {
    throw new Error(`Refusing to upload empty blob for ${params.path}`);
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client unavailable");
  }
  const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).upload(params.path, params.blob, {
    upsert: true,
    contentType: params.mimeType || params.blob.type || "image/jpeg",
  });
  if (error) throw error;
}

export async function deleteListingPhotosFromRemote(paths: string[]): Promise<void> {
  if (!isSupabaseConfigured() || paths.length === 0) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const unique = Array.from(new Set(paths.map((p) => p.trim()).filter(Boolean)));
  if (unique.length === 0) return;
  const { error } = await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(unique);
  if (error) throw error;
}

export async function uploadListingPhotosToRemote(params: {
  listingId: string;
  ownerId: string;
  photos: ListingPhotoRef[];
}): Promise<ListingPhotoRef[]> {
  if (!isSupabaseConfigured()) return params.photos;
  const supabase = getSupabaseClient();
  if (!supabase) return params.photos;

  const uploaded: ListingPhotoRef[] = [];

  for (const photo of params.photos) {
    const blob = await getMediaBlob(photo.id);
    const thumbBlob = photo.thumbId?.trim() ? await getMediaBlob(photo.thumbId) : null;

    // Keep remote-only refs when local blobs were evicted from IndexedDB.
    if (!blob && photo.storagePath?.trim()) {
      uploaded.push(photo);
      continue;
    }

    if (!blob) {
      uploaded.push(photo);
      continue;
    }

    const storagePath = buildListingPhotoPath(
      params.ownerId,
      params.listingId,
      photo.id,
      photo.mimeType,
      "full",
    );
    await uploadBlob({ path: storagePath, blob, mimeType: photo.mimeType });

    let thumbStoragePath = photo.thumbStoragePath;
    if (thumbBlob && thumbBlob.size > 0) {
      const thumbId = photo.thumbId?.trim() || `${photo.id}_thumb`;
      thumbStoragePath = buildListingPhotoPath(
        params.ownerId,
        params.listingId,
        thumbId,
        photo.mimeType,
        "thumb",
      );
      await uploadBlob({ path: thumbStoragePath, blob: thumbBlob, mimeType: photo.mimeType });
    }

    uploaded.push({
      ...photo,
      storagePath,
      ...(thumbStoragePath ? { thumbStoragePath } : {}),
    });
  }

  return uploaded;
}
