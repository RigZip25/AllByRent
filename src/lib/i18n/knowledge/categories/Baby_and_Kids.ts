import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Baby & Kids — host-facing Q→A only. */
export const facts_Baby_and_Kids: CategoryFactBlock = {
  title: "Baby safety rental FAQ",
  summary: "Short answers for car seats, cribs, and commercial play.",
  qa: [
    {
      q: "Can I rent an expired car seat?",
      a: "No—expiry and recall checks must be filled before you can publish and book.",
    },
    {
      q: "What do cribs require?",
      a: "No drop-side; portable sleep standard; firm mattress; sanitization.",
    },
    {
      q: "What does commercial play need?",
      a: "Certification, capacity, and a liability waiver.",
    },
    {
      q: "What must hosts show?",
      a: "Label photo, recall check, and sanitization attest where required.",
    },
    {
      q: "What does the renter acknowledge?",
      a: "Safety attestations at booking before unlock.",
    },
  ],
};

export const categoryKey = "Baby & Kids" as const;
