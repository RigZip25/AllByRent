import type { VercelResponse } from "@vercel/node";

const ALLOWED_METHODS = "POST, OPTIONS";

export function applyCors(res: VercelResponse, origin?: string) {
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, anthropic-version");
}

export function handleOptions(
  req: { method?: string; headers: { origin?: string | string[] } },
  res: VercelResponse,
): boolean {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    applyCors(res, typeof origin === "string" ? origin : undefined);
    res.status(204).end();
    return true;
  }
  return false;
}
