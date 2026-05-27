import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { applyCors, handleOptions } from "../../_lib/cors";
import { getPasskeyAllowedOrigins, getPasskeyRpIdForRequest } from "../../_lib/keys";
import { withApiErrorHandling } from "../../_lib/safeHandler";
import { verifyChallengeToken } from "../_lib/challenge";
import { upsertPasskeyProfile } from "../_lib/profiles";
import { getUserFromBearer } from "../_lib/supabaseAdmin";

async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  applyCors(res, origin);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getUserFromBearer(req.headers.authorization);
  if (!user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { attestationResponse, challengeToken } = body ?? {};

  if (!attestationResponse || !challengeToken) {
    return res.status(400).json({ error: "Missing attestationResponse or challengeToken" });
  }

  const challengePayload = verifyChallengeToken(challengeToken);
  if (!challengePayload || challengePayload.purpose !== "register") {
    return res.status(400).json({ error: "Invalid or expired challenge" });
  }
  if (challengePayload.userId !== user.id) {
    return res.status(403).json({ error: "Challenge user mismatch" });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challengePayload.challenge,
      expectedOrigin: getPasskeyAllowedOrigins(),
      expectedRPID: getPasskeyRpIdForRequest(origin),
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: "Passkey registration could not be verified." });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    await upsertPasskeyProfile({
      userId: user.id,
      email: user.email,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    });

    return res.status(200).json({ verified: true, credentialId: credential.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    const hint =
      /origin|rpId|RP ID/i.test(message)
        ? "Face ID domain mismatch. Use https://app.allbyrent.com and check PASSKEY_ORIGIN / PASSKEY_RP_ID in Vercel."
        : message;
    return res.status(400).json({ error: hint });
  }
}

export default withApiErrorHandling(handler);
