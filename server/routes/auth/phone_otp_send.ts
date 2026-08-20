import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { getSupabaseAnonKey, getSupabaseUrl } from "../../lib/keys";
import { getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import {
  isPhoneOtpEnabled,
  looksLikePhoneOtpTechDump,
  phoneOtpSetupMessage,
  sanitizePhoneOtpClientError,
} from "../../lib/phoneOtpConfig";
import { normalizePhoneToE164 } from "../../lib/phoneE164";

const GOTRUE_API_VERSION = "2024-01-01";

/**
 * Send SMS OTP to link/verify phone on the signed-in user.
 * Uses GoTrue PUT /user with access token (updateUser → phone_change flow).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isPhoneOtpEnabled()) {
    const message = phoneOtpSetupMessage();
    return res.status(503).json({
      ok: false,
      error: message,
      setupRequired: true,
      code: "phone_otp_not_configured",
    });
  }

  const baseUrl = getSupabaseUrl()?.replace(/\/$/, "");
  const anonKey = getSupabaseAnonKey()?.trim();
  if (!baseUrl || !anonKey) {
    return res.status(503).json({
      ok: false,
      error: "Supabase is not configured on the server.",
      setupRequired: true,
      code: "supabase_missing",
    });
  }

  const authHeader = typeof req.headers.authorization === "string" ? req.headers.authorization : undefined;
  const user = await getUserFromBearer(authHeader);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Sign in required.", code: "unauthorized" });
  }

  let body: { phone?: string };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const phone = normalizePhoneToE164(typeof body.phone === "string" ? body.phone : "");
  if (!phone) {
    return res.status(400).json({
      ok: false,
      error: "Enter a valid phone number with country code (E.164), e.g. +15551234567.",
      code: "invalid_phone",
    });
  }

  const token = authHeader!.slice("Bearer ".length).trim();

  try {
    const upstream = await fetch(`${baseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        "X-Supabase-Api-Version": GOTRUE_API_VERSION,
      },
      body: JSON.stringify({ phone }),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      let message = text || upstream.statusText;
      try {
        const parsed = JSON.parse(text) as { msg?: string; error_description?: string; message?: string };
        message = parsed.msg ?? parsed.error_description ?? parsed.message ?? message;
      } catch {
        // keep raw
      }
      const looksLikeProvider = looksLikePhoneOtpTechDump(message);
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({
        ok: false,
        // Never dump Twilio / provider / env setup text to clients.
        error: phoneOtpSetupMessage(),
        setupRequired: looksLikeProvider,
        code: looksLikeProvider ? "phone_provider_missing" : "upstream_error",
      });
    }

    return res.status(200).json({ ok: true, phone });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return res.status(502).json({
      ok: false,
      error: sanitizePhoneOtpClientError(message, "Could not send SMS code. Try again shortly."),
      code: "network_error",
    });
  }
}
