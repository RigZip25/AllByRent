/**
 * Client helper: ask the API to email a co-host invite via Resend.
 */
import { buildCoHostInviteUrlForInvite, type CoHostRecord } from "./coHostStorage";
import { getAccessToken } from "./stripePayments";
import { loadUserProfile } from "./userProfileStorage";

export type SendCoHostInviteEmailResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

export async function sendCoHostInviteEmail(params: {
  record: CoHostRecord;
  garageName?: string;
  hostDisplayName?: string;
}): Promise<SendCoHostInviteEmailResult> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "Sign in required", code: "unauthorized" };
  }

  const profile = loadUserProfile();
  const hostDisplayName =
    params.hostDisplayName?.trim() ||
    profile.displayName?.trim() ||
    undefined;
  const garageName =
    params.garageName?.trim() ||
    profile.garageIdentity?.shopName?.trim() ||
    undefined;

  try {
    const res = await fetch("/api/cohosts/invite-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        inviteId: params.record.id,
        email: params.record.email,
        displayName: params.record.displayName,
        garageName,
        hostDisplayName,
        inviteUrl: buildCoHostInviteUrlForInvite(params.record.id),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      code?: string;
    };

    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: data.error?.trim() || "Could not send invite email.",
        code: data.code,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not send invite email.", code: "network" };
  }
}
