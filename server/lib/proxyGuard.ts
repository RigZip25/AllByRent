import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserFromBearer } from "./passkey/supabaseAdmin";

type RateBucket = {
  resetAt: number;
  count: number;
};

/** In-memory buckets — fine for single serverless isolate; best-effort across cold starts. */
const buckets = new Map<string, RateBucket>();

export type ProxyRateLimitOpts = {
  /** Unique route key, e.g. "llm" | "photoroom". */
  route: string;
  /** Max requests per window when authenticated. */
  maxAuthed: number;
  /** Max requests per window when anonymous (stricter). */
  maxAnon: number;
  /** Window length in ms. */
  windowMs?: number;
  /** If true, reject when no Bearer user. */
  requireAuth?: boolean;
};

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(",")[0]?.trim() || "unknown";
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return "unknown";
}

function takeToken(key: string, max: number, windowMs: number): {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
} {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { resetAt: now + windowMs, count: 0 };
    buckets.set(key, bucket);
  }
  if (bucket.count >= max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, max - bucket.count),
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/**
 * Auth (optional/required) + per-user or per-IP rate limit for open proxies.
 * Returns userId when Bearer is valid; null response already written on failure.
 */
export async function enforceProxyGuard(
  req: VercelRequest,
  res: VercelResponse,
  opts: ProxyRateLimitOpts,
): Promise<{ userId: string | null } | null> {
  const windowMs = opts.windowMs ?? 60_000;
  const user = await getUserFromBearer(
    typeof req.headers.authorization === "string" ? req.headers.authorization : undefined,
  );

  if (opts.requireAuth && !user) {
    res.status(401).json({ error: "Sign in required" });
    return null;
  }

  const authed = Boolean(user?.id);
  const max = authed ? opts.maxAuthed : opts.maxAnon;
  const subject = authed ? `u:${user!.id}` : `ip:${clientIp(req)}`;
  const key = `${opts.route}:${subject}`;
  const result = takeToken(key, max, windowMs);

  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(result.remaining));

  if (!result.ok) {
    res.setHeader("Retry-After", String(result.retryAfterSec));
    res.status(429).json({
      error: "Rate limit exceeded. Please try again shortly.",
      retryAfterSec: result.retryAfterSec,
    });
    return null;
  }

  return { userId: user?.id ?? null };
}
