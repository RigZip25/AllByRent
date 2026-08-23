import type { CategoryFactBlock } from "../types";

/** Canonical EN FactCard for Costume & Cosplay — host-facing Q→A only. */
export const facts_Costume_and_Cosplay: CategoryFactBlock = {
  title: "Costume & cosplay rental FAQ",
  summary: "Short answers for return condition, cleaning fees, and hygiene.",
  qa: [
    {
      q: "Is return condition required?",
      a: "Yes—published rules (and optional cleaning fee) go on the rental agreement.",
    },
    {
      q: "Do contact pieces need sanitization?",
      a: "Yes for masks, makeup, wigs, and suit interiors when the shelf requires it.",
    },
    {
      q: "When is a piece inventory required?",
      a: "Theater, film props, pro makeup, and full-suit shelves.",
    },
    {
      q: "Do full suits need a waiver?",
      a: "Yes—plus heat/visibility guidance. Animatronics also keep the liability waiver on.",
    },
    {
      q: "What does the deposit cover?",
      a: "Tears and missing pieces beyond the published cleaning fee.",
    },
  ],
};

export const categoryKey = "Costume & Cosplay" as const;
