import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import { createNotificationRemote } from "./notificationsStorage";
import { APP_NAME } from "./brand";

export type ChatMessage = {
  id: string;
  /** Rental thread id, when chatting about a booking. */
  rentalId: string | null;
  /** Listing thread id, when chatting about a buy/gift item. */
  listingId: string | null;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
};

export type ChatThreadKind = "rental" | "listing";

export type ChatThreadSummary = {
  kind: ChatThreadKind;
  /** Stable key for local storage / UI lists. */
  threadKey: string;
  rentalId?: string;
  listingId?: string;
  peerId: string;
  preview: string;
  updatedAt: string;
  messageCount: number;
};

type RemoteMessageRow = {
  id: string;
  rental_id: string | null;
  listing_id: string | null;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

const LOCAL_KEY = "abr_chat_messages_v1";

function safeUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `msg-${Date.now()}`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function rentalThreadKey(rentalId: string): string {
  return `rental:${rentalId}`;
}

export function listingThreadKey(listingId: string, userA: string, userB: string): string {
  const [a, b] = [userA, userB].sort();
  return `listing:${listingId}:${a}:${b}`;
}

function loadLocalAll(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ChatMessage[]>;
    if (!parsed || typeof parsed !== "object") return {};
    // Migrate legacy rentalId-only keys → rental:id
    const next: Record<string, ChatMessage[]> = {};
    for (const [key, list] of Object.entries(parsed)) {
      if (!Array.isArray(list)) continue;
      const normalizedKey = key.startsWith("rental:") || key.startsWith("listing:")
        ? key
        : rentalThreadKey(key);
      const normalizedList = list.map((m) => ({
        ...m,
        rentalId: m.rentalId ?? (key.startsWith("listing:") ? null : key.replace(/^rental:/, "")),
        listingId: m.listingId ?? null,
      }));
      next[normalizedKey] = [...(next[normalizedKey] ?? []), ...normalizedList].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
    }
    return next;
  } catch {
    return {};
  }
}

function saveLocalAll(next: Record<string, ChatMessage[]>): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function threadKeyForMessage(message: ChatMessage): string {
  if (message.rentalId) return rentalThreadKey(message.rentalId);
  if (message.listingId) {
    return listingThreadKey(message.listingId, message.senderId, message.recipientId);
  }
  return rentalThreadKey(message.id);
}

export function loadChatMessagesLocal(threadKey: string): ChatMessage[] {
  const all = loadLocalAll();
  // Legacy: callers may still pass bare rentalId
  const key = threadKey.startsWith("rental:") || threadKey.startsWith("listing:")
    ? threadKey
    : rentalThreadKey(threadKey);
  return Array.isArray(all[key]) ? all[key] : [];
}

/** @deprecated Prefer loadChatMessagesLocal(rentalThreadKey(id)) */
export function loadChatMessagesForRental(rentalId: string): ChatMessage[] {
  return loadChatMessagesLocal(rentalThreadKey(rentalId));
}

export function appendChatMessageLocal(message: ChatMessage): void {
  const all = loadLocalAll();
  const key = threadKeyForMessage(message);
  const list = Array.isArray(all[key]) ? all[key] : [];
  if (list.some((m) => m.id === message.id)) {
    all[key] = list;
  } else {
    all[key] = [...list, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  saveLocalAll(all);
}

function rowToMessage(row: RemoteMessageRow): ChatMessage {
  return {
    id: row.id,
    rentalId: row.rental_id,
    listingId: row.listing_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function fetchChatMessagesRemote(input: {
  rentalId?: string | null;
  listingId?: string | null;
  peerId?: string | null;
  viewerId?: string | null;
}): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  if (input.rentalId && isUuid(input.rentalId)) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("rental_id", input.rentalId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error || !data) return [];
    return (data as unknown as RemoteMessageRow[]).map(rowToMessage);
  }

  if (input.listingId && isUuid(input.listingId)) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", input.listingId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error || !data) return [];
    const rows = (data as unknown as RemoteMessageRow[]).map(rowToMessage);
    const peer = input.peerId;
    const viewer = input.viewerId;
    if (peer && viewer) {
      return rows.filter(
        (m) =>
          (m.senderId === viewer && m.recipientId === peer) ||
          (m.senderId === peer && m.recipientId === viewer),
      );
    }
    if (peer) {
      return rows.filter((m) => m.senderId === peer || m.recipientId === peer);
    }
    return rows;
  }

  return [];
}

async function notifyChatPeer(input: {
  recipientId: string;
  senderId: string;
  body: string;
  rentalId?: string | null;
  listingId?: string | null;
  itemTitle?: string;
}): Promise<void> {
  if (!isUuid(input.recipientId) || !isUuid(input.senderId)) return;
  if (input.recipientId === input.senderId) return;

  const preview = input.body.trim().slice(0, 120);
  const title = input.itemTitle
    ? `New message · ${input.itemTitle}`
    : `New message on ${APP_NAME}`;

  let url = "/?screen=messages&skipSplash=1";
  if (input.rentalId) {
    url = `/?screen=activeRental&rentalId=${encodeURIComponent(input.rentalId)}&chat=1&skipSplash=1`;
  } else if (input.listingId) {
    url = `/?screen=listingChat&listingId=${encodeURIComponent(input.listingId)}&peerId=${encodeURIComponent(input.senderId)}&skipSplash=1`;
  }

  await createNotificationRemote({
    recipientId: input.recipientId,
    actorId: input.senderId,
    type: "general",
    title,
    body: preview || "Open the app to reply.",
    rentalId: input.rentalId ?? undefined,
    listingId: input.listingId ?? undefined,
    skipLocal: true,
    url,
  });
}

export async function sendChatMessageRemote(input: {
  rentalId?: string | null;
  listingId?: string | null;
  senderId: string;
  recipientId: string;
  body: string;
  itemTitle?: string;
}): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) {
    // Still notify when possible (notification insert may work without messages table write)
    await notifyChatPeer(input);
    return null;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    await notifyChatPeer(input);
    return null;
  }
  if (!isUuid(input.senderId) || !isUuid(input.recipientId)) return null;
  if (input.rentalId && !isUuid(input.rentalId)) return null;
  if (input.listingId && !isUuid(input.listingId)) return null;
  if (!input.rentalId && !input.listingId) return null;

  const id = safeUuid();
  const row: Record<string, string | null> = {
    id,
    rental_id: input.rentalId ?? null,
    listing_id: input.listingId ?? null,
    sender_id: input.senderId,
    recipient_id: input.recipientId,
    body: input.body,
  };

  const { error } = await supabase.from("messages").insert(row);
  if (error) {
    // Listing column may not exist yet — retry rental-only shape won't help for listing.
    // Still push-notify so the peer knows something arrived.
    await notifyChatPeer(input);
    throw error;
  }

  await notifyChatPeer(input);
  return { id };
}

