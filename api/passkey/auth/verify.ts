import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { applyCors, handleOptions } from "../../_lib/cors";
import { getPasskeyAllowedOrigins, getPasskeyRpIdForRequest } from "../../_lib/keys";
import { withApiErrorHandling } from "../../_lib/safeHandler";
import { verifyChallengeToken } from "../_lib/challenge";
import { getProfileByCredentialId, updatePasskeyCounter } from "../_lib/profiles";
import { mintSessionForUserId } from "../_lib/supabaseAdmin";

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { assertionResponse, challengeToken } = body ?? {};

  if (!assertionResponse || !challengeToken) {
    return res.status(400).json({ error: "Missing assertionResponse or challengeToken" });
  }

  const challengePayload = verifyChallengeToken(challengeToken);
  if (!challengePayload || challengePayload.purpose !== "auth") {
    return res.status(400).json({ error: "Invalid or expired challenge" });
  }

  const credentialId = assertionResponse.id as string;
  const profile = await getProfileByCredentialId(credentialId);
  if (!profile?.passkey_public_key) {
    return res.status(404).json({ error: "Passkey not found." });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: assertionResponse,
      expectedChallenge: challengePayload.challenge,
      expectedOrigin: getPasskeyAllowedOrigins(),
      expectedRPID: getPasskeyRpIdForRequest(origin),
      requireUserVerification: true,
      credential: {
        id: profile.passkey_credential_id!,
        publicKey: Buffer.from(profile.passkey_public_key, "base64url"),
        counter: profile.passkey_counter,
        transports: (profile.passkey_transports ?? []) as AuthenticatorTransport[],
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Passkey authentication failed." });
    }

    const { newCounter } = verification.authenticationInfo;
    await updatePasskeyCounter(profile.id, newCounter);

    const session = await mintSessionForUserId(profile.id);
    if (!session) {
      return res.status(503).json({ error: "Could not create session. Check server configuration." });
    }

    return res.status(200).json({
      verified: true,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    const hint =
      /origin|rpId|RP ID/i.test(message)
        ? "Face ID domain mismatch. Use https://app.evorios.com and check PASSKEY_ORIGIN / PASSKEY_RP_ID in Vercel."
        : message;
    return res.status(400).json({ error: hint });
  }
}

export default withApiErrorHandling(handler);
