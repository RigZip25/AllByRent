import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";

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
    res.status(503).json({
      ok: false,
      reason: "Account deletion requires SUPABASE_SERVICE_ROLE_KEY on the server.",
    });
    return;
  }

  await admin
    .from("profiles")
    .update({
      display_name: "Deleted user",
      phone: null,
      stripe_connect_account_id: null,
      stripe_payouts_enabled: false,
      stripe_bank_last4: null,
    })
    .eq("id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    res.status(500).json({ ok: false, reason: error.message });
    return;
  }

  res.status(200).json({
    ok: true,
    message: "Your account was permanently deleted.",
  });
});
