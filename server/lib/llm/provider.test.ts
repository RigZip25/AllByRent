import { describe, expect, it } from "vitest";
import {
  clampLlmMaxTokens,
  isAllowedLlmModel,
  LLM_MAX_TOKENS_CAP,
  LLM_MAX_TOKENS_DEFAULT,
  resolveLlmModel,
} from "./provider";

describe("llm provider guards", () => {
  it("clamps max_tokens to a hard ceiling", () => {
    expect(clampLlmMaxTokens(undefined)).toBe(LLM_MAX_TOKENS_DEFAULT);
    expect(clampLlmMaxTokens(0)).toBe(LLM_MAX_TOKENS_DEFAULT);
    expect(clampLlmMaxTokens(900)).toBe(900);
    expect(clampLlmMaxTokens(50_000)).toBe(LLM_MAX_TOKENS_CAP);
    expect(clampLlmMaxTokens(-3)).toBe(LLM_MAX_TOKENS_DEFAULT);
  });

  it("allowlists models and ignores unknown client picks", () => {
    expect(isAllowedLlmModel("openai", "gpt-4o-mini")).toBe(true);
    expect(isAllowedLlmModel("openai", "gpt-evil")).toBe(false);
    expect(
      resolveLlmModel("openai", {
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 100,
        model: "gpt-evil",
      }),
    ).toBe("gpt-4o-mini");
  });
});
