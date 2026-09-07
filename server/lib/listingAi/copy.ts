import { completeLlmChat } from "../llm/complete";
import {
  LISTING_COPY_JSON_SCHEMA,
  extractJsonObject,
  listingCopyResponseSchema,
} from "./schemas";

export type ConfirmedFact = { label: string; value: string };

export type ListingCopyRequest = {
  itemName: string;
  categoryName: string;
  subcategoryLabel: string;
  listingType: "personal" | "professional";
  facts: ConfirmedFact[];
  locale?: string;
};

export type ListingCopyOutcome =
  | { ok: true; title: string; description: string }
  | { ok: false; code: "invalid_response" | "unavailable"; message: string };

/**
 * Copy is written from confirmed data only — never from the photos.
 *
 * By the time this runs the host has approved the category, the listing type,
 * and every extracted field, so the model has no reason to reach for details it
 * cannot see, and no photos are sent that would tempt it to.
 */
const SYSTEM_PROMPT = [
  "You write short, factual marketplace listing copy for Evorios.",
  "You may only use the facts provided in the message. Never add specifications, accessories, history, or condition claims that are not listed.",
  "No marketing promises, no invented measurements, no pricing talk, no emoji.",
  "Answer with a single JSON object and nothing else.",
].join(" ");

function buildUserPrompt(request: ListingCopyRequest): string {
  const facts = request.facts
    .filter((fact) => fact.value.trim().length > 0)
    .map((fact) => `- ${fact.label}: ${fact.value}`)
    .join("\n");

  return `Write listing copy from these confirmed facts.

Item: ${request.itemName}
Category: ${request.categoryName} → ${request.subcategoryLabel}
Listing type: ${request.listingType}
${facts ? `Confirmed details:\n${facts}` : "Confirmed details: none beyond the item and category."}
${request.locale ? `Write in this language: ${request.locale}.` : ""}

Rules:
- title: max 80 characters, plain and searchable. Include brand and model only if they appear above.
- description: 2 to 4 sentences describing what it is and what a neighbour can use it for, built strictly from the facts above.
- If a detail is missing, leave it out instead of describing it vaguely.

Return JSON exactly in this shape:
{ "title": "...", "description": "..." }`;
}

export async function generateListingCopy(
  request: ListingCopyRequest,
): Promise<ListingCopyOutcome> {
  let text: string;
  try {
    const result = await completeLlmChat({
      purpose: "chat",
      max_tokens: 600,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(request) }],
      jsonSchema: { name: "listing_copy", schema: LISTING_COPY_JSON_SCHEMA },
    });
    text = result.text;
  } catch (error) {
    return {
      ok: false,
      code: "unavailable",
      message: error instanceof Error ? error.message : "Copy generation failed",
    };
  }

  try {
    const parsed = listingCopyResponseSchema.safeParse(extractJsonObject(text));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        code: "invalid_response",
        message: `${issue?.path.join(".") || "response"}: ${issue?.message ?? "invalid"}`,
      };
    }
    return { ok: true, title: parsed.data.title, description: parsed.data.description };
  } catch (error) {
    return {
      ok: false,
      code: "invalid_response",
      message: error instanceof Error ? error.message : "Unparsable copy response",
    };
  }
}
