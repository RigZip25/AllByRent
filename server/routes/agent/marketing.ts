import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "../../lib/agent/agentHandler";

export default agentHandler({
  action: "agent.marketing",
  handler: async (req: VercelRequest) => {
    const { city } = (req.body ?? {}) as { city?: string };
    return {
      ok: true,
      data: {
        city: city?.trim() ?? "",
        content: [],
        scheduled: false,
      },
      warning: "Scaffolding only — scheduling not implemented yet.",
    };
  },
});

