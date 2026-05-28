import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type ChatMessage = {
  id: string;
  rentalId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
};

type RemoteMessageRow = {
  id: string;
  rental_id: string;
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

function loadLocalAll(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ChatMessage[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
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

export function loadChatMessagesLocal(rentalId: string): ChatMessage[] {
  const all = loadLocalAll();
  return Array.isArray(all[rentalId]) ? all[rentalId] : [];
}

export function appendChatMessageLocal(message: ChatMessage): void {
  const all = loadLocalAll();
  const list = Array.isArray(all[message.rentalId]) ? all[message.rentalId] : [];
  all[message.rentalId] = [...list, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  saveLocalAll(all);
}

export async function fetchChatMessagesRemote(rentalId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("rental_id", rentalId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error || !data) return [];

  return (data as unknown as RemoteMessageRow[]).map((row) => ({
    id: row.id,
    rentalId: row.rental_id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function sendChatMessageRemote(input: {
  rentalId: string;
  senderId: string;
  recipientId: string;
  body: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  if (!isUuid(input.rentalId) || !isUuid(input.senderId) || !isUuid(input.recipientId)) return;

  const row = {
    id: safeUuid(),
    rental_id: input.rentalId,
    sender_id: input.senderId,
    recipient_id: input.recipientId,
    body: input.body,
  };

  const { error } = await supabase.from("messages").insert(row);
  if (error) throw error;
}

export function subscribeToChatMessagesRemote(input: {
  rentalId: string;
  onInsert: (message: ChatMessage) => void;
}): { unsubscribe: () => void } {
  if (!isSupabaseConfigured()) return { unsubscribe: () => undefined };
  const supabase = getSupabaseClient();
  if (!supabase) return { unsubscribe: () => undefined };
  if (!isUuid(input.rentalId)) return { unsubscribe: () => undefined };

  const channel = supabase
    .channel(`public:messages:rental:${input.rentalId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `rental_id=eq.${input.rentalId}`,
      },
      (payload) => {
        const row = payload.new as RemoteMessageRow;
        input.onInsert({
          id: row.id,
          rentalId: row.rental_id,
          senderId: row.sender_id,
          recipientId: row.recipient_id,
          body: row.body,
          createdAt: row.created_at,
        });
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}

