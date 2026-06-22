import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "../../lib/agent/agentHandler";
import { getAdminClient } from "../../lib/passkey/supabaseAdmin";
import { randomUUID } from "node:crypto";

export default agentHandler({
  action: "orchestrator.run",
  handler: async (req: VercelRequest) => {
    const goal = (req.body?.goal as string | undefined)?.trim() ?? null;

    const admin = getAdminClient();
    if (admin) {
      await admin.from("orchestrator_logs").insert({
        id: randomUUID(),
        goal,
        actions_taken: [],
        results: { ok: true, note: "Scaffolding only — no actions executed." },
        next_steps: "Implement agent intelligence + execution loop.",
      });
    }

    return {
      ok: true,
      data: {
        goal,
        actions_taken: [],
        next_steps: ["Implement hourly cron", "Collect /api/agent/* reports", "Prioritize + execute"],
      },
      warning: "Scaffolding only — orchestrator loop not implemented yet.",
    };
  },
});

