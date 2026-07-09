import { getAnthropicApiKey } from "../keys";
import type { LlmChatRequest, LlmContentPart, LlmMessage } from "./types";

function toAnthropicContent(content: string | LlmContentPart[]) {
  if (typeof content === "string") {
    return content;
  }
  return content.map((part) =>
    part.type === "text"
      ? { type: "text", text: part.text }
      : {
          type: "image",
          source: {
            type: "base64",
            media_type: part.mimeType,
            data: part.data,
          },
        },
  );
}

function toAnthropicMessages(messages: LlmMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: toAnthropicContent(message.content),
  }));
}

export async function completeAnthropicChat(
  request: LlmChatRequest,
  model: string,
): Promise<string> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured");
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: request.max_tokens,
    messages: toAnthropicMessages(request.messages),
  };

  if (request.system?.trim()) {
    body.system = request.system.trim();
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: { message?: string };
    content?: { type?: string; text?: string }[];
  };

  if (!response.ok) {
    const message = payload.error?.message ?? `Anthropic request failed (${response.status})`;
    throw new Error(message);
  }

  const text =
    payload.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error("Empty Anthropic response");
  }

  return text;
}
