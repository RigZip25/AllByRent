import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import { completeAuthCallbackFromUrl, onAuthStateChange } from "../lib/auth";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  userId: string | null;
  userEmail: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!configured) {
      setSession(null);
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    void completeAuthCallbackFromUrl().catch(() => {
      // URL cleanup errors are surfaced in AuthGate when user retries sign-in.
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    const sub = onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.unsubscribe();
    };
  }, [configured]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      configured,
      loading,
      session,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
    };
  }, [configured, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

