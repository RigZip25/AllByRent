import { useEffect, useMemo, useState } from "react";
import { HelpCircle, MessageCircle, Smartphone } from "lucide-react";
import { RentanoChatPanel } from "../components/rentano/RentanoChatPanel";
import { RentanoFaqPanel } from "../components/rentano/RentanoFaqPanel";
import { PwaInstallPanel } from "../components/PwaInstallPanel";
import { APP_NAME, APP_MODE_LABELS, MASCOT_NAME } from "../lib/brand";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { getAppMode } from "../lib/appMode";
import { useAuth } from "../hooks/AuthProvider";
import rentanoImg from "../imports/No_back_rentano.png";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type AssistantView = "chat" | "faq" | "install";

const QUICK_PROMPTS_RENT = [
  "How do I browse by category?",
  "Menu buttons — what does each tab do?",
  "What is Evorios — household marketplace?",
  "Profile vs Garage — what's the difference?",
  "How do I list my first item?",
];

const QUICK_PROMPTS_EARN = [
  "How do I stock my garage?",
  "Which categories can I list?",
  "What is Evorios — household marketplace?",
  "Profile vs Garage — what's the difference?",
  "How do I switch to Browse?",
];

export function MrEvoriosScreen() {
  const auth = useAuth();
  const pwa = usePwaInstallPrompt();
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

  const quickPrompts = appMode === "earn" ? QUICK_PROMPTS_EARN : QUICK_PROMPTS_RENT;

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
              {APP_NAME} guide · mode: {APP_MODE_LABELS[appMode]}
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {(
            [
              { id: "chat" as const, label: "Chat", Icon: MessageCircle },
              { id: "faq" as const, label: "FAQ", Icon: HelpCircle },
              { id: "install" as const, label: "Install", Icon: Smartphone },
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
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => openChat(prompt)}
                  className="rounded-full border bg-white px-3 py-1.5 text-left text-[12px] font-medium text-gray-700 active:bg-gray-50"
                  style={{ borderColor: BORDER }}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <RentanoChatPanel
              key={`${chatSeed ?? "chat-default"}-${appMode}`}
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
