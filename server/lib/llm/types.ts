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

export type LlmChatRequest = {
  system?: string;
  messages: LlmMessage[];
  max_tokens: number;
  model?: string;
  purpose?: LlmPurpose;
};

export type LlmChatResponse = {
  text: string;
  provider: LlmProvider;
  model: string;
};
