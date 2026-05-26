const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.85;

export async function compressImageFile(
  file: File,
  maxWidth = MAX_WIDTH,
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImageFile(file)));
}

export const MAX_LISTING_PHOTOS = 5;
