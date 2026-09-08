import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type RemoteProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  location_label: string | null;
  date_of_birth?: string | null;
  created_at: string;
  phone_verified: boolean | null;
  phone_verified_at?: string | null;
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
      "id, email, display_name, phone, location_label, date_of_birth, created_at, phone_verified, phone_verified_at, identity_verified, rating, stripe_connect_account_id, stripe_payouts_enabled, stripe_bank_last4, stripe_customer_id",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as RemoteProfile;
}

/**
 * What one person may know about another: a name, a rating, the trust badges
 * and how long they have been around. `profiles` itself is readable only by its
 * owner, so every cross-user read goes through the `public_profiles` view
 * (migration 057) instead of the table.
 */
export type PublicProfile = {
  id: string;
  displayName: string;
  rating: number;
  reviewsCount: number;
  identityVerified: boolean;
  phoneVerified: boolean;
  createdAt: string | null;
  avatarPath: string | null;
};

const PUBLIC_PROFILE_COLUMNS =
  "id, display_name, rating, reviews_count, identity_verified, phone_verified, created_at, avatar_path";

function publicProfileFromRow(row: Record<string, unknown>): PublicProfile | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;
  return {
    id,
    displayName: (row.display_name as string | null)?.trim() || "",
    rating: typeof row.rating === "number" ? row.rating : 0,
    reviewsCount: typeof row.reviews_count === "number" ? row.reviews_count : 0,
    identityVerified: Boolean(row.identity_verified),
    phoneVerified: Boolean(row.phone_verified),
    createdAt: typeof row.created_at === "string" ? row.created_at : null,
    avatarPath: typeof row.avatar_path === "string" ? row.avatar_path : null,
  };
}

export async function fetchPublicProfilesByIds(
  userIds: string[],
): Promise<Record<string, PublicProfile>> {
  const ids = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0 || !isSupabaseConfigured()) return {};
  const supabase = getSupabaseClient();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("public_profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .in("id", ids);
  if (error || !data) return {};
  const out: Record<string, PublicProfile> = {};
  for (const row of data) {
    const profile = publicProfileFromRow(row as Record<string, unknown>);
    if (profile) out[profile.id] = profile;
  }
  return out;
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile | null> {
  const id = userId.trim();
  if (!id || !isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("public_profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return publicProfileFromRow(data as Record<string, unknown>);
}

/** Batch-load display names for garage cards / trust lines. */
export async function fetchRemoteProfileNamesByIds(
  userIds: string[],
): Promise<Record<string, { displayName: string; rating: number; createdAt: string | null }>> {
  const profiles = await fetchPublicProfilesByIds(userIds);
  const out: Record<string, { displayName: string; rating: number; createdAt: string | null }> = {};
  for (const [id, profile] of Object.entries(profiles)) {
    out[id] = {
      displayName: profile.displayName || "Neighbor",
      rating: profile.rating,
      createdAt: profile.createdAt,
    };
  }
  return out;
}

export async function updateRemoteProfile(
  userId: string,
  patch: Partial<Pick<RemoteProfile, "display_name" | "phone" | "location_label" | "date_of_birth">>,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

