import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { applyDocumentLang } from "./lib/i18n";
import { redirectShareLinkToApp } from "./lib/shareLinkRedirect.ts";
import "./styles/index.css";

applyDocumentLang();

if (!redirectShareLinkToApp()) {
  createRoot(document.getElementById("root")!).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>,
  );
}
