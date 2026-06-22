export function getAgentApiKey(): string | undefined {
  const key = process.env.AGENT_API_KEY || process.env.VITE_AGENT_API_KEY;
  return key?.trim() ? key.trim() : undefined;
}

export function readAgentKeyFromRequest(req: { headers: Record<string, string | string[] | undefined> }): string | undefined {
  const h = req.headers;
  const raw = (h["x-agent-key"] ?? h["X-Agent-Key"] ?? h["x-agent-api-key"]) as string | string[] | undefined;
  if (Array.isArray(raw)) return raw[0]?.trim() || undefined;
  return raw?.trim() || undefined;
}

