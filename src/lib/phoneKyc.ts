import { getAccessToken } from "./stripePayments";
import {
  isPhoneOtpClientEnabled,
  normalizePhoneToE164,
  phoneDigitsForDisplay,
  phoneOtpDevSetupHint,
  phoneOtpSoftUnavailableMessage,
  sanitizePhoneOtpUserReason,
} from "./phoneE164";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { fetchRemoteProfile } from "./supabaseProfile";
import { loadUserProfile, saveUserProfile, updateProfileFields } from "./userProfileStorage";

export type PhoneKycResult =
  | { ok: true; phone: string; phoneVerifiedAt?: string }
  | { ok: false; reason: string; setupRequired?: boolean; code?: string };

function applyLocalVerified(phone: string): void {
  const display = phoneDigitsForDisplay(phone);
  const profile = loadUserProfile();
  const next = {
    ...profile,
    phone: display || phone,
    verification: { ...profile.verification, phone: true },
  };
  saveUserProfile(next);
}

function applyLocalUnverifiedPhone(phone: string): void {
  const display = phoneDigitsForDisplay(phone);
  const profile = loadUserProfile();
  saveUserProfile({
    ...profile,
    phone: display || phone,
    verification: { ...profile.verification, phone: false },
  });
}

export function isLocalPhoneVerified(): boolean {
  return Boolean(loadUserProfile().verification.phone);
}

export async function refreshPhoneVerifiedFromRemote(userId: string | null): Promise<boolean> {
  if (!userId) return isLocalPhoneVerified();
  const remote = await fetchRemoteProfile(userId);
  if (!remote) return isLocalPhoneVerified();
  const verified = Boolean(remote.phone_verified || remote.phone_verified_at);
  const profile = loadUserProfile();
  saveUserProfile({
    ...profile,
    phone: remote.phone ? phoneDigitsForDisplay(remote.phone) : profile.phone,
    verification: { ...profile.verification, phone: verified },
  });
  return verified;
}

function failPhoneKyc(
  reason: string,
  extras?: { setupRequired?: boolean; code?: string },
): PhoneKycResult {
  return {
    ok: false,
    reason: sanitizePhoneOtpUserReason(reason),
    setupRequired: extras?.setupRequired,
    code: extras?.code,
  };
}

export async function sendPhoneVerificationCode(phoneInput: string): Promise<PhoneKycResult> {
  if (!isSupabaseConfigured()) {
    return failPhoneKyc("Supabase is not configured.", {
      setupRequired: true,
      code: "supabase_missing",
    });
  }
  if (!isPhoneOtpClientEnabled()) {
    if (import.meta.env.DEV) {
      console.info("[phoneKyc]", phoneOtpDevSetupHint());
    }
    return failPhoneKyc(phoneOtpSoftUnavailableMessage(), {
      setupRequired: true,
      code: "phone_otp_not_configured",
    });
  }

  const e164 = normalizePhoneToE164(phoneInput);
  if (!e164) {
    return failPhoneKyc("Enter a valid phone number with country code (e.g. +15551234567).", {
      code: "invalid_phone",
    });
  }

  const token = await getAccessToken();
  if (!token) {
    return failPhoneKyc("Sign in required.", { code: "unauthorized" });
  }

  applyLocalUnverifiedPhone(e164);

  try {
    const res = await fetch("/api/auth/phone_otp_send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone: e164 }),
    });
    let payload: {
      ok?: boolean;
      error?: string;
      setupRequired?: boolean;
      code?: string;
      phone?: string;
    } = {};
    try {
      payload = (await res.json()) as typeof payload;
    } catch {
      // ignore
    }

    if (res.ok && payload.ok !== false) {
      return { ok: true, phone: payload.phone || e164 };
    }

    if (res.status === 404 || res.status === 502) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ phone: e164 });
        if (!error) return { ok: true, phone: e164 };
        if (import.meta.env.DEV) {
          console.info("[phoneKyc]", error.message || phoneOtpDevSetupHint());
        }
        // Never forward raw Supabase/Twilio client errors to the UI.
        return failPhoneKyc(phoneOtpSoftUnavailableMessage(), {
          setupRequired: true,
          code: "client_update_failed",
        });
      }
    }

    if (import.meta.env.DEV && (payload.setupRequired || payload.code === "phone_otp_not_configured")) {
      console.info("[phoneKyc]", phoneOtpDevSetupHint());
    }

    if (
      payload.setupRequired ||
      payload.code === "phone_otp_not_configured" ||
      payload.code === "phone_provider_missing" ||
      payload.code === "service_role_missing"
    ) {
      return failPhoneKyc(phoneOtpSoftUnavailableMessage(), {
        setupRequired: true,
        code: payload.code || "phone_otp_not_configured",
      });
    }

    return failPhoneKyc(payload.error || `Could not send SMS code (${res.status}).`, {
      setupRequired: Boolean(payload.setupRequired),
      code: payload.code,
    });
  } catch (error) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error: updateError } = await supabase.auth.updateUser({ phone: e164 });
        if (!updateError) return { ok: true, phone: e164 };
        if (import.meta.env.DEV) {
          console.info("[phoneKyc]", updateError.message || phoneOtpDevSetupHint());
        }
        return failPhoneKyc(phoneOtpSoftUnavailableMessage(), {
          setupRequired: true,
          code: "client_fallback_failed",
        });
      } catch {
        // fall through
      }
    }
    return failPhoneKyc(
      error instanceof Error ? error.message : "Network error sending SMS.",
      { code: "network_error" },
    );
  }
}

