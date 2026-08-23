import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Real Estate — host-facing Q→A only. */
export const facts_Real_Estate: CategoryFactBlock = {
  title: "Short stay & space rental FAQ",
  summary: "Short answers for house rules, access, cleaning fees, deposits, and check-in ID.",
  qa: [
    {
      q: "Are house rules required?",
      a: "Yes on rent—quiet hours, guests, smoking, pets, and checkout must be published and go on the rental agreement.",
    },
    {
      q: "What access types are supported?",
      a: "Host present, self check-in, key/lockbox, or staffed — required before publish on rent.",
    },
    {
      q: "Is there a cleaning fee?",
      a: "Optional. When set, it shows at booking and goes on the rental agreement.",
    },
    {
      q: "What ID is needed at check-in?",
      a: "Guest selfie / ID upload at start—same pattern as vehicle start ID.",
    },
    {
      q: "How big is the deposit?",
      a: "Defaults toward about one month of rent unless the host sets otherwise.",
    },
    {
      q: "When does access unlock?",
      a: "After start ID is completed on-site—not from a forwarded confirmation alone.",
    },
  ],
};

export const categoryKey = "Real Estate" as const;
