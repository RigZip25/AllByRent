import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../lib/cors";
import { withApiErrorHandling } from "../lib/safeHandler";
import { completeLlmChat } from "../lib/llm/complete";
import type { LlmChatRequest, LlmMessage } from "../lib/llm/types";

function readParsedBody(req: VercelRequest): unknown {
  if (typeof req.body === "string") {
    const trimmed = req.body.trim();
    if (!trimmed) return {};
    return JSON.parse(trimmed) as unknown;
  }
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  return {};
}

function normalizeMessages(raw: unknown): LlmMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof content === "string") {
        const text = content.trim();
        return text ? { role, content: text } : null;
      }
      if (Array.isArray(content) && content.length > 0) {
        return { role, content: content as LlmMessage["content"] };
      }
      return null;
    })
    .filter((message): message is LlmMessage => Boolean(message));
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let parsed: unknown;
  try {
    parsed = readParsedBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const raw = (parsed && typeof parsed === "object" ? parsed : {}) as Partial<LlmChatRequest>;
  const messages = normalizeMessages(raw.messages);
  if (messages.length === 0) {
    return res.status(400).json({ error: "messages are required" });
  }

  const maxTokens = Number(raw.max_tokens);
  const body: LlmChatRequest = {
    system: typeof raw.system === "string" ? raw.system : undefined,
    messages,
    max_tokens: Number.isFinite(maxTokens) && maxTokens > 0 ? maxTokens : 900,
    model: typeof raw.model === "string" ? raw.model : undefined,
    purpose: raw.purpose === "vision" ? "vision" : "chat",
  };

  try {
    const result = await completeLlmChat(body);
    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM request failed";
    const status = /not configured|No LLM API key/i.test(message)
      ? 503
      : /required|must be/i.test(message)
        ? 400
        : 502;
    return res.status(status).json({ error: message });
  }
}

export default withApiErrorHandling(handler);
