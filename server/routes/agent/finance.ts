import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "../../lib/agent/agentHandler";

export default agentHandler({
  action: "agent.finance",
  handler: async (_req: VercelRequest) => {
    return {
      ok: true,
      data: {
        pnl: null,
        gmv_by_period: [],
        revenue_forecast: null,
      },
      warning: "Scaffolding only — finance model not implemented yet.",
    };
  },
});

