/**
 * SSRF guard for `/api/og/image` remote photo fetch.
 * Only Supabase storage / CDN hosts (and the configured project URL) are allowed.
 */
export function isAllowedOgPhotoUrl(photoUrl: string, supabaseUrl?: string): boolean {
  if (!/^https:\/\//i.test(photoUrl)) return false;
  let parsed: URL;
  try {
    parsed = new URL(photoUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  const configured = (
    supabaseUrl ??
    process.env.VITE_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  ).trim();
  if (configured) {
    try {
      const originHost = new URL(configured).hostname.toLowerCase();
      if (host === originHost && path.includes("/storage/")) return true;
    } catch {
      // ignore bad env
    }
  }

  if (
    (host.endsWith(".supabase.co") || host.endsWith(".supabase.in")) &&
    path.includes("/storage/")
  ) {
    return true;
  }

  return false;
}
