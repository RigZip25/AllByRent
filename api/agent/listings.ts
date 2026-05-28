import type { VercelRequest } from "@vercel/node";
import { agentHandler } from "./_lib/agentHandler";

export default agentHandler({
  action: "agent.listings",
  handler: async (req: VercelRequest) => {
    const { listingId } = (req.body ?? {}) as { listingId?: string };
    return {
      ok: true,
      data: {
        listingId: listingId?.trim() ?? "",
        optimized: false,
        changes: [],
      },
      warning: "Scaffolding only — Claude optimization not implemented yet.",
    };
  },
});

