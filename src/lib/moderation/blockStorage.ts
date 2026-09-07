/**
 * Blocking a neighbour.
 *
 * The list is kept locally so every feed can filter synchronously while it
 * renders, and mirrored to `user_blocks` so the block follows the account to
 * another device and so the database can refuse messages from a blocked person.
 */
import { getSupabaseClient, isSupabaseConfigured } from "../supabaseClient";

export const USER_BLOCKS_KEY = "evorios_user_blocks_v1";
export const USER_BLOCKS_CHANGED_EVENT = "evorios-user-blocks-changed";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_BLOCKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is string => typeof id === "string" && !!id.trim()))];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]): void {
  try {
    localStorage.setItem(USER_BLOCKS_KEY, JSON.stringify([...new Set(ids)].slice(0, 500)));
    window.dispatchEvent(new CustomEvent(USER_BLOCKS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function loadBlockedUserIds(): string[] {
  return readLocal();
}

export function isUserBlocked(userId: string | null | undefined): boolean {
  const id = (userId ?? "").trim();
  if (!id) return false;
  return readLocal().includes(id);
}

/** Drop anything authored by someone on the block list. */
export function withoutBlocked<T>(items: T[], authorId: (item: T) => string | null | undefined): T[] {
  const blocked = new Set(readLocal());
  if (blocked.size === 0) return items;
  return items.filter((item) => {
    const id = (authorId(item) ?? "").trim();
    return !id || !blocked.has(id);
  });
}

export function onBlocksChanged(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener(USER_BLOCKS_CHANGED_EVENT, handler);
  return () => window.removeEventListener(USER_BLOCKS_CHANGED_EVENT, handler);
}

export async function blockUser(params: {
  viewerId: string | null;
  blockedId: string;
}): Promise<{ ok: boolean; remote: boolean }> {
  const blockedId = params.blockedId.trim();
  const viewerId = (params.viewerId ?? "").trim();
  if (!blockedId || blockedId === viewerId) return { ok: false, remote: false };

  writeLocal([blockedId, ...readLocal()]);

  if (!viewerId || !isSupabaseConfigured()) return { ok: true, remote: false };
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true, remote: false };

  const { error } = await supabase
    .from("user_blocks")
    .upsert({ blocker_id: viewerId, blocked_id: blockedId }, { onConflict: "blocker_id,blocked_id" });
  return { ok: true, remote: !error };
}

export async function unblockUser(params: {
  viewerId: string | null;
  blockedId: string;
}): Promise<{ ok: boolean; remote: boolean }> {
  const blockedId = params.blockedId.trim();
  const viewerId = (params.viewerId ?? "").trim();
  if (!blockedId) return { ok: false, remote: false };

  writeLocal(readLocal().filter((id) => id !== blockedId));

  if (!viewerId || !isSupabaseConfigured()) return { ok: true, remote: false };
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true, remote: false };

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", viewerId)
    .eq("blocked_id", blockedId);
  return { ok: true, remote: !error };
}

/**
 * Pull the account's list on sign-in. Local entries made while signed out are
 * kept and pushed up, so a block never quietly disappears.
 */
export async function syncBlocksFromRemote(viewerId: string | null): Promise<string[]> {
  const id = (viewerId ?? "").trim();
  if (!id || !isSupabaseConfigured()) return readLocal();
  const supabase = getSupabaseClient();
  if (!supabase) return readLocal();

  const { data, error } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", id);
  if (error || !data) return readLocal();

  const remote = data
    .map((row) => String((row as { blocked_id?: unknown }).blocked_id ?? "").trim())
    .filter(Boolean);
  const local = readLocal();
  const merged = [...new Set([...remote, ...local])];
  writeLocal(merged);

  const missingRemotely = local.filter((entry) => !remote.includes(entry));
  if (missingRemotely.length > 0) {
    await supabase.from("user_blocks").upsert(
      missingRemotely.map((blockedId) => ({ blocker_id: id, blocked_id: blockedId })),
      { onConflict: "blocker_id,blocked_id" },
    );
  }
  return merged;
}
