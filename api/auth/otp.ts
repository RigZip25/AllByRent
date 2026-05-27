import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../_lib/cors";
import { getSupabaseAnonKey, getSupabaseUrl } from "../_lib/keys";

function normalizeBaseUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/$/, "");
}

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

  let body: { email?: string; redirectTo?: string };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return res.status(400).json({ error: "email is required" });

  const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo.trim() : undefined;

  try {
    const upstream = await fetch(`${baseUrl}/auth/v1/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        email,
        options: {
          email_redirect_to: redirectTo || undefined,
          should_create_user: true,
        },
      }),
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
