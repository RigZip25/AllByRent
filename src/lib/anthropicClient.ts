export type AnthropicContentBlock = {
  type: string;
  text?: string;
};

export type AnthropicMessagesResponse = {
  content?: AnthropicContentBlock[];
};

const ANTHROPIC_API_URL = import.meta.env.DEV
  ? "/anthropic-api/v1/messages"
  : "https://api.anthropic.com/v1/messages";

export function isAnthropicConfigured(): boolean {
  if (import.meta.env.DEV) return true;
  return Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
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

export async function postAnthropicMessages(
  body: Record<string, unknown>,
): Promise<AnthropicMessagesResponse> {
  if (!isAnthropicConfigured()) {
    throw new Error("Missing VITE_ANTHROPIC_API_KEY");
  }

  const headers: Record<string, string> = {
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
    "anthropic-dangerous-direct-browser-access": "true",
  };

  if (!import.meta.env.DEV) {
    headers["x-api-key"] = import.meta.env.VITE_ANTHROPIC_API_KEY as string;
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Claude request failed (${response.status}): ${errorBody.slice(0, 240)}`,
    );
  }

  return (await response.json()) as AnthropicMessagesResponse;
}
