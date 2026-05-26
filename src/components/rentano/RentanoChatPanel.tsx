import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import rentanoImg from "../../imports/No_back_rentano.png";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { isAnthropicConfigured } from "../../lib/anthropicClient";
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
      content:
        "Hi! I'm Rentano — ask by voice or text. I know which screen and listing step you're on.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);
  const speech = useSpeechRecognition();

  const configured = isAnthropicConfigured();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const submitText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;

      if (!configured) {
        setError("Add VITE_ANTHROPIC_API_KEY to .env.local and restart the dev server.");
        return;
      }

      setError(null);
      const userMsg: ChatMessage = { id: nextId(), role: "user", content: text };
      setInput("");
      setLoading(true);

      let historyForApi: RentanoChatTurn[] = [];
      setMessages((prev) => {
        historyForApi = [...prev.filter((m) => m.id !== "welcome"), userMsg].map(
          ({ role, content }) => ({ role, content }),
        );
        return [...prev, userMsg];
      });

      try {
        const reply = await sendRentanoMessage(historyForApi, apiContext);
        setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: reply }]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [apiContext, configured, loading],
  );

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
    speech.start((text) => {
      setInput(text);
      void submitText(text);
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
            Rentano is thinking…
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="mb-2 text-center text-[12px] leading-snug text-red-600">{error}</p>
      ) : null}
      {speech.error ? (
        <p className="mb-2 text-center text-[12px] text-amber-700">{speech.error}</p>
      ) : null}
      {speech.interim ? (
        <p className="mb-2 text-center text-[12px] italic text-gray-500">"{speech.interim}"</p>
      ) : null}

      <div
        className="flex items-end gap-2 rounded-2xl border bg-white p-2"
        style={{ borderColor: BORDER }}
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
                ? "Stop"
                : "Voice input"
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
              handleSend();
            }
          }}
          rows={1}
          placeholder="Type or tap mic…"
          className="max-h-24 min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] outline-none placeholder:text-gray-400"
          disabled={loading}
          aria-label="Message to Rentano"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: PRIMARY_GREEN }}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
