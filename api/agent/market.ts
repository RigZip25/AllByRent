import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "./_lib/agentHandler";

export default agentHandler({
  action: "agent.market",
  handler: async (req: VercelRequest) => {
    const city = (req.body?.city as string | undefined)?.trim() ?? "";
    return {
      ok: true,
      data: {
        city,
        demand_analysis: [],
        trending_categories: [],
        supply_gaps: [],
      },
      warning: "Scaffolding only — intelligence layer not implemented yet.",
    };
  },
});

