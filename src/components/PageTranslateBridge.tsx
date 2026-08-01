import { useEffect } from "react";
import { syncPageTranslate } from "../lib/i18n/pageTranslate";
import { subscribeLocale } from "../lib/i18n";

/**
 * Keeps Google page-translate in sync with Auto locale / phone language.
 * Renders nothing visible (widget host is injected off-screen).
 */
export function PageTranslateBridge() {
  useEffect(() => {
    const run = () => {
      void syncPageTranslate();
    };
    run();
    const unsub = subscribeLocale(run);
    window.addEventListener("languagechange", run);
    return () => {
      unsub();
      window.removeEventListener("languagechange", run);
    };
  }, []);

  return null;
}