export function subscribeToChatMessagesRemote(input: {
  rentalId?: string | null;
  listingId?: string | null;
  onInsert: (message: ChatMessage) => void;
}): { unsubscribe: () => void } {
  if (!isSupabaseConfigured()) return { unsubscribe: () => undefined };
  const supabase = getSupabaseClient();
  if (!supabase) return { unsubscribe: () => undefined };

  const filter = input.rentalId && isUuid(input.rentalId)
    ? `rental_id=eq.${input.rentalId}`
    : input.listingId && isUuid(input.listingId)
      ? `listing_id=eq.${input.listingId}`
      : null;
  if (!filter) return { unsubscribe: () => undefined };

  const channel = supabase
    .channel(`public:messages:${filter}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter,
      },
      (payload) => {
        const row = payload.new as RemoteMessageRow;
        input.onInsert(rowToMessage(row));
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}

/** Build inbox rows from local cache (works offline / demo). */
export function listChatThreadsLocal(viewerId: string | null): ChatThreadSummary[] {
  const all = loadLocalAll();
  const threads: ChatThreadSummary[] = [];

  for (const [key, list] of Object.entries(all)) {
    if (!Array.isArray(list) || list.length === 0) continue;
    const last = list[list.length - 1]!;
    const peers = new Set<string>();
    for (const m of list) {
      peers.add(m.senderId);
      peers.add(m.recipientId);
    }
    if (viewerId && viewerId !== "local" && !peers.has(viewerId) && !peers.has("local")) {
      continue;
    }
    const peerId =
      [...peers].find((id) => id !== viewerId && id !== "local") ??
      [...peers].find((id) => id !== viewerId) ??
      "local";

    if (key.startsWith("listing:")) {
      const parts = key.split(":");
      const listingId = parts[1] ?? last.listingId ?? "";
      threads.push({
        kind: "listing",
        threadKey: key,
        listingId,
        peerId,
        preview: last.body,
        updatedAt: last.createdAt,
        messageCount: list.length,
      });
    } else {
      const rentalId = key.replace(/^rental:/, "") || last.rentalId || "";
      threads.push({
        kind: "rental",
        threadKey: key,
        rentalId,
        peerId,
        preview: last.body,
        updatedAt: last.createdAt,
        messageCount: list.length,
      });
    }
  }

  return threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function fetchRecentChatThreadsRemote(viewerId: string): Promise<ChatThreadSummary[]> {
  if (!isSupabaseConfigured() || !isUuid(viewerId)) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${viewerId},recipient_id.eq.${viewerId}`)
    .order("created_at", { ascending: false })
    .limit(120);
  if (error || !data) return [];

  const byKey = new Map<string, ChatThreadSummary>();
  for (const raw of data as unknown as RemoteMessageRow[]) {
    const m = rowToMessage(raw);
    const key = threadKeyForMessage(m);
    if (byKey.has(key)) continue;
    const peerId = m.senderId === viewerId ? m.recipientId : m.senderId;
    byKey.set(key, {
      kind: m.rentalId ? "rental" : "listing",
      threadKey: key,
      rentalId: m.rentalId ?? undefined,
      listingId: m.listingId ?? undefined,
      peerId,
      preview: m.body,
      updatedAt: m.createdAt,
      messageCount: 1,
    });
  }
  return [...byKey.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
