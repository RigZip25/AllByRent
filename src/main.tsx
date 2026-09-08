import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AppErrorBoundary } from "./app/components/AppErrorBoundary.tsx";
import { applyDocumentLang, getMessages, startLocaleChangeListener } from "./lib/i18n";
import { bootstrapPageTranslate } from "./lib/i18n/pageTranslate";
import {
  installNativeApiBridge,
  initNativeShell,
} from "./lib/nativeShell";
import { scheduleMediaHousekeeping } from "./lib/mediaHousekeeping.ts";
import { consumeResetAppBeforeBoot } from "./lib/resetAppStorage.ts";
import { redirectShareLinkToApp } from "./lib/shareLinkRedirect.ts";
import "./styles/index.css";

function showBootFailure(error: unknown): void {
  console.error("[boot] failed", error);
  const root = document.getElementById("root");
  if (!root) return;
  const t = getMessages().systemUi;
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "display:flex;min-height:100vh;flex-direction:column;align-items:center;justify-content:center;background:#F0F4F2;padding:24px;text-align:center;font-family:system-ui,sans-serif";
  const title = document.createElement("h1");
  title.textContent = t.bootFailedTitle;
  title.style.cssText = "margin:0 0 8px;font-size:20px;font-weight:700;color:#0D5C3A";
  const body = document.createElement("p");
  body.textContent = t.bootFailedBody;
  body.style.cssText = "margin:0 0 16px;max-width:320px;font-size:14px;color:#4b5563";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = t.reloadApp;
  button.style.cssText =
    "border:0;border-radius:12px;background:#0D5C3A;color:#fff;font-size:15px;font-weight:700;padding:12px 24px;cursor:pointer";
  button.onclick = () => window.location.reload();
  wrap.append(title, body, button);
  root.append(wrap);
}

async function boot(): Promise<void> {
  // Must run before React mounts so early /api fetch calls hit production
  // and Face ID WebAuthn is shimmed to native APIs.
  installNativeApiBridge();
  await initNativeShell();

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
    scheduleMediaHousekeeping();
  }
}

void (async () => {
  try {
    await boot();
  } catch (error) {
    showBootFailure(error);
  } finally {
    // launchAutoHide is false: without this a thrown plugin or a missing
    // root node leaves the native splash up forever.
    const { hideNativeSplash } = await import("./lib/nativeShell");
    await hideNativeSplash();
  }
})();
