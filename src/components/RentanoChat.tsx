import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Smartphone,
  X,
} from "lucide-react";
import { APP_NAME, MASCOT_NAME } from "../lib/brand";
import rentanoImg from "../imports/No_back_rentano.png";
import type { ListingDraft } from "../screens/listing/types";
import { LISTING_STEP_LABELS } from "../screens/listing/types";
import type { AppMode } from "../lib/appMode";
import { summarizeListingDraft } from "../lib/listingDraftSummary";
import {
  buildRentanoUserContext,
  type RentanoRequestContext,
} from "../lib/rentanoPrompt";
import { usePwaInstallPrompt } from "../hooks/PwaInstallProvider";
import { isStandalonePwa } from "../lib/pwaInstall";
import { PwaInstallPanel } from "./PwaInstallPanel";
import { RentanoFaqPanel } from "./rentano/RentanoFaqPanel";
import { RentanoChatPanel } from "./rentano/RentanoChatPanel";

const PRIMARY_GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

export type RentanoChatContext = {
  screen?: string;
  appMode?: AppMode;
  step?: number;
  totalSteps?: number;
  draft?: ListingDraft;
  rentalStatus?: string;
  userId?: string;
};

type SheetView = "menu" | "install" | "faq" | "chat";

function buildApiContext(context?: RentanoChatContext): RentanoRequestContext {
  const step = context?.step;
  return {
    screen: context?.screen,
    appMode: context?.appMode,
    step,
    totalSteps: context?.totalSteps,
    stepName: step != null ? LISTING_STEP_LABELS[step - 1] : undefined,
    userRole:
      context?.appMode === "earn"
        ? "host"
        : context?.appMode === "rent"
          ? "renter"
          : undefined,
    userId: context?.userId,
    draftSummary: context?.draft ? summarizeListingDraft(context.draft) : undefined,
  };
}

function MenuRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors active:bg-[#F9FAFB]"
      style={{ borderColor: BORDER }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#F0FDF4" }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold" style={{ color: PRIMARY_GREEN }}>
          {title}
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-gray-500">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
    </button>
  );
}

export function RentanoChatFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-lg transition-transform active:scale-95"
      style={{
        border: `2px solid ${PRIMARY_GREEN}`,
        boxShadow: "0 4px 14px rgba(13, 92, 58, 0.25)",
      }}
      aria-label={`Open ${MASCOT_NAME} menu`}
    >
      <img
        src={rentanoImg}
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </button>
  );
}

export function RentanoChatSheet({
  open,
  onClose,
  context,
  defaultView,
}: {
  open: boolean;
  onClose: () => void;
  context?: RentanoChatContext;
  defaultView?: "chat" | "menu";
}) {
  const pwa = usePwaInstallPrompt();
  const [view, setView] = useState<SheetView>("menu");
  const [chatSeed, setChatSeed] = useState<string | null>(null);
  const installed = isStandalonePwa();
  const isListingHelp = context?.step !== undefined && context.totalSteps !== undefined;
  const apiContext = useMemo(() => buildApiContext(context), [context]);

  useEffect(() => {
    if (!open) {
      setView("menu");
      setChatSeed(null);
      return;
    }
    if (defaultView === "chat") {
      setView("chat");
      if (!chatSeed) setChatSeed(`Hi ${MASCOT_NAME} — I need help on this screen.`);
    }
  }, [defaultView, open]);

  const openChat = (prefill?: string) => {
    setChatSeed(prefill?.trim() || null);
    setView("chat");
  };

  const handleClose = () => {
    setView("menu");
    setChatSeed(null);
    onClose();
  };

  const title =
    view === "install"
      ? "Install app"
      : view === "faq"
        ? "Help & FAQ"
        : view === "chat"
          ? isListingHelp
            ? "Listing help"
            : `Chat with ${MASCOT_NAME}`
          : MASCOT_NAME;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={`Close ${MASCOT_NAME} menu`}
            className="fixed inset-0 z-[70] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rentano-chat-title"
            className="fixed bottom-0 left-1/2 z-[71] flex max-h-[min(92dvh,720px)] w-full max-w-[390px] -translate-x-1/2 flex-col rounded-t-3xl bg-white shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="shrink-0 px-5 pb-2 pt-5">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E5E7EB]" />
              <div className="flex items-center gap-3">
                {view !== "menu" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setChatSeed(null);
                      setView("menu");
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]"
                    aria-label="Back to menu"
                  >
                    <ArrowLeft className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
                  </button>
                ) : null}
                <div
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-full"
                  style={{ border: `2px solid ${PRIMARY_GREEN}` }}
                >
                  <img
                    src={rentanoImg}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    id="rentano-chat-title"
                    className="text-lg font-bold leading-tight"
                    style={{ color: PRIMARY_GREEN }}
                  >
                    {title}
                  </h2>
                  {isListingHelp && view === "menu" ? (
                    <p className="text-xs text-[#9CA3AF]">
                      Listing · Step {context.step} of {context.totalSteps}
                      {context.step != null
                        ? ` · ${LISTING_STEP_LABELS[context.step - 1]}`
                        : ""}
                    </p>
                  ) : view === "chat" && apiContext.step != null ? (
                    <p className="text-xs text-[#9CA3AF]">
                      {buildRentanoUserContext(apiContext).split("\n").slice(1).join(" · ")}
                    </p>
                  ) : (
                    <p className="text-xs text-[#9CA3AF]">Your AI companion</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
              {view === "menu" ? (
                <ul className="flex flex-col gap-2.5">
                  {!installed ? (
                    <li>
                      <MenuRow
                        icon={
                          <Smartphone
                            className="h-5 w-5"
                            style={{ color: PRIMARY_GREEN }}
                            strokeWidth={1.75}
                          />
                        }
                        title="Add to Home Screen"
                        subtitle="Works like an app — faster, full screen"
                        onClick={() => setView("install")}
                      />
                    </li>
                  ) : null}
                  <li>
                    <MenuRow
                      icon={
                        <HelpCircle
                          className="h-5 w-5"
                          style={{ color: PRIMARY_GREEN }}
                          strokeWidth={1.75}
                        />
                      }
                      title="Help & FAQ"
                      subtitle={`Common questions — or ask ${MASCOT_NAME}`}
                      onClick={() => setView("faq")}
                    />
                  </li>
                  <li>
                    <MenuRow
                      icon={
                        <MessageCircle
                          className="h-5 w-5"
                          style={{ color: PRIMARY_GREEN }}
                          strokeWidth={1.75}
                        />
                      }
                      title={isListingHelp ? "Help with this listing" : `Chat with ${MASCOT_NAME}`}
                      subtitle={
                        isListingHelp
                          ? `Voice or text · step ${context.step} of ${context.totalSteps}`
                          : "Voice or text — I know where you are in the app"
                      }
                      onClick={() => openChat()}
                    />
                  </li>
                </ul>
              ) : null}

              {view === "install" ? (
                <PwaInstallPanel
                  nativeInstallReady={pwa.nativeInstallReady}
                  manualIos={pwa.manualIos}
                  onInstall={() => void pwa.install()}
                  onDismiss={pwa.dismiss}
                  showDismissActions
                />
              ) : null}

              {view === "faq" ? <RentanoFaqPanel onAskRentano={openChat} /> : null}

              {view === "chat" ? (
                <RentanoChatPanel
                  key={chatSeed ?? "chat-default"}
                  apiContext={apiContext}
                  initialMessage={chatSeed}
                  onInitialMessageConsumed={() => setChatSeed(null)}
                />
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

