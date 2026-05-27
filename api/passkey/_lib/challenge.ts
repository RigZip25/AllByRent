import crypto from "node:crypto";
import { getPasskeySecret } from "../../_lib/keys";

export type ChallengePurpose = "register" | "auth";

export type ChallengePayload = {
  challenge: string;
  purpose: ChallengePurpose;
  userId?: string;
  email?: string;
  exp: number;
};

export function signChallengeToken(payload: Omit<ChallengePayload, "exp"> & { ttlMs?: number }): string {
  const exp = Date.now() + (payload.ttlMs ?? 5 * 60 * 1000);
  const body: ChallengePayload = {
    challenge: payload.challenge,
    purpose: payload.purpose,
    userId: payload.userId,
    email: payload.email,
    exp,
  };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  const sig = crypto.createHmac("sha256", getPasskeySecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyChallengeToken(token: string): ChallengePayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", getPasskeySecret()).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as ChallengePayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!payload.challenge || !payload.purpose) return null;
    return payload;
  } catch {
    return null;
  }
}
