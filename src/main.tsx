import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { redirectShareLinkToApp } from "./lib/shareLinkRedirect.ts";
import "./styles/index.css";

if (!redirectShareLinkToApp()) {
  createRoot(document.getElementById("root")!).render(<App />);
}
