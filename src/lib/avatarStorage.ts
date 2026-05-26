const AVATAR_DATA_KEY = "allbyrent_avatar_data";
const AVATAR_PATH_KEY = "allbyrent_avatar_path";

/** Logical Supabase path: avatars/{user_id}.jpg */
export function getAvatarStoragePath(userId: string): string {
  return `avatars/${userId}.jpg`;
}

export function hasAvatarPhoto(userId: string): boolean {
  try {
    const path = localStorage.getItem(AVATAR_PATH_KEY);
    const data = localStorage.getItem(AVATAR_DATA_KEY);
    return Boolean(data && path === getAvatarStoragePath(userId));
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
 * Demo: persists JPEG as data URL in localStorage at logical path avatars/{userId}.jpg.
 * When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set, also uploads via Storage REST API.
 */
export async function saveAvatarPhoto(userId: string, jpegBlob: Blob): Promise<string> {
  const path = getAvatarStoragePath(userId);
  const dataUrl = await blobToDataUrl(jpegBlob);

  try {
    localStorage.setItem(AVATAR_DATA_KEY, dataUrl);
    localStorage.setItem(AVATAR_PATH_KEY, path);
  } catch {
    /* quota */
  }

  await trySupabaseUpload(path, jpegBlob);
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

async function trySupabaseUpload(path: string, blob: Blob): Promise<void> {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!baseUrl || !anonKey) return;

  const url = `${baseUrl.replace(/\/$/, "")}/storage/v1/object/${path}`;
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: blob,
    });
  } catch {
    /* offline demo */
  }
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
