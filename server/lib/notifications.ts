import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/** In-app notification, written with the service role. Push is a separate sender. */
export async function insertNotification(
  admin: SupabaseClient,
  input: {
    recipientId: string;
    actorId?: string | null;
    type: string;
    title: string;
    body: string;
  },
): Promise<void> {
  await admin.from("notifications").insert({
    id: randomUUID(),
    recipient_id: input.recipientId,
    actor_id: input.actorId ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    read_at: null,
  });
}
