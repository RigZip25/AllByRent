export type LlmImagePart = {
  type: "image";
  mimeType: string;
  data: string;
};

export type LlmTextPart = {
  type: "text";
  text: string;
};

export type LlmContentPart = LlmImagePart | LlmTextPart;

export type LlmMessage = {
  role: "user" | "assistant";
  content: string | LlmContentPart[];
};

export type LlmPurpose = "chat" | "vision";

export type LlmChatRequest = {
  system?: string;
  messages: LlmMessage[];
  max_tokens: number;
  model?: string;
  purpose?: LlmPurpose;
};

export type LlmChatResponse = {
  text: string;
  provider?: string;
  model?: string;
};

export const LLM_API_URL = "/api/proxy/llm";

/** @deprecated Use LLM_API_URL */
export const ANTHROPIC_API_URL = LLM_API_URL;

export function isLlmConfigured(): boolean {
  if (import.meta.env.VITE_AI_CHAT_ENABLED === "false") return false;
  if (import.meta.env.VITE_AI_CHAT_ENABLED === "true") return true;
  return import.meta.env.PROD;
}

/** @deprecated Use isLlmConfigured */
export const isAnthropicConfigured = isLlmConfigured;

export async function postLlmChat(request: LlmChatRequest): Promise<LlmChatResponse> {
  const response = await fetch(LLM_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = (await response.json().catch(() => ({}))) as LlmChatResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" && data.error.length > 0
        ? data.error
        : `AI request failed (${response.status})`,
    );
  }

  if (!data.text?.trim()) {
    throw new Error("Empty AI response");
  }

  return data;
}

/** @deprecated Use postLlmChat — returns Anthropic-shaped payload for legacy callers. */
export async function postAnthropicMessages(
  body: Record<string, unknown>,
): Promise<{ content: { type: string; text: string }[] }> {
  const messages = Array.isArray(body.messages) ? (body.messages as LlmMessage[]) : [];
  const system =
    typeof body.system === "string"
      ? body.system
      : Array.isArray(body.system)
        ? body.system
            .map((block) =>
              block && typeof block === "object" && "text" in block
                ? String((block as { text?: string }).text ?? "")
                : "",
            )
            .filter(Boolean)
            .join("\n\n")
        : undefined;

  const result = await postLlmChat({
    system,
    messages,
    max_tokens: Number(body.max_tokens) || 900,
    model: typeof body.model === "string" ? body.model : undefined,
    purpose: messages.some(
      (message) =>
        Array.isArray(message.content) &&
        message.content.some((part) => part.type === "image"),
    )
      ? "vision"
      : "chat",
  });

  return { content: [{ type: "text", text: result.text }] };
}

export function extractAnthropicText(data: { content?: { type?: string; text?: string }[] }): string {
  return (
    data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

/** @deprecated Use postLlmChat */
export function fetchAnthropicMessages(body: Record<string, unknown>): Promise<Response> {
  return fetch(LLM_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      system:
        typeof body.system === "string"
          ? body.system
          : Array.isArray(body.system)
            ? body.system
                .map((block) =>
                  block && typeof block === "object" && "text" in block
                    ? String((block as { text?: string }).text ?? "")
                    : "",
                )
                .join("\n\n")
            : undefined,
      messages: body.messages,
      max_tokens: body.max_tokens,
      model: body.model,
      purpose: "vision",
    }),
  }).then(async (response) => {
    if (!response.ok) return response;
    const data = (await response.json()) as LlmChatResponse;
    return new Response(
      JSON.stringify({ content: [{ type: "text", text: data.text }] }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });
}
