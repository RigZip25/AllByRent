import {
  getAnthropicApiKey,
  getGeminiApiKey,
  getOpenAiApiKey,
  getLlmChatModel,
  getLlmVisionModel,
} from "../keys";
import type { LlmChatRequest, LlmProvider, LlmPurpose } from "./types";

/** Hard ceiling — client cannot request unbounded completions. */
export const LLM_MAX_TOKENS_CAP = 2048;
export const LLM_MAX_TOKENS_DEFAULT = 900;

/** Server-side model allowlist per provider. Unknown client models are ignored. */
export const LLM_ALLOWED_MODELS: Record<LlmProvider, readonly string[]> = {
  gemini: [
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
  ],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
  anthropic: [
    "claude-3-5-haiku-latest",
    "claude-3-5-sonnet-latest",
    "claude-3-haiku-20240307",
    "claude-haiku-4-5",
    "claude-sonnet-4-5",
  ],
};

export function clampLlmMaxTokens(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return LLM_MAX_TOKENS_DEFAULT;
  return Math.min(LLM_MAX_TOKENS_CAP, Math.max(1, Math.floor(n)));
}

export function defaultLlmModel(provider: LlmProvider, purpose: LlmPurpose = "chat"): string {
  const configured = purpose === "vision" ? getLlmVisionModel() : getLlmChatModel();
  if (configured && isAllowedLlmModel(provider, configured)) return configured;
  if (provider === "gemini") return "gemini-3.1-flash-lite";
  if (provider === "openai") return "gpt-4o-mini";
  return "claude-3-5-haiku-latest";
}

export function isAllowedLlmModel(provider: LlmProvider, model: string): boolean {
  const normalized = model.trim();
  if (!normalized) return false;
  return LLM_ALLOWED_MODELS[provider].includes(normalized);
}

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
  const purpose: LlmPurpose = request.purpose ?? "chat";
  const requested = request.model?.trim();
  if (requested && isAllowedLlmModel(provider, requested)) {
    return requested;
  }
  return defaultLlmModel(provider, purpose);
}
