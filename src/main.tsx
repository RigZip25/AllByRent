import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { applyDocumentLang, startLocaleChangeListener } from "./lib/i18n";
import { bootstrapPageTranslate } from "./lib/i18n/pageTranslate";
import { consumeResetAppBeforeBoot } from "./lib/resetAppStorage.ts";
import { redirectShareLinkToApp } from "./lib/shareLinkRedirect.ts";
import "./styles/index.css";

applyDocumentLang();
// Set googtrans cookie before first paint so ES/FR/PL users don't flash English.
bootstrapPageTranslate();
startLocaleChangeListener();

// Reset must run before React so we don't flash the old session, then wipe.
if (!consumeResetAppBeforeBoot() && !redirectShareLinkToApp()) {
  createRoot(document.getElementById("root")!).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>,
  );
}
