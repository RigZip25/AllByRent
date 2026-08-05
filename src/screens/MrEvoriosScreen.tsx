import { useEffect, useMemo, useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle, Smartphone } from "lucide-react";
import { RentanoChatPanel } from "../components/rentano/RentanoChatPanel";
import { RentanoFaqPanel } from "../components/rentano/RentanoFaqPanel";
import { PwaInstallPanel } from "../components/PwaInstallPanel";
import { APP_NAME, MASCOT_NAME } from "../lib/brand";
import { useAppModeLabels, useMessages } from "../lib/i18n/react";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { getAppMode } from "../lib/appMode";
import { useAuth } from "../hooks/AuthProvider";
import rentanoImg from "../imports/No_back_rentano.png";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type AssistantView = "chat" | "faq" | "install";

function QuickTipsAccordion({ tips }: { tips: { q: string; a: string }[] }) {
  const t = useMessages();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mb-4">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
        {t.mrEvorios.quickTipsTitle}
      </p>
      <p className="mt-0.5 text-[13px] text-gray-500">{t.mrEvorios.quickTipsHint}</p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {tips.map(({ q, a }) => {
          const open = expanded === q;
          return (
            <li key={q}>
              <button
                type="button"
                onClick={() => setExpanded(open ? null : q)}
                aria-expanded={open}
                className="flex w-full flex-col rounded-2xl border bg-white px-3.5 py-3 text-left transition-colors active:bg-[#F7FBF8]"
                style={{ borderColor: open ? GREEN : BORDER }}
              >
                <span className="flex items-start gap-2">
                  <span
                    className="min-w-0 flex-1 text-[15px] font-semibold leading-snug"
                    style={{ color: GREEN }}
                  >
                    {q}
                  </span>
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    style={{ color: GREEN }}
                    aria-hidden
                  />
                </span>
                {open ? (
                  <p
                    className="mt-2.5 border-t pt-2.5 text-[14px] leading-relaxed text-gray-600"
                    style={{ borderColor: BORDER }}
                  >
                    {a}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MrEvoriosScreen() {
  const auth = useAuth();
  const pwa = usePwaInstallPrompt();
  const t = useMessages();
  const modeLabels = useAppModeLabels();
  const [view, setView] = useState<AssistantView>("chat");
  const [chatSeed, setChatSeed] = useState<string | null>(null);
  const [appMode, setAppModeState] = useState(() => getAppMode());

  useEffect(() => {
    const sync = () => setAppModeState(getAppMode());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("allbyrent-mode", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("allbyrent-mode", sync);
    };
  }, []);

  const quickTips =
    appMode === "earn" ? t.mrEvorios.quickTipsEarn : t.mrEvorios.quickTipsRent;

  const apiContext = useMemo(
    () => ({
      screen: "mrE",
      appMode,
      userRole: appMode === "earn" ? ("host" as const) : ("renter" as const),
      userId: auth.userId ?? undefined,
    }),
    [auth.userId, appMode],
  );

  const openChat = (prefill?: string) => {
    setChatSeed(prefill?.trim() || null);
    setView("chat");
  };

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <div className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full"
            style={{ border: `2px solid ${GREEN}` }}
          >
            <img src={rentanoImg} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
              {MASCOT_NAME}
            </h1>
            <p className="text-[12px] text-gray-500">
              {t.mrEvorios.subtitle(APP_NAME, modeLabels[appMode])}
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {(
            [
              { id: "chat" as const, label: t.mrEvorios.chat, Icon: MessageCircle },
              { id: "faq" as const, label: t.mrEvorios.faq, Icon: HelpCircle },
              { id: "install" as const, label: t.mrEvorios.install, Icon: Smartphone },
            ] as const
          ).map((tab) => {
            const active = view === tab.id;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-bold transition-colors"
                style={{
                  backgroundColor: active ? GREEN : "white",
                  color: active ? "white" : "#666",
                  border: `1px solid ${active ? GREEN : BORDER}`,
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="screen-scroll min-h-0 flex-1 px-4 pb-4 pt-3">
        {view === "chat" ? (
          <>
            <QuickTipsAccordion tips={quickTips} />
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              {t.mrEvorios.askInChatBelow}
            </p>
            <RentanoChatPanel
              key={appMode}
              apiContext={apiContext}
              initialMessage={chatSeed}
              onInitialMessageConsumed={() => setChatSeed(null)}
            />
          </>
        ) : null}

        {view === "faq" ? <RentanoFaqPanel onAskRentano={openChat} /> : null}

        {view === "install" ? (
          <PwaInstallPanel
            nativeInstallReady={pwa.nativeInstallReady}
            manualIos={pwa.manualIos}
            onInstall={() => void pwa.install()}
            onDismiss={pwa.dismiss}
            showDismissActions
          />
        ) : null}
      </div>
    </div>
  );
}
