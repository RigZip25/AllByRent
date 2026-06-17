import { LISTING_STEP_LABELS } from "../screens/listing/types";
import { APP_MODE_LABELS, APP_NAME, MASCOT_NAME, PRODUCT_METAPHOR } from "./brand";

/** Evorios companion — Claude API system prompt */
export const EVORIOS_MODEL = "claude-sonnet-4-20250514";

export const EVORIOS_SYSTEM_PROMPT = `You are ${MASCOT_NAME}, the only support companion for ${APP_NAME} — a ${PRODUCT_METAPHOR} for every household.
You wear a green jacket, hat, glasses, and bow tie. You are a friendly neighbor-guide: practical, warm, yard-sale savvy, never corporate.
Respond in the user's language automatically.
You help households show their garage online: listing items, pricing for borrow or buy, pickup on the porch, and trust on the block.
${APP_NAME} does not store cards, bank accounts, or identity documents; Stripe handles payments and identity.
If unsure, suggest the in-app next step rather than guessing.
You always know which app screen and listing wizard step the user is on (provided in context). Prioritize help for that step.`;

export type EvoriosRequestContext = {
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
  1: "Photos: clear, well-lit shots from the garage or shelf; AI can suggest title and category after upload.",
  2: "Item Info: title, category, condition, description, replacement value.",
  3: "How to share: rent, sell, or gift — set prices for the modes you enable.",
  4: "Pickup & Delivery: porch, in-person, contactless, or delivery by distance.",
  5: "Availability: blocked dates and pause your showcase.",
  6: "QR Code: sticker for pickup verification on borrow listings.",
  7: "Review & Publish: your item goes on your garage showcase; QR flow may follow.",
};

export function buildListingStepGuidance(step?: number): string | null {
  if (step == null || step < 1 || step > 7) return null;
  const label = LISTING_STEP_LABELS[step - 1] ?? `Step ${step}`;
  const hint = LISTING_STEP_HINTS[step];
  return `[Listing wizard focus]\nCurrent step: ${step} — ${label}.\n${hint}`;
}

export function buildEvoriosUserContext(context: EvoriosRequestContext): string {
  const lines = ["[App context]"];
  if (context.screen) lines.push(`Screen: ${context.screen}`);
  if (context.appMode) {
    const label = APP_MODE_LABELS[context.appMode];
    lines.push(`Home mode: ${context.appMode} (${label})`);
  }
  if (context.step != null && context.totalSteps != null) {
    const name =
      context.stepName ?? LISTING_STEP_LABELS[context.step - 1] ?? `Step ${context.step}`;
    lines.push(`Wizard: step ${context.step} of ${context.totalSteps} (${name})`);
  }
  if (context.userRole) lines.push(`Role: ${context.userRole}`);
  if (context.draftSummary) lines.push(`Listing draft:\n${context.draftSummary}`);
  const stepGuide = buildListingStepGuidance(context.step);
  if (stepGuide) lines.push(stepGuide);
  return lines.join("\n");
}
