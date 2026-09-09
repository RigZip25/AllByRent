import { useEffect, useRef, useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import {
  appendChatMessageLocal,
  fetchChatMessagesRemote,
  listingThreadKey,
  loadChatMessagesLocal,
  markChatThreadRead,
  removeChatMessageLocal,
  rentalThreadKey,
  requestThreadKey,
  sendChatMessageRemote,
  subscribeToChatMessagesRemote,
  updateChatMessageLocal,
  type ChatMessage,
} from "../lib/messagesStorage";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { MASCOT_NAME } from "../lib/brand";
import { ReportSheet } from "./moderation/ReportSheet";
import { isUserBlocked, onBlocksChanged, unblockUser } from "../lib/moderation/blockStorage";
import { useMessages } from "../lib/i18n/react";
import { moderatePeerChatMessage } from "../lib/peerChatModeration";
import {
  formatCooldownHours,
  getModerationCooldownRemaining,
  isInModerationCooldown,
  recordModerationStrike,
} from "../lib/softModerationStrikes";

const BORDER = "#E8E6E0";
const GREEN = "#0D5C3A";

type PeerChatPanelProps = {
  rentalId?: string | null;
  listingId?: string | null;
  /** Ask thread: answering a neighbor's "looking for" request. */
  requestId?: string | null;
  peerId: string;
  itemTitle?: string;
  /** Compact embed (e.g. inside ActiveRental card). */
  embedded?: boolean;
  /** When true, history stays visible but sending is disabled. */
  readOnly?: boolean;
  /** Optional status banner (e.g. post-rental tolls & fines mode). */
  banner?: string | null;
  onRequireAuth?: () => void;
};

export function PeerChatPanel({
  rentalId,
  listingId,
  requestId,
  peerId,
  itemTitle,
  embedded = false,
  readOnly = false,
  banner = null,
  onRequireAuth,
}: PeerChatPanelProps) {
  const auth = useAuth();
  const { peerChat, common, listing, moderation } = useMessages();
  const mascotHandle = MASCOT_NAME.replace(/\s+/g, "").toLowerCase();
  const threadKey = rentalId
    ? rentalThreadKey(rentalId)
    : listingId
      ? listingThreadKey(listingId, auth.userId ?? "local", peerId)
      : requestId
        ? requestThreadKey(requestId, auth.userId ?? "local", peerId)
        : "unknown";

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessagesLocal(threadKey));
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [gateMessage, setGateMessage] = useState<string | null>(null);
  const [reported, setReported] = useState<ChatMessage | null>(null);
  const [blocked, setBlocked] = useState(() => isUserBlocked(peerId));
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBlocked(isUserBlocked(peerId));
    return onBlocksChanged(() => setBlocked(isUserBlocked(peerId)));
  }, [peerId]);

  useEffect(() => {
    setMessages(loadChatMessagesLocal(threadKey));
    markChatThreadRead(threadKey);
    let cancelled = false;
    void fetchChatMessagesRemote({
      rentalId,
      listingId,
      requestId,
      peerId,
      viewerId: auth.userId,
    }).then((remote) => {
      if (cancelled || remote.length === 0) return;
      for (const m of remote) appendChatMessageLocal(m);
      setMessages(loadChatMessagesLocal(threadKey));
      markChatThreadRead(threadKey);
    });
    const sub = subscribeToChatMessagesRemote({
      rentalId,
      listingId,
      requestId,
      onInsert: (message) => {
        if ((listingId || requestId) && auth.userId) {
          const pair = new Set([auth.userId, peerId]);
          if (!pair.has(message.senderId) || !pair.has(message.recipientId)) return;
        }
        appendChatMessageLocal(message);
        setMessages(loadChatMessagesLocal(threadKey));
        if (message.senderId !== auth.userId) {
          markChatThreadRead(threadKey);
        }
      },
    });
    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, [threadKey, rentalId, listingId, requestId, peerId, auth.userId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const rawBody = text.trim();
    if (!rawBody || sending || readOnly) return;
    if (!auth.userId) {
      onRequireAuth?.();
      return;
    }
    if (!peerId || peerId === "local") return;

    setGateMessage(null);

    if (isInModerationCooldown(auth.userId)) {
      const hours = formatCooldownHours(getModerationCooldownRemaining(auth.userId));
      setGateMessage(listing.moderationCooldownWait(hours));
      return;
    }

    setSending(true);
    try {
      const moderationResult = await moderatePeerChatMessage(rawBody);
      if (!moderationResult.ok) {
        if (moderationResult.reasonCode === "off_platform") {
          setGateMessage(peerChat.moderationOffPlatform);
          return;
        }
        const strike = recordModerationStrike({
          userId: auth.userId,
          severe: moderationResult.reasonCode === "blocked",
        });
        if (strike.hasCooldown) {
          setGateMessage(
            `${peerChat.moderationBlocked} ${listing.moderationCooldownWait(
              formatCooldownHours(strike.cooldownMs),
            )}`,
          );
        } else if (moderationResult.reasonCode === "verification_failed") {
          setGateMessage(peerChat.moderationVerifyFailed);
        } else {
          setGateMessage(
            `${peerChat.moderationBlocked} ${listing.moderationSoftNudgeChat}`,
          );
        }
        return;
      }

      const body = moderationResult.cleanedBody;
      const clientId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `msg-${Date.now()}`;
      const msg: ChatMessage = {
        id: clientId,
        clientId,
        rentalId: rentalId ?? null,
        listingId: listingId ?? null,
        requestId: requestId ?? null,
        senderId: auth.userId,
        recipientId: peerId,
        body,
        createdAt: new Date().toISOString(),
        sendStatus: "pending",
      };
      setText("");
      appendChatMessageLocal(msg);
      setMessages((prev) => [...prev, msg]);
      try {
        const remote = await sendChatMessageRemote({
          rentalId,
          listingId,
          requestId,
          senderId: auth.userId,
          recipientId: peerId,
          body,
          itemTitle,
        });
        if (remote?.id) {
          // Swap optimistic id for the server id so realtime insert does not duplicate.
          removeChatMessageLocal(threadKey, clientId);
          const confirmed: ChatMessage = {
            ...msg,
            id: remote.id,
            sendStatus: undefined,
            clientId: undefined,
          };
          appendChatMessageLocal(confirmed);
          setMessages(loadChatMessagesLocal(threadKey));
        } else if (!isSupabaseConfigured()) {
          // Local-only mode — keep the bubble without a pending spinner.
          updateChatMessageLocal(threadKey, clientId, { sendStatus: undefined });
          setMessages(loadChatMessagesLocal(threadKey));
        } else {
          updateChatMessageLocal(threadKey, clientId, { sendStatus: "failed" });
          setMessages(loadChatMessagesLocal(threadKey));
          setText(body);
          setGateMessage(peerChat.sendFailed);
        }
      } catch {
        updateChatMessageLocal(threadKey, clientId, { sendStatus: "failed" });
        setMessages(loadChatMessagesLocal(threadKey));
        setText(body);
        setGateMessage(peerChat.sendFailed);
      }
    } catch {
      setGateMessage(peerChat.moderationVerifyFailed);
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
            {peerChat.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500">{peerChat.tip(mascotHandle)}</p>
        </>
      ) : null}

      {banner ? (
        <p
          className={`rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 ${
            embedded ? "mt-3" : "mb-2"
          }`}
        >
          {banner}
        </p>
      ) : null}

      {readOnly ? (
        <p
          className={`rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 ${
            embedded && !banner ? "mt-3" : "mt-2"
          }`}
        >
          {peerChat.closedReadOnly}
        </p>
      ) : null}

      <div
        ref={listRef}
        className={`space-y-2 overflow-y-auto rounded-xl border bg-[#F7FBF8] p-3 ${
          embedded ? "mt-3 max-h-56" : "min-h-0 flex-1"
        }`}
        style={{ borderColor: BORDER }}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">{peerChat.empty}</p>
        ) : (
          messages.map((m) => {
            const mine = Boolean(auth.userId && m.senderId === auth.userId);
            const failed = m.sendStatus === "failed";
            const pending = m.sendStatus === "pending";
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  failed
                    ? "ml-auto border border-amber-300 bg-amber-50 text-amber-950"
                    : mine
                      ? "ml-auto bg-[#0D5C3A] text-white"
                      : "bg-white text-gray-800"
                }`}
                style={!mine && !failed ? { border: `1px solid ${BORDER}` } : undefined}
              >
                {m.body}
                <div
                  className={`mt-1 flex items-center gap-2 text-[10px] ${
                    failed ? "text-amber-800" : mine ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleString()}
                  {pending ? <span>· {peerChat.sending}</span> : null}
                  {failed ? <span>· {peerChat.sendFailedShort}</span> : null}
                  {mine ? null : (
                    <button
                      type="button"
                      onClick={() => setReported(m)}
                      aria-label={moderation.reportMessage}
                      title={moderation.reportMessage}
                      className="ml-auto flex h-6 w-6 touch-manipulation items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Flag className="h-3 w-3" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {gateMessage ? (
        <p className={`text-xs text-amber-800 ${embedded ? "mt-2" : "shrink-0 px-0 pt-2"}`}>
          {gateMessage}
        </p>
      ) : null}

      {blocked ? (
        <div
          className={`flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 ${
            embedded ? "mt-3" : "mt-2"
          }`}
        >
          <span className="flex-1">{moderation.blockedNotice}</span>
          <button
            type="button"
            onClick={() => void unblockUser({ viewerId: auth.userId, blockedId: peerId })}
            className="min-h-9 touch-manipulation rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: BORDER, color: GREEN }}
          >
            {moderation.unblockUser}
          </button>
        </div>
      ) : null}

      {readOnly || blocked ? null : (
      <div
        className={`flex gap-2 ${embedded ? "mt-3" : "shrink-0 border-t bg-white px-0 pt-3"}`}
        style={{ borderColor: BORDER }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder={peerChat.placeholder}
          className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-[#0D5C3A]"
          style={{ borderColor: BORDER }}
          disabled={sending}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !text.trim()}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: GREEN }}
        >
          {common.send}
        </button>
      </div>
      )}

      {reported ? (
        <ReportSheet
          targetKind="message"
          targetId={reported.id}
          targetThreadKey={threadKey}
          reportedUserId={reported.senderId}
          evidence={reported.body}
          onClose={() => setReported(null)}
        />
      ) : null}
    </div>
  );
}
