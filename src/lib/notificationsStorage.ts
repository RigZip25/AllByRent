import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { pushInAppNotification } from "./inAppNotifications";
import type { Session } from "@supabase/supabase-js";

async function trySendWebPush(input: {
  recipientId: string;
  title: string;
  body: string;
}): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const session = data.session as Session | null;
    if (!session?.access_token) return;
    await fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        toUserId: input.recipientId,
        title: input.title,
        body: input.body,
        url: "/?screen=notifications",
      }),
    });
  } catch {
    // ignore; in-app notification already covers the UX
  }
}

export type NotificationType = "booking_request" | "general";

export type Notification = {
  id: string;
  recipientId: string;
  actorId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type RemoteNotificationInsert = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  read_at: string | null;
  created_at?: string;
};

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `notif-${Date.now()}`;
}

function rowToNotification(row: {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    actorId: row.actor_id,
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function createNotificationRemote(params: {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
}): Promise<void> {
  // Local fallback is still useful for demo/single-device flows.
  pushInAppNotification({
    type: params.type === "booking_request" ? "booking_request" : "general",
    title: params.title,
    body: params.body,
  });

  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const row: RemoteNotificationInsert = {
    id: safeUuid(),
    recipient_id: params.recipientId,
    actor_id: params.actorId ?? null,
    type: params.type,
    title: params.title,
    body: params.body,
    read_at: null,
  };

  // Table is created in a later migration; insertion is best-effort.
  const { error } = await supabase.from("notifications").insert(row);
  if (error) {
    // ignore; local notification already pushed
  } else {
    void trySendWebPush({
      recipientId: params.recipientId,
      title: params.title,
      body: params.body,
    });
  }
}

export async function fetchNotificationsRemote(recipientId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", recipientId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as unknown as Array<{
    id: string;
    recipient_id: string;
    actor_id: string | null;
    type: NotificationType;
    title: string;
    body: string;
    read_at: string | null;
    created_at: string;
  }>).map(rowToNotification);
}

export async function markNotificationReadRemote(
  recipientId: string,
  notificationId: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", recipientId);
  if (error) {
    // ignore
  }
}

