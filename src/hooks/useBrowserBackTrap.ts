import { useEffect } from "react";
import { isStandalonePwa } from "../lib/pwaInstall";

/**
 * In mobile Safari/Chrome tabs, the browser Back often leaves the site.
 * Keep an extra history entry so Back maps to in-app navigation instead.
 */
export function useBrowserBackTrap(enabled: boolean, onBack: () => void) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (isStandalonePwa()) return;

    const marker = { evoriosNav: true as const };
    const push = () => {
      try {
        window.history.pushState(marker, "", window.location.href);
      } catch {
        /* ignore */
      }
    };

    // Seed so the first Back stays in-app.
    push();

    const onPopState = () => {
      onBack();
      push();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled, onBack]);
}
