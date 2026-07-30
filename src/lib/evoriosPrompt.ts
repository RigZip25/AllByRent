import { getSteps } from "../screens/listing/types";
import { APP_MODE_LABELS, APP_NAME, MASCOT_NAME, PRODUCT_METAPHOR } from "./brand";
import { getMessages } from "./i18n";

function listingStepName(step: number): string {
  return getSteps(getMessages().listing)[step - 1]?.name ?? `Step ${step}`;
}

/** Server picks provider via LLM_PROVIDER (default: Gemini → OpenAI → Anthropic). */
export const EVORIOS_MODEL = "auto";

export const EVORIOS_SYSTEM_PROMPT = `You are ${MASCOT_NAME}, the only support companion for ${APP_NAME} — a neighborhood ${PRODUCT_METAPHOR} where every household is a business cell (garage storefront) that can rent, sell, or gift items on the block.
You wear a green jacket, hat, glasses, and bow tie. You are a friendly neighbor-guide: practical, warm, yard-sale savvy, never corporate.
Language rule (required): Always reply in the same language as the user's latest message (Russian → Russian, Spanish → Spanish, etc.). Never switch to English unless the user wrote in English. UI labels like Rent/Sell/Garage may stay in English when they are product terms, but the rest of the sentence must match the user.
Mode rule (required): Never assume the user is only browsing (rent mode) or only hosting (earn mode). Read Home mode from context. If context says earn / My Garage, help them stock and manage listings. If rent / Browse, help them find gear. If unsure, explain both paths.
Navigation truth (required): Bottom tabs are Home, ${MASCOT_NAME}, green + (Stock), Garage, More/Account. There is NO magnifying-glass search icon in the footer. Categories are on the Home browse hub chips and on the feed filter strip — not via a footer search lupa.
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
  3: "How to share: rent and/or sell — set prices for the modes you enable. Sell at $0 = free giveaway.",
  4: "Pickup & Delivery: porch, in-person, contactless, or delivery by distance.",
  5: "Availability: blocked dates and pause your showcase.",
  6: "QR Code: sticker for pickup verification on borrow listings.",
  7: "Review & Publish: your item goes on your garage showcase; QR flow may follow.",
};

export function buildListingStepGuidance(step?: number): string | null {
  if (step == null || step < 1 || step > 7) return null;
  const label = listingStepName(step);
  const hint = LISTING_STEP_HINTS[step];
  return `[Listing wizard focus]\nCurrent step: ${step} — ${label}.\n${hint}`;
}

export function buildEvoriosUserContext(context: EvoriosRequestContext): string {
  const lines = ["[App context]"];
  if (context.screen) lines.push(`Screen: ${context.screen}`);
  if (context.appMode) {
    const label = APP_MODE_LABELS[context.appMode];
    lines.push(`Home mode: ${context.appMode} (${label})`);
    if (context.appMode === "earn") {
      lines.push(
        "User focus: hosting / My Garage — help stock listings, QR, requests, and earnings. Do not push browse-only advice.",
      );
    } else {
      lines.push(
        "User focus: browsing the block — help find categories, Rent/Buy filters, bookings. Also mention Stock (+) if they want to host.",
      );
    }
  } else {
    lines.push("Home mode: unknown — do not assume rent-only; offer Browse and My Garage paths.");
  }
  if (context.step != null && context.totalSteps != null) {
    const name = context.stepName ?? listingStepName(context.step);
    lines.push(`Wizard: step ${context.step} of ${context.totalSteps} (${name})`);
  }
  if (context.userRole) lines.push(`Role: ${context.userRole}`);
  if (context.draftSummary) lines.push(`Listing draft:\n${context.draftSummary}`);
  const stepGuide = buildListingStepGuidance(context.step);
  if (stepGuide) lines.push(stepGuide);
  return lines.join("\n");
}
