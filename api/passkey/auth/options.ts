import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { applyCors, handleOptions } from "../../_lib/cors";
import { getPasskeyRpId } from "../../_lib/keys";
import { signChallengeToken } from "../_lib/challenge";
import { getAdminClient } from "../_lib/supabaseAdmin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  let allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] | undefined;

  if (email) {
    const admin = getAdminClient();
    if (!admin) {
      return res.status(503).json({ error: "Auth service is not configured." });
    }
    const { data: profile, error } = await admin
      .from("profiles")
      .select("passkey_credential_id, passkey_transports")
      .eq("email", email)
      .maybeSingle();
    if (error || !profile?.passkey_credential_id) {
      return res.status(404).json({
        error: "No passkey registered for this account. Use email sign-in.",
      });
    }
    allowCredentials = [
      {
        id: profile.passkey_credential_id,
        transports: (profile.passkey_transports ?? []) as AuthenticatorTransport[],
      },
    ];
  }

  const options = await generateAuthenticationOptions({
    rpID: getPasskeyRpId(),
    allowCredentials,
    userVerification: "required",
  });

  const challengeToken = signChallengeToken({
    challenge: options.challenge,
    purpose: "auth",
    email: email || undefined,
  });

  return res.status(200).json({
    options,
    challengeToken,
    rpID: getPasskeyRpId(),
  });
}
