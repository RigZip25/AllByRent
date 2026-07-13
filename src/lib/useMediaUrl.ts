import { useEffect, useMemo, useState } from "react";
import { getListingPhotoPublicUrl } from "./listingPhotoStorage";
import { getMediaBlob, type MediaRef } from "./mediaStore";

type MediaUrlState =
  | { status: "idle"; url: null }
  | { status: "loading"; url: null }
  | { status: "ready"; url: string }
  | { status: "missing"; url: null };

type MediaUrlInput = Pick<MediaRef, "id" | "mimeType" | "storagePath" | "thumbStoragePath">;

export function useMediaUrl(ref: MediaUrlInput | null | undefined): MediaUrlState {
  const id = ref?.id ?? "";
  const mimeType = ref?.mimeType ?? "";
  const storagePath = ref?.storagePath?.trim() ?? "";
  const key = useMemo(() => `${id}|${mimeType}|${storagePath}`, [id, mimeType, storagePath]);
  const [state, setState] = useState<MediaUrlState>({ status: "idle", url: null });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!id && !storagePath) {
      setState({ status: "idle", url: null });
      return () => undefined;
    }

    const remoteUrl = getListingPhotoPublicUrl(storagePath);
    if (remoteUrl) {
      setState({ status: "ready", url: remoteUrl });
      return () => undefined;
    }

    if (!id) {
      setState({ status: "missing", url: null });
      return () => undefined;
    }

    setState({ status: "loading", url: null });

    void (async () => {
      const blob = await getMediaBlob(id);
      if (cancelled) return;
      if (!blob) {
        setState({ status: "missing", url: null });
        return;
      }
      objectUrl = URL.createObjectURL(blob);
      setState({ status: "ready", url: objectUrl });
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key, id, storagePath]);

  return state;
}

/** Prefer thumbnail blob; fall back to full-size if thumb was evicted from IndexedDB. */
export function useCoverMediaUrl(cover: MediaUrlInput | null | undefined): MediaUrlState {
  const thumbStoragePath = cover?.thumbStoragePath?.trim() ?? "";
  const storagePath = cover?.storagePath?.trim() ?? "";
  const thumbId = cover?.thumbId?.trim() ?? "";
  const fullId = cover?.id?.trim() ?? "";
  const mimeType = cover?.mimeType ?? "";
  const key = useMemo(
    () => `${thumbStoragePath}|${storagePath}|${thumbId}|${fullId}|${mimeType}`,
    [thumbStoragePath, storagePath, thumbId, fullId, mimeType],
  );
  const [state, setState] = useState<MediaUrlState>({ status: "idle", url: null });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!thumbStoragePath && !storagePath && !thumbId && !fullId) {
      setState({ status: "idle", url: null });
      return () => undefined;
    }

    const remoteCandidates = [thumbStoragePath, storagePath].filter(Boolean);
    for (const path of remoteCandidates) {
      const remoteUrl = getListingPhotoPublicUrl(path);
      if (remoteUrl) {
        setState({ status: "ready", url: remoteUrl });
        return () => undefined;
      }
    }

    if (!thumbId && !fullId) {
      setState({ status: "missing", url: null });
      return () => undefined;
    }

    setState({ status: "loading", url: null });

    void (async () => {
      const ids = [thumbId, fullId].filter((id, index, list) => id && list.indexOf(id) === index);
      for (const id of ids) {
        const blob = await getMediaBlob(id);
        if (cancelled) return;
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setState({ status: "ready", url: objectUrl });
          return;
        }
      }
      if (!cancelled) setState({ status: "missing", url: null });
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key, thumbStoragePath, storagePath, thumbId, fullId]);

  return state;
}
