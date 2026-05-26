import { createContext, useContext, type ReactNode } from "react";
import { usePwaInstall } from "./usePwaInstall";

type PwaInstallContextValue = ReturnType<typeof usePwaInstall>;

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const value = usePwaInstall();
  return (
    <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
  );
}

export function usePwaInstallPrompt(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error("usePwaInstallPrompt must be used within PwaInstallProvider");
  }
  return ctx;
}
