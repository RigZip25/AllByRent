import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { applyCors, handleOptions } from "../../_lib/cors";
import { getPasskeyOrigin, getPasskeyRpIdForRequest } from "../../_lib/keys";
import { withApiErrorHandling } from "../../_lib/safeHandler";
import { signChallengeToken } from "../_lib/challenge";
import { getProfileByUserId } from "../_lib/profiles";
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
    return res.status(401).json({ error: "Sign in with email before registering a passkey." });
  }

  const existing = await getProfileByUserId(user.id);
  const excludeCredentials =
    existing?.passkey_credential_id && existing.passkey_public_key
      ? [
          {
            id: existing.passkey_credential_id,
            transports: (existing.passkey_transports ?? []) as AuthenticatorTransport[],
          },
        ]
      : [];

  const rpID = getPasskeyRpIdForRequest(origin);

  const options = await generateRegistrationOptions({
    rpName: "Evorios",
    rpID,
    userName: user.email,
    userID: new TextEncoder().encode(user.id),
    userDisplayName: user.email,
    attestationType: "none",
    excludeCredentials,
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required",
    },
  });

  const challengeToken = signChallengeToken({
    challenge: options.challenge,
    purpose: "register",
    userId: user.id,
    email: user.email,
  });

  return res.status(200).json({
    options,
    challengeToken,
    expectedOrigin: getPasskeyOrigin(),
    rpID,
  });
}

export default withApiErrorHandling(handler);
