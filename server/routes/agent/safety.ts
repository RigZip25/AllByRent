import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "../../lib/agent/agentHandler";

export default agentHandler({
  action: "agent.safety",
  handler: async (_req: VercelRequest) => {
    return {
      ok: true,
      data: {
        suspicious_accounts: [],
        patterns: [],
      },
      warning: "Scaffolding only — rules engine not implemented yet.",
    };
  },
});

