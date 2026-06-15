import type { VercelRequest } from "@vercel/node";

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function isCronAuthorized(req: VercelRequest): boolean {
  const secret = trimEnv(process.env.CRON_SECRET);
  if (!secret) return false;
  const header = req.headers.authorization;
  if (header === `Bearer ${secret}`) return true;
  const cronHeader = req.headers["x-cron-secret"];
  return typeof cronHeader === "string" && cronHeader === secret;
}
