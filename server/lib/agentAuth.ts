import type { VercelRequest } from "@vercel/node";
import { getAgentApiKey, readAgentKeyFromRequest } from "./agentKey";

export function requireAgentKey(req: VercelRequest): { ok: true } | { ok: false; status: number; error: string } {
  const configured = getAgentApiKey();
  if (!configured) {
    return { ok: false, status: 503, error: "Agent API key not configured" };
  }
  const provided = readAgentKeyFromRequest(req);
  if (!provided || provided !== configured) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

