import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";
import {
  appendChatMessageLocal,
  fetchChatMessagesRemote,
  listingThreadKey,
  loadChatMessagesLocal,
  rentalThreadKey,
  sendChatMessageRemote,
  subscribeToChatMessagesRemote,
  type ChatMessage,
} from "../lib/messagesStorage";
import { MASCOT_NAME } from "../lib/brand";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type PeerChatPanelProps = {
  rentalId?: string | null;
  listingId?: string | null;
  peerId: string;
  itemTitle?: string;
  /** Compact embed (e.g. inside ActiveRental card). */
  embedded?: boolean;
  onRequireAuth?: () => void;
};

export function PeerChatPanel({
  rentalId,
  listingId,
  peerId,
  itemTitle,
  embedded = false,
  onRequireAuth,
}: PeerChatPanelProps) {
  const auth = useAuth();
  const threadKey = rentalId
    ? rentalThreadKey(rentalId)
    : listingId && (auth.userId || peerId)
      ? listingThreadKey(listingId, auth.userId ?? "local", peerId)
      : listingId
        ? `listing:${listingId}:local`
        : "unknown";

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessagesLocal(threadKey));
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadChatMessagesLocal(threadKey));
    let cancelled = false;
    void fetchChatMessagesRemote({
      rentalId,
      listingId,
      peerId,
      viewerId: auth.userId,
    }).then((remote) => {
      if (cancelled || remote.length === 0) return;
      for (const m of remote) appendChatMessageLocal(m);
      setMessages(loadChatMessagesLocal(threadKey));
    });
    const sub = subscribeToChatMessagesRemote({
      rentalId,
      listingId,
      onInsert: (message) => {
        // Listing realtime is listing-scoped — filter to this peer pair.
        if (listingId && auth.userId) {
          const pair = new Set([auth.userId, peerId]);
          if (!pair.has(message.senderId) || !pair.has(message.recipientId)) return;
        }
        appendChatMessageLocal(message);
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        });
      },
    });
    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, [threadKey, rentalId, listingId, peerId, auth.userId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    if (!auth.userId) {
      onRequireAuth?.();
      return;
    }
    if (!peerId || peerId === "local") return;

    setSending(true);
    setText("");
    const msg: ChatMessage = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `msg-${Date.now()}`,
      rentalId: rentalId ?? null,
      listingId: listingId ?? null,
      senderId: auth.userId,
      recipientId: peerId,
      body,
      createdAt: new Date().toISOString(),
    };
    appendChatMessageLocal(msg);
    setMessages((prev) => [...prev, msg]);
    try {
      await sendChatMessageRemote({
        rentalId,
        listingId,
        senderId: auth.userId,
        recipientId: peerId,
        body,
        itemTitle,
      });
    } catch {
      // Local bubble already shown; peer may still get push from notify fallback.
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "rounded-xl border bg-white p-4"
          : "flex min-h-0 flex-1 flex-col overflow-hidden"
      }
      style={{ borderColor: embedded ? BORDER : undefined }}
    >
      {embedded ? (
        <>
          <h3 className="font-semibold" style={{ color: GREEN }}>
            Chat
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Tip: mention{" "}
            <span className="font-semibold">@{MASCOT_NAME.replace(/\s+/g, "").toLowerCase()}</span>{" "}
            for quick help. Push alerts the other person when they enabled notifications.
          </p>
        </>
      ) : null}

      <div
        ref={listRef}
        className={`space-y-2 overflow-y-auto rounded-xl border bg-[#F7FBF8] p-3 ${
          embedded ? "mt-3 max-h-56" : "min-h-0 flex-1"
        }`}
        style={{ borderColor: BORDER }}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No messages yet — say hi and confirm pickup details.
          </p>
        ) : (
          messages.map((m) => {
            const mine = Boolean(auth.userId && m.senderId === auth.userId);
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  mine ? "ml-auto bg-[#0D5C3A] text-white" : "bg-white text-gray-800"
                }`}
                style={!mine ? { border: `1px solid ${BORDER}` } : undefined}
              >
                {m.body}
                <div className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-gray-400"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={`flex gap-2 ${embedded ? "mt-3" : "shrink-0 border-t bg-white px-0 pt-3"}`} style={{ borderColor: BORDER }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder="Write a message…"
          className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-[#0D5C3A]"
          style={{ borderColor: BORDER }}
        />
        <button
          type="button"
          disabled={!text.trim() || sending}
          onClick={() => void send()}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: GREEN }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
