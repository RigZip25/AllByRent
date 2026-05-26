import { LISTING_STEP_LABELS } from "../screens/listing/types";

/** Mr. Rentano system prompt — Claude API (see PROJECT_CONTEXT.md) */
export const RENTANO_MODEL = "claude-sonnet-4-20250514";

export const RENTANO_SYSTEM_PROMPT = `You are Mr. Rentano, the only support companion for AllByRent — The Social Rental Network.
You wear a green jacket, hat, glasses, and bow tie. You are friendly, concise, and practical.
Respond in the user's language automatically.
You help with listing items, renting, pricing, pickup, disputes, and onboarding — never invent legal or payment details.
AllByRent does not store cards, bank accounts, or identity documents; Stripe handles payments and identity.
If unsure, suggest the in-app next step rather than guessing.
You always know which app screen and listing wizard step the user is on (provided in context). Prioritize help for that step.`;

export type RentanoRequestContext = {
  screen?: string;
  step?: number;
  totalSteps?: number;
  stepName?: string;
  appMode?: "rent" | "earn";
  userRole?: "host" | "renter";
  userId?: string;
  draftSummary?: string;
};

const LISTING_STEP_HINTS: Record<number, string> = {
  1: "Photos: encourage clear, well-lit shots; multiple angles; Rentano AI can auto-fill item info after photos.",
  2: "Item Info: title, category, condition, description, replacement value. Suggest using AI improve on description.",
  3: "Transaction Modes: rent, sell, rent-to-own, gift — explain pricing fields for chosen modes.",
  4: "Pickup & Delivery: in-person windows, contactless, delivery tiers by distance.",
  5: "Availability: blocked dates and pause listing.",
  6: "QR Code: physical sticker for pickup verification; required for most rent listings.",
  7: "Review & Publish: final check before going live; QR sticker flow may follow publish.",
};

export function buildListingStepGuidance(step?: number): string | null {
  if (step == null || step < 1 || step > 7) return null;
  const label = LISTING_STEP_LABELS[step - 1] ?? `Step ${step}`;
  const hint = LISTING_STEP_HINTS[step];
  return `[Listing wizard focus]\nCurrent step: ${step} — ${label}.\n${hint}`;
}

export function buildRentanoUserContext(context: RentanoRequestContext): string {
  const lines = ["[App context]"];
  if (context.screen) lines.push(`Screen: ${context.screen}`);
  if (context.appMode) lines.push(`Home mode: ${context.appMode}`);
  if (context.step != null && context.totalSteps != null) {
    const name =
      context.stepName ?? LISTING_STEP_LABELS[context.step - 1] ?? `Step ${context.step}`;
    lines.push(`Wizard: step ${context.step} of ${context.totalSteps} (${name})`);
  }
  if (context.userRole) lines.push(`Role: ${context.userRole}`);
  if (context.draftSummary) lines.push(`Listing draft: ${context.draftSummary}`);
  return lines.join("\n");
}
