import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useAuth } from "../hooks/AuthProvider";
import {
  fetchRecentChatThreadsRemote,
  listChatThreadsLocal,
  type ChatThreadSummary,
} from "../lib/messagesStorage";
import { loadRentalBookings } from "../lib/rentalsStorage";
import { getPublishedListingById } from "../lib/listingStorage";
import { getListingDisplayTitle } from "../lib/listingQr";
import { BRAND_GREEN } from "../lib/brand";
import { useMessages } from "../lib/i18n/react";

const GREEN = BRAND_GREEN;
const BORDER = "#E8E6E0";

type Props = {
  onBack: () => void;
  onOpenRentalChat: (rentalId: string) => void;
  onOpenListingChat: (listingId: string, peerId: string) => void;
  onOpenRequestChat: (requestId: string, peerId: string) => void;
  onBrowse?: () => void;
  onOpenRentals?: () => void;
};

function threadTitle(thread: ChatThreadSummary, requestFallback: string): string {
  if (thread.kind === "rental" && thread.rentalId) {
    const booking = loadRentalBookings().find((b) => b.id === thread.rentalId);
    if (booking?.itemTitle) return booking.itemTitle;
    return "Rental chat";
  }
  if (thread.kind === "request") return requestFallback;
  if (thread.listingId) {
    const listing = getPublishedListingById(thread.listingId);
    if (listing) return getListingDisplayTitle(listing.title) || listing.title || "Listing chat";
    return "Listing chat";
  }
  return "Chat";
}

function mergeThreads(local: ChatThreadSummary[], remote: ChatThreadSummary[]): ChatThreadSummary[] {
  const map = new Map<string, ChatThreadSummary>();
  for (const t of [...remote, ...local]) {
    const prev = map.get(t.threadKey);
    if (!prev || t.updatedAt > prev.updatedAt) map.set(t.threadKey, t);
  }
  return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function MessagesInboxScreen({
  onBack,
  onOpenRentalChat,
  onOpenListingChat,
  onOpenRequestChat,
  onBrowse,
  onOpenRentals,
}: Props) {
  const auth = useAuth();
  const copy = useMessages();
  const [remote, setRemote] = useState<ChatThreadSummary[]>([]);
  const [tick, setTick] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);

  useEffect(() => {
    setTick((n) => n + 1);
    if (!auth.userId) {
      setSyncing(false);
      setSyncFailed(false);
      return;
    }
    let cancelled = false;
    setSyncing(true);
    setSyncFailed(false);
    void fetchRecentChatThreadsRemote(auth.userId)
      .then((rows) => {
        if (!cancelled) setRemote(rows);
      })
      .catch(() => {
        if (!cancelled) setSyncFailed(true);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.userId]);

  const threads = useMemo(() => {
    void tick;
    const local = listChatThreadsLocal(auth.userId);
    const bookings = loadRentalBookings().filter(
      (b) =>
        b.status === "active" ||
        b.status === "upcoming" ||
        b.status === "pending_approval" ||
        b.status === "pending_checkin" ||
        b.status === "overdue",
    );
    const extras: ChatThreadSummary[] = [];
    for (const b of bookings) {
      const key = `rental:${b.id}`;
      if (local.some((row) => row.threadKey === key) || remote.some((row) => row.threadKey === key)) {
        continue;
      }
      extras.push({
        kind: "rental",
        threadKey: key,
        rentalId: b.id,
        peerId: b.counterpartyId || "local",
        preview: copy.messages.tapToDiscuss,
        updatedAt: b.startDate || new Date(0).toISOString(),
        messageCount: 0,
      });
    }
    return mergeThreads([...local, ...extras], remote);
  }, [auth.userId, remote, tick, copy.messages.tapToDiscuss]);

  return (
    <div className="screen flex flex-col overflow-hidden bg-[#F0F4F2]">
      <header className="shrink-0 border-b bg-white px-4 pb-3 pt-3" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            aria-label={copy.common.back}
          >
            <ArrowLeft className="h-5 w-5" style={{ color: GREEN }} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold" style={{ color: GREEN }}>
              {copy.messages.title}
            </h1>
            <p className="text-[12px] text-gray-500">
              {copy.messages.subtitle}
              {threads.some((t) => (t.unreadCount ?? 0) > 0)
                ? ` · ${copy.messages.unreadCount(
                    threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0),
                  )}`
                : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!auth.userId ? (
          <p className="rounded-2xl border bg-white p-4 text-[14px] text-gray-600" style={{ borderColor: BORDER }}>
            {copy.messages.signInHint}
          </p>
        ) : null}

        {auth.userId && syncing ? (
          <p className="mb-3 text-center text-[12px] text-gray-500">{copy.messages.syncing}</p>
        ) : null}
        {auth.userId && syncFailed ? (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[12px] text-amber-950">
            {copy.messages.syncFailed}
          </p>
        ) : null}

        {threads.length === 0 ? (
          <div
            className="mt-2 flex flex-col items-center rounded-2xl border bg-white px-4 py-10 text-center"
            style={{ borderColor: BORDER }}
          >
            <MessageCircle className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-[15px] font-semibold" style={{ color: GREEN }}>
              {copy.messages.emptyTitle}
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-gray-500">{copy.messages.emptyBody}</p>
            <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
              {onBrowse ? (
                <button
                  type="button"
                  onClick={onBrowse}
                  className="w-full rounded-xl py-3 text-[14px] font-bold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {copy.messages.emptyBrowseCta}
                </button>
              ) : null}
              {onOpenRentals ? (
                <button
                  type="button"
                  onClick={onOpenRentals}
                  className="w-full rounded-xl border-2 py-3 text-[14px] font-bold"
                  style={{ borderColor: GREEN, color: GREEN }}
                >
                  {copy.messages.emptyRentalsCta}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {threads.map((thread) => (
              <li key={thread.threadKey}>
                <button
                  type="button"
                  onClick={() => {
                    if (thread.kind === "rental" && thread.rentalId) onOpenRentalChat(thread.rentalId);
                    else if (thread.kind === "request" && thread.requestId) {
                      onOpenRequestChat(thread.requestId, thread.peerId);
                    } else if (thread.listingId) onOpenListingChat(thread.listingId, thread.peerId);
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left active:bg-gray-50"
                  style={{
                    borderColor: BORDER,
                    backgroundColor: (thread.unreadCount ?? 0) > 0 ? "#F7FBF8" : undefined,
                  }}
                >
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "#F0F4F2" }}
                  >
                    <MessageCircle className="h-5 w-5" style={{ color: GREEN }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[15px] font-semibold" style={{ color: GREEN }}>
                        {threadTitle(thread, copy.messages.requestFallback)}
                      </p>
                      <span className="shrink-0 text-[11px] text-gray-500">
                        {new Date(thread.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-gray-500">
                      {thread.kind === "rental"
                        ? copy.messages.rental
                        : thread.kind === "request"
                          ? copy.messages.request
                          : copy.messages.buyGift}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-gray-600">{thread.preview}</p>
                  </div>
                  {(thread.unreadCount ?? 0) > 0 ? (
                    <span
                      className="mt-1 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                      style={{ backgroundColor: GREEN }}
                      aria-label={copy.messages.unreadCount(thread.unreadCount ?? 0)}
                    >
                      {thread.unreadCount}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
