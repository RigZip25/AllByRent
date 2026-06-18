export type AnthropicContentBlock = {
  type: string;
  text?: string;
};

export type AnthropicMessagesResponse = {
  content?: AnthropicContentBlock[];
};

export const ANTHROPIC_API_URL = "/api/anthropic";

export function isAnthropicConfigured(): boolean {
  if (import.meta.env.VITE_AI_CHAT_ENABLED === "false") return false;
  if (import.meta.env.VITE_AI_CHAT_ENABLED === "true") return true;
  return import.meta.env.PROD;
}

export function extractAnthropicText(data: AnthropicMessagesResponse): string {
  return (
    data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

export function fetchAnthropicMessages(body: Record<string, unknown>): Promise<Response> {
  return fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify(body),
  });
}

export async function postAnthropicMessages(
  body: Record<string, unknown>,
): Promise<AnthropicMessagesResponse> {
  const response = await fetchAnthropicMessages(body);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Claude request failed (${response.status}): ${errorBody.slice(0, 240)}`,
    );
  }

  return (await response.json()) as AnthropicMessagesResponse;
}
