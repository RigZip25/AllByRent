import { useEffect, useMemo, useState } from "react";
import { getMediaBlob, type MediaRef } from "./mediaStore";

type MediaUrlState =
  | { status: "idle"; url: null }
  | { status: "loading"; url: null }
  | { status: "ready"; url: string }
  | { status: "missing"; url: null };

export function useMediaUrl(ref: Pick<MediaRef, "id" | "mimeType"> | null | undefined): MediaUrlState {
  const id = ref?.id ?? "";
  const mimeType = ref?.mimeType ?? "";
  const key = useMemo(() => `${id}|${mimeType}`, [id, mimeType]);
  const [state, setState] = useState<MediaUrlState>({ status: "idle", url: null });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!id) {
      setState({ status: "idle", url: null });
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
  }, [key, id]);

  return state;
}

/** Prefer thumbnail blob; fall back to full-size if thumb was evicted from IndexedDB. */
export function useCoverMediaUrl(cover: MediaRef | null | undefined): MediaUrlState {
  const thumbId = cover?.thumbId?.trim() ?? "";
  const fullId = cover?.id?.trim() ?? "";
  const mimeType = cover?.mimeType ?? "";
  const key = useMemo(() => `${thumbId}|${fullId}|${mimeType}`, [thumbId, fullId, mimeType]);
  const [state, setState] = useState<MediaUrlState>({ status: "idle", url: null });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!thumbId && !fullId) {
      setState({ status: "idle", url: null });
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
  }, [key, thumbId, fullId]);

  return state;
}

