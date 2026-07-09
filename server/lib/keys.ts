export function getAnthropicApiKey(): string | undefined {
  return trimEnv(process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY);
}

export function getGeminiApiKey(): string | undefined {
  return trimEnv(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

export function getOpenAiApiKey(): string | undefined {
  return trimEnv(process.env.OPENAI_API_KEY);
}

/** Optional override — otherwise provider defaults (Gemini Flash, GPT-4o mini, Claude Haiku). */
export function getLlmChatModel(): string | undefined {
  return trimEnv(process.env.LLM_CHAT_MODEL);
}

export function getLlmVisionModel(): string | undefined {
  return trimEnv(process.env.LLM_VISION_MODEL || process.env.LLM_CHAT_MODEL);
}

export function getPhotoRoomApiKey(): string | undefined {
  return trimEnv(process.env.PHOTOROOM_API_KEY || process.env.VITE_PHOTOROOM_API_KEY);
}

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function getSupabaseUrl(): string | undefined {
  return trimEnv(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
}

export function getSupabaseAnonKey(): string | undefined {
  return trimEnv(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getStripeSecretKey(): string | undefined {
  return trimEnv(process.env.STRIPE_SECRET_KEY);
}

export function getStripeWebhookSecret(): string | undefined {
  return trimEnv(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripePublishableKey(): string | undefined {
  return trimEnv(
    process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
  );
}

/** USPS Web Tools USERID for Address Verify API (optional — improves US match rate). */
export function getUspsWebToolsUserId(): string | undefined {
  return trimEnv(process.env.USPS_WEBTOOLS_USER_ID || process.env.USPS_USER_ID);
}

/** True when server-side Stripe secret is configured (not a placeholder). */
export function isStripeServerConfigured(): boolean {
  const key = getStripeSecretKey();
  if (!key) return false;
  const lower = key.toLowerCase();
  return !lower.includes("placeholder") && !lower.includes("changeme");
}

export function getPasskeySecret(): string {
  return (
    process.env.PASSKEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-passkey-secret-change-me"
  );
}

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

/** Primary WebAuthn origin (must match the browser URL, no trailing slash). */
export function getPasskeyOrigin(): string {
  const configured = trimEnv(process.env.PASSKEY_ORIGIN);
  if (configured) return normalizeOrigin(configured);
  return "http://localhost:5173";
}

/** All origins accepted during verify (primary + PASSKEY_ORIGINS + local dev). */
export function getPasskeyAllowedOrigins(): string[] {
  const origins = new Set<string>([getPasskeyOrigin()]);
  const extra = trimEnv(process.env.PASSKEY_ORIGINS);
  if (extra) {
    for (const part of extra.split(",")) {
      const o = normalizeOrigin(part);
      if (o) origins.add(o);
    }
  }
  origins.add("http://localhost:5173");
  origins.add("http://127.0.0.1:5173");
  origins.add("https://localhost:5173");
  return [...origins];
}

/**
 * RP ID for WebAuthn (registrable domain, no scheme).
 * Falls back to hostname of PASSKEY_ORIGIN when PASSKEY_RP_ID is unset.
 */
export function getPasskeyRpId(): string {
  const configured = trimEnv(process.env.PASSKEY_RP_ID);
  if (configured) return configured;
  try {
    return new URL(getPasskeyOrigin()).hostname;
  } catch {
    return "localhost";
  }
}

/** Prefer configured RP ID; otherwise derive from the incoming request Origin. */
export function getPasskeyRpIdForRequest(requestOrigin?: string): string {
  const configured = trimEnv(process.env.PASSKEY_RP_ID);
  if (configured) return configured;
  if (requestOrigin) {
    try {
      return new URL(requestOrigin).hostname;
    } catch {
      // ignore
    }
  }
  return getPasskeyRpId();
}

/** Pick request Origin when allowlisted; otherwise use PASSKEY_ORIGIN. */
export function resolvePasskeyOrigin(requestOrigin?: string): string {
  if (requestOrigin) {
    const normalized = normalizeOrigin(requestOrigin);
    if (getPasskeyAllowedOrigins().includes(normalized)) {
      return normalized;
    }
  }
  return getPasskeyOrigin();
}
