import { postAnthropicMessages, extractAnthropicText } from "./anthropicClient";
import {
  RENTANO_MODEL,
  RENTANO_SYSTEM_PROMPT,
  buildRentanoUserContext,
  buildListingStepGuidance,
  type RentanoRequestContext,
} from "./rentanoPrompt";

export type RentanoChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt(context: RentanoRequestContext): string {
  const parts = [RENTANO_SYSTEM_PROMPT, buildRentanoUserContext(context)];
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
  const data = await postAnthropicMessages({
    model: RENTANO_MODEL,
    max_tokens: 900,
    system: buildSystemPrompt(context),
    messages: history.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
  });

  const text = extractAnthropicText(data);
  if (!text) {
    throw new Error("Empty Claude response");
  }
  return text;
}
