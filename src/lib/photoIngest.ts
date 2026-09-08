import { createImageThumbnail } from "./imageThumbnail";
import { putMediaBlob, putUserPhoto, type MediaPutResult, type MediaRef } from "./mediaStore";

/**
 * Store a photo together with a grid-sized copy.
 *
 * Only the listing wizard used to make thumbnails, so every other place a photo
 * is taken — a garage shelf, a snap sale, a hand-off — left the grids decoding
 * full-size camera files for tiles the size of a stamp.
 */
export async function putPhotoWithThumbnail(
  blob: Blob,
  opts: { sanitize?: boolean; id?: string } = {},
): Promise<MediaPutResult> {
  const put = opts.sanitize === false
    ? await putMediaBlob(blob, { kind: "image", id: opts.id })
    : await putUserPhoto(blob, { kind: "image", id: opts.id });
  if (!put.ok) return put;

  const ref: MediaRef = put.ref;
  const thumb = await createImageThumbnail(blob);
  // No thumbnail is not a failure: a small photo does not need one, and a
  // device that cannot re-encode still gets to keep the photo.
  if (!thumb) return put;

  const thumbPut = await putMediaBlob(thumb, { kind: "image", thumbForId: ref.id });
  if (!thumbPut.ok) return put;

  return { ...put, ref: { ...ref, thumbId: thumbPut.ref.id } };
}
