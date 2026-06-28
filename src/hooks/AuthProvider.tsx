import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import { resolveSessionUserEmail } from "../lib/authEmail";
import { AUTH_CALLBACK_RESUME_KEY, completeAuthCallbackFromUrl, onAuthStateChange } from "../lib/auth";
import { syncUserProfileFromAuth } from "../lib/userProfileStorage";
import { fetchRemoteProfile } from "../lib/supabaseProfile";

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

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_CALLBACK_RESUME_KEY) return;
      // Another tab finished the auth callback and wrote the resume flag.
      void supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      });
    };
    window.addEventListener("storage", onStorage);

    let channel: BroadcastChannel | null = null;
    const onBroadcast = () => {
      // Another tab likely completed the auth callback; refresh the session.
      void supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      });
    };
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("abr_auth_v1");
        channel.addEventListener("message", onBroadcast);
      }
    } catch {
      channel = null;
    }

    return () => {
      mounted = false;
      sub.unsubscribe();
      window.removeEventListener("storage", onStorage);
      if (channel) {
        try {
          channel.removeEventListener("message", onBroadcast);
          channel.close();
        } catch {
          // ignore
        }
      }
    };
  }, [configured]);

  useEffect(() => {
    const user = session?.user;
    if (!user?.id) return;

    const userEmail = resolveSessionUserEmail(user);

    syncUserProfileFromAuth({
      userId: user.id,
      userEmail,
    });

    void fetchRemoteProfile(user.id).then((remote) => {
      if (!remote) return;
      syncUserProfileFromAuth({
        userId: user.id,
        userEmail,
        remoteDisplayName: remote.display_name,
        remoteEmail: remote.email,
      });
    });
  }, [session]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      configured,
      loading,
      session,
      userId: user?.id ?? null,
      userEmail: resolveSessionUserEmail(user),
    };
  }, [configured, loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

