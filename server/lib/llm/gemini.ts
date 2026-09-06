import { getGeminiApiKey } from "../keys";
import type { LlmChatRequest, LlmContentPart, LlmMessage } from "./types";

function toGeminiParts(content: string | LlmContentPart[]) {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  return content.map((part) =>
    part.type === "text"
      ? { text: part.text }
      : { inlineData: { mimeType: part.mimeType, data: part.data } },
  );
}

function toGeminiContents(messages: LlmMessage[]) {
  return messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(message.content),
  }));
}

/** Gemini rejects standard JSON Schema keywords it does not implement. */
const GEMINI_UNSUPPORTED_KEYS = new Set([
  "additionalProperties",
  "$schema",
  "definitions",
  "$defs",
  "patternProperties",
  "const",
]);

function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map((item) => toGeminiSchema(item));
  if (!node || typeof node !== "object") return node;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (GEMINI_UNSUPPORTED_KEYS.has(key)) continue;
    // Gemini expresses optionality with `nullable`, not a union of types.
    if (key === "type" && Array.isArray(value)) {
      const types = value.filter((entry): entry is string => typeof entry === "string");
      const concrete = types.find((entry) => entry !== "null");
      if (concrete) out.type = concrete;
      if (types.includes("null")) out.nullable = true;
      continue;
    }
    out[key] = toGeminiSchema(value);
  }
  return out;
}

export async function completeGeminiChat(
  request: LlmChatRequest,
  model: string,
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: request.max_tokens,
    temperature: request.temperature ?? 0.4,
  };

  if (request.jsonSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = toGeminiSchema(request.jsonSchema.schema);
  }

  const body: Record<string, unknown> = {
    contents: toGeminiContents(request.messages),
    generationConfig,
  };

  if (request.system?.trim()) {
    body.systemInstruction = { parts: [{ text: request.system.trim() }] };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  if (!response.ok) {
    const message = payload.error?.message ?? `Gemini request failed (${response.status})`;
    throw new Error(message);
  }

  const text =
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  return text;
}
