import { getAdminClient } from "../passkey/_lib/supabaseAdmin";
import { randomUUID } from "node:crypto";

function safeUuid(): string {
  try {
    return randomUUID();
  } catch {
    // Should never happen in Node 20+, but keep a fallback for safety.
    return "00000000-0000-0000-0000-000000000000";
  }
}

export async function logAgentAction(input: {
  actor?: string;
  action: string;
  endpoint: string;
  request?: unknown;
  result?: unknown;
  ok?: boolean;
}): Promise<void> {
  const admin = getAdminClient();
  if (!admin) return;

  const row = {
    id: safeUuid(),
    actor: input.actor ?? "agent",
    action: input.action,
    endpoint: input.endpoint,
    request: input.request ?? {},
    result: input.result ?? {},
    ok: input.ok ?? true,
  };

  await admin.from("agent_logs").insert(row);
}

