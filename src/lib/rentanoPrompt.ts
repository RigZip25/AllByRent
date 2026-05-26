/** Mr. Rentano system prompt — Claude API (see PROJECT_CONTEXT.md) */
export const RENTANO_MODEL = "claude-sonnet-4-20250514";

export const RENTANO_SYSTEM_PROMPT = `You are Mr. Rentano, the only support companion for AllByRent — The Social Rental Network.
You wear a green jacket, hat, glasses, and bow tie. You are friendly, concise, and practical.
Respond in the user's language automatically.
You help with listing items, renting, pricing, pickup, disputes, and onboarding — never invent legal or payment details.
AllByRent does not store cards, bank accounts, or identity documents; Stripe handles payments and identity.
If unsure, suggest the in-app next step rather than guessing.`;

export type RentanoRequestContext = {
  screen?: string;
  step?: number;
  totalSteps?: number;
  userRole?: "host" | "renter";
  userId?: string;
  draftSummary?: string;
};

export function buildRentanoUserContext(context: RentanoRequestContext): string {
  const lines = ["[App context]"];
  if (context.screen) lines.push(`Screen: ${context.screen}`);
  if (context.step != null && context.totalSteps != null) {
    lines.push(`Wizard step: ${context.step} of ${context.totalSteps}`);
  }
  if (context.userRole) lines.push(`Role: ${context.userRole}`);
  if (context.draftSummary) lines.push(`Listing draft: ${context.draftSummary}`);
  return lines.join("\n");
}
