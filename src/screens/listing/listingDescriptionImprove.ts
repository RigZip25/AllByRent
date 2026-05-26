import type { ListingDraft } from "./types";

const ANTHROPIC_API_URL = import.meta.env.DEV
  ? "/anthropic-api/v1/messages"
  : "https://api.anthropic.com/v1/messages";

type DescriptionDraft = Pick<
  ListingDraft,
  "title" | "category" | "subcategory" | "grade" | "condition" | "description"
>;

export async function improveListingDescription(draft: DescriptionDraft): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Missing VITE_ANTHROPIC_API_KEY");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are Mr. Rentano, AI companion on AllByRent rental platform.

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
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude request failed (${response.status})`);
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  const text = data.content?.find((block) => block.type === "text")?.text?.trim();
  if (!text) {
    throw new Error("Empty Claude response");
  }

  return text.slice(0, 1000);
}
