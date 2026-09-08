import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const AVATAR_DATA_KEY = "allbyrent_avatar_data";
const AVATAR_PATH_KEY = "allbyrent_avatar_path";

/** Object name inside the public `avatars` bucket: `{user_id}.jpg`. */
export function getAvatarObjectName(userId: string): string {
  return `${userId}.jpg`;
}

/** @deprecated use getAvatarObjectName — kept for localStorage path equality. */
export function getAvatarStoragePath(userId: string): string {
  return getAvatarObjectName(userId);
}

export function publicAvatarUrl(avatarPath: string | null | undefined): string | null {
  const path = avatarPath?.trim();
  if (!path) return null;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/avatars/${path.replace(/^\/+/, "")}`;
}

export function hasAvatarPhoto(userId: string): boolean {
  try {
    const path = localStorage.getItem(AVATAR_PATH_KEY);
    const data = localStorage.getItem(AVATAR_DATA_KEY);
    const expected = getAvatarObjectName(userId);
    // Accept legacy `avatars/{id}.jpg` keys written before Stage 14.
    return Boolean(
      data && (path === expected || path === `avatars/${userId}.jpg`),
    );
  } catch {
    return false;
  }
}

export function loadAvatarDataUrl(userId: string): string | null {
  try {
    if (!hasAvatarPhoto(userId)) return null;
    return localStorage.getItem(AVATAR_DATA_KEY);
  } catch {
    return null;
  }
}

/**
 * Persists JPEG locally and uploads to the public `avatars` bucket when signed in.
 * Also stamps `profiles.avatar_path` so public_profiles can show the photo.
 */
export async function saveAvatarPhoto(userId: string, jpegBlob: Blob): Promise<string> {
  const objectName = getAvatarObjectName(userId);
  const dataUrl = await blobToDataUrl(jpegBlob);

  try {
    localStorage.setItem(AVATAR_DATA_KEY, dataUrl);
    localStorage.setItem(AVATAR_PATH_KEY, objectName);
  } catch {
    /* quota */
  }

  await trySupabaseUpload(userId, objectName, jpegBlob);
  return dataUrl;
}

export function clearAvatarPhoto(): void {
  try {
    localStorage.removeItem(AVATAR_DATA_KEY);
    localStorage.removeItem(AVATAR_PATH_KEY);
  } catch {
    /* ignore */
  }
}

const PHOTO_PROMPT_KEY = "allbyrent_profile_photo_prompt_deferred";

export function isPhotoPromptDeferred(): boolean {
  try {
    return localStorage.getItem(PHOTO_PROMPT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPhotoPromptDeferred(deferred: boolean): void {
  try {
    if (deferred) localStorage.setItem(PHOTO_PROMPT_KEY, "1");
    else localStorage.removeItem(PHOTO_PROMPT_KEY);
  } catch {
    /* ignore */
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function trySupabaseUpload(
  userId: string,
  objectName: string,
  blob: Blob,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.storage.from("avatars").upload(objectName, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) return;

  await supabase.from("profiles").update({ avatar_path: objectName }).eq("id", userId);
}

/** Center-crop to square, min 200×200, export JPEG */
export async function cropAvatarToJpeg(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  minSize = 200,
): Promise<Blob> {
  const size = Math.min(sourceWidth, sourceHeight);
  const sx = (sourceWidth - size) / 2;
  const sy = (sourceHeight - size) / 2;
  const outSize = Math.max(minSize, size);

  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(source, sx, sy, size, size, 0, 0, outSize, outSize);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode JPEG"))),
      "image/jpeg",
      0.92,
    );
  });
}

export async function fileToImageBitmap(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
}> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}
