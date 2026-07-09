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

export async function completeGeminiChat(
  request: LlmChatRequest,
  model: string,
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: Record<string, unknown> = {
    contents: toGeminiContents(request.messages),
    generationConfig: {
      maxOutputTokens: request.max_tokens,
      temperature: 0.4,
    },
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
