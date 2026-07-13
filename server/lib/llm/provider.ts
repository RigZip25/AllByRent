import {
  getAnthropicApiKey,
  getGeminiApiKey,
  getOpenAiApiKey,
  getLlmChatModel,
  getLlmVisionModel,
} from "../keys";
import type { LlmChatRequest, LlmProvider, LlmPurpose } from "./types";

export function resolveLlmProvider(): LlmProvider | null {
  const forced = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (forced === "gemini" || forced === "openai" || forced === "anthropic") {
    if (forced === "gemini" && getGeminiApiKey()) return "gemini";
    if (forced === "openai" && getOpenAiApiKey()) return "openai";
    if (forced === "anthropic" && getAnthropicApiKey()) return "anthropic";
    return null;
  }
  if (getGeminiApiKey()) return "gemini";
  if (getOpenAiApiKey()) return "openai";
  if (getAnthropicApiKey()) return "anthropic";
  return null;
}

export function resolveLlmModel(provider: LlmProvider, request: LlmChatRequest): string {
  if (request.model?.trim()) return request.model.trim();
  const purpose: LlmPurpose = request.purpose ?? "chat";
  const configured = purpose === "vision" ? getLlmVisionModel() : getLlmChatModel();
  if (configured) return configured;

  if (provider === "gemini") {
    return "gemini-3.1-flash-lite";
  }
  if (provider === "openai") {
    return "gpt-4o-mini";
  }
  return purpose === "vision" ? "claude-3-5-haiku-latest" : "claude-3-5-haiku-latest";
}
