import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { putMediaBlob, type MediaRef } from "./mediaStore";
import { sanitizeImageBlob } from "./imageSanitize";
import { RENTAL_DOCUMENT_BUCKET, signRentalDocumentUrl } from "./privateDocumentUrl";

/**
 * What the renter has to show before they can take the thing away: an
 * insurance card or declaration page, a driver's licence, a CDL, a boater or
 * drone certificate, a trade credential.
 *
 * Path: `{renterId}/{rentalId}/{kind}_{ts}.{ext}` in `listing-verification`, a
 * private bucket. The host still opens the document before handing over the
 * keys, but through a signed link that expires — and the rental id in the path
 * is what lets the other side of that rental, and nobody else, read it.
 */

export type RentalDocumentKind =
  | "insurance"
  | "cdl"
  | "credential"
  | "operator_cert"
  | "boater_license"
  | "drone_cert";

export async function uploadRentalInsuranceProof(params: {
  renterId: string;
  rentalId: string;
  file: File;
  kind?: RentalDocumentKind;
}): Promise<{
  media: MediaRef;
  path: string;
  /** Expires; for showing the document now, never for storing on the rental. */
  signedUrl: string | null;
  /** The host reads the proof from the server, so a failed upload must not pass as saved. */
  remote: "uploaded" | "unconfigured" | "failed";
}> {
  // A document photographed at home must not carry its GPS tag, private bucket
  // or not — the host is a stranger. PDFs pass through untouched.
  const sanitized = await sanitizeImageBlob(params.file);
  const upload: Blob = sanitized.blob;

  const saved = await putMediaBlob(upload, { kind: "image" });
  if (!saved.ok) {
    throw new Error(saved.message || "Could not save insurance photo on this device.");
  }

  const media: MediaRef = {
    ...saved.ref,
  };

  if (!isSupabaseConfigured()) {
    return { media, path: "", signedUrl: null, remote: "unconfigured" };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { media, path: "", signedUrl: null, remote: "unconfigured" };
  }

  const ext = sanitized.stripped
    ? "jpg"
    : params.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const kind = params.kind ?? "insurance";
  const path = `${params.renterId}/${params.rentalId}/${kind}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(RENTAL_DOCUMENT_BUCKET).upload(path, upload, {
    upsert: true,
    contentType: upload.type || params.file.type || "image/jpeg",
  });
  if (error) {
    console.warn("insurance proof upload failed:", error.message);
    return { media, path: "", signedUrl: null, remote: "failed" };
  }

  return {
    media: { ...media, storagePath: path, storageBucket: RENTAL_DOCUMENT_BUCKET },
    path,
    signedUrl: await signRentalDocumentUrl(path),
    remote: "uploaded",
  };
}
