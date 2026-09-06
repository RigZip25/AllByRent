export type LlmProvider = "gemini" | "openai" | "anthropic";

export type LlmPurpose = "chat" | "vision";

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

/**
 * Provider-native structured output.
 *
 * Gemini and OpenAI can constrain generation to a JSON schema; Anthropic falls
 * back to the schema described in the prompt. Callers must validate the parsed
 * result either way — this only reduces how often that validation fails.
 */
export type LlmJsonSchema = {
  name: string;
  schema: Record<string, unknown>;
};

export type LlmChatRequest = {
  system?: string;
  messages: LlmMessage[];
  max_tokens: number;
  model?: string;
  purpose?: LlmPurpose;
  temperature?: number;
  jsonSchema?: LlmJsonSchema;
};

export type LlmChatResponse = {
  text: string;
  provider: LlmProvider;
  model: string;
};
