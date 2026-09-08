import type { VercelResponse } from "@vercel/node";
import { APP_HOST, DEFAULT_APP_ORIGIN, MARKETING_URL, resolveConfiguredAppOrigin } from "./brand";
import { getPasskeyAllowedOrigins } from "./keys";

const ALLOWED_METHODS = "GET, POST, OPTIONS";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/** Origins allowed for browser CORS (app, marketing, local, Capacitor). */
export function getAllowedCorsOrigins(): string[] {
  const origins = new Set<string>(getPasskeyAllowedOrigins());
  origins.add(DEFAULT_APP_ORIGIN);
  origins.add(`https://${APP_HOST}`);
  origins.add(MARKETING_URL);
  origins.add("https://www.evorios.com");
  origins.add(resolveConfiguredAppOrigin());
  const appOrigin = process.env.APP_ORIGIN?.trim() || process.env.VITE_APP_ORIGIN?.trim();
  if (appOrigin) origins.add(normalizeOrigin(appOrigin));
  const extra = process.env.CORS_ALLOWED_ORIGINS?.trim();
  if (extra) {
    for (const part of extra.split(",")) {
      const o = normalizeOrigin(part);
      if (o) origins.add(o);
    }
  }
  return [...origins];
}

export function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin || typeof origin !== "string") return false;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return getAllowedCorsOrigins().includes(normalized);
}

export function applyCors(res: VercelResponse, origin?: string) {
  if (origin && isAllowedCorsOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, anthropic-version, x-ops-key, x-agent-key, x-agent-api-key, x-cron-secret",
  );
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
