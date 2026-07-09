import { completeAnthropicChat } from "./anthropic";
import { completeGeminiChat } from "./gemini";
import { completeOpenAiChat } from "./openai";
import { resolveLlmModel, resolveLlmProvider } from "./provider";
import type { LlmChatRequest, LlmChatResponse } from "./types";

export async function completeLlmChat(request: LlmChatRequest): Promise<LlmChatResponse> {
  if (!request.messages?.length) {
    throw new Error("messages are required");
  }
  if (!Number.isFinite(request.max_tokens) || request.max_tokens <= 0) {
    throw new Error("max_tokens must be a positive number");
  }

  const provider = resolveLlmProvider();
  if (!provider) {
    throw new Error(
      "No LLM API key configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY on the server.",
    );
  }

  const model = resolveLlmModel(provider, request);

  const text =
    provider === "gemini"
      ? await completeGeminiChat(request, model)
      : provider === "openai"
        ? await completeOpenAiChat(request, model)
        : await completeAnthropicChat(request, model);

  return { text, provider, model };
}
