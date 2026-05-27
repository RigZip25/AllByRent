import { createContext, useContext, type ReactNode } from "react";

type RequireAuthFn = () => boolean;

const RequireAuthContext = createContext<RequireAuthFn | null>(null);

export function RequireAuthProvider({
  children,
  requireAuth,
}: {
  children: ReactNode;
  requireAuth: RequireAuthFn;
}) {
  return (
    <RequireAuthContext.Provider value={requireAuth}>{children}</RequireAuthContext.Provider>
  );
}

/** Returns true when the action may proceed; false when redirected to sign-in. */
export function useRequireAuth(): RequireAuthFn {
  const fn = useContext(RequireAuthContext);
  return fn ?? (() => true);
}
