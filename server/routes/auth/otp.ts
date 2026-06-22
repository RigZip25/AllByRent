import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { getSupabaseAnonKey, getSupabaseUrl } from "../../lib/keys";

const GOTRUE_API_VERSION = "2024-01-01";

function normalizeBaseUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/$/, "");
}

/**
 * Proxy for Supabase Auth `signInWithOtp` (POST /auth/v1/otp).
 * Must match @supabase/auth-js body shape — not signUp, not nested `options`.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);

  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const baseUrl = normalizeBaseUrl(getSupabaseUrl());
  const anonKey = getSupabaseAnonKey()?.trim();
  if (!baseUrl || !anonKey) {
    return res.status(503).json({
      error: "Supabase is not configured on the server (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).",
    });
  }

  let body: {
    email?: string;
    redirectTo?: string;
    code_challenge?: string;
    code_challenge_method?: string;
  };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return res.status(400).json({ error: "email is required" });

  const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo.trim() : undefined;
  const codeChallenge =
    typeof body.code_challenge === "string" ? body.code_challenge.trim() : undefined;
  const codeChallengeMethod =
    typeof body.code_challenge_method === "string" ? body.code_challenge_method.trim() : undefined;

  const otpUrl = new URL(`${baseUrl}/auth/v1/otp`);
  if (redirectTo) {
    otpUrl.searchParams.set("redirect_to", redirectTo);
  }

  const gotrueBody: Record<string, unknown> = {
    email,
    data: {},
    create_user: true,
    gotrue_meta_security: {},
  };
  if (codeChallenge) gotrueBody.code_challenge = codeChallenge;
  if (codeChallengeMethod) gotrueBody.code_challenge_method = codeChallengeMethod;

  try {
    const upstream = await fetch(otpUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "X-Supabase-Api-Version": GOTRUE_API_VERSION,
      },
      body: JSON.stringify(gotrueBody),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      let message = text || upstream.statusText;
      try {
        const parsed = JSON.parse(text) as { msg?: string; error_description?: string };
        message = parsed.msg ?? parsed.error_description ?? message;
      } catch {
        // keep raw text
      }
      return res.status(upstream.status).json({ error: message });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    let hostname = baseUrl;
    try {
      hostname = new URL(baseUrl).hostname;
    } catch {
      // ignore
    }
    const hint =
      /ENOTFOUND|getaddrinfo/i.test(message)
        ? `Cannot resolve Supabase host (${hostname}). Use the Project URL from Supabase → Settings → API and redeploy Vercel.`
        : message;
    return res.status(502).json({ error: hint });
  }
}
