import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { pushInAppNotification } from "./inAppNotifications";

export type NotificationType = "booking_request" | "general";

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
  }
}

