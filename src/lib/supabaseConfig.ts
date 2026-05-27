export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

function trimEnv(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

/** Normalize VITE_* env vars (trim, ensure https, strip trailing slash). */
export function getSupabaseConfig(): SupabasePublicConfig | null {
  const urlRaw = trimEnv(import.meta.env.VITE_SUPABASE_URL);
  const anonKey = trimEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (!urlRaw || !anonKey) return null;

  let url = urlRaw;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/$/, "");

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith(".supabase.co")) {
      return null;
    }
  } catch {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
