import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "./_lib/agentHandler";
import { getAdminClient } from "../passkey/_lib/supabaseAdmin";

export default agentHandler({
  action: "agent.activity",
  handler: async (req: VercelRequest) => {
    const limit = Math.max(1, Math.min(200, Number(req.body?.limit ?? 50)));
    const admin = getAdminClient();
    if (!admin) {
      return { ok: true, data: { items: [] }, warning: "Supabase admin not configured." };
    }
    const { data } = await admin
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    return { ok: true, data: { items: data ?? [] } };
  },
});

