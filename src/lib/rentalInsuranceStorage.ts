import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { putMediaBlob, type MediaRef } from "./mediaStore";

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
  const saved = await putMediaBlob(params.file, { kind: "image" });
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

  const ext = params.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${params.renterId}/${params.rentalId}/insurance_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("listing-verification").upload(path, params.file, {
    upsert: true,
    contentType: params.file.type || "image/jpeg",
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
