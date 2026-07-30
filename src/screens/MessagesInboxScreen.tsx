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
};

function threadTitle(thread: ChatThreadSummary): string {
  if (thread.kind === "rental" && thread.rentalId) {
    const booking = loadRentalBookings().find((b) => b.id === thread.rentalId);
    if (booking?.itemTitle) return booking.itemTitle;
    return "Rental chat";
  }
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

export function MessagesInboxScreen({ onBack, onOpenRentalChat, onOpenListingChat }: Props) {
  const auth = useAuth();
  const copy = useMessages();
  const [remote, setRemote] = useState<ChatThreadSummary[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick((n) => n + 1);
    if (!auth.userId) return;
    let cancelled = false;
    void fetchRecentChatThreadsRemote(auth.userId).then((rows) => {
      if (!cancelled) setRemote(rows);
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
            <p className="text-[12px] text-gray-500">{copy.messages.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!auth.userId ? (
          <p className="rounded-2xl border bg-white p-4 text-[14px] text-gray-600" style={{ borderColor: BORDER }}>
            {copy.messages.signInHint}
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
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {threads.map((thread) => (
              <li key={thread.threadKey}>
                <button
                  type="button"
                  onClick={() => {
                    if (thread.kind === "rental" && thread.rentalId) onOpenRentalChat(thread.rentalId);
                    else if (thread.listingId) onOpenListingChat(thread.listingId, thread.peerId);
                  }}
                  className="flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left active:bg-gray-50"
                  style={{ borderColor: BORDER }}
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
                        {threadTitle(thread)}
                      </p>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {new Date(thread.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-gray-400">
                      {thread.kind === "rental" ? copy.messages.rental : copy.messages.buyGift}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-gray-600">{thread.preview}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
