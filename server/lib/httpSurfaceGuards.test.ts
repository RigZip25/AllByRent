import { describe, expect, it } from "vitest";
import { isAllowedOgPhotoUrl } from "./ogPhotoAllowlist";
import { getAgentApiKey } from "./agentKey";

describe("og photo allowlist", () => {
  it("allows supabase storage https URLs", () => {
    expect(
      isAllowedOgPhotoUrl(
        "https://abcd.supabase.co/storage/v1/object/public/listing-photos/u/x.jpg",
        "https://abcd.supabase.co",
      ),
    ).toBe(true);
  });

  it("rejects arbitrary https hosts", () => {
    expect(isAllowedOgPhotoUrl("https://evil.example/secret.png")).toBe(false);
    expect(isAllowedOgPhotoUrl("http://abcd.supabase.co/storage/v1/object/public/x")).toBe(false);
    expect(isAllowedOgPhotoUrl("https://abcd.supabase.co/rest/v1/profiles")).toBe(false);
  });
});

describe("agentKey", () => {
  it("does not read VITE_AGENT_API_KEY", () => {
    const prevAgent = process.env.AGENT_API_KEY;
    const prevVite = process.env.VITE_AGENT_API_KEY;
    delete process.env.AGENT_API_KEY;
    process.env.VITE_AGENT_API_KEY = "client-bundled-secret";
    expect(getAgentApiKey()).toBeUndefined();
    if (prevAgent === undefined) delete process.env.AGENT_API_KEY;
    else process.env.AGENT_API_KEY = prevAgent;
    if (prevVite === undefined) delete process.env.VITE_AGENT_API_KEY;
    else process.env.VITE_AGENT_API_KEY = prevVite;
  });
});
