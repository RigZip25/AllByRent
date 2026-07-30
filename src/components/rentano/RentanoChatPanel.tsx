import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import rentanoImg from "../../imports/No_back_rentano.png";
import { MASCOT_NAME } from "../../lib/brand";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useRequireAuth } from "../../hooks/RequireAuth";
import { useLocale, useMessages } from "../../lib/i18n/react";
import { isAnthropicConfigured } from "../../lib/anthropicClient";
import { findLocalRentanoAnswer, queryLooksNonEnglish } from "../../lib/rentanoLocalAnswer";
import { sendRentanoMessage, type RentanoChatTurn } from "../../lib/rentanoChatApi";
import type { RentanoRequestContext } from "../../lib/rentanoPrompt";

const PRIMARY_GREEN = "#0D5C3A";
const BORDER = "#E8E6E0";

type ChatMessage = RentanoChatTurn & { id: string };

function nextId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function RentanoChatPanel({
  apiContext,
  initialMessage,
  onInitialMessageConsumed,
}: {
  apiContext: RentanoRequestContext;
  initialMessage?: string | null;
  onInitialMessageConsumed?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "", // filled after first render via locale
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAiQuestion, setPendingAiQuestion] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);
  const locale = useLocale();
  const t = useMessages();
  // Prefer device language so RU/ES speech works even when UI locale is EN.
  const speechLang =
    locale === "cs"
      ? "cs-CZ"
      : typeof navigator !== "undefined" && navigator.language
        ? navigator.language
        : "en-US";
  const speech = useSpeechRecognition(speechLang);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0]?.id === "welcome") {
        return [{ id: "welcome", role: "assistant", content: t.mrEvorios.welcome(MASCOT_NAME) }];
      }
      return prev.map((m) =>
        m.id === "welcome" ? { ...m, content: t.mrEvorios.welcome(MASCOT_NAME) } : m,
      );
    });
  }, [t, locale]);

  const configured = isAnthropicConfigured();
  const requireAuth = useRequireAuth();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const submitText = useCallback(
    async (raw: string, options?: { forceAi?: boolean }) => {
      const text = raw.trim();
      if (!text || loading) return;

      if (!requireAuth("message")) return;

      setError(null);
      setPendingAiQuestion(null);
      const userMsg: ChatMessage = { id: nextId(), role: "user", content: text };
      // Build API history synchronously — never rely on setState updater side effects
      // (those can be deferred, which sent `messages: []` and failed with "messages are required").
      const historyForApi: RentanoChatTurn[] = [
        ...messages
          .filter((m) => m.id !== "welcome")
          .map(({ role, content }) => ({ role, content })),
        { role: "user", content: text },
      ];
      setInput("");
      setLoading(true);
      setMessages((prev) => [...prev, userMsg]);

      try {
        if (!options?.forceAi) {
          const local = findLocalRentanoAnswer(text);
          if (local) {
            setMessages((prev) => [
              ...prev,
              { id: nextId(), role: "assistant", content: local.answer },
            ]);
            return;
          }
        }

        if (!configured) {
          setPendingAiQuestion(text);
          setError(
            queryLooksNonEnglish(text)
              ? "AI chat is off here, so I can’t answer in your language yet — open the FAQ tab (English) or try again later."
              : "No ready FAQ match. AI chat is off in this environment — open the FAQ tab or rephrase your question.",
          );
          return;
        }

        const reply = await sendRentanoMessage(historyForApi, apiContext);
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: reply }]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
        if (configured) setPendingAiQuestion(text);
      } finally {
        setLoading(false);
      }
    },
    [apiContext, configured, loading, messages, requireAuth],
  );

  const handleAskAi = () => {
    if (!pendingAiQuestion?.trim() || !configured) return;
    void submitText(pendingAiQuestion, { forceAi: true });
  };

  useEffect(() => {
    if (!initialMessage?.trim() || initialSentRef.current) return;
    initialSentRef.current = true;
    void submitText(initialMessage);
    onInitialMessageConsumed?.();
  }, [initialMessage, onInitialMessageConsumed, submitText]);

  const handleSend = () => {
    void submitText(input);
  };

  const handleMic = () => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    setError(null);
    // Fresh dictation into the composer — user can edit before Send.
    setInput("");
    void speech.start({
      onInterim: (text) => {
        setInput(text);
      },
      onDraft: (text) => {
        const trimmed = text.trim();
        if (trimmed) setInput(trimmed);
      },
    });
  };

  const stepLabel =
    apiContext.step != null && apiContext.totalSteps != null
      ? `Listing · step ${apiContext.step}/${apiContext.totalSteps}`
      : apiContext.screen
        ? `Screen: ${apiContext.screen}`
        : null;

  return (
    <div className="flex min-h-[280px] flex-col">
      {stepLabel ? (
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
          {stepLabel}
          {apiContext.stepName ? ` · ${apiContext.stepName}` : ""}
        </p>
      ) : null}

      <div
        ref={scrollRef}
        className="mb-3 flex max-h-[min(42dvh,320px)] min-h-[200px] flex-col gap-2.5 overflow-y-auto rounded-2xl border bg-[#F9FAFB] p-3"
        style={{ borderColor: BORDER }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" ? (
              <div
                className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
                style={{ border: `1.5px solid ${PRIMARY_GREEN}` }}
              >
                <img src={rentanoImg} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                msg.role === "user"
                  ? "text-white"
                  : "border bg-white text-[#374151]"
              }`}
              style={
                msg.role === "user"
                  ? { backgroundColor: PRIMARY_GREEN }
                  : { borderColor: BORDER }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex items-center gap-2 px-2 text-[13px] text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: PRIMARY_GREEN }} />
            {MASCOT_NAME} is thinking…
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mb-2 text-center">
          <p className="text-[12px] leading-snug text-red-600">{error}</p>
          {pendingAiQuestion && configured ? (
            <button
              type="button"
              onClick={handleAskAi}
              disabled={loading}
              className="mt-2 text-[12px] font-semibold underline"
              style={{ color: PRIMARY_GREEN }}
            >
              Ask AI anyway (cached when possible)
            </button>
          ) : null}
        </div>
      ) : null}
      {speech.error ? (
        <p className="mb-2 text-center text-[12px] text-amber-700">{speech.error}</p>
      ) : null}
      {speech.listening ? (
        <p className="mb-2 text-center text-[12px] font-medium text-red-600">
          {t.mrEvorios.listeningHint}
        </p>
      ) : input.trim() && !loading ? (
        <p className="mb-2 text-center text-[11px] text-gray-400">{t.mrEvorios.editThenSend}</p>
      ) : null}

      <div
        className="flex items-end gap-2 rounded-2xl border bg-white p-2"
        style={{
          borderColor: speech.listening ? "#DC2626" : BORDER,
          boxShadow: speech.listening ? "0 0 0 2px rgba(220,38,38,0.15)" : undefined,
        }}
      >
        <button
          type="button"
          onClick={handleMic}
          disabled={loading || !speech.supported}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-40"
          style={{
            backgroundColor: speech.listening ? "#FEE2E2" : "#F0FDF4",
          }}
          aria-label={speech.listening ? "Stop listening" : "Speak your question"}
          title={
            speech.supported
              ? speech.listening
                ? "Stop — then edit & send"
                : "Voice input (review before send)"
              : "Voice not supported in this browser"
          }
        >
          {speech.listening ? (
            <MicOff className="h-5 w-5 text-red-600" />
          ) : (
            <Mic className="h-5 w-5" style={{ color: PRIMARY_GREEN }} />
          )}
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!speech.listening) handleSend();
            }
          }}
          rows={2}
          placeholder={
            speech.listening ? t.mrEvorios.placeholderListening : t.mrEvorios.placeholderIdle
          }
          className="max-h-28 min-h-[48px] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] outline-none placeholder:text-gray-400"
          disabled={loading}
          aria-label={`Message to ${MASCOT_NAME}`}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim() || speech.listening}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: PRIMARY_GREEN }}
          aria-label="Send message"
          title={speech.listening ? "Stop the mic first" : "Send"}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
