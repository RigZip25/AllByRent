import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export type RemoteProfile = {
  id: string;
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
};

export async function fetchRemoteProfile(userId: string): Promise<RemoteProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, phone, location_label, created_at, phone_verified, identity_verified, rating, stripe_connect_account_id, stripe_payouts_enabled, stripe_bank_last4",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as RemoteProfile;
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

