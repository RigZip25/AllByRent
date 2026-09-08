import { useEffect, useMemo, useState } from "react";
import { getListingPhotoPublicUrl } from "./listingPhotoStorage";
import { getMediaBlob, type MediaRef } from "./mediaStore";
import { signRentalDocumentUrl } from "./privateDocumentUrl";

type MediaUrlState =
  | { status: "idle"; url: null }
  | { status: "loading"; url: null }
  | { status: "ready"; url: string }
  | { status: "missing"; url: null };

type MediaUrlInput = Pick<
  MediaRef,
  "id" | "mimeType" | "storagePath" | "thumbStoragePath" | "thumbId" | "storageBucket"
>;

export type MediaUrlOptions = {
  /**
   * Which copy to reach for first. `"thumb"` for grids and cards, `"full"`
   * where the photo is the point: a hero, a full-screen viewer, evidence in a
   * dispute. Asking for a thumbnail everywhere is what made the wizard's hero
   * a soft 480 px image despite the code meaning to show the original.
   */
  prefer?: "thumb" | "full";
};

export function useMediaUrl(
  ref: MediaUrlInput | null | undefined,
  options: MediaUrlOptions = {},
): MediaUrlState {
  const id = ref?.id ?? "";
  const thumbId = ref?.thumbId?.trim() ?? "";
  const mimeType = ref?.mimeType ?? "";
  const storagePath = ref?.storagePath?.trim() ?? "";
  const thumbStoragePath = ref?.thumbStoragePath?.trim() ?? "";
  const privateDocument = ref?.storageBucket === "listing-verification";
  const preferFull = options.prefer === "full";
  const key = useMemo(
    () =>
      `${id}|${thumbId}|${mimeType}|${thumbStoragePath}|${storagePath}|${privateDocument}|${preferFull}`,
    [id, thumbId, mimeType, thumbStoragePath, storagePath, privateDocument, preferFull],
  );
  const [state, setState] = useState<MediaUrlState>({ status: "idle", url: null });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!id && !thumbId && !storagePath && !thumbStoragePath) {
      setState({ status: "idle", url: null });
      return () => undefined;
    }

    if (!privateDocument) {
      const remoteCandidates = (
        preferFull ? [storagePath, thumbStoragePath] : [thumbStoragePath, storagePath]
      ).filter(Boolean);
      for (const path of remoteCandidates) {
        const remoteUrl = getListingPhotoPublicUrl(path);
        if (remoteUrl) {
          setState({ status: "ready", url: remoteUrl });
          return () => undefined;
        }
      }
    }

    if (!thumbId && !id && !storagePath) {
      setState({ status: "missing", url: null });
      return () => undefined;
    }

    setState({ status: "loading", url: null });

    void (async () => {
      const ids = (preferFull ? [id, thumbId] : [thumbId, id]).filter(
        (candidate, index, list) => candidate && list.indexOf(candidate) === index,
      );
      for (const mediaId of ids) {
        const blob = await getMediaBlob(mediaId);
        if (cancelled) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setState({ status: "ready", url: objectUrl });
          return;
        }
      }

      // The other side of the rental has no blob on this device; a document in
      // the private bucket opens through a signed link instead.
      if (privateDocument && storagePath) {
        const signed = await signRentalDocumentUrl(storagePath);
        if (cancelled) return;
        if (signed) {
          setState({ status: "ready", url: signed });
          return;
        }
      }

      if (!cancelled) setState({ status: "missing", url: null });
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key, id, thumbId, storagePath, thumbStoragePath, privateDocument, preferFull]);

  return state;
}

/** Prefer thumbnail blob; fall back to full-size if thumb was evicted from IndexedDB. */
export function useCoverMediaUrl(cover: MediaUrlInput | null | undefined): MediaUrlState {
  return useMediaUrl(cover, { prefer: "thumb" });
}
