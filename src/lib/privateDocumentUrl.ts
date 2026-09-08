import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

/**
 * Links to documents that must not be readable by a stranger with the URL.
 *
 * The `listing-verification` bucket is private (migration 052), so an insurance
 * card or a licence scan can only be opened through a signed link. The link is
 * minted for the person asking and expires, which means it cannot be stored on
 * the rental row and handed around later.
 */

export const RENTAL_DOCUMENT_BUCKET = "listing-verification";

/** Long enough to open the document and look at it, short enough to be useless if shared. */
const LINK_TTL_SECONDS = 10 * 60;

export async function signRentalDocumentUrl(path: string): Promise<string | null> {
  const trimmed = path.trim();
  if (!trimmed || !isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(RENTAL_DOCUMENT_BUCKET)
    .createSignedUrl(trimmed, LINK_TTL_SECONDS);
  if (error) return null;
  return data?.signedUrl ?? null;
}

type DocumentUrlState =
  | { status: "idle"; url: null }
  | { status: "loading"; url: null }
  | { status: "ready"; url: string }
  | { status: "missing"; url: null };

/**
 * Resolve a signed link for a stored document path.
 *
 * `fallbackUrl` covers rentals from before the bucket went private, whose rows
 * still carry the old public URL.
 */
export function useRentalDocumentUrl(
  path: string | null | undefined,
  fallbackUrl?: string | null,
): DocumentUrlState {
  const key = path?.trim() ?? "";
  const fallback = fallbackUrl?.trim() ?? "";
  const [state, setState] = useState<DocumentUrlState>({ status: "idle", url: null });

  useEffect(() => {
    if (!key) {
      setState(fallback ? { status: "ready", url: fallback } : { status: "idle", url: null });
      return () => undefined;
    }

    let cancelled = false;
    setState({ status: "loading", url: null });

    void (async () => {
      const signed = await signRentalDocumentUrl(key);
      if (cancelled) return;
      if (signed) {
        setState({ status: "ready", url: signed });
        return;
      }
      setState(fallback ? { status: "ready", url: fallback } : { status: "missing", url: null });
    })();

    return () => {
      cancelled = true;
    };
  }, [key, fallback]);

  return state;
}
