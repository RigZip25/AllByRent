import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  isWebPushSendConfigured,
} from "../../lib/vapidKeys";

async function vapidPublicHandler(req: VercelRequest, res: VercelResponse) {
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);
  if (handleOptions(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const publicKey = getVapidPublicKey();
  const sendConfigured = isWebPushSendConfigured();

  res.status(200).json({
    ok: Boolean(publicKey),
    publicKey: publicKey ?? null,
    sendConfigured,
    hasPrivateKey: Boolean(getVapidPrivateKey()),
  });
}

export default withApiErrorHandling(vapidPublicHandler, "push/vapid-public");
