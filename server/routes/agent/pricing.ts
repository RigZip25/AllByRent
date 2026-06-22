import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "../../lib/agent/agentHandler";

export default agentHandler({
  action: "agent.pricing",
  handler: async (req: VercelRequest) => {
    const { city, category, commission_rate } = (req.body ?? {}) as {
      city?: string;
      category?: string;
      commission_rate?: number;
    };
    return {
      ok: true,
      data: {
        city: city?.trim() ?? "",
        category: category?.trim() ?? "",
        commission_rate: typeof commission_rate === "number" ? commission_rate : null,
        applied: false,
      },
      warning: "Scaffolding only — commission tuning not implemented yet.",
    };
  },
});

