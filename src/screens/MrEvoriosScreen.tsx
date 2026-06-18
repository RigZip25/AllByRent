import { useMemo, useState } from "react";
import { HelpCircle, MessageCircle, Smartphone } from "lucide-react";
import { BottomNav } from "../app/components/BottomNav";
import { RentanoChatPanel } from "../components/rentano/RentanoChatPanel";
import { RentanoFaqPanel } from "../components/rentano/RentanoFaqPanel";
import { PwaInstallPanel } from "../components/PwaInstallPanel";
import { APP_NAME, MASCOT_NAME } from "../lib/brand";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { isStandalonePwa } from "../lib/pwaInstall";
import { getAppMode } from "../lib/appMode";
import { useAuth } from "../hooks/AuthProvider";
import rentanoImg from "../imports/No_back_rentano.png";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type AssistantView = "chat" | "faq" | "install";

const QUICK_PROMPTS = [
  "What can I rent near me?",
  "How do I list an item in my garage?",
  "How does the deposit hold work?",
  "Help me find a tile saw for the weekend",
];

export function MrEvoriosScreen({
  onHome,
  onGarage,
  onStockGarage,
  onMore,
}: {
  onHome: () => void;
  onGarage: () => void;
  onStockGarage: () => void;
  onMore: () => void;
}) {
  const auth = useAuth();
  const pwa = usePwaInstallPrompt();
  const installed = isStandalonePwa();
  const [view, setView] = useState<AssistantView>("chat");
  const [chatSeed, setChatSeed] = useState<string | null>(null);

  const apiContext = useMemo(
    () => ({
      screen: "mrE",
      appMode: getAppMode(),
      userId: auth.userId ?? undefined,
    }),
    [auth.userId],
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
            className="h-14 w-14 shrink-0 overflow-hidden rounded-full"
            style={{ border: `2px solid ${GREEN}` }}
          >
            <img src={rentanoImg} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-extrabold leading-tight" style={{ color: GREEN }}>
              {MASCOT_NAME}
            </h1>
            <p className="text-[13px] text-gray-500">
              Your {APP_NAME} guide — ask anything, voice or text
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {(
            [
              { id: "chat" as const, label: "Chat", icon: MessageCircle },
              { id: "faq" as const, label: "FAQ", icon: HelpCircle },
              ...(!installed
                ? [{ id: "install" as const, label: "Install", icon: Smartphone }]
                : []),
            ] as const
          ).map((tab) => {
            const active = view === tab.id;
            const Icon = tab.icon;
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
              {QUICK_PROMPTS.map((prompt) => (
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
              key={chatSeed ?? "chat-default"}
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

      <div className="shrink-0">
        <BottomNav
          activeTab="mre"
          onHome={onHome}
          onMrE={() => undefined}
          onAdd={onStockGarage}
          onGarage={onGarage}
          onMore={onMore}
        />
      </div>
    </div>
  );
}
