import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { getAdminClient } from "./supabaseAdmin";

export type ProfilePasskeyRow = {
  id: string;
  email: string | null;
  passkey_credential_id: string | null;
  passkey_public_key: string;
  passkey_counter: number;
  passkey_transports: string[] | null;
};

export async function getProfileByCredentialId(
  credentialId: string,
): Promise<ProfilePasskeyRow | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, email, passkey_credential_id, passkey_public_key, passkey_counter, passkey_transports",
    )
    .eq("passkey_credential_id", credentialId)
    .maybeSingle();
  if (error || !data?.passkey_credential_id) return null;
  return data as ProfilePasskeyRow;
}

export async function getProfileByUserId(userId: string): Promise<ProfilePasskeyRow | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, email, passkey_credential_id, passkey_public_key, passkey_counter, passkey_transports",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return (data as ProfilePasskeyRow | null) ?? null;
}

export async function upsertPasskeyProfile(args: {
  userId: string;
  email: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  deviceType?: string;
  backedUp?: boolean;
}): Promise<void> {
  const admin = getAdminClient();
  if (!admin) throw new Error("Supabase admin is not configured.");

  const { error } = await admin.from("profiles").upsert(
    {
      id: args.userId,
      email: args.email,
      passkey_credential_id: args.credentialId,
      passkey_public_key: args.publicKey,
      passkey_counter: args.counter,
      passkey_transports: args.transports ?? [],
      passkey_device_type: args.deviceType ?? null,
      passkey_backed_up: args.backedUp ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function updatePasskeyCounter(
  userId: string,
  counter: number,
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) throw new Error("Supabase admin is not configured.");
  const { error } = await admin
    .from("profiles")
    .update({ passkey_counter: counter, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}
