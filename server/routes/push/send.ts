import type { VercelRequest, VercelResponse } from "@vercel/node";
import webpush from "web-push";
import { applyCors, handleOptions } from "../../lib/cors";
import { withApiErrorHandling } from "../../lib/safeHandler";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import { SUPPORT_EMAIL } from "../../lib/brand";

type SendBody = {
  toUserId: string;
  title: string;
  body: string;
  url?: string;
  notificationId?: string;
};

function getVapidPublicKey(): string | undefined {
  const key = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  return key?.trim() ? key.trim() : undefined;
}

function getVapidPrivateKey(): string | undefined {
  const key = process.env.VAPID_PRIVATE_KEY;
  return key?.trim() ? key.trim() : undefined;
}

async function callerMayNotifyRecipient(
  admin: NonNullable<ReturnType<typeof getAdminClient>>,
  callerId: string,
  toUserId: string,
  notificationId: string,
): Promise<boolean> {
  const { data: notification } = await admin
    .from("notifications")
    .select("actor_id, recipient_id, created_at")
    .eq("id", notificationId)
    .maybeSingle();

  if (
    notification?.actor_id === callerId &&
    notification.recipient_id === toUserId
  ) {
    return true;
  }

  const { data: rental } = await admin
    .from("rentals")
    .select("id")
    .or(
      `and(owner_id.eq.${callerId},renter_id.eq.${toUserId}),and(owner_id.eq.${toUserId},renter_id.eq.${callerId})`,
    )
    .limit(1)
    .maybeSingle();

  return Boolean(rental?.id);
}

export default withApiErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  applyCors(res, typeof req.headers.origin === "string" ? req.headers.origin : undefined);

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const caller = await getUserFromBearer(req.headers.authorization);
  if (!caller) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = (req.body ?? {}) as Partial<SendBody>;
  const toUserId = typeof body.toUserId === "string" ? body.toUserId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.body === "string" ? body.body.trim() : "";
  const notificationId = typeof body.notificationId === "string" ? body.notificationId.trim() : "";
  if (!toUserId || !title || !message || !notificationId) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  if (toUserId === caller.id) {
    res.status(400).json({ error: "Cannot push to self" });
    return;
  }

  const admin = getAdminClient();
  if (!admin) {
    res.status(200).json({ ok: false, reason: "Supabase admin not configured" });
    return;
  }

  const allowed = await callerMayNotifyRecipient(admin, caller.id, toUserId, notificationId);
  if (!allowed) {
    res.status(403).json({ error: "Forbidden" });
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
    if (!s || typeof (s as { endpoint?: string }).endpoint !== "string") continue;
    try {
      await webpush.sendNotification(s as webpush.PushSubscription, payload);
      results.push({ ok: true, endpoint: (s as { endpoint: string }).endpoint });
    } catch (e) {
      results.push({
        ok: false,
        endpoint: (s as { endpoint: string }).endpoint,
        error: e instanceof Error ? e.message : "send failed",
      });
    }
  }

  res.status(200).json({ ok: true, sent: results.filter((r) => r.ok).length, results });
});
