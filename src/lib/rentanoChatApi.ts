import { postLlmChat } from "./llmClient";
import {
  buildRentanoCacheKey,
  readCachedRentanoAnswer,
  writeCachedRentanoAnswer,
} from "./rentanoChatCache";
import {
  buildRentanoUserContext,
  buildListingStepGuidance,
  type RentanoRequestContext,
} from "./rentanoPrompt";
import { EVORIOS_SYSTEM_PROMPT } from "./evoriosPrompt";

export type RentanoChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt(context: RentanoRequestContext): string {
  const parts = [EVORIOS_SYSTEM_PROMPT, buildRentanoUserContext(context)];
  const stepGuide = buildListingStepGuidance(context.step);
  if (stepGuide) parts.push(stepGuide);
  parts.push(
    "Keep replies short (2–4 sentences unless the user asks for detail). Use bullet lists only when listing options.",
  );
  return parts.join("\n\n");
}

export async function sendRentanoMessage(
  history: RentanoChatTurn[],
  context: RentanoRequestContext,
): Promise<string> {
  const lastUser = [...history].reverse().find((turn) => turn.role === "user");
  const cacheKey = lastUser
    ? buildRentanoCacheKey(lastUser.content, context.screen)
    : null;
  if (cacheKey) {
    const cached = readCachedRentanoAnswer(cacheKey);
    if (cached) return cached;
  }

  const data = await postLlmChat({
    purpose: "chat",
    max_tokens: 900,
    system: buildSystemPrompt(context),
    messages: history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
  });

  const text = data.text;
  if (!text) {
    throw new Error("Empty AI response");
  }

  if (cacheKey) writeCachedRentanoAnswer(cacheKey, text);
  return text;
}
