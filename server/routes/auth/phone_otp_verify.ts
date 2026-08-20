import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, handleOptions } from "../../lib/cors";
import { getSupabaseAnonKey, getSupabaseUrl } from "../../lib/keys";
import { getAdminClient, getUserFromBearer } from "../../lib/passkey/supabaseAdmin";
import {
  isPhoneOtpEnabled,
  looksLikePhoneOtpTechDump,
  phoneOtpSetupMessage,
  sanitizePhoneOtpClientError,
} from "../../lib/phoneOtpConfig";
import { normalizePhoneToE164, phoneDigitsForDisplay } from "../../lib/phoneE164";

const GOTRUE_API_VERSION = "2024-01-01";

/**
 * Verify SMS OTP (phone_change), then mark profiles.phone_verified (+ phone_verified_at)
 * via service role.
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
    return res.status(503).json({
      ok: false,
      error: phoneOtpSetupMessage(),
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

  let body: { phone?: string; token?: string };
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  const phone = normalizePhoneToE164(typeof body.phone === "string" ? body.phone : "");
  const otp = typeof body.token === "string" ? body.token.replace(/\D/g, "").slice(0, 8) : "";
  if (!phone) {
    return res.status(400).json({ ok: false, error: "Phone is required.", code: "invalid_phone" });
  }
  if (otp.length < 6) {
    return res.status(400).json({ ok: false, error: "Enter the SMS code (6–8 digits).", code: "invalid_otp" });
  }

  try {
    const upstream = await fetch(`${baseUrl}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "X-Supabase-Api-Version": GOTRUE_API_VERSION,
      },
      body: JSON.stringify({
        type: "phone_change",
        phone,
        token: otp,
      }),
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
      const looksLikeDump = looksLikePhoneOtpTechDump(message);
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({
        ok: false,
        error: looksLikeDump
          ? phoneOtpSetupMessage()
          : sanitizePhoneOtpClientError(message, "Verification failed. Check the code and try again."),
        code: looksLikeDump ? "phone_provider_missing" : "verify_failed",
        setupRequired: looksLikeDump || undefined,
      });
    }

    const displayPhone = phoneDigitsForDisplay(phone);
    const verifiedAt = new Date().toISOString();
    const admin = getAdminClient();
    if (admin) {
      const { error } = await admin
        .from("profiles")
        .update({
          phone: displayPhone || phone,
          phone_verified: true,
          phone_verified_at: verifiedAt,
        })
        .eq("id", user.id);
      if (error) {
        return res.status(500).json({
          ok: false,
          error: sanitizePhoneOtpClientError(
            error.message,
            "OTP verified, but saving phone verification failed. Try again shortly.",
          ),
          code: "profile_update_failed",
        });
      }
    } else {
      return res.status(503).json({
        ok: false,
        error: phoneOtpSetupMessage(),
        setupRequired: true,
        code: "service_role_missing",
      });
    }

    return res.status(200).json({
      ok: true,
      phone: displayPhone || phone,
      phone_verified: true,
      phone_verified_at: verifiedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream request failed";
    return res.status(502).json({
      ok: false,
      error: sanitizePhoneOtpClientError(message, "Verification failed. Try again shortly."),
      code: "network_error",
    });
  }
}
