import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

/**
 * Stamp a listing as QR-verified.
 *
 * The host prints the tag, sticks it on the thing and photographs it; that
 * photo is what "verified" means on the shelf. Until now the client wrote
 * `qr_verified_at` itself right after the upload, so the column said a photo
 * existed whether or not one did, and a direct write said it with no upload at
 * all. The columns are the server's now (migration 054), and this route is the
 * only thing that sets them: it checks the caller owns the listing and that the
 * object is really in the bucket before it writes the timestamp.
 */

const DOCUMENT_BUCKET = "listing-verification";

type Body = { listingId?: string; path?: string };

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }

  const body = (req.body ?? {}) as Body;
  const listingId = typeof body.listingId === "string" ? body.listingId.trim() : "";
  const path = typeof body.path === "string" ? body.path.trim() : "";

  if (!listingId || !path) {
    res.status(400).json({ error: "listingId and path are required" });
    return;
  }

  // `{ownerId}/{listingId}/{file}` — the photo has to be filed under the
  // caller and the listing they say it verifies.
  const segments = path.split("/");
  if (segments.length < 3 || segments[0] !== user.id || segments[1] !== listingId) {
    res.status(400).json({ error: "Photo path does not belong to this listing" });
    return;
  }

  const { data: listing, error } = await admin
    .from("listings")
    .select("id, owner_id, listing_status")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (listing.owner_id !== user.id) {
    res.status(403).json({ error: "Only the owner can verify this listing" });
    return;
  }

  const folder = `${segments[0]}/${segments[1]}`;
  const fileName = segments.slice(2).join("/");
  const { data: files, error: listError } = await admin.storage
    .from(DOCUMENT_BUCKET)
    .list(folder, { search: fileName, limit: 100 });

  if (listError) {
    res.status(502).json({ error: "Could not read the verification photo" });
    return;
  }
  if (!files?.some((file) => file.name === fileName)) {
    res.status(400).json({ error: "Verification photo was not uploaded" });
    return;
  }

  const verifiedAt = new Date().toISOString();
  const { error: updateError } = await admin
    .from("listings")
    .update({
      qr_verification_photo_path: path,
      qr_verified_at: verifiedAt,
      listing_status: "active",
    })
    .eq("id", listingId);

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.status(200).json({ ok: true, qrVerifiedAt: verifiedAt, listingStatus: "active" });
});
