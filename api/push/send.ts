import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";
import { applyCors, handleOptions } from "../_lib/cors";
import { withApiErrorHandling } from "../_lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../passkey/_lib/supabaseAdmin";
import { SUPPORT_EMAIL } from "../_lib/brand";

type SendBody = {
  toUserId: string;
  title: string;
  body: string;
  url?: string;
};

function getVapidPublicKey(): string | undefined {
  const key = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  return key?.trim() ? key.trim() : undefined;
}

function getVapidPrivateKey(): string | undefined {
  const key = process.env.VAPID_PRIVATE_KEY;
  return key?.trim() ? key.trim() : undefined;
}

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Require a logged-in caller (any user) so this endpoint can't be abused anonymously.
  const caller = await getUserFromBearer(req.headers.authorization);
  if (!caller) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = (req.body ?? {}) as Partial<SendBody>;
  const toUserId = typeof body.toUserId === "string" ? body.toUserId : "";
  const title = typeof body.title === "string" ? body.title : "";
  const message = typeof body.body === "string" ? body.body : "";
  if (!toUserId || !title || !message) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(200).json({ ok: false, reason: "Supabase admin not configured" });
    return;
  }

  const vapidPublicKey = getVapidPublicKey();
  const vapidPrivateKey = getVapidPrivateKey();
  if (!vapidPublicKey || !vapidPrivateKey) {
    res.status(200).json({ ok: false, reason: "VAPID keys not configured" });
    return;
  }

  const vapidSubject =
    process.env.VAPID_SUBJECT?.trim().replace(/^mailto:/i, "") || SUPPORT_EMAIL;
  webpush.setVapidDetails(`mailto:${vapidSubject}`, vapidPublicKey, vapidPrivateKey);

  const { data } = await admin.from("profiles").select("push_subscriptions").eq("id", toUserId).maybeSingle();
  const subs = (data?.push_subscriptions ?? []) as unknown;
  const arr = Array.isArray(subs) ? subs : [];

  const payload = JSON.stringify({
    title,
    body: message,
    url: typeof body.url === "string" ? body.url : "/",
  });

  const results: Array<{ ok: boolean; endpoint?: string; error?: string }> = [];
  for (const s of arr) {
    if (!s || typeof (s as any).endpoint !== "string") continue;
    try {
      await webpush.sendNotification(s as any, payload);
      results.push({ ok: true, endpoint: (s as any).endpoint });
    } catch (e) {
      results.push({ ok: false, endpoint: (s as any).endpoint, error: e instanceof Error ? e.message : "send failed" });
    }
  }

  res.status(200).json({ ok: true, sent: results.filter((r) => r.ok).length, results });
});

