import { postLlmChat } from "../../lib/llmClient";
import { APP_NAME, MASCOT_NAME } from "../../lib/brand";
import type { ListingDraft } from "./types";

type DescriptionDraft = Pick<
  ListingDraft,
  "title" | "category" | "subcategory" | "grade" | "condition" | "description"
>;

export async function improveListingDescription(draft: DescriptionDraft): Promise<string> {
  const data = await postLlmChat({
    purpose: "chat",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are ${MASCOT_NAME}, AI companion on ${APP_NAME} (${APP_NAME} Garage Showcase platform).

Item details:
Title: ${draft.title}
Category: ${draft.category}
Subcategory: ${draft.subcategory}
Grade: ${draft.grade}
Condition: ${draft.condition}
Current description:
${draft.description}
Rewrite this description to be more accurate, 
professional and appealing for renters.
Fix any factual inconsistencies.
Keep it under 300 words.
Return ONLY the improved description text, 
nothing else.`,
      },
    ],
  });

  const text = data.text;
  if (!text) {
    throw new Error("Empty AI response");
  }

  return text.slice(0, 1000);
}
