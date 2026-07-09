import { getOpenAiApiKey } from "../keys";
import type { LlmChatRequest, LlmContentPart, LlmMessage } from "./types";

function toOpenAiContent(content: string | LlmContentPart[]) {
  if (typeof content === "string") {
    return content;
  }
  return content.map((part) =>
    part.type === "text"
      ? { type: "text", text: part.text }
      : {
          type: "image_url",
          image_url: {
            url: `data:${part.mimeType};base64,${part.data}`,
          },
        },
  );
}

function toOpenAiMessages(request: LlmChatRequest) {
  const messages: { role: string; content: unknown }[] = [];
  if (request.system?.trim()) {
    messages.push({ role: "system", content: request.system.trim() });
  }
  for (const message of request.messages) {
    messages.push({
      role: message.role,
      content: toOpenAiContent(message.content),
    });
  }
  return messages;
}

export async function completeOpenAiChat(
  request: LlmChatRequest,
  model: string,
): Promise<string> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: request.max_tokens,
      temperature: 0.4,
      messages: toOpenAiMessages(request),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: { message?: { content?: string | null } }[];
  };

  if (!response.ok) {
    const message = payload.error?.message ?? `OpenAI request failed (${response.status})`;
    throw new Error(message);
  }

  const text = payload.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) {
    throw new Error("Empty OpenAI response");
  }

  return text;
}
