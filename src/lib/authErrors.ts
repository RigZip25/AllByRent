import { AuthError } from "@supabase/supabase-js";

export function isNetworkFetchError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === "Failed to fetch") return true;
  if (err instanceof AuthError && /fetch|network/i.test(err.message)) return true;
  if (err instanceof Error && /ENOTFOUND|Failed to fetch|NetworkError/i.test(err.message)) {
    return true;
  }
  return false;
}

export function formatAuthError(err: unknown): string {
  if (err instanceof AuthError) {
    if (err.message === "Failed to fetch" || /fetch/i.test(err.message)) {
      return networkHint();
    }
    return err.message;
  }
  if (err instanceof Error) {
    if (err.message === "Failed to fetch" || /ENOTFOUND|getaddrinfo/i.test(err.message)) {
      return networkHint();
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

function networkHint(): string {
  return (
    "Cannot reach Supabase. In Vercel, set VITE_SUPABASE_URL to your Project URL " +
    "(Supabase → Settings → API, e.g. https://YOUR_REF.supabase.co), confirm the project is " +
    "active (not paused), then redeploy."
  );
}
