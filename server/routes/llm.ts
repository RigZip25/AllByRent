import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../lib/cors";
import { withApiErrorHandling } from "../lib/safeHandler";
import { completeLlmChat } from "../lib/llm/complete";
import type { LlmChatRequest } from "../lib/llm/types";

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as LlmChatRequest;

  try {
    const result = await completeLlmChat(body);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM request failed";
    const status = /not configured|No LLM API key/i.test(message) ? 503 : 502;
    return res.status(status).json({ error: message });
  }
}

export default withApiErrorHandling(handler);
