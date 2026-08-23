import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Photo & Video — host-facing Q→A only. */
export const facts_Photo_and_Video: CategoryFactBlock = {
  title: "Photo & video tips",
  summary: "Say what the kit is, what’s included, and how the deposit works.",
  qa: [
    {
      q: "What should I fill in?",
      a: "Brand, model, whether it’s a body or full kit, and a short list of what’s in the bag. For drones, also weight class and Remote ID.",
    },
    {
      q: "Who brings memory cards?",
      a: "Say if cards are included, partial, or the renter should bring their own.",
    },
    {
      q: "Do drones need Remote ID?",
      a: "Usually yes unless under 250g exempt — mark built-in, add-on, or exempt. Wrong combo blocks publishing.",
    },
    {
      q: "What does the deposit cover?",
      a: "Damage to the body and missing pieces on your list — not production insurance.",
    },
  ],
};

export const categoryKey = "Photo & Video" as const;
