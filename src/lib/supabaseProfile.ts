import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type RemoteProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  location_label: string | null;
  created_at: string;
  phone_verified: boolean | null;
  identity_verified: boolean | null;
  rating: number | null;
  stripe_connect_account_id?: string | null;
  stripe_payouts_enabled?: boolean | null;
  stripe_bank_last4?: string | null;
  stripe_customer_id?: string | null;
};

export async function fetchRemoteProfile(userId: string): Promise<RemoteProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, phone, location_label, created_at, phone_verified, identity_verified, rating, stripe_connect_account_id, stripe_payouts_enabled, stripe_bank_last4, stripe_customer_id",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as RemoteProfile;
}

/** Batch-load display names for garage cards / trust lines. */
export async function fetchRemoteProfileNamesByIds(
  userIds: string[],
): Promise<Record<string, { displayName: string; rating: number; createdAt: string | null }>> {
  const ids = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0 || !isSupabaseConfigured()) return {};
  const supabase = getSupabaseClient();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, rating, created_at")
    .in("id", ids);
  if (error || !data) return {};
  const out: Record<string, { displayName: string; rating: number; createdAt: string | null }> = {};
  for (const row of data) {
    const id = typeof row.id === "string" ? row.id : "";
    if (!id) continue;
    out[id] = {
      displayName: (row.display_name as string | null)?.trim() || "Neighbor",
      rating: typeof row.rating === "number" ? row.rating : 0,
      createdAt: typeof row.created_at === "string" ? row.created_at : null,
    };
  }
  return out;
}

export async function updateRemoteProfile(
  userId: string,
  patch: Partial<Pick<RemoteProfile, "display_name" | "phone" | "location_label">>,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