export async function verifyPhoneVerificationCode(
  phoneInput: string,
  otpInput: string,
): Promise<PhoneKycResult> {
  if (!isSupabaseConfigured()) {
    return failPhoneKyc("Supabase is not configured.", { setupRequired: true });
  }

  const e164 = normalizePhoneToE164(phoneInput);
  const otp = otpInput.replace(/\D/g, "").slice(0, 8);
  if (!e164) {
    return failPhoneKyc("Phone is required.", { code: "invalid_phone" });
  }
  if (otp.length < 6) {
    return failPhoneKyc("Enter the SMS code (6–8 digits).", { code: "invalid_otp" });
  }

  const token = await getAccessToken();
  if (!token) {
    return failPhoneKyc("Sign in required.", { code: "unauthorized" });
  }

  try {
    const res = await fetch("/api/auth/phone_otp_verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phone: e164, token: otp }),
    });
    let payload: {
      ok?: boolean;
      error?: string;
      setupRequired?: boolean;
      code?: string;
      phone?: string;
      phone_verified_at?: string;
    } = {};
    try {
      payload = (await res.json()) as typeof payload;
    } catch {
      // ignore
    }

    if (res.ok && payload.ok !== false) {
      applyLocalVerified(payload.phone || e164);
      return {
        ok: true,
        phone: payload.phone || e164,
        phoneVerifiedAt: payload.phone_verified_at,
      };
    }

    if (res.status === 404 || res.status === 502) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.verifyOtp({
          phone: e164,
          token: otp,
          type: "phone_change",
        });
        if (!error) {
          applyLocalVerified(e164);
          return {
            ok: true,
            phone: e164,
          };
        }
        if (import.meta.env.DEV) {
          console.info("[phoneKyc]", error.message || phoneOtpDevSetupHint());
        }
        return failPhoneKyc(
          sanitizePhoneOtpUserReason(error.message, "Verification failed. Check the code and try again."),
          { code: "client_verify_failed" },
        );
      }
    }

    if (
      payload.setupRequired ||
      payload.code === "phone_otp_not_configured" ||
      payload.code === "phone_provider_missing" ||
      payload.code === "service_role_missing"
    ) {
      return failPhoneKyc(phoneOtpSoftUnavailableMessage(), {
        setupRequired: true,
        code: payload.code || "phone_otp_not_configured",
      });
    }

    return failPhoneKyc(payload.error || `Verification failed (${res.status}).`, {
      setupRequired: Boolean(payload.setupRequired),
      code: payload.code,
    });
  } catch (error) {
    return failPhoneKyc(
      error instanceof Error ? error.message : "Network error verifying SMS.",
      { code: "network_error" },
    );
  }
}

export { updateProfileFields };
