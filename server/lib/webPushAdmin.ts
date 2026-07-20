import webpush from "web-push";
import { SUPPORT_EMAIL } from "./brand";
import { getAdminClient } from "./passkey/supabaseAdmin";

function getVapidPublicKey(): string | undefined {
  const key = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  return key?.trim() ? key.trim() : undefined;
}

function getVapidPrivateKey(): string | undefined {
  const key = process.env.VAPID_PRIVATE_KEY;
  return key?.trim() ? key.trim() : undefined;
}

export type AdminPushResult = {
  ok: boolean;
  sent: number;
  reason?: string;
};

/** Service-role web-push (cron / orchestrator). Does not require a user JWT. */
export async function sendAdminWebPush(params: {
  toUserId: string;
  title: string;
  body: string;
  url?: string;
}): Promise<AdminPushResult> {
  const admin = getAdminClient();
  if (!admin) return { ok: false, sent: 0, reason: "admin unavailable" };

  const vapidPublicKey = getVapidPublicKey();
  const vapidPrivateKey = getVapidPrivateKey();
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { ok: false, sent: 0, reason: "VAPID keys not configured" };
  }

  const vapidSubject =
    process.env.VAPID_SUBJECT?.trim().replace(/^mailto:/i, "") || SUPPORT_EMAIL;
  webpush.setVapidDetails(`mailto:${vapidSubject}`, vapidPublicKey, vapidPrivateKey);

  const { data } = await admin
    .from("profiles")
    .select("push_subscriptions")
    .eq("id", params.toUserId)
    .maybeSingle();

  const subs = Array.isArray(data?.push_subscriptions) ? data.push_subscriptions : [];
  const payload = JSON.stringify({
    title: params.title,
    body: params.body,
    url: params.url ?? "/",
  });

  let sent = 0;
  for (const sub of subs) {
    if (!sub || typeof (sub as { endpoint?: string }).endpoint !== "string") continue;
    try {
      await webpush.sendNotification(sub as webpush.PushSubscription, payload);
      sent += 1;
    } catch {
      /* drop dead endpoints silently for now */
    }
  }

  return { ok: true, sent };
}
