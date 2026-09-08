import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { putMediaBlob, type MediaRef } from "./mediaStore";
import { sanitizeImageBlob } from "./imageSanitize";

/**
 * Upload renter insurance card / declaration page.
 * Path: `{renterId}/{rentalId}/insurance_{ts}.{ext}` in listing-verification
 * (public read so host can open the proof URL).
 */
export async function uploadRentalInsuranceProof(params: {
  renterId: string;
  rentalId: string;
  file: File;
}): Promise<{
  media: MediaRef;
  path: string;
  publicUrl: string | null;
  /** The host reads the proof from the server, so a failed upload must not pass as saved. */
  remote: "uploaded" | "unconfigured" | "failed";
}> {
  // The proof bucket is world-readable, so an insurance card photographed at
  // home must not carry its GPS tag. PDFs pass through untouched.
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
    return { media, path: "", publicUrl: null, remote: "unconfigured" };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { media, path: "", publicUrl: null, remote: "unconfigured" };
  }

  const ext = sanitized.stripped
    ? "jpg"
    : params.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${params.renterId}/${params.rentalId}/insurance_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("listing-verification").upload(path, upload, {
    upsert: true,
    contentType: upload.type || params.file.type || "image/jpeg",
  });
  if (error) {
    console.warn("insurance proof upload failed:", error.message);
    return { media, path: "", publicUrl: null, remote: "failed" };
  }

  const { data } = supabase.storage.from("listing-verification").getPublicUrl(path);
  return {
    media: { ...media, storagePath: path },
    path,
    publicUrl: data.publicUrl || null,
    remote: "uploaded",
  };
}
