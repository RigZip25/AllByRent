import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  PlusCircle,
  Store,
  UserRound,
  Home,
} from "lucide-react";
import { RentanoChatPanel } from "../components/rentano/RentanoChatPanel";
import { RentanoFaqPanel } from "../components/rentano/RentanoFaqPanel";
import { APP_NAME, MASCOT_NAME } from "../lib/brand";
import { useAppModeLabels, useMessages } from "../lib/i18n/react";
import { getAppMode } from "../lib/appMode";
import { useAuth } from "../hooks/AuthProvider";
import rentanoImg from "../imports/No_back_rentano.png";

const GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type AssistantView = "faq" | "chat" | "guides";

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

function GuidesPanel({
  appMode,
  onHowItWorks,
  onListItem,
  onBrowse,
  onGarage,
  onProfile,
}: {
  appMode: "rent" | "earn";
  onHowItWorks: () => void;
  onListItem: () => void;
  onBrowse: () => void;
  onGarage: () => void;
  onProfile: () => void;
}) {
  const t = useMessages();

  const rentFirst = [
    {
      id: "browse",
      title: t.mrEvorios.guidesBrowseTitle,
      body: t.mrEvorios.guidesBrowseBody,
      Icon: Home,
      onClick: onBrowse,
    },
    {
      id: "how",
      title: t.mrEvorios.guidesHowTitle(APP_NAME),
      body: t.mrEvorios.guidesHowBody,
      Icon: BookOpen,
      onClick: onHowItWorks,
    },
    {
      id: "list",
      title: t.mrEvorios.guidesListTitle,
      body: t.mrEvorios.guidesListBody,
      Icon: PlusCircle,
      onClick: onListItem,
    },
    {
      id: "garage",
      title: t.mrEvorios.guidesGarageTitle,
      body: t.mrEvorios.guidesGarageBody,
      Icon: Store,
      onClick: onGarage,
    },
    {
      id: "profile",
      title: t.mrEvorios.guidesProfileTitle,
      body: t.mrEvorios.guidesProfileBody,
      Icon: UserRound,
      onClick: onProfile,
    },
  ];

  const earnFirst = [
    rentFirst[2]!,
    rentFirst[3]!,
    rentFirst[1]!,
    rentFirst[0]!,
    rentFirst[4]!,
  ];

  const cards = appMode === "earn" ? earnFirst : rentFirst;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">
          {t.mrEvorios.guidesTitle}
        </p>
        <p className="mt-0.5 text-[13px] text-gray-500">{t.mrEvorios.guidesHint}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {cards.map(({ id, title, body, Icon, onClick }) => (
          <li key={id}>
            <button
              type="button"
              onClick={onClick}
              className="flex w-full items-center gap-3 rounded-2xl border bg-white px-3.5 py-3.5 text-left transition-colors active:bg-[#F7FBF8]"
              style={{ borderColor: BORDER }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#E8F5EE", color: GREEN }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold" style={{ color: GREEN }}>
                  {title}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-gray-500">{body}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MrEvoriosScreen({
  onHowItWorks,
  onListItem,
  onBrowse,
  onGarage,
  onProfile,
}: {
  onHowItWorks: () => void;
  onListItem: () => void;
  onBrowse: () => void;
  onGarage: () => void;
  onProfile: () => void;
}) {
  const auth = useAuth();
  const t = useMessages();
  const modeLabels = useAppModeLabels();
  const [view, setView] = useState<AssistantView>("faq");
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
              { id: "faq" as const, label: t.mrEvorios.faq, Icon: HelpCircle },
              { id: "chat" as const, label: t.mrEvorios.chat, Icon: MessageCircle },
              { id: "guides" as const, label: t.mrEvorios.guides, Icon: BookOpen },
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
        {view === "faq" ? (
          <>
            <QuickTipsAccordion tips={quickTips} />
            <RentanoFaqPanel onAskRentano={openChat} />
          </>
        ) : null}

        {view === "chat" ? (
          <>
            <p className="mb-3 text-[13px] leading-snug text-gray-500">
              {t.mrEvorios.chatPrompt(MASCOT_NAME)}
            </p>
            <RentanoChatPanel
              key={appMode}
              apiContext={apiContext}
              initialMessage={chatSeed}
              onInitialMessageConsumed={() => setChatSeed(null)}
            />
          </>
        ) : null}

        {view === "guides" ? (
          <GuidesPanel
            appMode={appMode}
            onHowItWorks={onHowItWorks}
            onListItem={onListItem}
            onBrowse={onBrowse}
            onGarage={onGarage}
            onProfile={onProfile}
          />
        ) : null}
      </div>
    </div>
  );
}
