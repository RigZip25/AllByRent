export function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
}

export function getPhotoRoomApiKey(): string | undefined {
  return process.env.PHOTOROOM_API_KEY || process.env.VITE_PHOTOROOM_API_KEY;
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

export function getPasskeySecret(): string {
  return (
    process.env.PASSKEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-passkey-secret-change-me"
  );
}

export function getPasskeyRpId(): string {
  return process.env.PASSKEY_RP_ID || "localhost";
}

export function getPasskeyOrigin(): string {
  return process.env.PASSKEY_ORIGIN || "http://localhost:5173";
}
